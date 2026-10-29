window.__ModuleLoader__.load({
  id: 'dsh-sidebar-git',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Locale namespace owned by this package. */
    const NS = 'sidebarGit'
    /** This tab type's identity in the sidebar registry and its body slot key. */
    const TAB_ID = 'dsh-sidebar-git-v3'
    /** The tab kind this package owns. */
    const KIND = 'gitpanel'
    /** One commit row's height, shared with the lane geometry. */
    const ROW = 30
    /** Graph lane ink; fixed data-viz colors, readable on both themes. */
    const LANE_COLORS = ['#4c8dff', '#ff9f43', '#3ecf8e', '#c792ea', '#ff6b81', '#f5c542']
    /** Share of the body given to the changes pane on first open. */
    const DEFAULT_SPLIT = 0.64
    /** Per-session storage key for the dragged split. */
    const SPLIT_PREFIX = 'dsh.gitPanel.split.v2.'
    /** Stable empty list so the detail memo does not churn. */
    const NO_FILES = []
    /** Diff lines rendered before the view stops adding rows. */
    const DIFF_RENDER_LINES = 4000

    const zh = {
      'type.label': 'Git',
      'guide.title': 'Git',
      'guide.description': '改动文件与提交树',
      changes: '更改',
      history: '提交',
      clean: '没有未提交的更改',
      noCommits: '还没有提交',
      loading: '正在读取 Git 数据…',
      refresh: '刷新',
      retry: '重试',
      notRepo: '当前工作目录不在 Git 仓库里。',
      gitMissing: '没有找到 git 命令，无法读取仓库。',
      detached: 'HEAD（游离）',
      noSubject: '（无提交信息）',
      error: '读取失败：{message}',
      noWorkspace: '这个会话没有工作区目录。',
      filesTruncated: '改动太多，只显示了前 {count} 个。',
      upstream: '上游 {name}',
      back: '返回',
      openFile: '打开文件',
      diffLoading: '正在读取差异…',
      diffError: '读取差异失败：{message}',
      diffBinary: '二进制文件，无法显示文本差异。',
      diffEmpty: '没有文本差异。',
      diffMetaOnly: '只有重命名或权限等元数据变更。',
      diffTruncated: '差异太大，只显示了开头部分。',
      diffTooLarge: '文件太大，无法显示差异。',
      commitDetails: '提交详情',
      commitFiles: '{count} 个文件',
      commitLoading: '正在读取提交…',
      commitError: '读取提交失败：{message}',
      commitEmpty: '这个提交没有文件改动。',
      dragHint: '拖动调整上下两栏高度',
    }

    const en = {
      'type.label': 'Git',
      'guide.title': 'Git',
      'guide.description': 'Changed files and the commit graph',
      changes: 'Changes',
      history: 'Commits',
      clean: 'No uncommitted changes',
      noCommits: 'No commits yet',
      loading: 'Reading Git data…',
      refresh: 'Refresh',
      retry: 'Retry',
      notRepo: 'The session directory is not inside a Git repository.',
      gitMissing: 'The git command was not found.',
      detached: 'HEAD (detached)',
      noSubject: '(no commit message)',
      error: 'Could not read Git data: {message}',
      noWorkspace: 'This session has no workspace directory.',
      filesTruncated: 'Too many changes; showing the first {count}.',
      upstream: 'Upstream {name}',
      back: 'Back',
      openFile: 'Open file',
      diffLoading: 'Reading diff…',
      diffError: 'Could not read the diff: {message}',
      diffBinary: 'Binary file; no text diff to show.',
      diffEmpty: 'No text changes.',
      diffMetaOnly: 'Only metadata changed (rename, mode, …).',
      diffTruncated: 'The diff is too large; showing the beginning.',
      diffTooLarge: 'The file is too large to show a diff.',
      commitDetails: 'Commit details',
      commitFiles: '{count} files',
      commitLoading: 'Reading commit…',
      commitError: 'Could not read the commit: {message}',
      commitEmpty: 'This commit changed no files.',
      dragHint: 'Drag to resize the two sections',
    }

    /** Git branch glyph used by the guide card, the tab title and the header. */
    function GitGlyph({ size = 22, className }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          className,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('circle', { cx: 7, cy: 5, r: 2.4 }),
        h('circle', { cx: 17, cy: 5, r: 2.4 }),
        h('circle', { cx: 7, cy: 19, r: 2.4 }),
        h('path', { d: 'M7 7.4v9.2' }),
        h('path', { d: 'M17 7.4v2.4c0 3.2-2.4 5.6-5.6 5.6H9.4' }),
      )
    }

    /** Refresh arrow. */
    function RefreshGlyph({ size = 15 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
        h('path', { d: 'M20 5v6h-6' }),
      )
    }

    /** Left arrow used by the diff view's back control. */
    function BackGlyph({ size = 15 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.9,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M15 5l-7 7 7 7' }),
        h('path', { d: 'M8 12h12' }),
      )
    }

    /** External-link arrow used to open the file beside its diff. */
    function OpenGlyph({ size = 15 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M14 4h6v6' }),
        h('path', { d: 'M20 4l-9 9' }),
        h('path', { d: 'M18 13v6H5V6h6' }),
      )
    }

    /**
     * Translate a template message.
     * @param {Function} t - namespace-bound translate.
     * @param {string} key - message key.
     * @param {object} [values] - placeholders.
     * @returns {string} the translated text.
     */
    function message(t, key, values) {
      const text = t(key)
      if (values === undefined) return text
      return text.replace(/\{(\w+)\}/g, (match, name) =>
        Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
      )
    }

    /**
     * The letter shown for a working-tree entry.
     * @param {object} file - one status entry.
     * @returns {string} one status letter.
     */
    function statusLetter(file) {
      if (file.conflicted) return '!'
      if (file.untracked) return 'U'
      if (file.worktree !== ' ' && file.worktree !== '?') return file.worktree
      if (file.index !== ' ' && file.index !== '?') return file.index
      return '?'
    }

    /**
     * Last path segment.
     * @param {string} filePath - repository-relative path.
     * @returns {string} the file name.
     */
    function baseName(filePath) {
      const index = filePath.lastIndexOf('/')
      return index < 0 ? filePath : filePath.slice(index + 1)
    }

    /**
     * Everything before the last path segment.
     * @param {string} filePath - repository-relative path.
     * @returns {string} the directory, or an empty string at the root.
     */
    function dirName(filePath) {
      const index = filePath.lastIndexOf('/')
      return index < 0 ? '' : filePath.slice(0, index)
    }

    /**
     * Decoration badges of one commit.
     * @param {string} raw - `%D` output.
     * @returns {Array<{ kind: string, label: string }>} badges.
     */
    function decorations(raw) {
      if (typeof raw !== 'string' || raw === '') return []
      const badges = []
      for (const part of raw.split(',')) {
        const name = part.trim()
        if (name === '') continue
        if (name.startsWith('HEAD -> ')) badges.push({ kind: 'head', label: name.slice(8) })
        else if (name === 'HEAD') badges.push({ kind: 'head', label: 'HEAD' })
        else if (name.startsWith('tag: ')) badges.push({ kind: 'tag', label: name.slice(5) })
        else if (name.includes('/')) badges.push({ kind: 'remote', label: name })
        else badges.push({ kind: 'branch', label: name })
      }
      return badges
    }

    /**
     * Two-digit month and day.
     * @param {number} seconds - unix seconds.
     * @returns {string} a short date.
     */
    function shortDate(seconds) {
      if (!Number.isFinite(seconds) || seconds <= 0) return ''
      const date = new Date(seconds * 1000)
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return month + '-' + day
    }

    /**
     * The address that opens a changed file through its Session.
     * @param {string} sessionId - owning Session.
     * @param {string} relativePath - path relative to the Session workspace.
     * @returns {string} a `dsh-resource://file/…` address.
     */
    function sessionFileAddress(sessionId, relativePath) {
      const normalized = relativePath.replace(/\\/g, '/').replace(/^(?:\.\/)+/, '')
      const encoded = normalized.split('/').map((segment) => encodeURIComponent(segment)).join('/')
      return 'dsh-resource://file/session/' + encodeURIComponent(sessionId) + '/' + encoded
    }

    /**
     * Read the persisted split for one Session.
     * @param {string} sessionId - current Session.
     * @returns {number} a ratio between 0.2 and 0.8.
     */
    function readSplit(sessionId) {
      try {
        if (typeof window === 'undefined' || window.localStorage == null) return DEFAULT_SPLIT
        const value = Number(window.localStorage.getItem(SPLIT_PREFIX + sessionId))
        if (Number.isFinite(value) && value >= 0.2 && value <= 0.8) return value
      } catch {
        // Fall through to the default.
      }
      return DEFAULT_SPLIT
    }

    /**
     * Persist the split for one Session.
     * @param {string} sessionId - current Session.
     * @param {number} value - ratio between 0.2 and 0.8.
     */
    function writeSplit(sessionId, value) {
      try {
        if (typeof window === 'undefined' || window.localStorage == null) return
        window.localStorage.setItem(SPLIT_PREFIX + sessionId, String(value))
      } catch {
        // A blocked storage area only loses the preference.
      }
    }

    /**
     * Assign every commit a lane and the edges it draws.
     * @param {Array<object>} commits - newest first, parents after children.
     * @returns {{ rows: Array<object>, maxLanes: number }} laid-out rows and the lane count.
     */
    function layoutCommits(commits) {
      const lanes = []
      const rows = []
      const seen = new Set()
      for (const commit of commits) {
        if (seen.has(commit.hash)) continue
        seen.add(commit.hash)
        let lane = lanes.indexOf(commit.hash)
        if (lane < 0) {
          lane = lanes.length
          lanes.push(commit.hash)
        }
        const before = lanes.slice()
        const targets = []
        const parents = commit.parents
        if (parents.length === 0) {
          lanes.splice(lane, 1)
        } else {
          const existing = lanes.indexOf(parents[0])
          if (existing >= 0) {
            lanes.splice(lane, 1)
            targets.push({ to: existing > lane ? existing - 1 : existing })
          } else {
            lanes[lane] = parents[0]
            targets.push({ to: lane })
          }
          let cursor = existing >= 0 ? lane : lane + 1
          for (let index = 1; index < parents.length; index += 1) {
            const parent = parents[index]
            const found = lanes.indexOf(parent)
            if (found >= 0) {
              targets.push({ to: found })
              continue
            }
            const at = Math.min(cursor, lanes.length)
            lanes.splice(at, 0, parent)
            targets.push({ to: at })
            cursor = at + 1
          }
        }
        rows.push({ commit, lane, before, after: lanes.slice(), targets })
      }
      let maxLanes = 1
      for (const row of rows) {
        maxLanes = Math.max(maxLanes, row.before.length, row.after.length, row.lane + 1)
      }
      return { rows, maxLanes }
    }

    /**
     * One cubic (or straight) connector.
     * @returns {string} an SVG path.
     */
    function connector(x1, y1, x2, y2) {
      if (x1 === x2) return 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2
      const middle = (y1 + y2) / 2
      return 'M ' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + middle + ', ' + x2 + ' ' + middle + ', ' + x2 + ' ' + y2
    }

    /** Added and removed line counts of one file, VSCode style. */
    function Stats({ file }) {
      const added = file.additions === null || file.additions === undefined ? null : Number(file.additions)
      const deleted = file.deletions === null || file.deletions === undefined ? null : Number(file.deletions)
      const showAdd = Number.isFinite(added) && added > 0
      const showDel = Number.isFinite(deleted) && deleted > 0
      if (!showAdd && !showDel) return null
      return h(
        'span',
        { className: 'dshgit-stats' },
        showAdd ? h('span', { className: 'dshgit-add' }, '+' + added) : null,
        showDel ? h('span', { className: 'dshgit-del' }, '-' + deleted) : null,
      )
    }

    /** Two-letter or symbol badge per extension; literal colors are artwork. */
    const FILE_BADGES = {
      js: ['JS', 'js'], mjs: ['JS', 'js'], cjs: ['JS', 'js'], jsx: ['JS', 'js'],
      ts: ['TS', 'ts'], tsx: ['TS', 'ts'], mts: ['TS', 'ts'], cts: ['TS', 'ts'],
      json: ['{}', 'json'], jsonc: ['{}', 'json'], json5: ['{}', 'json'],
      css: ['#', 'css'], scss: ['#', 'css'], sass: ['#', 'css'], less: ['#', 'css'],
      html: ['<>', 'html'], htm: ['<>', 'html'], vue: ['<>', 'html'],
      svelte: ['<>', 'html'], astro: ['<>', 'html'], xml: ['<>', 'html'],
      md: ['MD', 'md'], mdx: ['MD', 'md'], markdown: ['MD', 'md'],
      py: ['PY', 'py'], pyi: ['PY', 'py'],
      rb: ['RB', 'rb'],
      go: ['GO', 'go'],
      rs: ['RS', 'rs'],
      java: ['JV', 'java'],
      kt: ['KT', 'kt'], kts: ['KT', 'kt'],
      c: ['C', 'c'], h: ['C', 'c'],
      cc: ['C+', 'cpp'], cpp: ['C+', 'cpp'], cxx: ['C+', 'cpp'], hpp: ['C+', 'cpp'], hxx: ['C+', 'cpp'],
      cs: ['C#', 'cs'],
      php: ['P', 'php'],
      swift: ['SW', 'swift'],
      sh: ['>_', 'shell'], bash: ['>_', 'shell'], zsh: ['>_', 'shell'],
      fish: ['>_', 'shell'], ksh: ['>_', 'shell'],
      ps1: ['PS', 'shell'],
      yml: ['Y', 'yaml'], yaml: ['Y', 'yaml'],
      toml: ['T', 'toml'],
      ini: ['≡', 'config'], conf: ['≡', 'config'], cfg: ['≡', 'config'],
      env: ['≡', 'config'], properties: ['≡', 'config'],
      sql: ['S', 'sql'],
      lock: ['LK', 'lock'],
    }
    /** Extensions drawn as a picture glyph instead of a letter badge. */
    const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'avif', 'tiff', 'svg'])

    /**
     * Classification of one path for its leading icon.
     * @param {string} filePath - repository-relative path.
     * @returns {{ label?: string, kind: string, glyph?: string }} badge text or glyph choice.
     */
    function fileInfo(filePath) {
      const name = baseName(filePath).toLowerCase()
      if (name === 'dockerfile' || name.startsWith('dockerfile.')) return { label: 'DK', kind: 'docker' }
      if (name === 'makefile' || name === 'gnumakefile') return { label: 'MK', kind: 'make' }
      if (name === '.gitignore' || name === '.gitattributes' || name === '.gitmodules') return { label: 'G', kind: 'git' }
      const dot = name.lastIndexOf('.')
      const extension = dot >= 0 ? name.slice(dot + 1) : ''
      if (IMAGE_EXTENSIONS.has(extension)) return { glyph: 'image', kind: 'image' }
      if (extension === 'pdf') return { glyph: 'doc', kind: 'pdf' }
      const badge = FILE_BADGES[extension]
      if (badge !== undefined) return { label: badge[0], kind: badge[1] }
      return { glyph: 'doc', kind: 'doc' }
    }

    /** Leading file-type icon: a colored letter chip, or a picture/document glyph. */
    function FileIcon({ filePath }) {
      const info = fileInfo(filePath)
      if (info.glyph === 'image') {
        return h(
          'svg',
          {
            className: 'dshgit-ficon dshgit-fileglyph',
            'data-k': info.kind,
            viewBox: '0 0 16 16',
            width: 14,
            height: 14,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'aria-hidden': true,
            focusable: false,
          },
          h('rect', { x: 1.75, y: 2.75, width: 12.5, height: 10.5, rx: 2 }),
          h('circle', { cx: 5.5, cy: 6, r: 1.1, fill: 'currentColor', stroke: 'none' }),
          h('path', { d: 'M2.5 12.2l3.4-3.4 2.4 2.4 2-2 3.2 3.4' }),
        )
      }
      if (info.glyph === 'doc') {
        return h(
          'svg',
          {
            className: 'dshgit-ficon dshgit-fileglyph',
            'data-k': info.kind,
            viewBox: '0 0 16 16',
            width: 14,
            height: 14,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.2,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            'aria-hidden': true,
            focusable: false,
          },
          h('path', { d: 'M4 1.75h4.75L12 5v9.25H4z' }),
          h('path', { d: 'M8.75 1.75V5H12' }),
          h('path', { d: 'M6 8.25h4M6 10.5h3' }),
        )
      }
      return h(
        'span',
        { className: 'dshgit-ficon dshgit-filebadge', 'data-k': info.kind, 'aria-hidden': true },
        info.label,
      )
    }

    /** One single-line file row; clicking it opens the file's unified diff. */
    function FileRow({ file, onOpen, commitStatus }) {
      const letter = commitStatus === undefined ? statusLetter(file) : file.status
      const name = baseName(file.path)
      const directory = dirName(file.path)
      const label =
        file.origPath === null || file.origPath === undefined ? file.path : file.origPath + ' → ' + file.path
      return h(
        'button',
        {
          type: 'button',
          className: 'dshgit-row',
          title: label,
          onClick: () => onOpen(file),
        },
        h(
          'span',
          { className: 'dshgit-path' },
          h(FileIcon, { filePath: file.path }),
          h('span', { className: 'dshgit-name' }, name),
          directory === '' ? null : h('span', { className: 'dshgit-dir' }, directory),
        ),
        h(Stats, { file }),
        h('span', { className: 'dshgit-status', 'data-s': letter }, letter),
      )
    }

    /** One commit row: lane geometry on the left, one compact text line on the right. */
    function CommitRow({ row, step, width, expanded, onToggle, t }) {
      const before = row.before
      const after = row.after
      const lane = row.lane
      const x = (index) => 6 + index * step
      const pieces = []
      const expected = before[lane] === row.commit.hash
      if (expected) {
        pieces.push(
          h('path', {
            key: 'own-top',
            d: connector(x(lane), 0, x(lane), ROW / 2),
            fill: 'none',
            stroke: LANE_COLORS[lane % LANE_COLORS.length],
            strokeWidth: 1.8,
            strokeLinecap: 'round',
          }),
        )
      }
      for (let index = 0; index < before.length; index += 1) {
        const hash = before[index]
        if (hash === row.commit.hash) continue
        const to = after.indexOf(hash)
        if (to < 0) continue
        pieces.push(
          h('path', {
            key: 'lane-' + index,
            d: connector(x(index), 0, x(to), ROW),
            fill: 'none',
            stroke: LANE_COLORS[index % LANE_COLORS.length],
            strokeWidth: 1.4,
            strokeLinecap: 'round',
            opacity: 0.8,
          }),
        )
      }
      row.targets.forEach((target, index) => {
        pieces.push(
          h('path', {
            key: 'edge-' + index,
            d: connector(x(lane), ROW / 2, x(target.to), ROW),
            fill: 'none',
            stroke: LANE_COLORS[lane % LANE_COLORS.length],
            strokeWidth: 1.8,
            strokeLinecap: 'round',
          }),
        )
      })
      const refs = decorations(row.commit.refs).slice(0, 2)
      const title =
        row.commit.subject +
        '\n' +
        row.commit.author +
        ' · ' +
        shortDate(row.commit.time) +
        '\n' +
        row.commit.hash
      return h(
        'button',
        {
          type: 'button',
          className: 'dshgit-commit',
          'aria-expanded': expanded,
          title,
          onClick: () => onToggle(row.commit.hash),
        },
        h(
          'svg',
          {
            className: 'dshgit-graph',
            width,
            height: ROW,
            viewBox: '0 0 ' + width + ' ' + ROW,
            'aria-hidden': true,
            focusable: false,
          },
          pieces,
          h('circle', {
            cx: x(lane),
            cy: ROW / 2,
            r: 3.5,
            fill: LANE_COLORS[lane % LANE_COLORS.length],
          }),
        ),
        h(
          'span',
          { className: 'dshgit-commit-text' },
          h(
            'span',
            { className: 'dshgit-subject' },
            row.commit.subject === '' ? t('noSubject') : row.commit.subject,
          ),
          refs.length === 0
            ? null
            : h(
                'span',
                { className: 'dshgit-refs' },
                refs.map((ref, index) =>
                  h(
                    'span',
                    { key: ref.kind + index, className: 'dshgit-ref', 'data-k': ref.kind },
                    ref.label,
                  ),
                ),
              ),
          h('span', { className: 'dshgit-hash' }, row.commit.short),
        ),
      )
    }

    /** The expanded files of one commit. */
    function CommitDetail({ commit, detail, onOpen, t }) {
      const files = detail.phase === 'ready' ? detail.files : NO_FILES
      let added = 0
      let deleted = 0
      for (const file of files) {
        if (typeof file.additions === 'number') added += file.additions
        if (typeof file.deletions === 'number') deleted += file.deletions
      }
      const head = h(
        'div',
        { className: 'dshgit-detail-head' },
        h('span', null, t('commitDetails')),
        h('span', { className: 'dshgit-hash' }, commit.short),
        h(
          'span',
          { className: 'dshgit-detail-meta' },
          added > 0 ? h('span', { className: 'dshgit-add' }, '+' + added) : null,
          deleted > 0 ? h('span', { className: 'dshgit-del' }, '-' + deleted) : null,
          h(
            'span',
            null,
            detail.phase === 'ready'
              ? message(t, 'commitFiles', { count: files.length })
              : commit.author + ' · ' + shortDate(commit.time),
          ),
        ),
      )
      let body
      if (detail.phase === 'loading') body = h('div', { className: 'dshgit-detail-empty' }, t('commitLoading'))
      else if (detail.phase === 'error')
        body = h(
          'div',
          { className: 'dshgit-detail-empty dshgit-detail-error' },
          message(t, 'commitError', { message: detail.error }),
        )
      else if (files.length === 0)
        body = h('div', { className: 'dshgit-detail-empty' }, t('commitEmpty'))
      else
        body = files.map((file, index) =>
          h(FileRow, {
            key: file.path + ':' + index,
            file,
            commitStatus: file.status,
            onOpen: (target) => onOpen(target, commit.hash),
          }),
        )
      return h('div', { className: 'dshgit-detail' }, head, body)
    }

    /**
     * Fetch one commit's changed files.
     * @param {string} cwd - session directory.
     * @param {string} hash - commit hash.
     * @param {AbortSignal} signal - request lifetime.
     * @returns {Promise<Array<object>>} changed files.
     */
    async function fetchCommit(cwd, hash, signal) {
      const response = await fetch('api/git-panel/commit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cwd, hash }),
        signal,
      })
      if (response.ok !== true) {
        const text = await response.text().catch(() => '')
        let detail = text
        try {
          const parsed = JSON.parse(text)
          if (parsed !== null && typeof parsed === 'object' && typeof parsed.error === 'string') detail = parsed.error
        } catch {
          // Keep the raw body.
        }
        throw new Error('HTTP ' + response.status + (detail === '' ? '' : ': ' + detail))
      }
      const value = await response.json()
      return value !== null && typeof value === 'object' && Array.isArray(value.files) ? value.files : NO_FILES
    }

    /**
     * Classify unified diff lines and restore the old/new line numbers.
     * @param {string} text - unified diff.
     * @returns {Array<{ type: string, text: string, old: number | string, new: number | string }>} renderable lines.
     */
    function parseDiffLines(text) {
      const raw = text.split('\n')
      if (raw.length > 0 && raw[raw.length - 1] === '') raw.pop()
      const lines = []
      let oldNumber = 0
      let newNumber = 0
      for (const line of raw) {
        if (line.startsWith('@@')) {
          const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line)
          if (match !== null) {
            oldNumber = Number(match[1]) - 1
            newNumber = Number(match[2]) - 1
          }
          lines.push({ type: 'hunk', text: line, old: '', new: '' })
          continue
        }
        if (
          line.startsWith('+++') ||
          line.startsWith('---') ||
          line.startsWith('diff --git') ||
          line.startsWith('index ') ||
          line.startsWith('new file mode') ||
          line.startsWith('deleted file mode') ||
          line.startsWith('old mode') ||
          line.startsWith('new mode') ||
          line.startsWith('similarity index') ||
          line.startsWith('rename from') ||
          line.startsWith('rename to') ||
          line.startsWith('Binary files')
        ) {
          lines.push({ type: 'meta', text: line, old: '', new: '' })
          continue
        }
        if (line.startsWith('+')) {
          newNumber += 1
          lines.push({ type: 'add', text: line.slice(1), old: '', new: newNumber })
          continue
        }
        if (line.startsWith('-')) {
          oldNumber += 1
          lines.push({ type: 'del', text: line.slice(1), old: oldNumber, new: '' })
          continue
        }
        if (line.startsWith(' ')) {
          oldNumber += 1
          newNumber += 1
          lines.push({ type: 'ctx', text: line.slice(1), old: oldNumber, new: newNumber })
          continue
        }
        lines.push({ type: 'meta', text: line, old: '', new: '' })
      }
      return lines
    }

    /**
     * Fetch one file's unified diff.
     * @param {string} cwd - session directory.
     * @param {object} file - the row being opened.
     * @param {string | null} rev - commit to compare, or null for the working tree.
     * @param {AbortSignal} signal - request lifetime.
     * @returns {Promise<object>} `{ diff, binary, truncated, tooLarge, empty, hasHunks }`.
     */
    async function fetchDiff(cwd, file, rev, signal) {
      const response = await fetch('api/git-panel/diff', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          cwd,
          path: file.path,
          origPath: file.origPath === undefined ? null : file.origPath,
          rev,
          untracked: file.untracked === true,
        }),
        signal,
      })
      if (response.ok !== true) {
        const text = await response.text().catch(() => '')
        let detail = text
        try {
          const parsed = JSON.parse(text)
          if (parsed !== null && typeof parsed === 'object' && typeof parsed.error === 'string') detail = parsed.error
        } catch {
          // Keep the raw body.
        }
        throw new Error('HTTP ' + response.status + (detail === '' ? '' : ': ' + detail))
      }
      return response.json()
    }

    /** The unified diff view that replaces both lists while one file is open. */
    function DiffView({ view, state, onBack, onReload, sessionId, tab, t }) {
      const file = view.file
      const letter =
        view.rev === null
          ? statusLetter(file)
          : typeof file.status === 'string'
            ? file.status
            : statusLetter(file)
      const deleted = letter === 'D'
      const openable = !deleted && typeof file.rel === 'string' && file.rel !== ''
      const name = baseName(file.path)
      const directory = dirName(file.path)
      const data = state.data
      const lines = React.useMemo(
        () =>
          state.phase === 'ready' && data !== null && typeof data.diff === 'string'
            ? parseDiffLines(data.diff)
            : NO_FILES,
        [state.phase, data],
      )
      const hasChanges = lines.some((line) => line.type === 'add' || line.type === 'del')
      const shownLines = lines.length > DIFF_RENDER_LINES ? lines.slice(0, DIFF_RENDER_LINES) : lines
      const lineTruncated = lines.length > DIFF_RENDER_LINES

      let content
      if (state.phase === 'loading') {
        content = h('div', { className: 'dshgit-empty' }, t('diffLoading'))
      } else if (state.phase === 'error') {
        content = h(
          'div',
          { className: 'dshgit-empty' },
          h('div', { className: 'dshgit-error' }, message(t, 'diffError', { message: state.error })),
          h('button', { type: 'button', className: 'dshgit-retry', onClick: onReload }, t('retry')),
        )
      } else if (data !== null && data.binary === true) {
        content = h('div', { className: 'dshgit-empty' }, t('diffBinary'))
      } else if (data !== null && data.tooLarge === true) {
        content = h('div', { className: 'dshgit-empty' }, t('diffTooLarge'))
      } else if (data !== null && data.empty === true) {
        content = h('div', { className: 'dshgit-empty' }, t('diffEmpty'))
      } else if (data !== null) {
        content = h(
          'div',
          { className: 'dshgit-diffbody' },
          hasChanges ? null : h('div', { className: 'dshgit-note' }, t('diffMetaOnly')),
          shownLines.map((line, index) =>
            h(
              'div',
              { key: index, className: 'dshgit-diffline', 'data-t': line.type },
              h('span', { className: 'dshgit-difflineno' }, line.old),
              h('span', { className: 'dshgit-difflineno' }, line.new),
              h('span', { className: 'dshgit-difflinetext' }, line.text === '' ? ' ' : line.text),
            ),
          ),
          data.truncated === true || lineTruncated
            ? h('div', { className: 'dshgit-note' }, t('diffTruncated'))
            : null,
        )
      }

      return h(
        'div',
        { className: 'dshgit-diff' },
        h(
          'div',
          { className: 'dshgit-diffhead' },
          h(
            'button',
            {
              type: 'button',
              className: 'dshgit-tool',
              title: t('back'),
              'aria-label': t('back'),
              onClick: onBack,
            },
            h(BackGlyph, {}),
          ),
          h(FileIcon, { filePath: file.path }),
          h('span', { className: 'dshgit-diffname', title: file.path }, name),
          directory === '' ? null : h('span', { className: 'dshgit-diffdir', title: directory }, directory),
          h('span', { className: 'dshgit-grow' }),
          view.rev === null ? null : h('span', { className: 'dshgit-hash' }, view.rev.slice(0, 7)),
          h('span', { className: 'dshgit-status', 'data-s': letter }, letter),
          h(Stats, { file }),
          openable
            ? h(
                'button',
                {
                  type: 'button',
                  className: 'dshgit-tool',
                  title: t('openFile'),
                  'aria-label': t('openFile'),
                  onClick: () => tab.actions.openResource(sessionFileAddress(sessionId, file.rel)),
                },
                h(OpenGlyph, {}),
              )
            : null,
          h(
            'button',
            {
              type: 'button',
              className: 'dshgit-tool',
              title: t('refresh'),
              'aria-label': t('refresh'),
              onClick: onReload,
            },
            h(RefreshGlyph, {}),
          ),
        ),
        content,
      )
    }

    /** Tab chip title: the branch glyph followed by the captured title. */
    function GitTitle({ useTabInfo }) {
      const info = useTabInfo()
      return h(React.Fragment, null, h(GitGlyph, { size: 16, className: 'dshgit-title-glyph' }), info.tab.title)
    }

    /** The tab body: changes on top, commit graph below, with a draggable split. */
    function GitBody({ useTabInfo, sessionId, useSessions, t }) {
      const info = useTabInfo()
      const tab = info.tab
      const cwd = useSessions((sessions) => sessions.byId[sessionId]?.cwd)
      const [state, setState] = React.useState({ phase: 'idle', data: null, error: null })
      const [revision, setRevision] = React.useState(0)
      const [split, setSplit] = React.useState(() => readSplit(sessionId))
      const [expanded, setExpanded] = React.useState(null)
      const [detail, setDetail] = React.useState({ hash: null, phase: 'idle', files: NO_FILES, error: null })
      const [diffView, setDiffView] = React.useState(null)
      const [diffState, setDiffState] = React.useState({ phase: 'idle', data: null, error: null })
      const bodyRef = React.useRef(null)
      const draggingRef = React.useRef(false)
      const detailCache = React.useRef(new Map())
      const detailController = React.useRef(null)
      const diffController = React.useRef(null)
      const visible = tab.visible !== false

      React.useEffect(() => {
        const timer = setTimeout(() => writeSplit(sessionId, split), 200)
        return () => clearTimeout(timer)
      }, [sessionId, split])

      React.useEffect(
        () => () => {
          detailController.current?.abort()
          diffController.current?.abort()
        },
        [],
      )

      React.useEffect(() => {
        if (cwd === undefined || cwd === null || cwd === '' || !visible) return undefined
        let cancelled = false
        let inFlight = false
        const controller = new AbortController()
        const load = async () => {
          if (inFlight) return
          inFlight = true
          setState((previous) =>
            previous.data === null
              ? { phase: 'loading', data: null, error: null }
              : { phase: 'refreshing', data: previous.data, error: null },
          )
          try {
            const response = await fetch('api/git-panel/snapshot', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ cwd, limit: 60 }),
              signal: controller.signal,
            })
            if (cancelled) return
            if (response.ok !== true) {
              const text = await response.text().catch(() => '')
              let detailMessage = text
              try {
                const parsed = JSON.parse(text)
                if (parsed !== null && typeof parsed === 'object' && typeof parsed.error === 'string') detailMessage = parsed.error
              } catch {
                // Keep the raw body.
              }
              throw new Error('HTTP ' + response.status + (detailMessage === '' ? '' : ': ' + detailMessage))
            }
            const value = await response.json()
            if (cancelled) return
            setState({ phase: 'ready', data: value, error: null })
          } catch (error) {
            if (cancelled || controller.signal.aborted) return
            const detailMessage = error instanceof Error ? error.message : String(error)
            setState((previous) => ({ phase: 'error', data: previous.data, error: detailMessage }))
          } finally {
            inFlight = false
          }
        }
        load()
        const timer = setInterval(load, 8000)
        return () => {
          cancelled = true
          controller.abort()
          clearInterval(timer)
        }
      }, [cwd, visible, revision])

      const toggleCommit = (hash) => {
        if (expanded === hash) {
          detailController.current?.abort()
          detailController.current = null
          setExpanded(null)
          setDetail({ hash: null, phase: 'idle', files: NO_FILES, error: null })
          return
        }
        setExpanded(hash)
        const cached = detailCache.current.get(hash)
        if (cached !== undefined) {
          setDetail({ hash, phase: 'ready', files: cached, error: null })
          return
        }
        detailController.current?.abort()
        const controller = new AbortController()
        detailController.current = controller
        setDetail({ hash, phase: 'loading', files: NO_FILES, error: null })
        fetchCommit(cwd, hash, controller.signal).then(
          (files) => {
            if (controller.signal.aborted) return
            detailCache.current.set(hash, files)
            setDetail({ hash, phase: 'ready', files, error: null })
          },
          (error) => {
            if (controller.signal.aborted) return
            setDetail({ hash, phase: 'error', files: NO_FILES, error: error instanceof Error ? error.message : String(error) })
          },
        )
      }

      const openDiff = (file, rev) => {
        if (cwd === undefined || cwd === null || cwd === '') return
        const target = rev === undefined ? null : rev
        diffController.current?.abort()
        const controller = new AbortController()
        diffController.current = controller
        setDiffView({ file, rev: target })
        setDiffState({ phase: 'loading', data: null, error: null })
        fetchDiff(cwd, file, target, controller.signal).then(
          (value) => {
            if (controller.signal.aborted) return
            setDiffState({ phase: 'ready', data: value, error: null })
          },
          (error) => {
            if (controller.signal.aborted) return
            setDiffState({ phase: 'error', data: null, error: error instanceof Error ? error.message : String(error) })
          },
        )
      }

      const closeDiff = () => {
        diffController.current?.abort()
        diffController.current = null
        setDiffView(null)
        setDiffState({ phase: 'idle', data: null, error: null })
      }

      const reloadDiff = () => {
        if (diffView !== null) openDiff(diffView.file, diffView.rev)
      }

      const data = state.data
      const error = state.error
      const commits = data !== null && data.isRepo === true && Array.isArray(data.commits) ? data.commits : []
      const layout = React.useMemo(() => layoutCommits(commits), [commits])
      const files = data !== null && data.isRepo === true && Array.isArray(data.files) ? data.files : []
      const step = layout.maxLanes > 8 ? 8 : 12
      const graphWidth = 12 + Math.max(0, layout.maxLanes - 1) * step
      const refresh = () => setRevision((value) => value + 1)

      const branchLabel = (() => {
        if (data === null) return '…'
        if (data.isRepo !== true) return '—'
        if (data.detached === true) return data.head === null ? t('detached') : t('detached') + ' · ' + data.head
        return typeof data.branch === 'string' && data.branch !== '' ? data.branch : '—'
      })()

      const counts = []
      if (data !== null && data.isRepo === true) {
        if (Number(data.ahead) > 0) counts.push('↑' + data.ahead)
        if (Number(data.behind) > 0) counts.push('↓' + data.behind)
      }

      let changeAdd = 0
      let changeDel = 0
      for (const file of files) {
        if (typeof file.additions === 'number') changeAdd += file.additions
        if (typeof file.deletions === 'number') changeDel += file.deletions
      }

      const head = h(
        'div',
        { className: 'dshgit-head' },
        h(GitGlyph, { size: 15, className: 'dshgit-head-glyph' }),
        h('span', { className: 'dshgit-branch', title: data !== null && data.root !== null ? data.root : '' }, branchLabel),
        counts.length === 0
          ? null
          : h(
              'span',
              { className: 'dshgit-ab', title: data.upstream === null ? '' : message(t, 'upstream', { name: data.upstream }) },
              counts.join(' '),
            ),
        h('span', { className: 'dshgit-grow' }),
        h(
          'button',
          {
            type: 'button',
            className: 'dshgit-tool',
            title: t('refresh'),
            'aria-label': t('refresh'),
            onClick: refresh,
            disabled: state.phase === 'loading',
          },
          h(RefreshGlyph, {}),
        ),
      )

      const onDividerDown = (event) => {
        event.preventDefault()
        event.currentTarget.setPointerCapture?.(event.pointerId)
        draggingRef.current = true
        document.body.style.userSelect = 'none'
      }
      const onDividerMove = (event) => {
        if (!draggingRef.current) return
        const box = bodyRef.current?.getBoundingClientRect()
        if (box === undefined || box.height <= 0) return
        const ratio = (event.clientY - box.top) / box.height
        setSplit(Math.min(0.8, Math.max(0.2, ratio)))
      }
      const onDividerUp = (event) => {
        draggingRef.current = false
        document.body.style.userSelect = ''
        if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }
      }

      let body
      if (cwd === undefined || cwd === null || cwd === '') {
        body = h('div', { className: 'dshgit-empty' }, t('noWorkspace'))
      } else if (data === null && error !== null) {
        body = h(
          'div',
          { className: 'dshgit-empty' },
          h('div', { className: 'dshgit-error' }, message(t, 'error', { message: error })),
          h('button', { type: 'button', className: 'dshgit-retry', onClick: refresh }, t('retry')),
        )
      } else if (data === null) {
        body = h('div', { className: 'dshgit-empty' }, t('loading'))
      } else if (data.isRepo !== true) {
        body = h(
          'div',
          { className: 'dshgit-empty' },
          h('div', null, t(data.gitMissing === true ? 'gitMissing' : 'notRepo')),
          h('div', { className: 'dshgit-empty-path' }, data.cwd),
        )
      } else if (diffView !== null) {
        body = h(DiffView, {
          view: diffView,
          state: diffState,
          onBack: closeDiff,
          onReload: reloadDiff,
          sessionId,
          tab,
          t,
        })
      } else {
        const changesPane = h(
          'div',
          { className: 'dshgit-pane dshgit-pane-top', style: { flexBasis: (split * 100).toFixed(2) + '%' } },
          h(
            'div',
            { className: 'dshgit-section' },
            h('span', { className: 'dshgit-section-title' }, t('changes')),
            h('span', { className: 'dshgit-count' }, String(files.length)),
            h(
              'span',
              { className: 'dshgit-section-meta' },
              changeAdd > 0 ? h('span', { className: 'dshgit-add' }, '+' + changeAdd) : null,
              changeDel > 0 ? h('span', { className: 'dshgit-del' }, '-' + changeDel) : null,
            ),
          ),
          h(
            'div',
            { className: 'dshgit-list' },
            files.length === 0
              ? h('div', { className: 'dshgit-note' }, t('clean'))
              : files.map((file, index) =>
                  h(FileRow, {
                    key: (file.origPath === null ? '' : file.origPath + '→') + file.path + ':' + index,
                    file,
                    onOpen: openDiff,
                  }),
                ),
          ),
          data.filesTruncated === true
            ? h('div', { className: 'dshgit-note' }, message(t, 'filesTruncated', { count: files.length }))
            : null,
        )
        const historyPane = h(
          'div',
          { className: 'dshgit-pane dshgit-pane-bottom' },
          h(
            'div',
            { className: 'dshgit-section' },
            h('span', { className: 'dshgit-section-title' }, t('history')),
            h('span', { className: 'dshgit-count' }, String(commits.length)),
          ),
          h(
            'div',
            { className: 'dshgit-list' },
            commits.length === 0
              ? h('div', { className: 'dshgit-note' }, t('noCommits'))
              : layout.rows.map((row) => {
                  const isOpen = expanded === row.commit.hash
                  return h(
                    React.Fragment,
                    { key: row.commit.hash },
                    h(CommitRow, {
                      row,
                      step,
                      width: graphWidth,
                      expanded: isOpen,
                      onToggle: toggleCommit,
                      t,
                    }),
                    isOpen
                      ? h(CommitDetail, {
                          commit: row.commit,
                          detail: detail.hash === row.commit.hash ? detail : { hash: row.commit.hash, phase: 'loading', files: NO_FILES, error: null },
                          onOpen: openDiff,
                          t,
                        })
                      : null,
                  )
                }),
          ),
        )
        const divider = h('div', {
          className: 'dshgit-divider',
          role: 'separator',
          'aria-orientation': 'horizontal',
          'aria-label': t('dragHint'),
          'aria-valuemin': 20,
          'aria-valuemax': 80,
          'aria-valuenow': Math.round(split * 100),
          tabIndex: 0,
          onPointerDown: onDividerDown,
          onPointerMove: onDividerMove,
          onPointerUp: onDividerUp,
          onPointerCancel: onDividerUp,
          onKeyDown: (event) => {
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setSplit((value) => Math.max(0.2, value - 0.03))
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              setSplit((value) => Math.min(0.8, value + 0.03))
            }
          },
        })
        body = h(
          'div',
          { className: 'dshgit-body', ref: bodyRef },
          error === null ? null : h('div', { className: 'dshgit-error' }, message(t, 'error', { message: error })),
          changesPane,
          divider,
          historyPane,
        )
      }

      return h('div', { className: 'dshgit-root' }, h('style', null, CSS), head, body)
    }

    const CSS = [
      '.dshgit-root{height:100%;min-height:0;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,12px);line-height:1.45}',
      '.dshgit-head{flex:none;display:flex;align-items:center;gap:6px;height:36px;padding:0 6px 0 12px;border-bottom:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dshgit-head-glyph{flex:none;color:var(--dsw-alias-label-secondary)}',
      '.dshgit-title-glyph{flex:none;color:inherit;margin-right:6px;vertical-align:-3px}',
      '.dshgit-branch{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      '.dshgit-ab{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;font-variant-numeric:tabular-nums}',
      '.dshgit-grow{flex:1}',
      '.dshgit-tool{width:26px;height:26px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:5px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1}',
      '.dshgit-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-tool:disabled{opacity:.55;cursor:default}',
      '.dshgit-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}',
      '.dshgit-pane{display:flex;flex-direction:column;min-height:0;overflow:hidden}',
      '.dshgit-pane-top{flex:0 0 auto}',
      '.dshgit-pane-bottom{flex:1 1 0}',
      '.dshgit-section{flex:none;display:flex;align-items:center;gap:6px;padding:7px 12px 3px;color:var(--dsw-alias-label-secondary);font-size:11px;user-select:none}',
      '.dshgit-section-title{font-weight:500}',
      '.dshgit-count{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}',
      '.dshgit-section-meta{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:10px;font-variant-numeric:tabular-nums}',
      '.dshgit-list{flex:1 1 auto;min-height:0;overflow:auto;padding:0 6px 6px;scrollbar-gutter:stable}',
      '.dshgit-row{box-sizing:border-box;display:flex;align-items:center;gap:8px;width:100%;height:24px;padding:0 6px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:inherit;font:inherit;text-align:left;white-space:nowrap;cursor:pointer;overflow:hidden}',
      '.dshgit-row:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-row[data-openable=false]{cursor:default}',
      '.dshgit-row[data-openable=false]:hover{background:0 0}',
      '.dshgit-path{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 auto;overflow:hidden}',
      '.dshgit-name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-dir{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-stats{flex:none;display:flex;align-items:center;gap:4px;font-size:10px;font-variant-numeric:tabular-nums}',
      '.dshgit-add{color:var(--dsw-alias-state-success-primary)}',
      '.dshgit-del{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-status{flex:none;width:9px;text-align:center;font-size:11px;font-weight:600;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-status[data-s=M]{color:var(--dsw-alias-state-warn-primary)}',
      '.dshgit-status[data-s=A]{color:var(--dsw-alias-state-success-primary)}',
      '.dshgit-status[data-s=D]{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-status[data-s=R]{color:var(--dsw-alias-brand-primary)}',
      '.dshgit-status[data-s=C]{color:var(--dsw-alias-brand-primary)}',
      '.dshgit-status[data-s=T]{color:var(--dsw-alias-state-warn-primary)}',
      '.dshgit-status[data-s=U]{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-status[data-s="!"]{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-ficon{flex:none;width:14px;height:14px}',
      '.dshgit-filebadge{display:inline-flex;align-items:center;justify-content:center;border-radius:3px;background:color-mix(in srgb,currentColor 15%,transparent);font-size:8.5px;font-weight:700;line-height:1;letter-spacing:-.03em;user-select:none}',
      '.dshgit-fileglyph{display:block}',
      '.dshgit-ficon[data-k=js],.dshgit-ficon[data-k=json]{color:#d4a72c}',
      '.dshgit-ficon[data-k=ts]{color:#3b82f6}',
      '.dshgit-ficon[data-k=css]{color:#d946ef}',
      '.dshgit-ficon[data-k=html]{color:#ef4444}',
      '.dshgit-ficon[data-k=md]{color:#0ea5e9}',
      '.dshgit-ficon[data-k=py],.dshgit-ficon[data-k=cs],.dshgit-ficon[data-k=shell]{color:#22c55e}',
      '.dshgit-ficon[data-k=rb],.dshgit-ficon[data-k=swift]{color:#f43f5e}',
      '.dshgit-ficon[data-k=go]{color:#06b6d4}',
      '.dshgit-ficon[data-k=rs],.dshgit-ficon[data-k=toml],.dshgit-ficon[data-k=git]{color:#f97316}',
      '.dshgit-ficon[data-k=java],.dshgit-ficon[data-k=sql]{color:#f59e0b}',
      '.dshgit-ficon[data-k=kt],.dshgit-ficon[data-k=php]{color:#a855f7}',
      '.dshgit-ficon[data-k=c],.dshgit-ficon[data-k=cpp],.dshgit-ficon[data-k=make]{color:#64748b}',
      '.dshgit-ficon[data-k=yaml],.dshgit-ficon[data-k=pdf]{color:#ef4444}',
      '.dshgit-ficon[data-k=config],.dshgit-ficon[data-k=lock]{color:#94a3b8}',
      '.dshgit-ficon[data-k=docker]{color:#0ea5e9}',
      '.dshgit-ficon[data-k=image]{color:#84cc16}',
      '.dshgit-ficon[data-k=doc]{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-divider{flex:0 0 7px;position:relative;cursor:row-resize;outline:none;touch-action:none}',
      '.dshgit-divider:before{content:"";position:absolute;left:0;right:0;top:3px;height:1px;background:var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dshgit-divider:hover:before,.dshgit-divider:focus-visible:before{background:var(--dsw-alias-brand-primary)}',
      '.dshgit-commit{box-sizing:border-box;display:flex;align-items:center;gap:6px;width:100%;height:30px;padding:0 8px 0 2px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:inherit;font:inherit;text-align:left;cursor:pointer;overflow:hidden}',
      '.dshgit-commit:hover,.dshgit-commit[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-graph{flex:none;display:block;overflow:visible}',
      '.dshgit-commit-text{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 auto;overflow:hidden}',
      '.dshgit-subject{min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-refs{flex:none;display:flex;align-items:center;gap:3px;max-width:45%;overflow:hidden}',
      '.dshgit-ref{flex:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 4px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));font-size:9px;line-height:13px;color:var(--dsw-alias-label-secondary)}',
      '.dshgit-ref[data-k=head]{color:var(--dsw-alias-brand-primary);border-color:currentColor}',
      '.dshgit-ref[data-k=tag]{color:var(--dsw-alias-state-warn-primary)}',
      '.dshgit-ref[data-k=remote]{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-hash{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-detail{display:flex;flex-direction:column;margin:0 4px 4px 12px;padding:1px 2px 4px 8px;border-left:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}',
      '.dshgit-detail-head{display:flex;align-items:center;gap:6px;padding:2px 4px 3px;color:var(--dsw-alias-label-tertiary);font-size:10px}',
      '.dshgit-detail-meta{margin-left:auto;display:flex;align-items:center;gap:6px;font-variant-numeric:tabular-nums}',
      '.dshgit-detail-empty{padding:2px 4px 4px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-detail-error{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-diff{flex:1;min-height:0;display:flex;flex-direction:column}',
      '.dshgit-diffhead{flex:none;display:flex;align-items:center;gap:5px;height:34px;padding:0 6px;border-bottom:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l1));overflow:hidden}',
      '.dshgit-diffname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      '.dshgit-diffdir{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px}',
      '.dshgit-diffbody{flex:1;min-height:0;overflow:auto;padding:4px 0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.55;tab-size:4}',
      '.dshgit-diffline{display:flex;align-items:flex-start;min-width:max-content;padding-right:12px}',
      '.dshgit-difflineno{flex:none;width:24px;padding-right:5px;text-align:right;color:var(--dsw-alias-label-tertiary);opacity:.7;font-variant-numeric:tabular-nums;user-select:none}',
      '.dshgit-difflinetext{white-space:pre;flex:1}',
      '.dshgit-diffline[data-t=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 13%,transparent)}',
      '.dshgit-diffline[data-t=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 13%,transparent)}',
      '.dshgit-diffline[data-t=hunk]{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);padding:2px 0}',
      '.dshgit-diffline[data-t=meta]{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-empty{margin:0;padding:8px 12px 12px;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.6;word-break:break-word}',
      '.dshgit-note{padding:2px 6px 6px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-empty-path{margin-top:2px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;word-break:break-all}',
      '.dshgit-error{margin:8px 12px;padding:8px 10px;border-radius:var(--dsw-radius-sm,6px);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-state-error-primary);font-size:12px;line-height:1.5;word-break:break-word}',
      '.dshgit-retry{margin:0 12px 12px;padding:4px 10px;border-radius:var(--dsw-radius-sm,6px);border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer}',
      '.dshgit-retry:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
    ].join('\n')

    return {
      inject: ['slots', 'locale', 'sidebarRightTabs'],
      apply(ctx) {
        const t = ctx.locale.bind(NS)

        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'git-panel: dictionaries')
        ctx.effect(
          () =>
            ctx.sidebarRightTabs.register({
              id: TAB_ID,
              kind: KIND,
              title: () => t('type.label'),
              guide: [
                {
                  id: 'git',
                  order: 15,
                  title: () => t('guide.title'),
                  description: () => t('guide.description'),
                  icon: GitGlyph,
                },
              ],
            }),
          'git-panel: tab type',
        )
        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab', () =>
              ctx.slots.register({ name: 'sidebar.right.pane.tab', key: TAB_ID, locale: NS }, GitBody),
            ),
          'git-panel: tab body',
        )
        ctx.effect(
          () =>
            ctx.slots.inject('sidebar.right.pane.tab.title', () =>
              ctx.slots.register({ name: 'sidebar.right.pane.tab.title', key: TAB_ID }, GitTitle),
            ),
          'git-panel: tab title',
        )
      },
    }
  },
})