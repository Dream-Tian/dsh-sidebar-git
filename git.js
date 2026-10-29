/**
 * Read-only Git data for the sidebar tab.
 *
 * The Host half runs `git` in the directory the browser asks about. Every call
 * is bounded (timeout, output size, entry count) and only reads: `rev-parse`,
 * `status`, `log`, `diff` and `show` never mutate the repository.
 */
import { execFile } from 'node:child_process'
import { readFile, realpath, rm, stat } from 'node:fs/promises'
import path from 'node:path'

/** Hard ceiling for one git invocation. */
const GIT_TIMEOUT_MS = 8000
/** Hard ceiling for one git invocation's stdout. */
const GIT_MAX_BUFFER = 8 * 1024 * 1024
/** Changed files kept in one snapshot or commit detail. */
const FILE_LIMIT = 500
/** Unified diff bytes returned for one file. */
const DIFF_LIMIT = 512 * 1024
/** Untracked files larger than this are not synthesized into a diff. */
const UNTRACKED_LIMIT = 256 * 1024
/** Lines rendered for one synthesized untracked diff. */
const UNTRACKED_LINES = 5000
/** One commit record: hash, short hash, parents, refs, author, unix time, subject. */
const LOG_FORMAT = '%H%x1f%h%x1f%P%x1f%D%x1f%an%x1f%at%x1f%s%x1e'

/**
 * Run one read-only git command.
 * @param {string} dir - directory git treats as the working directory.
 * @param {string[]} args - arguments after the global options.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<string>} stdout.
 */
function runGit(dir, args, signal, timeoutMs = GIT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      ['--no-pager', '-c', 'core.quotepath=false', '-C', dir, ...args],
      {
        timeout: timeoutMs,
        maxBuffer: GIT_MAX_BUFFER,
        encoding: 'utf8',
        signal,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: '0',
          GIT_OPTIONAL_LOCKS: '0',
          LC_ALL: 'C',
        },
      },
      (error, stdout, stderr) => {
        if (error !== null) {
          error.stdout = stdout
          error.stderr = stderr
          reject(error)
          return
        }
        resolve(stdout)
      },
    )
  })
}

/**
 * Resolve the repository root that contains `cwd`.
 * @param {string} cwd - a directory inside the repository.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ root: string } | { missing: true } | null>} null when `cwd` is not in a repository.
 */
async function resolveRoot(cwd, signal) {
  try {
    const out = await runGit(cwd, ['rev-parse', '--show-toplevel'], signal)
    const root = out.trim()
    return root === '' ? null : { root }
  } catch (error) {
    if (signal?.aborted) throw error
    if (error?.code === 'ENOENT') return { missing: true }
    return null
  }
}

/**
 * Resolve the repository root or fail with a readable message.
 * @param {string} cwd - a directory inside the repository.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<string>} repository root.
 */
async function requireRoot(cwd, signal) {
  const resolved = await resolveRoot(cwd, signal)
  if (resolved === null) throw new Error('not a git repository')
  if ('missing' in resolved) throw new Error('git is not installed')
  return resolved.root
}

/**
 * Whether the repository has at least one commit.
 * @param {string} root - repository root.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<boolean>} true when HEAD resolves.
 */
async function hasHead(root, signal) {
  try {
    await runGit(root, ['rev-parse', '--verify', '--quiet', 'HEAD'], signal)
    return true
  } catch {
    if (signal?.aborted) throw new Error('aborted')
    return false
  }
}

/**
 * Parse `git status --porcelain=v1 -z --branch` output.
 * @param {string} raw - NUL-separated porcelain output.
 * @returns {{ branch: string | null, detached: boolean, upstream: string | null, ahead: number, behind: number, files: Array<object> }} parsed status.
 */
function parseStatus(raw) {
  const files = []
  let branch = null
  let detached = false
  let upstream = null
  let ahead = 0
  let behind = 0
  const records = raw.split('\0')
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i]
    if (!record) continue
    if (record.startsWith('## ')) {
      const header = record.slice(3)
      if (header === 'HEAD (no branch)') {
        detached = true
      } else if (header.startsWith('No commits yet on ')) {
        branch = header.slice('No commits yet on '.length)
      } else {
        const flags = header.match(/\[([^\]]*)\]\s*$/)
        const core = (flags === null ? header : header.slice(0, flags.index)).trim()
        if (flags !== null) {
          const a = /ahead (\d+)/.exec(flags[1])
          if (a !== null) ahead = Number(a[1])
          const b = /behind (\d+)/.exec(flags[1])
          if (b !== null) behind = Number(b[1])
        }
        const split = core.indexOf('...')
        if (split >= 0) {
          branch = core.slice(0, split)
          upstream = core.slice(split + 3) || null
        } else {
          branch = core
        }
        if (branch === 'HEAD') {
          branch = null
          detached = true
        }
        if (upstream === 'gone') upstream = null
      }
      continue
    }
    const x = record.charAt(0)
    const y = record.charAt(1)
    const filePath = record.slice(3)
    if (filePath === '') continue
    let origPath = null
    if (x === 'R' || x === 'C' || y === 'R' || y === 'C') {
      origPath = records[i + 1] ?? null
      i += 1
    }
    files.push({
      path: filePath,
      index: x,
      worktree: y,
      origPath,
      untracked: x === '?',
      conflicted:
        x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D'),
    })
  }
  return { branch, detached, upstream, ahead, behind, files }
}

/**
 * Parse `--numstat -z` output. Rename records carry the original path in the
 * next two NUL fields; binary files report `-` for both counts.
 * @param {string} raw - NUL-separated numstat output.
 * @returns {Map<string, { additions: number | null, deletions: number | null, origPath: string | null }>} stats keyed by the new path.
 */
function parseNumstat(raw) {
  const stats = new Map()
  const records = raw.split('\0')
  for (let i = 0; i < records.length; i += 1) {
    const record = records[i]
    if (record === '') continue
    const firstTab = record.indexOf('\t')
    const secondTab = record.indexOf('\t', firstTab + 1)
    if (firstTab < 0 || secondTab < 0) continue
    const added = record.slice(0, firstTab)
    const deleted = record.slice(firstTab + 1, secondTab)
    let filePath = record.slice(secondTab + 1)
    let origPath = null
    if (filePath === '') {
      origPath = records[i + 1] ?? null
      filePath = records[i + 2] ?? ''
      i += 2
    }
    if (filePath === '') continue
    stats.set(filePath, {
      additions: added === '-' ? null : Number(added),
      deletions: deleted === '-' ? null : Number(deleted),
      origPath,
    })
  }
  return stats
}

/**
 * Sum two numstat maps by new path.
 * @param {Map<string, object>} target - accumulator, mutated.
 * @param {Map<string, object>} source - stats to add.
 */
function mergeStats(target, source) {
  for (const [filePath, stat] of source) {
    const previous = target.get(filePath)
    if (previous === undefined) {
      target.set(filePath, { ...stat })
      continue
    }
    target.set(filePath, {
      additions:
        previous.additions === null || stat.additions === null
          ? null
          : previous.additions + stat.additions,
      deletions:
        previous.deletions === null || stat.deletions === null
          ? null
          : previous.deletions + stat.deletions,
      origPath: previous.origPath ?? stat.origPath,
    })
  }
}

/**
 * Parse `--name-status -z` output into status rows.
 * @param {string} raw - NUL-separated name-status output.
 * @returns {Array<{ path: string, status: string, origPath: string | null }>} changed files.
 */
function parseNameStatus(raw) {
  const files = []
  const records = raw.split('\0')
  for (let i = 0; i < records.length; i += 1) {
    const code = records[i]
    if (code === '') continue
    const letter = code.charAt(0)
    if (letter === 'R' || letter === 'C') {
      const origPath = records[i + 1] ?? null
      const filePath = records[i + 2] ?? ''
      i += 2
      if (filePath !== '') files.push({ path: filePath, status: letter, origPath })
      continue
    }
    const filePath = records[i + 1] ?? ''
    i += 1
    if (filePath !== '') files.push({ path: filePath, status: letter, origPath: null })
  }
  return files
}

/**
 * Parse the custom `git log` record format.
 * @param {string} raw - records separated by 0x1e.
 * @returns {Array<{ hash: string, short: string, parents: string[], refs: string, author: string, time: number, subject: string }>} commits, newest first.
 */
function parseLog(raw) {
  const commits = []
  for (const record of raw.split('\x1e')) {
    const text = record.replace(/^\r?\n/, '')
    if (text === '') continue
    const fields = text.split('\x1f')
    if (fields.length < 7) continue
    const [hash, short, parents, refs, author, at, ...rest] = fields
    commits.push({
      hash,
      short,
      parents: parents === '' ? [] : parents.split(' ').filter(Boolean),
      refs,
      author,
      time: Number(at) || 0,
      subject: rest.join('\x1f'),
    })
  }
  return commits
}

/**
 * Path relative to the session directory, or null when the file lives above it.
 * @param {string} cwdReal - resolved session directory.
 * @param {string} root - repository root.
 * @param {string} filePath - repository-relative path.
 * @returns {string | null} a `/`-separated path the Session can open.
 */
function relativeToSession(cwdReal, root, filePath) {
  const relative = path.relative(cwdReal, path.join(root, filePath))
  const inside = relative !== '' && !relative.startsWith('..') && !path.isAbsolute(relative)
  return inside ? relative.split(path.sep).join('/') : null
}

/**
 * Collect one consistent-enough snapshot of the repository for the panel.
 * @param {string} cwd - the session's working directory.
 * @param {number} limit - maximum commits to return.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<object>} snapshot consumed by the Client.
 */
export async function snapshot(cwd, limit, signal, sessionCwd) {
  const resolved = await resolveRoot(cwd, signal)
  if (resolved === null) return { isRepo: false, cwd, root: null, gitMissing: false }
  if ('missing' in resolved) return { isRepo: false, cwd, root: null, gitMissing: true }
  const root = resolved.root
  const [statusText, logText, unstagedText, stagedText] = await Promise.all([
    runGit(root, ['status', '--porcelain=v1', '-z', '--branch', '--untracked-files=all'], signal),
    runGit(
      root,
      ['log', '--topo-order', '-n', String(limit + 1), `--pretty=format:${LOG_FORMAT}`, '--decorate=short'],
      signal,
    ).catch((error) => {
      if (signal?.aborted) throw error
      return ''
    }),
    runGit(root, ['diff', '--numstat', '-z', '--no-ext-diff', '--no-color'], signal).catch(() => ''),
    runGit(root, ['diff', '--cached', '--numstat', '-z', '--no-ext-diff', '--no-color'], signal).catch(
      () => '',
    ),
  ])
  const status = parseStatus(statusText)
  const allCommits = parseLog(logText)
  const hasMore = allCommits.length > limit
  const commits = hasMore ? allCommits.slice(0, limit) : allCommits
  const unstagedStats = parseNumstat(unstagedText)
  const stagedStats = parseNumstat(stagedText)
  const stats = new Map()
  mergeStats(stats, unstagedStats)
  mergeStats(stats, stagedStats)
  const relBase = typeof sessionCwd === 'string' && sessionCwd !== '' ? sessionCwd : cwd
  const cwdReal = await realpath(relBase).catch(() => relBase)
  const files = status.files.map((file) => {
    const stat = stats.get(file.path)
    return {
      ...file,
      rel: relativeToSession(cwdReal, root, file.path),
      additions: stat === undefined ? null : stat.additions,
      deletions: stat === undefined ? null : stat.deletions,
      stagedStats: stagedStats.get(file.path) ?? null,
      unstagedStats: unstagedStats.get(file.path) ?? null,
    }
  })
  return {
    isRepo: true,
    cwd,
    root,
    gitMissing: false,
    branch: status.branch,
    detached: status.detached,
    upstream: status.upstream,
    ahead: status.ahead,
    behind: status.behind,
    files: files.slice(0, FILE_LIMIT),
    filesTruncated: files.length > FILE_LIMIT,
    hasMore,
    commits,
    head: commits.length > 0 ? commits[0].short : null,
  }
}

/**
 * Files changed by one commit, compared with its first parent.
 * @param {string} cwd - the session's working directory.
 * @param {string} hash - commit hash.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ files: Array<object> }>} changed files with status and line counts.
 */
export async function commitDetail(cwd, hash, signal, sessionCwd) {
  const resolved = await resolveRoot(cwd, signal)
  if (resolved === null) throw new Error('not a git repository')
  if ('missing' in resolved) throw new Error('git is not installed')
  const root = resolved.root
  const [nameStatusText, numstatText] = await Promise.all([
    runGit(root, ['show', '--format=', '--name-status', '-z', '--first-parent', hash], signal),
    runGit(root, ['show', '--format=', '--numstat', '-z', '--first-parent', hash], signal).catch(
      () => '',
    ),
  ])
  const stats = parseNumstat(numstatText)
  const relBase = typeof sessionCwd === 'string' && sessionCwd !== '' ? sessionCwd : cwd
  const cwdReal = await realpath(relBase).catch(() => relBase)
  const files = parseNameStatus(nameStatusText).map((file) => {
    const stat = stats.get(file.path)
    return {
      path: file.path,
      status: file.status,
      origPath: file.origPath,
      rel: relativeToSession(cwdReal, root, file.path),
      additions: stat === undefined ? null : stat.additions,
      deletions: stat === undefined ? null : stat.deletions,
    }
  })
  return { files: files.slice(0, FILE_LIMIT) }
}
/**
 * Accept one repository-relative path from the browser.
 * @param {unknown} value - path field.
 * @returns {string | null} a safe `/`-separated path, or null.
 */
function repoPath(value) {
  if (typeof value !== 'string' || value === '' || value.includes('\0')) return null
  const normalized = value.replace(/\\/g, '/')
  if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) return null
  if (normalized.split('/').some((segment) => segment === '..' || segment === '')) return null
  return normalized
}

/**
 * Truncate a diff at the last complete line under the byte ceiling.
 * @param {string} text - unified diff.
 * @returns {string} the capped diff.
 */
function capDiff(text) {
  const cut = text.lastIndexOf('\n', DIFF_LIMIT)
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, DIFF_LIMIT)) + '\n'
}

/**
 * Whether a resolved path stays inside the resolved repository root.
 * @param {string} root - resolved root.
 * @param {string} target - resolved file.
 * @returns {boolean} containment.
 */
function insideRoot(root, target) {
  return target === root || target.startsWith(root + path.sep)
}

/**
 * Synthesize a unified diff for an untracked file, which git has no baseline for.
 * @param {string} root - repository root.
 * @param {string} filePath - repository-relative path.
 * @returns {Promise<object>} diff payload.
 */
async function untrackedDiff(root, filePath) {
  const real = await realpath(path.join(root, filePath))
  const rootReal = await realpath(root)
  if (!insideRoot(rootReal, real)) throw new Error('file is outside the repository')
  const info = await stat(real)
  if (!info.isFile()) throw new Error('not a file')
  if (info.size > UNTRACKED_LIMIT) {
    return { diff: '', binary: false, truncated: true, tooLarge: true, hasHunks: false, empty: false }
  }
  const buffer = await readFile(real)
  if (buffer.includes(0)) {
    return { diff: '', binary: true, truncated: false, tooLarge: false, hasHunks: false, empty: false }
  }
  const text = buffer.toString('utf8')
  if (text === '') {
    return { diff: '', binary: false, truncated: false, tooLarge: false, hasHunks: false, empty: true }
  }
  const all = text.split('\n')
  if (all.length > 0 && all[all.length - 1] === '') all.pop()
  const truncated = all.length > UNTRACKED_LINES
  const lines = truncated ? all.slice(0, UNTRACKED_LINES) : all
  const header =
    'diff --git a/' + filePath + ' b/' + filePath + '\n' +
    'new file mode 100644\n' +
    '--- /dev/null\n' +
    '+++ b/' + filePath + '\n' +
    '@@ -0,0 +1,' + lines.length + ' @@\n'
  return {
    diff: header + lines.map((line) => '+' + line).join('\n') + '\n',
    binary: false,
    truncated,
    tooLarge: false,
    hasHunks: lines.length > 0,
    empty: false,
  }
}

/**
 * Unified diff of one working-tree file against HEAD, or of one file inside a
 * commit when `rev` is supplied. Untracked files are synthesized.
 * @param {string} cwd - the session's working directory.
 * @param {object} request - `{ path, origPath?, rev?, untracked? }`.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<object>} diff payload consumed by the Client.
 */
export async function fileDiff(cwd, request, signal) {
  const resolved = await resolveRoot(cwd, signal)
  if (resolved === null) throw new Error('not a git repository')
  if ('missing' in resolved) throw new Error('git is not installed')
  const root = resolved.root
  const body = request !== null && typeof request === 'object' ? request : {}
  const filePath = repoPath(body.path)
  if (filePath === null) throw new Error('path is invalid')
  const rawOrig = typeof body.origPath === 'string' && body.origPath !== '' ? body.origPath : null
  const origPath = rawOrig === null ? null : repoPath(rawOrig)
  if (rawOrig !== null && origPath === null) throw new Error('origPath is invalid')
  const rawRev = typeof body.rev === 'string' && body.rev !== '' ? body.rev : null
  const rev = rawRev !== null && /^[0-9a-f]{4,64}$/i.test(rawRev) ? rawRev : null
  if (rawRev !== null && rev === null) throw new Error('rev is invalid')
  if (rev === null && body.untracked === true) return untrackedDiff(root, filePath)
  const paths = origPath === null || origPath === filePath ? ['--', filePath] : ['--', filePath, origPath]
  let diff = ''
  try {
    if (rev !== null) {
      diff = await runGit(
        root,
        [
          '--literal-pathspecs',
          'show',
          '--format=',
          '--no-color',
          '--no-ext-diff',
          '-U3',
          '-M',
          '--first-parent',
          rev,
          ...paths,
        ],
        signal,
      )
    } else {
      diff = await runGit(
        root,
        ['--literal-pathspecs', 'diff', 'HEAD', '--no-color', '--no-ext-diff', '-U3', '-M', ...paths],
        signal,
      )
    }
  } catch (error) {
    if (signal?.aborted) throw error
    if (rev !== null) throw error
    const [staged, unstaged] = await Promise.all([
      runGit(root, ['--literal-pathspecs', 'diff', '--cached', '--no-color', '--no-ext-diff', '-U3', ...paths], signal).catch(
        () => '',
      ),
      runGit(root, ['--literal-pathspecs', 'diff', '--no-color', '--no-ext-diff', '-U3', ...paths], signal).catch(
        () => '',
      ),
    ])
    diff = [staged, unstaged].filter((part) => part !== '').join('\n')
  }
  const truncated = diff.length > DIFF_LIMIT
  return {
    diff: truncated ? capDiff(diff) : diff,
    binary: /^Binary files .* differ$/m.test(diff),
    truncated,
    tooLarge: false,
    hasHunks: /^@@ /m.test(diff),
    empty: diff === '',
  }
}

/**
 * Stage one file (including its deletion) or fail with git's message.
 * @param {string} cwd - the session's working directory.
 * @param {string} filePath - repository-relative path.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function stageFile(cwd, filePath, signal) {
  const root = await requireRoot(cwd, signal)
  const target = repoPath(filePath)
  if (target === null) throw new Error('path is invalid')
  await runGit(root, ['--literal-pathspecs', 'add', '-A', '--', target], signal)
  return { ok: true }
}

/**
 * Unstage one file without touching its working-tree content.
 * @param {string} cwd - the session's working directory.
 * @param {string} filePath - repository-relative path.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function unstageFile(cwd, filePath, signal) {
  const root = await requireRoot(cwd, signal)
  const target = repoPath(filePath)
  if (target === null) throw new Error('path is invalid')
  if (await hasHead(root, signal)) {
    await runGit(root, ['--literal-pathspecs', 'restore', '--staged', '--', target], signal)
  } else {
    await runGit(root, ['--literal-pathspecs', 'rm', '--cached', '--', target], signal)
  }
  return { ok: true }
}

/**
 * Stage every change in the repository.
 * @param {string} cwd - the session's working directory.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function stageAll(cwd, signal) {
  const root = await requireRoot(cwd, signal)
  await runGit(root, ['--literal-pathspecs', 'add', '-A'], signal)
  return { ok: true }
}

/**
 * Unstage every change in the repository, keeping the working tree intact.
 * @param {string} cwd - the session's working directory.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function unstageAll(cwd, signal) {
  const root = await requireRoot(cwd, signal)
  if (await hasHead(root, signal)) {
    await runGit(root, ['--literal-pathspecs', 'restore', '--staged', '--', '.'], signal)
  } else {
    await runGit(root, ['--literal-pathspecs', 'rm', '-r', '--cached', '--', '.'], signal)
  }
  return { ok: true }
}

/**
 * Commit everything currently staged.
 * @param {string} cwd - the session's working directory.
 * @param {string} message - commit message.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true, hash: string, short: string, output: string }>} the new commit.
 */
export async function commitChanges(cwd, message, signal) {
  const root = await requireRoot(cwd, signal)
  const text = typeof message === 'string' ? message.trim() : ''
  if (text === '') throw new Error('commit message is required')
  if (text.length > 20000) throw new Error('commit message is too long')
  const output = await runGit(root, ['commit', '-m', text], signal, 20000)
  const hash = (await runGit(root, ['rev-parse', 'HEAD'], signal)).trim()
  const short = (await runGit(root, ['rev-parse', '--short', 'HEAD'], signal)).trim()
  return { ok: true, hash, short, output: output.trim() }
}

/**
 * Whether git tracks a path in the index.
 * @param {string} root - repository root.
 * @param {string} target - repository-relative path.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<boolean>} true when the index knows the path.
 */
async function isTracked(root, target, signal) {
  try {
    await runGit(root, ['--literal-pathspecs', 'ls-files', '--error-unmatch', '--', target], signal)
    return true
  } catch (error) {
    if (signal?.aborted) throw error
    return false
  }
}

/**
 * Delete one untracked file after proving it still lives inside the repository.
 * @param {string} root - repository root.
 * @param {string} target - repository-relative path.
 * @returns {Promise<void>} after the file is gone.
 */
async function removeRepoFile(root, target) {
  const real = await realpath(path.join(root, target))
  const rootReal = await realpath(root)
  if (!insideRoot(rootReal, real)) throw new Error('file is outside the repository')
  const info = await stat(real)
  if (!info.isFile()) throw new Error('not a file')
  await rm(real)
}

/**
 * Discard every uncommitted change of one path: restore tracked files from
 * HEAD, delete untracked files. Destructive; the Client confirms first.
 * @param {string} cwd - the session's working directory.
 * @param {string} filePath - repository-relative path.
 * @param {string | null} origPath - original path of a rename, if any.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function discardChanges(cwd, filePath, origPath, signal) {
  const root = await requireRoot(cwd, signal)
  const target = repoPath(filePath)
  if (target === null) throw new Error('path is invalid')
  const original = origPath === undefined || origPath === null ? null : repoPath(origPath)
  if (origPath !== undefined && origPath !== null && original === null) throw new Error('origPath is invalid')
  const head = await hasHead(root, signal)
  const tracked = await isTracked(root, target, signal)
  if (!head) {
    if (tracked) await runGit(root, ['--literal-pathspecs', 'rm', '--cached', '--', target], signal).catch(() => '')
    await removeRepoFile(root, target)
    return { ok: true }
  }
  if (!tracked) {
    await removeRepoFile(root, target)
    return { ok: true }
  }
  const paths = original === null || original === target ? [target] : [target, original]
  await runGit(
    root,
    ['--literal-pathspecs', 'restore', '--source=HEAD', '--staged', '--worktree', '--', ...paths],
    signal,
  )
  return { ok: true }
}

/**
 * Show one path in the platform file manager.
 * @param {string} cwd - the session's working directory.
 * @param {string} filePath - repository-relative path.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true }>} success.
 */
export async function revealInFileManager(cwd, filePath, signal) {
  const root = await requireRoot(cwd, signal)
  const target = repoPath(filePath)
  if (target === null) throw new Error('path is invalid')
  const absolute = path.join(root, target)
  const rootReal = await realpath(root)
  let exists = true
  let real = absolute
  try {
    real = await realpath(absolute)
  } catch {
    exists = false
  }
  const reveal = exists ? real : path.dirname(absolute)
  if (!insideRoot(rootReal, exists ? real : path.dirname(absolute))) throw new Error('file is outside the repository')
  const command =
    process.platform === 'darwin'
      ? ['open', ['-R', reveal]]
      : process.platform === 'win32'
        ? ['explorer.exe', [exists ? '/select,' + real : reveal]]
        : ['xdg-open', [reveal]]
  await new Promise((resolve, reject) => {
    execFile(command[0], command[1], { timeout: 5000 }, (error) => {
      if (error !== null) reject(error)
      else resolve()
    })
  })
  return { ok: true }
}

/**
 * Accept one branch name from the browser.
 * @param {unknown} value - branch field.
 * @returns {string | null} a safe branch name, or null.
 */
function branchName(value) {
  if (typeof value !== 'string') return null
  const name = value.trim()
  if (name === '' || name.startsWith('-') || name.includes('..') || name.includes(' ')) return null
  if (!/^[A-Za-z0-9._/-]+$/.test(name)) return null
  return name
}

/**
 * List local branches with the current one marked.
 * @param {string} cwd - the session's working directory.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ current: string | null, branches: Array<{ name: string, current: boolean }> }>} branches.
 */
export async function listBranches(cwd, signal) {
  const root = await requireRoot(cwd, signal)
  const output = await runGit(root, ['for-each-ref', '--format=%(refname:short)%09%(HEAD)', 'refs/heads'], signal)
  const branches = []
  let current = null
  for (const line of output.split('\n')) {
    if (line === '') continue
    const separator = line.indexOf('\t')
    const name = separator < 0 ? line : line.slice(0, separator)
    const isCurrent = separator >= 0 && line.slice(separator + 1).trim() === '*'
    if (isCurrent) current = name
    branches.push({ name, current: isCurrent })
  }
  branches.sort((left, right) => Number(right.current) - Number(left.current) || left.name.localeCompare(right.name))
  return { current, branches }
}

/**
 * Switch to one existing local branch.
 * @param {string} cwd - the session's working directory.
 * @param {string} name - branch name.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true, branch: string }>} success.
 */
export async function switchBranch(cwd, name, signal) {
  const root = await requireRoot(cwd, signal)
  const branch = branchName(name)
  if (branch === null) throw new Error('branch name is invalid')
  try {
    await runGit(root, ['show-ref', '--verify', '--quiet', 'refs/heads/' + branch], signal)
  } catch (error) {
    if (signal?.aborted) throw error
    throw new Error('branch not found: ' + branch)
  }
  await runGit(root, ['switch', branch], signal, 20000)
  return { ok: true, branch }
}

/**
 * Create a branch and switch to it.
 * @param {string} cwd - the session's working directory.
 * @param {string} name - new branch name.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true, branch: string }>} success.
 */
export async function createBranch(cwd, name, signal) {
  const root = await requireRoot(cwd, signal)
  const branch = branchName(name)
  if (branch === null) throw new Error('branch name is invalid')
  await runGit(root, ['switch', '-c', branch], signal, 20000)
  return { ok: true, branch }
}

/**
 * Fetch, fast-forward pull, or push the current branch.
 * @param {string} cwd - the session's working directory.
 * @param {string} action - `fetch`, `pull`, or `push`.
 * @param {AbortSignal | undefined} signal - request lifetime.
 * @returns {Promise<{ ok: true, output: string }>} git output.
 */
export async function syncRepo(cwd, action, signal) {
  const root = await requireRoot(cwd, signal)
  if (action === 'fetch') {
    const output = await runGit(root, ['fetch', '--all', '--prune'], signal, 30000)
    return { ok: true, output: output.trim() }
  }
  if (action === 'pull') {
    const output = await runGit(root, ['pull', '--ff-only'], signal, 30000)
    return { ok: true, output: output.trim() }
  }
  if (action === 'push') {
    const branch = (await runGit(root, ['rev-parse', '--abbrev-ref', 'HEAD'], signal)).trim()
    if (branch === 'HEAD') throw new Error('HEAD is detached')
    let upstream = true
    try {
      await runGit(root, ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], signal)
    } catch (error) {
      if (signal?.aborted) throw error
      upstream = false
    }
    const output = upstream
      ? await runGit(root, ['push'], signal, 30000)
      : await runGit(root, ['push', '-u', 'origin', branch], signal, 30000)
    return { ok: true, output: output.trim() }
  }
  throw new Error('unknown sync action')
}
