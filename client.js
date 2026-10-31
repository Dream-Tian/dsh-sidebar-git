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
    /** Diff view preferences, shared by every tab. */
    const DIFF_OPTIONS_KEY = 'dsh.gitPanel.diffOptions.v1'
    /** Stable empty list so the detail memo does not churn. */
    const NO_FILES = []
    /** Diff lines rendered before the view stops adding rows. */
    const DIFF_RENDER_LINES = 4000

    const zh = {
      'type.label': 'Git',
      'guide.title': 'Git',
      'guide.description': '改动文件与提交树',
      changes: '更改',
      history: '提交图',
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
      stage: '暂存',
      unstage: '取消暂存',
      stageAll: '全部暂存',
      unstageAll: '全部取消暂存',
      stagedGroup: '暂存的更改',
      unstagedGroup: '更改',
      commitPlaceholder: '提交信息（Enter 提交）',
      commit: '提交',
      commitAndPush: '提交并推送',
      commitActions: '提交操作',
      committing: '提交中…',
      pushing: '推送中…',
      commitNoMessage: '先写提交信息',
      commitNothingStaged: '先暂存要提交的更改',
      commitDone: '已提交 {short}',
      writeError: '操作失败：{message}',
      filterFiles: '过滤文件…',
      searchCommits: '搜索提交…',
      loadMore: '加载更多提交',
      loadingMore: '加载中…',
      noMatches: '没有匹配项',
      viewDiff: '查看差异',
      copyPath: '复制路径',
      reveal: '在 Finder 中显示',
      discard: '丢弃改动',
      deleteFile: '删除文件',
      discardTitle: '丢弃改动？',
      discardBody: '将丢弃 {path} 的所有未提交改动，此操作不可撤销。',
      deleteTitle: '删除未跟踪文件？',
      deleteBody: '将删除 {path}，此操作不可撤销。',
      cancel: '取消',
      confirmDiscard: '丢弃',
      confirmDelete: '删除',
      branches: '分支',
      newBranchPlaceholder: '新分支名…',
      createBranch: '新建分支',
      fetch: '获取',
      pull: '拉取',
      push: '推送',
      noBranches: '没有本地分支',
      splitView: '并排',
      changesOnly: '只看改动',
      syntaxHighlight: '语法高亮',
      openAtLine: '打开第 {line} 行',
      dragHint: '拖动调整上下两栏高度',
    }

    const en = {
      'type.label': 'Git',
      'guide.title': 'Git',
      'guide.description': 'Changed files and the commit graph',
      changes: 'Changes',
      history: 'Graph',
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
      stage: 'Stage',
      unstage: 'Unstage',
      stageAll: 'Stage all',
      unstageAll: 'Unstage all',
      stagedGroup: 'Staged Changes',
      unstagedGroup: 'Changes',
      commitPlaceholder: 'Commit message (Enter to commit)',
      commit: 'Commit',
      commitAndPush: 'Commit and push',
      commitActions: 'Commit actions',
      committing: 'Committing…',
      pushing: 'Pushing…',
      commitNoMessage: 'Write a commit message first',
      commitNothingStaged: 'Stage changes to commit',
      commitDone: 'Committed {short}',
      writeError: 'Operation failed: {message}',
      filterFiles: 'Filter files…',
      searchCommits: 'Search commits…',
      loadMore: 'Load more commits',
      loadingMore: 'Loading…',
      noMatches: 'No matches',
      viewDiff: 'View diff',
      copyPath: 'Copy path',
      reveal: 'Reveal in Finder',
      discard: 'Discard changes',
      deleteFile: 'Delete file',
      discardTitle: 'Discard changes?',
      discardBody: 'All uncommitted changes to {path} will be discarded. This cannot be undone.',
      deleteTitle: 'Delete untracked file?',
      deleteBody: '{path} will be deleted. This cannot be undone.',
      cancel: 'Cancel',
      confirmDiscard: 'Discard',
      confirmDelete: 'Delete',
      branches: 'Branches',
      newBranchPlaceholder: 'New branch name…',
      createBranch: 'Create branch',
      fetch: 'Fetch',
      pull: 'Pull',
      push: 'Push',
      noBranches: 'No local branches',
      splitView: 'Split',
      changesOnly: 'Changes only',
      syntaxHighlight: 'Syntax',
      openAtLine: 'Open line {line}',
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

    /** Small chevron marking the branch menu trigger. */
    function ChevronGlyph({ size = 10 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M6 9l6 6 6-6' }),
      )
    }

    /** Right-pointing disclosure chevron; rotated by CSS while the section is open. */
    function DisclosureGlyph({ size = 12, open }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          className: 'dshgit-chev',
          'data-open': open === true ? 'true' : 'false',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M9 6l6 6-6 6' }),
      )
    }

    /** Check mark for the primary commit action. */
    function CheckGlyph({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 2.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M5 12.5l4.5 4.5L19 7' }),
      )
    }

    /** Cloud with a down arrow: fetch from the remote. */
    function FetchGlyph({ size = 14 }) {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M7 17.5a4 4 0 0 1-.3-8 5.5 5.5 0 0 1 10.6-1A3.7 3.7 0 0 1 17.5 15' }),
        h('path', { d: 'M12 11v7' }),
        h('path', { d: 'M9.5 15.5L12 18l2.5-2.5' }),
      )
    }

    /** Arrow down onto a baseline: pull. */
    function PullGlyph({ size = 14 }) {
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
        h('path', { d: 'M12 4v11' }),
        h('path', { d: 'M8 11l4 4 4-4' }),
        h('path', { d: 'M5 19h14' }),
      )
    }

    /** Arrow up from a baseline: push. */
    function PushGlyph({ size = 14 }) {
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
        h('path', { d: 'M12 20V9' }),
        h('path', { d: 'M8 13l4-4 4 4' }),
        h('path', { d: 'M5 5h14' }),
      )
    }

    /** Plus glyph for staging controls. */
    function PlusGlyph({ size = 13 }) {
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
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M12 5v14' }),
        h('path', { d: 'M5 12h14' }),
      )
    }

    /** Minus glyph for unstaging controls. */
    function MinusGlyph({ size = 13 }) {
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
          'aria-hidden': true,
          focusable: false,
        },
        h('path', { d: 'M5 12h14' }),
      )
    }

    /** Magnifier used by the section filters. */
    function SearchGlyph({ size = 13 }) {
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
          'aria-hidden': true,
          focusable: false,
        },
        h('circle', { cx: 10.5, cy: 10.5, r: 5.5 }),
        h('path', { d: 'M15 15l4.5 4.5' }),
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
     * Read the persisted diff view preferences.
     * @returns {{ split: boolean, changesOnly: boolean, syntax: boolean }} options.
     */
    function readDiffOptions() {
      try {
        if (typeof window === 'undefined' || window.localStorage == null) {
          return { split: false, changesOnly: false, syntax: true }
        }
        const raw = JSON.parse(window.localStorage.getItem(DIFF_OPTIONS_KEY) ?? '{}')
        return {
          split: raw !== null && typeof raw === 'object' && raw.split === true,
          changesOnly: raw !== null && typeof raw === 'object' && raw.changesOnly === true,
          syntax: raw === null || typeof raw !== 'object' || raw.syntax !== false,
        }
      } catch {
        return { split: false, changesOnly: false, syntax: true }
      }
    }

    /**
     * Persist the diff view preferences.
     * @param {{ split: boolean, changesOnly: boolean, syntax: boolean }} options - current options.
     */
    function writeDiffOptions(options) {
      try {
        if (typeof window === 'undefined' || window.localStorage == null) return
        window.localStorage.setItem(DIFF_OPTIONS_KEY, JSON.stringify(options))
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
    function Stats({ additions, deletions }) {
      const added = additions === null || additions === undefined ? null : Number(additions)
      const deleted = deletions === null || deletions === undefined ? null : Number(deletions)
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

    /** One single-line file row; the body opens its diff, the trailing button stages it. */
    function FileRow({ file, onOpen, onMenu, commitStatus, stats, stageMode, onStage, busy, t }) {
      const letter = commitStatus === undefined ? statusLetter(file) : file.status
      const name = baseName(file.path)
      const dot = name.lastIndexOf('.')
      const stem = dot > 0 ? name.slice(0, dot) : name
      const extension = dot > 0 ? name.slice(dot) : ''
      const directory = dirName(file.path)
      const stat = stats === undefined ? file : stats === null ? {} : stats
      const label =
        file.origPath === null || file.origPath === undefined ? file.path : file.origPath + ' → ' + file.path
      return h(
        'div',
        {
          className: 'dshgit-row',
          title: label,
          onContextMenu:
            onMenu === undefined
              ? undefined
              : (event) => {
                  event.preventDefault()
                  onMenu(event, file)
                },
        },
        h(
          'button',
          { type: 'button', className: 'dshgit-rowmain', onClick: () => onOpen(file) },
          h(
            'span',
            { className: 'dshgit-path' },
            h(FileIcon, { filePath: file.path }),
            h(
              'span',
              { className: 'dshgit-name' },
              stem,
              extension === '' ? null : h('span', { className: 'dshgit-ext' }, extension),
            ),
            directory === '' ? null : h('span', { className: 'dshgit-dir' }, directory),
          ),
          h(Stats, { additions: stat.additions, deletions: stat.deletions }),
          h('span', { className: 'dshgit-status', 'data-s': letter, title: letter }, letter),
        ),
        stageMode === undefined
          ? null
          : h(
              'button',
              {
                type: 'button',
                className: 'dshgit-rowbtn',
                title: t(stageMode),
                'aria-label': t(stageMode),
                disabled: busy === true,
                onClick: () => onStage(file, stageMode),
              },
              stageMode === 'stage' ? h(PlusGlyph, { size: 12 }) : h(MinusGlyph, { size: 12 }),
            ),
      )
    }

    /** One commit row: lane geometry on the left, subject, author and refs on the right. */
    function CommitRow({ row, step, width, expanded, head, pending, onToggle, onPrefetch, onCancelPrefetch, t }) {
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
          'aria-busy': pending === true ? 'true' : undefined,
          title,
          onClick: () => onToggle(row.commit.hash),
          onPointerEnter: onPrefetch === undefined ? undefined : () => onPrefetch(row.commit.hash),
          onPointerLeave: onCancelPrefetch,
          onFocus: onPrefetch === undefined ? undefined : () => onPrefetch(row.commit.hash),
          onBlur: onCancelPrefetch,
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
          head === true
            ? h(
                React.Fragment,
                null,
                h('circle', {
                  cx: x(lane),
                  cy: ROW / 2,
                  r: 4.4,
                  fill: 'none',
                  stroke: LANE_COLORS[lane % LANE_COLORS.length],
                  strokeWidth: 2,
                }),
                h('circle', {
                  cx: x(lane),
                  cy: ROW / 2,
                  r: 1.9,
                  fill: LANE_COLORS[lane % LANE_COLORS.length],
                }),
              )
            : h('circle', {
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
            { className: 'dshgit-subject', 'data-head': head === true ? 'true' : undefined },
            row.commit.subject === '' ? t('noSubject') : row.commit.subject,
          ),
          row.commit.author === '' ? null : h('span', { className: 'dshgit-author' }, row.commit.author),
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
          pending === true
            ? h('span', {
                className: 'dshgit-commit-spinner',
                role: 'status',
                'aria-label': t('commitLoading'),
              })
            : null,
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
    async function fetchCommit(cwd, hash, signal, sessionCwd) {
      const response = await fetch('api/git-panel/commit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cwd, hash, sessionCwd }),
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
      let index = 0
      while (index < lines.length) {
        if (lines[index].type !== 'del') {
          index += 1
          continue
        }
        const deletions = []
        while (index < lines.length && lines[index].type === 'del') {
          deletions.push(lines[index])
          index += 1
        }
        const additions = []
        while (index < lines.length && lines[index].type === 'add') {
          additions.push(lines[index])
          index += 1
        }
        const pairs = Math.min(deletions.length, additions.length)
        for (let pair = 0; pair < pairs; pair += 1) {
          const left = deletions[pair].text
          const right = additions[pair].text
          const max = Math.min(left.length, right.length)
          let prefix = 0
          while (prefix < max && left.charCodeAt(prefix) === right.charCodeAt(prefix)) prefix += 1
          let suffix = 0
          while (
            suffix < max - prefix &&
            left.charCodeAt(left.length - 1 - suffix) === right.charCodeAt(right.length - 1 - suffix)
          ) {
            suffix += 1
          }
          const leftEnd = left.length - suffix
          const rightEnd = right.length - suffix
          if (prefix < leftEnd) deletions[pair].mark = { start: prefix, end: leftEnd }
          if (prefix < rightEnd) additions[pair].mark = { start: prefix, end: rightEnd }
        }
      }
      return lines
    }

    /** Extension families that get the lightweight highlighter. */
    const SYNTAX_EXTENSIONS = {
      js: 'js', mjs: 'js', cjs: 'js', jsx: 'js',
      ts: 'js', tsx: 'js', mts: 'js', cts: 'js',
      json: 'json', jsonc: 'json', json5: 'json',
      css: 'css', scss: 'css', sass: 'css', less: 'css',
      html: 'html', htm: 'html', vue: 'html', svelte: 'html', xml: 'html',
      py: 'py', pyi: 'py',
      rb: 'rb', go: 'go', rs: 'rs', java: 'java', kt: 'kt', kts: 'kt',
      c: 'c', h: 'c', cc: 'c', cpp: 'c', cxx: 'c', hpp: 'c',
      cs: 'c', php: 'php', swift: 'swift',
      sh: 'shell', bash: 'shell', zsh: 'shell', fish: 'shell',
      yml: 'yaml', yaml: 'yaml', toml: 'toml', ini: 'ini', conf: 'ini',
      properties: 'ini', sql: 'sql', md: 'md', mdx: 'md',
    }

    /** Common keywords across the supported languages. */
    const KEYWORD_PATTERN =
      '\\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|from|export|default|async|await|try|catch|finally|throw|typeof|instanceof|delete|void|yield|def|elif|lambda|pass|raise|with|as|None|True|False|self|and|or|not|is|pub|fn|mut|struct|enum|impl|trait|match|use|mod|package|type|interface|public|private|protected|static|final|int|string|bool|boolean|true|false|null|undefined)\\b'

    /**
     * The tokenizer family of one path.
     * @param {string} filePath - repository-relative path.
     * @returns {string | null} a family, or null for plain text.
     */
    function syntaxLanguage(filePath) {
      const name = baseName(filePath).toLowerCase()
      const dot = name.lastIndexOf('.')
      if (dot < 0) return null
      return SYNTAX_EXTENSIONS[name.slice(dot + 1)] ?? null
    }

    /**
     * Split one line into comment, string, number and keyword tokens.
     * @param {string} text - source line.
     * @param {string | null} language - syntax family.
     * @returns {Array<{ start: number, end: number, kind: string }>} tokens.
     */
    function tokenizeLine(text, language) {
      if (language === null || language === 'md' || text === '') return []
      const hashComment =
        language === 'py' || language === 'shell' || language === 'yaml' || language === 'toml' || language === 'rb'
      const slashComment = language !== 'css' && !hashComment
      const parts = []
      if (hashComment) parts.push('#[^\\n]*')
      if (slashComment) parts.push('//[^\\n]*', '/\\*[\\s\\S]*?\\*/')
      if (language === 'html') parts.push('<!--[\\s\\S]*?-->')
      parts.push('"(?:\\\\.|[^"\\\\])*"', "'(?:\\\\.|[^'\\\\])*'", '`(?:\\\\.|[^`\\\\])*`')
      parts.push('\\b\\d+(?:\\.\\d+)?\\b')
      parts.push(KEYWORD_PATTERN)
      const pattern = new RegExp(parts.join('|'), 'g')
      const tokens = []
      let match
      while ((match = pattern.exec(text)) !== null) {
        const value = match[0]
        const start = match.index
        const end = start + value.length
        let kind = 'keyword'
        if (
          value.startsWith('//') ||
          value.startsWith('#') ||
          value.startsWith('/*') ||
          value.startsWith('<!--')
        ) {
          kind = 'comment'
        } else if (value.startsWith('"') || value.startsWith("'") || value.startsWith('`')) {
          kind = 'string'
        } else if (/^\d/.test(value)) {
          kind = 'number'
        }
        tokens.push({ start, end, kind })
        if (value === '') pattern.lastIndex += 1
      }
      return tokens
    }

    /**
     * Render one line's text with token colors and a word-diff mark.
     * @param {string} text - line text.
     * @param {{ start: number, end: number } | undefined} mark - changed character range.
     * @param {Array<object>} tokens - syntax tokens.
     * @returns {Array<*>} React children.
     */
    function codeSegments(text, mark, tokens) {
      if (text === '') return [' ']
      const points = new Set([0, text.length])
      if (mark !== undefined && mark.end > mark.start) {
        points.add(mark.start)
        points.add(mark.end)
      }
      for (const token of tokens) {
        points.add(token.start)
        points.add(token.end)
      }
      const ordered = [...points].filter((value) => value >= 0 && value <= text.length).sort((a, b) => a - b)
      const parts = []
      let tokenIndex = 0
      for (let index = 0; index < ordered.length - 1; index += 1) {
        const start = ordered[index]
        const end = ordered[index + 1]
        if (end <= start) continue
        while (tokenIndex < tokens.length && tokens[tokenIndex].end <= start) tokenIndex += 1
        const token =
          tokens[tokenIndex] !== undefined && tokens[tokenIndex].start <= start && tokens[tokenIndex].end >= end
            ? tokens[tokenIndex]
            : null
        const marked = mark !== undefined && mark.end > mark.start && start >= mark.start && end <= mark.end
        const piece = text.slice(start, end)
        if (token === null && !marked) {
          parts.push(piece)
          continue
        }
        const classes = []
        if (token !== null) classes.push('tok-' + token.kind)
        if (marked) classes.push('tok-mark')
        parts.push(h('span', { key: 's' + start, className: classes.join(' ') }, piece))
      }
      return parts
    }

    /**
     * Pair deletion and addition lines into two-column rows.
     * @param {Array<object>} lines - parsed diff lines.
     * @returns {Array<object>} rows for the split view.
     */
    function toSplitRows(lines) {
      const rows = []
      let index = 0
      while (index < lines.length) {
        const line = lines[index]
        if (line.type === 'del' || line.type === 'add') {
          const deletions = []
          const additions = []
          while (index < lines.length && lines[index].type === 'del') {
            deletions.push(lines[index])
            index += 1
          }
          while (index < lines.length && lines[index].type === 'add') {
            additions.push(lines[index])
            index += 1
          }
          const count = Math.max(deletions.length, additions.length)
          for (let pair = 0; pair < count; pair += 1) {
            rows.push({ type: 'pair', left: deletions[pair] ?? null, right: additions[pair] ?? null })
          }
          continue
        }
        rows.push({ type: line.type, line })
        index += 1
      }
      return rows
    }

    /** One line-number cell; clickable when the file can be opened at that line. */
    function LineNo({ value, onOpen, title }) {
      if (value === '' || value === null || value === undefined) {
        return h('span', { className: 'dshgit-difflineno' })
      }
      if (onOpen === null || onOpen === undefined) {
        return h('span', { className: 'dshgit-difflineno' }, value)
      }
      return h(
        'button',
        { type: 'button', className: 'dshgit-difflineno dshgit-lineno-btn', title, onClick: onOpen },
        value,
      )
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
    function DiffView({ view, state, options, onOptions, onBack, onReload, sessionId, tab, t }) {
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
      const language = syntaxLanguage(file.path)
      const lines = React.useMemo(
        () =>
          state.phase === 'ready' && data !== null && typeof data.diff === 'string'
            ? parseDiffLines(data.diff)
            : NO_FILES,
        [state.phase, data],
      )
      const hasChanges = lines.some((line) => line.type === 'add' || line.type === 'del')
      const visible = options.changesOnly ? lines.filter((line) => line.type !== 'ctx') : lines
      const shownLines = visible.length > DIFF_RENDER_LINES ? visible.slice(0, DIFF_RENDER_LINES) : visible
      const lineTruncated = visible.length > DIFF_RENDER_LINES
      const renderText = (line) => {
        if (line.type === 'meta' || line.type === 'hunk') return line.text === '' ? ' ' : line.text
        return codeSegments(line.text, line.mark, options.syntax ? tokenizeLine(line.text, language) : [])
      }
      const openAt = (value) => {
        if (!openable || value === '' || value === null || value === undefined) return null
        const lineNumber = Number(value)
        if (!Number.isFinite(lineNumber)) return null
        return () =>
          tab.actions.openResource(sessionFileAddress(sessionId, file.rel), {
            params: { line: lineNumber },
          })
      }
      const lineTitle = (value) => (value === '' ? '' : message(t, 'openAtLine', { line: value }))

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
        const metaNote = hasChanges ? null : h('div', { className: 'dshgit-note' }, t('diffMetaOnly'))
        const truncatedNote =
          data.truncated === true || lineTruncated
            ? h('div', { className: 'dshgit-note' }, t('diffTruncated'))
            : null
        if (options.split) {
          const rows = toSplitRows(shownLines)
          content = h(
            'div',
            { className: 'dshgit-diffbody dshgit-diffbody-split' },
            metaNote,
            rows.map((row, index) => {
              if (row.type === 'hunk' || row.type === 'meta') {
                return h(
                  'div',
                  { key: index, className: 'dshgit-diffline', 'data-t': row.type },
                  h('span', { className: 'dshgit-difflinetext' }, row.line.text === '' ? ' ' : row.line.text),
                )
              }
              const left = row.type === 'ctx' ? row.line : row.left
              const right = row.type === 'ctx' ? row.line : row.right
              return h(
                'div',
                { key: index, className: 'dshgit-splitrow' },
                h(
                  'span',
                  { className: 'dshgit-splitcell', 'data-t': left === null ? 'empty' : left.type },
                  h(LineNo, {
                    value: left === null ? '' : left.old,
                    onOpen: left === null ? null : openAt(left.old),
                    title: left === null ? '' : lineTitle(left.old),
                  }),
                  h(
                    'span',
                    { className: 'dshgit-difflinetext' },
                    left === null ? '' : renderText(left),
                  ),
                ),
                h(
                  'span',
                  { className: 'dshgit-splitcell', 'data-t': right === null ? 'empty' : right.type },
                  h(LineNo, {
                    value: right === null ? '' : right.new,
                    onOpen: right === null ? null : openAt(right.new),
                    title: right === null ? '' : lineTitle(right.new),
                  }),
                  h(
                    'span',
                    { className: 'dshgit-difflinetext' },
                    right === null ? '' : renderText(right),
                  ),
                ),
              )
            }),
            truncatedNote,
          )
        } else {
          content = h(
            'div',
            { className: 'dshgit-diffbody' },
            metaNote,
            shownLines.map((line, index) =>
              h(
                'div',
                { key: index, className: 'dshgit-diffline', 'data-t': line.type },
                h(LineNo, {
                  value: line.type === 'del' ? line.old : line.new,
                  onOpen: openAt(line.type === 'del' ? line.old : line.new),
                  title: lineTitle(line.type === 'del' ? line.old : line.new),
                }),
                h('span', { className: 'dshgit-difflinetext' }, renderText(line)),
              ),
            ),
            truncatedNote,
          )
        }
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
          h(Stats, { additions: file.additions, deletions: file.deletions }),
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
        h(
          'div',
          { className: 'dshgit-difftools' },
          h(
            'button',
            {
              type: 'button',
              className: 'dshgit-modebtn',
              'aria-pressed': options.split,
              onClick: () => onOptions({ ...options, split: !options.split }),
            },
            t('splitView'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dshgit-modebtn',
              'aria-pressed': options.changesOnly,
              onClick: () => onOptions({ ...options, changesOnly: !options.changesOnly }),
            },
            t('changesOnly'),
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dshgit-modebtn',
              'aria-pressed': options.syntax,
              onClick: () => onOptions({ ...options, syntax: !options.syntax }),
            },
            t('syntaxHighlight'),
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
      const [pendingHash, setPendingHash] = React.useState(null)
      const [diffView, setDiffView] = React.useState(null)
      const [diffState, setDiffState] = React.useState({ phase: 'idle', data: null, error: null })
      const [commitMessage, setCommitMessage] = React.useState('')
      const [limit, setLimit] = React.useState(60)
      const [fileQuery, setFileQuery] = React.useState('')
      const [commitQuery, setCommitQuery] = React.useState('')
      const [fileSearchOpen, setFileSearchOpen] = React.useState(false)
      const [commitSearchOpen, setCommitSearchOpen] = React.useState(false)
      const [writing, setWriting] = React.useState(false)
      const [busyAction, setBusyAction] = React.useState(null)
      const [writeError, setWriteError] = React.useState(null)
      const [commitNotice, setCommitNotice] = React.useState(null)
      const [contextMenu, setContextMenu] = React.useState(null)
      const [confirmDiscard, setConfirmDiscard] = React.useState(null)
      const [branchMenuOpen, setBranchMenuOpen] = React.useState(false)
      const [branches, setBranches] = React.useState([])
      const [branchInput, setBranchInput] = React.useState('')
      const [branchLoading, setBranchLoading] = React.useState(false)
      const [diffOptions, setDiffOptions] = React.useState(() => readDiffOptions())
      const [changesOpen, setChangesOpen] = React.useState(true)
      const [graphOpen, setGraphOpen] = React.useState(true)
      const [stagedOpen, setStagedOpen] = React.useState(true)
      const [unstagedOpen, setUnstagedOpen] = React.useState(true)
      const [pushPending, setPushPending] = React.useState(false)
      const [commitMenuOpen, setCommitMenuOpen] = React.useState(false)
      const [commitMenuAnchor, setCommitMenuAnchor] = React.useState(null)
      const [branchAnchor, setBranchAnchor] = React.useState(null)
      const bodyRef = React.useRef(null)
      const draggingRef = React.useRef(false)
      const detailCache = React.useRef(new Map())
      const detailRequest = React.useRef(0)
      const prefetching = React.useRef(new Map())
      const prefetchControllers = React.useRef(new Set())
      const hoverTimer = React.useRef(null)
      const diffController = React.useRef(null)
      const visible = tab.visible !== false

      React.useEffect(() => {
        const timer = setTimeout(() => writeSplit(sessionId, split), 200)
        return () => clearTimeout(timer)
      }, [sessionId, split])

      React.useEffect(
        () => () => {
          if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
          for (const controller of prefetchControllers.current) controller.abort()
          prefetchControllers.current.clear()
          prefetching.current.clear()
          diffController.current?.abort()
        },
        [],
      )

      React.useEffect(() => {
        diffController.current?.abort()
        setDiffView(null)
        setDiffState({ phase: 'idle', data: null, error: null })
        if (hoverTimer.current !== null) {
          clearTimeout(hoverTimer.current)
          hoverTimer.current = null
        }
        for (const controller of prefetchControllers.current) controller.abort()
        prefetchControllers.current.clear()
        prefetching.current.clear()
        detailCache.current.clear()
        detailRequest.current += 1
        setPendingHash(null)
        setExpanded(null)
        setDetail({ hash: null, phase: 'idle', files: NO_FILES, error: null })
        setPushPending(false)
        setBranchMenuOpen(false)
        setBranchAnchor(null)
        setCommitMenuOpen(false)
        setCommitMenuAnchor(null)
      }, [cwd])

      React.useEffect(() => {
        if (contextMenu === null && confirmDiscard === null) return undefined
        const onKey = (event) => {
          if (event.key === 'Escape') {
            setContextMenu(null)
            setConfirmDiscard(null)
          }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [contextMenu, confirmDiscard])

      React.useEffect(() => {
        writeDiffOptions(diffOptions)
      }, [diffOptions])

      React.useEffect(() => {
        if (!branchMenuOpen && !commitMenuOpen) return undefined
        const onKey = (event) => {
          if (event.key === 'Escape') {
            setBranchMenuOpen(false)
            setCommitMenuOpen(false)
          }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [branchMenuOpen, commitMenuOpen])

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
              body: JSON.stringify({ cwd, sessionCwd: cwd, limit }),
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
      }, [cwd, visible, revision, limit])

      /**
       * Fetch one commit's file list once. Hover prefetch and the click that
       * expands the row share this promise, so a click never duplicates a
       * request that is already in flight.
       */
      const ensureCommit = (hash) => {
        const cached = detailCache.current.get(hash)
        if (cached !== undefined) return Promise.resolve(cached)
        const inflight = prefetching.current.get(hash)
        if (inflight !== undefined) return inflight
        const controller = new AbortController()
        prefetchControllers.current.add(controller)
        const promise = fetchCommit(cwd, hash, controller.signal, cwd)
          .then((files) => {
            detailCache.current.set(hash, files)
            return files
          })
          .finally(() => {
            prefetching.current.delete(hash)
            prefetchControllers.current.delete(controller)
          })
        prefetching.current.set(hash, promise)
        return promise
      }

      /** Warm one commit's details shortly after the pointer settles on it. */
      const prefetchCommit = (hash) => {
        if (detailCache.current.has(hash) || prefetching.current.has(hash)) return
        if (hoverTimer.current !== null) clearTimeout(hoverTimer.current)
        hoverTimer.current = setTimeout(() => {
          hoverTimer.current = null
          ensureCommit(hash).catch(() => {})
        }, 60)
      }

      const cancelPrefetch = () => {
        if (hoverTimer.current === null) return
        clearTimeout(hoverTimer.current)
        hoverTimer.current = null
      }

      /**
       * Open one commit. The row is only expanded once its files have arrived
       * (or failed), so the panel never paints a loading row first and then
       * jumps to the file list.
       */
      const toggleCommit = (hash) => {
        cancelPrefetch()
        if (expanded === hash) {
          detailRequest.current += 1
          setExpanded(null)
          setPendingHash(null)
          return
        }
        const cached = detailCache.current.get(hash)
        if (cached !== undefined) {
          detailRequest.current += 1
          setDetail({ hash, phase: 'ready', files: cached, error: null })
          setExpanded(hash)
          setPendingHash(null)
          return
        }
        if (pendingHash === hash) return
        detailRequest.current += 1
        const requestId = detailRequest.current
        setExpanded(null)
        setPendingHash(hash)
        ensureCommit(hash).then(
          (files) => {
            if (detailRequest.current !== requestId) return
            setDetail({ hash, phase: 'ready', files, error: null })
            setExpanded(hash)
            setPendingHash(null)
          },
          (error) => {
            if (detailRequest.current !== requestId) return
            setDetail({
              hash,
              phase: 'error',
              files: NO_FILES,
              error: error instanceof Error ? error.message : String(error),
            })
            setExpanded(hash)
            setPendingHash(null)
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

      const runWrite = async (path, body, action) => {
        setWriting(true)
        setBusyAction(action ?? null)
        setWriteError(null)
        setCommitNotice(null)
        try {
          const response = await fetch(path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
          })
          const value = await response.json().catch(() => null)
          if (response.ok !== true || value === null || value.ok !== true) {
            const detail = value !== null && typeof value.error === 'string' ? value.error : 'HTTP ' + response.status
            throw new Error(detail)
          }
          return value
        } finally {
          setWriting(false)
          setBusyAction(null)
        }
      }

      const changeStage = (file, mode) => {
        const target = mode === 'stage' ? 'api/git-panel/stage' : 'api/git-panel/unstage'
        runWrite(target, { cwd, path: file.path }).then(
          () => setRevision((value) => value + 1),
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const changeStageAll = (mode) => {
        const target = mode === 'stage' ? 'api/git-panel/stage' : 'api/git-panel/unstage'
        runWrite(target, { cwd }).then(
          () => setRevision((value) => value + 1),
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const commitStaged = (alsoPush) => {
        const text = commitMessage.trim()
        if (text === '' || writing || stagedCount === 0) return
        runWrite('api/git-panel/commit-create', { cwd, message: text }, 'commit').then(
          (value) => {
            setCommitMessage('')
            setCommitNotice(
              message(t, 'commitDone', { short: typeof value.short === 'string' ? value.short : '' }),
            )
            // The working tree is usually clean right after this, so the primary
            // action becomes Push even when the branch has no upstream yet.
            setPushPending(true)
            setRevision((current) => current + 1)
            if (alsoPush === true) sync('push')
          },
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const loadBranches = (silent) => {
        setBranchLoading(true)
        fetch('api/git-panel/branches', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ cwd }),
        })
          .then(async (response) => {
            const value = await response.json().catch(() => null)
            if (response.ok !== true || value === null) {
              const detail =
                value !== null && typeof value.error === 'string' ? value.error : 'HTTP ' + response.status
              throw new Error(detail)
            }
            setBranches(Array.isArray(value.branches) ? value.branches : [])
          })
          .catch((error) => {
            if (silent !== true) setWriteError(error instanceof Error ? error.message : String(error))
          })
          .finally(() => setBranchLoading(false))
      }

      // Warm the branch list before the first click so the menu opens with its
      // content instead of a loading row that resizes under the pointer.
      React.useEffect(() => {
        if (!visible || cwd === undefined || cwd === null || cwd === '' || state.data === null) return
        if (state.data.isRepo !== true) return
        loadBranches(true)
        // `state.data.isRepo` is the only field this effect depends on; a
        // snapshot refresh must not re-fetch the list every 8 seconds.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [visible, cwd, state.data === null ? false : state.data.isRepo])

      /** Anchor the branch popover under its trigger in the Graph header. */
      const toggleBranchMenu = (event) => {
        if (branchMenuOpen) {
          setBranchMenuOpen(false)
          return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const rootRect = event.currentTarget.closest('.dshgit-root')?.getBoundingClientRect()
        const viewportW = window.innerWidth || 400
        const viewportH = window.innerHeight || 600
        const panelLeft = rootRect === undefined ? 0 : rootRect.left
        const panelWidth = rootRect === undefined ? viewportW : rootRect.width
        const width = Math.min(232, panelWidth - 12, viewportW - 16)
        const left = Math.max(panelLeft + 6, Math.min(rect.right - width, panelLeft + panelWidth - width - 6))
        const below = viewportH - rect.bottom - 12
        const above = rect.top - 12
        const openUp = below < 200 && above > below
        const maxHeight = Math.max(140, Math.min(320, openUp ? above : below))
        // Anchor the popover's near edge to the trigger: `bottom` when it opens
        // upward, otherwise `top`. Anchoring by the far edge (maxHeight) would
        // leave a gap whenever the content is shorter than the cap.
        const anchor = { left, width, maxHeight }
        if (openUp) anchor.bottom = viewportH - rect.top + 4
        else anchor.top = rect.bottom + 4
        setBranchAnchor(anchor)
        setBranchMenuOpen(true)
        setCommitMenuOpen(false)
        setBranchInput('')
        setWriteError(null)
        loadBranches()
      }

      /** Anchor the split button's action menu under its chevron. */
      const openCommitMenu = (event) => {
        if (commitMenuOpen) {
          setCommitMenuOpen(false)
          return
        }
        const rect = event.currentTarget.getBoundingClientRect()
        const rootRect = event.currentTarget.closest('.dshgit-root')?.getBoundingClientRect()
        const viewportW = window.innerWidth || 400
        const panelLeft = rootRect === undefined ? 0 : rootRect.left
        const panelWidth = rootRect === undefined ? viewportW : rootRect.width
        const width = Math.min(232, panelWidth - 12, viewportW - 16)
        const left = Math.max(panelLeft + 6, Math.min(rect.right - width, panelLeft + panelWidth - width - 6))
        setCommitMenuAnchor({ left, top: rect.bottom + 4, width })
        setCommitMenuOpen(true)
        setBranchMenuOpen(false)
      }

      const switchToBranch = (name) => {
        runWrite('api/git-panel/branch', { cwd, name }).then(
          () => {
            setBranchMenuOpen(false)
            setRevision((value) => value + 1)
          },
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const submitBranch = () => {
        const name = branchInput.trim()
        if (name === '' || writing) return
        runWrite('api/git-panel/branch', { cwd, name, create: true }).then(
          () => {
            setBranchInput('')
            setBranchMenuOpen(false)
            setRevision((value) => value + 1)
          },
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const sync = (action) => {
        setBranchMenuOpen(false)
        setCommitMenuOpen(false)
        runWrite('api/git-panel/sync', { cwd, action }, action).then(
          () => {
            if (action === 'push') setPushPending(false)
            setRevision((value) => value + 1)
          },
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const openContextMenu = (event, file) => {
        event.preventDefault()
        const x = Math.max(6, Math.min(event.clientX, (window.innerWidth || 400) - 196))
        const y = Math.max(6, Math.min(event.clientY, (window.innerHeight || 600) - 240))
        setContextMenu({ file, x, y })
      }

      const closeContextMenu = () => setContextMenu(null)

      const copyRepoPath = (file) => {
        const root = data !== null && typeof data.root === 'string' ? data.root.replace(/[\\/]+$/, '') : ''
        const value = root === '' ? file.path : root + '/' + file.path
        try {
          navigator.clipboard.writeText(value).catch(() => {})
        } catch {
          // Clipboard can be unavailable; nothing else to do.
        }
        closeContextMenu()
      }

      const revealFile = (file) => {
        closeContextMenu()
        runWrite('api/git-panel/reveal', { cwd, path: file.path }).catch((error) =>
          setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const discardFile = (file) => {
        runWrite('api/git-panel/discard', { cwd, path: file.path, origPath: file.origPath }).then(
          () => setRevision((value) => value + 1),
          (error) => setWriteError(error instanceof Error ? error.message : String(error)),
        )
      }

      const confirmDiscardAction = () => {
        const file = confirmDiscard
        setConfirmDiscard(null)
        if (file !== null) discardFile(file)
      }

      const data = state.data
      const error = state.error
      const commits = data !== null && data.isRepo === true && Array.isArray(data.commits) ? data.commits : []
      const commitNeedle = commitQuery.trim().toLowerCase()
      const layout = React.useMemo(() => {
        if (commitNeedle === '') return layoutCommits(commits)
        const filtered = commits.filter((commit) =>
          (commit.subject + ' ' + commit.author + ' ' + commit.short + ' ' + commit.hash + ' ' + commit.refs)
            .toLowerCase()
            .includes(commitNeedle),
        )
        return layoutCommits(filtered)
      }, [commits, commitNeedle])
      const files = data !== null && data.isRepo === true && Array.isArray(data.files) ? data.files : []
      const fileNeedle = fileQuery.trim().toLowerCase()
      const matchFile = (file) => fileNeedle === '' || file.path.toLowerCase().includes(fileNeedle)
      const filesVisible = files.filter(matchFile)
      const stagedFiles = files.filter(
        (file) => !file.conflicted && file.index !== ' ' && file.index !== '?' && file.index !== '',
      )
      const unstagedFiles = files.filter(
        (file) => file.conflicted || file.untracked || (file.worktree !== ' ' && file.worktree !== '?'),
      )
      const stagedVisible = stagedFiles.filter(matchFile)
      const unstagedVisible = unstagedFiles.filter(matchFile)
      const stagedCount = stagedFiles.length
      const canCommit = stagedCount > 0 && commitMessage.trim() !== '' && !writing
      const step = layout.maxLanes > 8 ? 8 : 12
      const graphWidth = 12 + Math.max(0, layout.maxLanes - 1) * step
      const refresh = () => setRevision((value) => value + 1)

      const branchLabel = (() => {
        if (data === null) return '…'
        if (data.isRepo !== true) return '—'
        if (data.detached === true) return data.head === null ? t('detached') : t('detached') + ' · ' + data.head
        return typeof data.branch === 'string' && data.branch !== '' ? data.branch : '—'
      })()

      const ahead = data !== null && data.isRepo === true ? Number(data.ahead) : 0
      const behind = data !== null && data.isRepo === true ? Number(data.behind) : 0
      const workingClean = files.length === 0
      // A branch without an upstream has never pushed, so its commits are still
      // local even when git cannot count them as ahead.
      const noUpstream =
        data !== null && data.isRepo === true && data.detached !== true && data.upstream === null && commits.length > 0
      const sendable = pushPending || ahead > 0 || noUpstream
      // Primary action: Commit while work is pending, then Push once the tree is
      // clean and the last commit (or an upstream gap) left something to send.
      const pushMode = workingClean && sendable
      const canPush =
        !writing && data !== null && data.isRepo === true && data.detached !== true && sendable
      const canPrimary = pushMode ? canPush : canCommit
      const primaryLabel =
        busyAction === 'push'
          ? t('pushing')
          : busyAction === 'commit'
            ? t('committing')
            : pushMode
              ? t('push')
              : t('commit')
      const primaryAction = () => {
        if (pushMode) sync('push')
        else commitStaged(false)
      }
      const commitHint =
        writing || commitNotice !== null || pushMode
          ? null
          : stagedCount === 0
            ? files.length === 0
              ? null
              : t('commitNothingStaged')
            : commitMessage.trim() === ''
              ? t('commitNoMessage')
              : null

      let changeAdd = 0
      let changeDel = 0
      for (const file of files) {
        if (typeof file.additions === 'number') changeAdd += file.additions
        if (typeof file.deletions === 'number') changeDel += file.deletions
      }

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
          options: diffOptions,
          onOptions: setDiffOptions,
          onBack: closeDiff,
          onReload: reloadDiff,
          sessionId,
          tab,
          t,
        })
      } else {
        const renderRows = (group, mode, statsKey, prefix) =>
          group.map((file, index) =>
            h(FileRow, {
              key: prefix + ':' + (file.origPath === null ? '' : file.origPath + '→') + file.path + ':' + index,
              file,
              onOpen: openDiff,
              stats: file[statsKey],
              stageMode: mode,
              onStage: changeStage,
              onMenu: openContextMenu,
              busy: writing,
              t,
            }),
          )
        const changesList = []
        if (files.length === 0) {
          changesList.push(
            h(
              'div',
              { key: 'clean', className: 'dshgit-clean' },
              h(CheckGlyph, { size: 13 }),
              h('span', null, t('clean')),
            ),
          )
        } else if (filesVisible.length === 0) {
          changesList.push(h('div', { key: 'none', className: 'dshgit-note' }, t('noMatches')))
        } else {
          const renderGroup = (
            key,
            label,
            groupRows,
            mode,
            statsKey,
            prefix,
            open,
            onToggle,
            actionMode,
            actionLabel,
            actionIcon,
          ) =>
            h(
              'div',
              { key, className: 'dshgit-group' },
              h(
                'div',
                { className: 'dshgit-grouphead' },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshgit-groupdisclosure',
                    'aria-expanded': open,
                    onClick: onToggle,
                  },
                  h(DisclosureGlyph, { open }),
                  h('span', { className: 'dshgit-grouptitle' }, label),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshgit-groupact dshgit-tip',
                    'data-tip': actionLabel,
                    'aria-label': actionLabel,
                    disabled: writing,
                    onClick: () => changeStageAll(actionMode),
                  },
                  actionIcon,
                ),
                h('span', { className: 'dshgit-countpill' }, String(groupRows.length)),
              ),
              open ? renderRows(groupRows, mode, statsKey, prefix) : null,
            )
          if (stagedVisible.length > 0) {
            changesList.push(
              renderGroup(
                'staged-group',
                t('stagedGroup'),
                stagedVisible,
                'unstage',
                'stagedStats',
                's',
                stagedOpen,
                () => setStagedOpen((value) => !value),
                'unstage',
                t('unstageAll'),
                h(MinusGlyph, { size: 12 }),
              ),
            )
          }
          if (unstagedVisible.length > 0) {
            changesList.push(
              renderGroup(
                'unstaged-group',
                t('unstagedGroup'),
                unstagedVisible,
                'stage',
                'unstagedStats',
                'u',
                unstagedOpen,
                () => setUnstagedOpen((value) => !value),
                'stage',
                t('stageAll'),
                h(PlusGlyph, { size: 12 }),
              ),
            )
          }
        }

        const commitBox = h(
          'div',
          { className: 'dshgit-composer' },
          h(
            'div',
            { className: 'dshgit-messagebox' },
            h('input', {
              className: 'dshgit-commitinput',
              type: 'text',
              value: commitMessage,
              placeholder: t('commitPlaceholder'),
              autoComplete: 'off',
              disabled: writing,
              'aria-label': t('commitPlaceholder'),
              onChange: (event) => {
                setCommitMessage(event.target.value)
                setCommitNotice(null)
                setWriteError(null)
              },
              onKeyDown: (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitStaged(false)
                }
              },
            }),
          ),
          h(
            'div',
            { className: 'dshgit-split', 'data-disabled': canPrimary ? 'false' : 'true' },
            h(
              'button',
              { type: 'button', className: 'dshgit-splitmain', disabled: !canPrimary, onClick: primaryAction },
              pushMode ? h(PushGlyph, { size: 13 }) : h(CheckGlyph, { size: 13 }),
              h('span', null, primaryLabel),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-splitchev',
                title: t('commitActions'),
                'aria-label': t('commitActions'),
                'aria-haspopup': 'menu',
                'aria-expanded': commitMenuOpen,
                onClick: openCommitMenu,
              },
              h(ChevronGlyph, { size: 10 }),
            ),
          ),
          commitHint === null ? null : h('div', { className: 'dshgit-hint' }, commitHint),
          commitNotice === null ? null : h('div', { className: 'dshgit-notice' }, commitNotice),
        )

        const changesPaneStyle = changesOpen
          ? graphOpen
            ? { flexBasis: (split * 100).toFixed(2) + '%' }
            : { flexBasis: 'auto', flexGrow: 1 }
          : { flexBasis: 'auto', flexGrow: 0, flexShrink: 0 }
        const changesPane = h(
          'div',
          {
            className: 'dshgit-pane dshgit-pane-top' + (changesOpen ? '' : ' dshgit-pane-closed'),
            style: changesPaneStyle,
          },
          h(
            'div',
            { className: 'dshgit-sechead dshgit-sechead-top' },
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-secdisclosure',
                'aria-expanded': changesOpen,
                onClick: () => setChangesOpen((value) => !value),
              },
              h(DisclosureGlyph, { open: changesOpen }),
              h('span', { className: 'dshgit-sectitle' }, t('changes')),
            ),
            h('span', { className: 'dshgit-grow' }),
            h(
              'span',
              { className: 'dshgit-secstats' },
              changeAdd > 0 ? h('span', { className: 'dshgit-add' }, '+' + changeAdd) : null,
              changeDel > 0 ? h('span', { className: 'dshgit-del' }, '-' + changeDel) : null,
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-iconbtn dshgit-tip',
                'data-tip': t('filterFiles'),
                'aria-label': t('filterFiles'),
                'aria-pressed': fileSearchOpen,
                onClick: () => setFileSearchOpen((value) => !value),
              },
              h(SearchGlyph, { size: 14 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-iconbtn dshgit-tip',
                'data-tip': t('refresh'),
                'aria-label': t('refresh'),
                disabled: state.phase === 'loading',
                onClick: refresh,
              },
              h(RefreshGlyph, { size: 14 }),
            ),
          ),
          changesOpen && fileSearchOpen
            ? h(
                'div',
                { className: 'dshgit-filterrow' },
                h('input', {
                  className: 'dshgit-filter',
                  value: fileQuery,
                  placeholder: t('filterFiles'),
                  autoFocus: true,
                  onChange: (event) => setFileQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Escape') {
                      setFileQuery('')
                      setFileSearchOpen(false)
                    }
                  },
                }),
              )
            : null,
          changesOpen ? commitBox : null,
          changesOpen
            ? h(
                'div',
                { className: 'dshgit-list' },
                changesList,
                data.filesTruncated === true
                  ? h('div', { className: 'dshgit-note' }, message(t, 'filesTruncated', { count: files.length }))
                  : null,
              )
            : null,
        )

        const historyList = []
        if (layout.rows.length === 0) {
          historyList.push(
            h(
              'div',
              { key: 'none', className: 'dshgit-note' },
              commitNeedle === '' ? t('noCommits') : t('noMatches'),
            ),
          )
        } else {
          for (const row of layout.rows) {
            const isOpen = expanded === row.commit.hash
            historyList.push(
              h(
                React.Fragment,
                { key: row.commit.hash },
                h(CommitRow, {
                  row,
                  step,
                  width: graphWidth,
                  expanded: isOpen,
                  head: data.head !== null && row.commit.short === data.head,
                  pending: pendingHash === row.commit.hash,
                  onToggle: toggleCommit,
                  onPrefetch: prefetchCommit,
                  onCancelPrefetch: cancelPrefetch,
                  t,
                }),
                h(
                  'div',
                  {
                    key: 'detail',
                    className: 'dshgit-detailwrap',
                    'data-open': isOpen ? 'true' : 'false',
                  },
                  h(
                    'div',
                    { className: 'dshgit-detailinner' },
                    detail.hash === row.commit.hash
                      ? h(CommitDetail, {
                          commit: row.commit,
                          detail,
                          onOpen: openDiff,
                          t,
                        })
                      : null,
                  ),
                ),
              ),
            )
          }
        }
        if (data !== null && data.hasMore === true && limit < 1000) {
          historyList.push(
            h(
              'button',
              {
                key: 'more',
                type: 'button',
                className: 'dshgit-more',
                disabled: state.phase !== 'ready',
                onClick: () => setLimit((value) => Math.min(1000, value + 60)),
              },
              state.phase === 'refreshing' ? t('loadingMore') : t('loadMore'),
            ),
          )
        }
        const graphPaneStyle = graphOpen
          ? undefined
          : { flexBasis: 'auto', flexGrow: 0, flexShrink: 0 }
        const historyPane = h(
          'div',
          {
            className: 'dshgit-pane dshgit-pane-bottom' + (graphOpen ? '' : ' dshgit-pane-closed'),
            style: graphPaneStyle,
          },
          h(
            'div',
            { className: 'dshgit-sechead dshgit-sechead-graph' },
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-secdisclosure',
                'aria-expanded': graphOpen,
                onClick: () => setGraphOpen((value) => !value),
              },
              h(DisclosureGlyph, { open: graphOpen }),
              h('span', { className: 'dshgit-sectitle' }, t('history')),
            ),
            h('span', { className: 'dshgit-grow' }),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-branchbtn dshgit-tip',
                'data-tip': data !== null && typeof data.root === 'string' ? data.root : cwd ?? '',
                'aria-haspopup': 'menu',
                'aria-expanded': branchMenuOpen,
                disabled: writing,
                onClick: toggleBranchMenu,
              },
              h(GitGlyph, { size: 13, className: 'dshgit-branchglyph' }),
              h('span', { className: 'dshgit-branch' }, branchLabel),
              h(ChevronGlyph, { size: 9 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-syncbtn dshgit-tip',
                'data-tip': t('fetch'),
                'aria-label': t('fetch'),
                disabled: writing,
                onClick: () => sync('fetch'),
              },
              h(FetchGlyph, { size: 13 }),
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-syncbtn dshgit-tip',
                'data-tip': t('pull'),
                'aria-label': t('pull'),
                disabled: writing || data.detached === true,
                onClick: () => sync('pull'),
              },
              h(PullGlyph, { size: 13 }),
              behind > 0 ? h('span', { className: 'dshgit-syncnum' }, String(behind)) : null,
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-syncbtn dshgit-tip',
                'data-tip': t('push'),
                'aria-label': t('push'),
                disabled: !canPush,
                onClick: () => sync('push'),
              },
              h(PushGlyph, { size: 13 }),
              ahead > 0 ? h('span', { className: 'dshgit-syncnum' }, String(ahead)) : null,
            ),
            h(
              'button',
              {
                type: 'button',
                className: 'dshgit-iconbtn dshgit-tip',
                'data-tip': t('searchCommits'),
                'aria-label': t('searchCommits'),
                'aria-pressed': commitSearchOpen,
                onClick: () => setCommitSearchOpen((value) => !value),
              },
              h(SearchGlyph, { size: 14 }),
            ),
          ),
          graphOpen && commitSearchOpen
            ? h(
                'div',
                { className: 'dshgit-filterrow' },
                h('input', {
                  className: 'dshgit-filter',
                  value: commitQuery,
                  placeholder: t('searchCommits'),
                  autoFocus: true,
                  onChange: (event) => setCommitQuery(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Escape') {
                      setCommitQuery('')
                      setCommitSearchOpen(false)
                    }
                  },
                }),
              )
            : null,
          graphOpen ? h('div', { className: 'dshgit-list' }, historyList) : null,
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
          changesOpen && graphOpen ? divider : null,
          historyPane,
        )
      }

      const branchPicker = branchMenuOpen
        ? [
            h('div', { key: 'backdrop', className: 'dshgit-backdrop', onClick: () => setBranchMenuOpen(false) }),
            h(
              'div',
              {
                key: 'picker',
                className: 'dshgit-popover',
                style:
                  branchAnchor === null
                    ? undefined
                    : {
                        left: branchAnchor.left + 'px',
                        width: branchAnchor.width + 'px',
                        maxHeight: branchAnchor.maxHeight + 'px',
                        ...(branchAnchor.top === undefined
                          ? { bottom: branchAnchor.bottom + 'px' }
                          : { top: branchAnchor.top + 'px' }),
                      },
              },
              h('div', { className: 'dshgit-pop-title' }, t('branches')),
              branches.length === 0
                ? branchLoading
                  ? h('div', { className: 'dshgit-pop-empty' }, t('loading'))
                  : h('div', { className: 'dshgit-pop-empty' }, t('noBranches'))
                : branches.map((branch) =>
                      h(
                        'button',
                        {
                          key: branch.name,
                          type: 'button',
                          className: 'dshgit-pop-item',
                          disabled: branch.current || writing,
                          onClick: () => switchToBranch(branch.name),
                        },
                        h(
                          'span',
                          { className: 'dshgit-pop-text' },
                          h('span', { className: 'dshgit-pop-name' }, branch.name),
                        ),
                        branch.current ? h('span', { className: 'dshgit-pop-check' }, '✓') : null,
                      ),
                    ),
              h(
                'div',
                { className: 'dshgit-pop-form' },
                h('input', {
                  className: 'dshgit-filter',
                  value: branchInput,
                  placeholder: t('newBranchPlaceholder'),
                  disabled: writing,
                  onChange: (event) => setBranchInput(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      submitBranch()
                    } else if (event.key === 'Escape') {
                      setBranchMenuOpen(false)
                    }
                  },
                }),
                h(
                  'button',
                  { type: 'button', className: 'dshgit-pop-open', disabled: writing, onClick: submitBranch },
                  t('createBranch'),
                ),
              ),
            ),
          ]
        : null
      const commitPicker =
        commitMenuOpen && commitMenuAnchor !== null
          ? [
              h('div', {
                key: 'commit-backdrop',
                className: 'dshgit-backdrop',
                onClick: () => setCommitMenuOpen(false),
              }),
              h(
                'div',
                {
                  key: 'commit-menu',
                  className: 'dshgit-menu dshgit-commitmenu',
                  style: {
                    left: commitMenuAnchor.left + 'px',
                    top: commitMenuAnchor.top + 'px',
                    width: commitMenuAnchor.width + 'px',
                  },
                },
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshgit-menuitem',
                    disabled: !canCommit,
                    onClick: () => {
                      setCommitMenuOpen(false)
                      commitStaged(false)
                    },
                  },
                  h(CheckGlyph, { size: 14 }),
                  h('span', { className: 'dshgit-menulabel' }, t('commit')),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshgit-menuitem',
                    disabled: !canCommit,
                    onClick: () => {
                      setCommitMenuOpen(false)
                      commitStaged(true)
                    },
                  },
                  h(PushGlyph, { size: 14 }),
                  h('span', { className: 'dshgit-menulabel' }, t('commitAndPush')),
                ),
                h('div', { className: 'dshgit-menusep' }),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'dshgit-menuitem',
                    disabled: !canPush,
                    onClick: () => {
                      setCommitMenuOpen(false)
                      sync('push')
                    },
                  },
                  h(PushGlyph, { size: 14 }),
                  h('span', { className: 'dshgit-menulabel' }, t('push')),
                ),
              ),
            ]
          : null
      const menuFile = contextMenu === null ? null : contextMenu.file
      const menuUnstaged =
        menuFile !== null && (menuFile.untracked || (menuFile.worktree !== ' ' && menuFile.worktree !== '?'))
      const menuStaged =
        menuFile !== null &&
        !menuFile.conflicted &&
        menuFile.index !== ' ' &&
        menuFile.index !== '?' &&
        menuFile.index !== ''
      const menu =
        contextMenu === null
          ? null
          : [
              h('div', { key: 'menu-backdrop', className: 'dshgit-backdrop', onClick: closeContextMenu }),
              h(
                'div',
                {
                  key: 'menu',
                  className: 'dshgit-menu',
                  style: { left: contextMenu.x + 'px', top: contextMenu.y + 'px' },
                },
                h(
                  'button',
                  {
                    key: 'diff',
                    type: 'button',
                    className: 'dshgit-menuitem',
                    onClick: () => {
                      closeContextMenu()
                      openDiff(menuFile)
                    },
                  },
                  t('viewDiff'),
                ),
                menuUnstaged
                  ? h(
                      'button',
                      {
                        key: 'stage',
                        type: 'button',
                        className: 'dshgit-menuitem',
                        onClick: () => {
                          closeContextMenu()
                          changeStage(menuFile, 'stage')
                        },
                      },
                      t('stage'),
                    )
                  : null,
                menuStaged
                  ? h(
                      'button',
                      {
                        key: 'unstage',
                        type: 'button',
                        className: 'dshgit-menuitem',
                        onClick: () => {
                          closeContextMenu()
                          changeStage(menuFile, 'unstage')
                        },
                      },
                      t('unstage'),
                    )
                  : null,
                h('div', { key: 'sep-1', className: 'dshgit-menusep' }),
                h(
                  'button',
                  {
                    key: 'copy',
                    type: 'button',
                    className: 'dshgit-menuitem',
                    onClick: () => copyRepoPath(menuFile),
                  },
                  t('copyPath'),
                ),
                h(
                  'button',
                  {
                    key: 'reveal',
                    type: 'button',
                    className: 'dshgit-menuitem',
                    onClick: () => revealFile(menuFile),
                  },
                  t('reveal'),
                ),
                h('div', { key: 'sep-2', className: 'dshgit-menusep' }),
                h(
                  'button',
                  {
                    key: 'discard',
                    type: 'button',
                    className: 'dshgit-menuitem',
                    'data-danger': 'true',
                    onClick: () => {
                      closeContextMenu()
                      setConfirmDiscard(menuFile)
                    },
                  },
                  menuFile.untracked ? t('deleteFile') : t('discard'),
                ),
              ),
            ]
      const dialog =
        confirmDiscard === null
          ? null
          : h(
              'div',
              { className: 'dshgit-modal-backdrop', onClick: () => setConfirmDiscard(null) },
              h(
                'div',
                {
                  className: 'dshgit-modal',
                  role: 'dialog',
                  'aria-modal': 'true',
                  onClick: (event) => event.stopPropagation(),
                },
                h(
                  'div',
                  { className: 'dshgit-modal-title' },
                  confirmDiscard.untracked ? t('deleteTitle') : t('discardTitle'),
                ),
                h(
                  'div',
                  { className: 'dshgit-modal-body' },
                  message(t, confirmDiscard.untracked ? 'deleteBody' : 'discardBody', {
                    path: confirmDiscard.path,
                  }),
                ),
                h(
                  'div',
                  { className: 'dshgit-modal-actions' },
                  h(
                    'button',
                    { type: 'button', className: 'dshgit-cancel', onClick: () => setConfirmDiscard(null) },
                    t('cancel'),
                  ),
                  h(
                    'button',
                    { type: 'button', className: 'dshgit-danger', onClick: confirmDiscardAction },
                    confirmDiscard.untracked ? t('confirmDelete') : t('confirmDiscard'),
                  ),
                ),
              ),
            )
      const globalError =
        writeError === null
          ? null
          : h(
              'div',
              { className: 'dshgit-error dshgit-global-error' },
              message(t, 'writeError', { message: writeError }),
            )
      return h(
        'div',
        { className: 'dshgit-root' },
        h('style', null, CSS),
        globalError,
        branchPicker,
        commitPicker,
        menu,
        dialog,
        body,
      )
    }

    const CSS = [
      '.dshgit-root{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;color:var(--dsw-alias-label-primary);font-size:var(--dsh-content-font-size-secondary,12px);line-height:1.45;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base))}',
      '.dshgit-sechead{flex:none;display:flex;align-items:center;gap:2px;min-height:32px;padding:0 4px 0 8px;border-bottom:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));user-select:none}',
      '.dshgit-sechead-top{height:37.5px;min-height:37.5px;background:var(--dsw-alias-bg-base);border-bottom-color:var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dshgit-sechead-graph{padding-right:3px}',
      '.dshgit-secdisclosure{display:flex;align-items:center;gap:5px;min-width:0;height:24px;padding:0 4px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap}',
      '.dshgit-secdisclosure:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-sectitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-chev{flex:none;color:var(--dsw-alias-label-tertiary);transition:transform 140ms ease}',
      '.dshgit-chev[data-open=true]{transform:rotate(90deg)}',
      '.dshgit-secstats{display:flex;align-items:center;gap:5px;flex:none;margin-right:2px;font-size:10px;font-variant-numeric:tabular-nums}',
      '.dshgit-iconbtn{width:22px;height:22px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.dshgit-iconbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshgit-iconbtn:disabled{opacity:.4;cursor:default}',
      '.dshgit-iconbtn[aria-pressed=true]{background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 14%,transparent);color:var(--dsw-static-deepseek-500,#4176e6)}',
      '.dshgit-branchbtn{display:flex;align-items:center;gap:4px;min-width:0;max-width:42%;height:22px;padding:0 5px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer}',
      '.dshgit-branchbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshgit-branchbtn:disabled{opacity:.45;cursor:default}',
      '.dshgit-branchbtn svg{flex:none}',
      '.dshgit-branchglyph{opacity:.85}',
      '.dshgit-branch{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      '.dshgit-syncbtn{display:inline-flex;align-items:center;gap:1px;height:22px;flex:none;padding:0 3px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:10px;font-variant-numeric:tabular-nums;cursor:pointer}',
      '.dshgit-syncbtn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshgit-syncbtn:disabled{opacity:.35;cursor:default}',
      '.dshgit-syncnum{font-size:9px;line-height:1;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-grow{flex:1}',
      '.dshgit-tip{position:relative}',
      '.dshgit-tip::after{content:attr(data-tip);position:absolute;right:0;top:calc(100% + 5px);z-index:60;padding:4px 7px;border-radius:5px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 6px 18px rgba(0,0,0,.24);font-size:11px;font-weight:400;line-height:1.3;width:max-content;max-width:180px;white-space:normal;overflow-wrap:anywhere;text-align:left;pointer-events:none;opacity:0;transform:translateY(-2px);transition:opacity 100ms ease,transform 100ms ease}',
      '.dshgit-tip:hover::after,.dshgit-tip:focus-visible::after{opacity:1;transform:none;transition-delay:180ms}',
      '.dshgit-branchbtn::after{left:0;right:auto}',
      '.dshgit-tool{width:26px;height:26px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:5px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);cursor:pointer;line-height:1}',
      '.dshgit-tool:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-tool:disabled{opacity:.55;cursor:default}',
      '.dshgit-body{flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden}',
      '.dshgit-pane{display:flex;flex-direction:column;min-height:0;overflow:hidden}',
      '.dshgit-pane-top{flex:0 0 auto}',
      '.dshgit-pane-bottom{flex:1 1 0}',
      '.dshgit-pane-closed{overflow:visible}',
      '.dshgit-list{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:0 6px 8px;scrollbar-gutter:stable}',
      '.dshgit-filterrow{flex:none;padding:6px 8px 0}',
      '.dshgit-filter{box-sizing:border-box;width:100%;height:26px;padding:0 8px;border-radius:6px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:11px;outline:none}',
      '.dshgit-filter:focus{border-color:var(--dsw-static-deepseek-500,#4176e6)}',
      '.dshgit-filter::placeholder{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-more{box-sizing:border-box;width:calc(100% - 12px);margin:4px 6px 2px;height:25px;border:.5px dashed var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:var(--dsw-radius-sm,4px);background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:11px;cursor:pointer}',
      '.dshgit-more:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-more:disabled{opacity:.5;cursor:default}',
      '.dshgit-group{display:block}',
      '.dshgit-grouphead{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:2px;min-height:27px;margin:0 -6px;padding:3px 8px 0 10px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600;user-select:none;background:var(--dsw-specific-sidebar-fill,var(--dsw-alias-bg-base))}',
      '.dshgit-groupdisclosure{display:flex;align-items:center;gap:5px;min-width:0;height:22px;padding:0 3px;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:inherit;font:inherit;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}',
      '.dshgit-groupdisclosure:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-grouptitle{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-groupact{width:20px;height:20px;flex:none;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:4px;background:0 0;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:0;transition:opacity 120ms ease}',
      '.dshgit-grouphead:hover .dshgit-groupact,.dshgit-grouphead:focus-within .dshgit-groupact{opacity:1}',
      '.dshgit-groupact:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshgit-groupact:disabled{opacity:0;cursor:default}',
      '.dshgit-countpill{flex:none;min-width:18px;height:18px;margin-left:2px;padding:0 5px;border-radius:9px;background:var(--dsw-static-deepseek-500,#4176e6);color:#fff;font-size:10px;font-weight:600;line-height:18px;text-align:center;font-variant-numeric:tabular-nums}',
      '.dshgit-composer{flex:none;display:flex;flex-direction:column;gap:6px;padding:8px 8px 9px}',
      '.dshgit-messagebox{display:flex;align-items:center;min-height:34px;padding:0 9px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-layer-1);transition:border-color 120ms ease}',
      '.dshgit-messagebox:focus-within{border-color:var(--dsw-static-deepseek-500,#4176e6)}',
      '.dshgit-commitinput{box-sizing:border-box;width:100%;height:32px;padding:0;border:none;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;outline:none}',
      '.dshgit-commitinput::placeholder{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-commitinput:disabled{opacity:.6}',
      '.dshgit-split{display:flex;height:32px;border-radius:6px;overflow:hidden;background:var(--dsw-static-deepseek-500,#4176e6)}',
      '.dshgit-splitmain{flex:1 1 auto;display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;border:none;background:0 0;color:#fff;font:inherit;font-size:13px;font-weight:600;line-height:1;cursor:pointer}',
      '.dshgit-splitmain:hover:not(:disabled){background:color-mix(in srgb,var(--dsw-static-deepseek-500,#4176e6) 88%,#fff)}',
      '.dshgit-splitchev{flex:none;width:30px;display:flex;align-items:center;justify-content:center;border:none;border-left:1px solid rgba(255,255,255,.28);background:0 0;color:#fff;cursor:pointer}',
      '.dshgit-splitchev:hover{background:rgba(255,255,255,.12)}',
      '.dshgit-split[data-disabled=true]{background:var(--dsw-alias-bg-layer-2)}',
      '.dshgit-split[data-disabled=true] .dshgit-splitmain{color:var(--dsw-alias-label-tertiary);cursor:default}',
      '.dshgit-split[data-disabled=true] .dshgit-splitchev{border-left-color:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-hint{padding:0 2px;color:var(--dsw-alias-label-tertiary);font-size:10px;line-height:1.4}',
      '.dshgit-notice{padding:0 2px;color:var(--dsw-alias-state-success-primary);font-size:10px;line-height:1.4}',
      '.dshgit-clean{display:flex;align-items:center;gap:6px;padding:6px 8px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-global-error{margin:6px 8px 0}',
      '@keyframes dshgit-pop-in{from{opacity:0;transform:translateY(-3px) scale(.985)}to{opacity:1;transform:none}}',
      '@media (prefers-reduced-motion:reduce){.dshgit-popover,.dshgit-menu{animation:none}}',
      '.dshgit-backdrop{position:fixed;inset:0;z-index:30}',
      '.dshgit-popover{position:fixed;z-index:31;display:flex;flex-direction:column;gap:1px;overflow:auto;padding:4px 4px 5px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-overlay);background:color-mix(in srgb,var(--dsw-alias-bg-overlay) 94%,transparent);box-shadow:0 14px 34px rgba(0,0,0,.3);backdrop-filter:blur(16px);transform-origin:top right;animation:dshgit-pop-in 140ms cubic-bezier(.2,.8,.2,1)}',
      '.dshgit-pop-title{padding:1px 4px 3px;font-size:10px;font-weight:600;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-pop-empty{padding:4px 6px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-pop-item{display:flex;align-items:center;gap:6px;width:100%;padding:4px 6px;border:none;border-radius:4px;background:0 0;color:inherit;font:inherit;font-size:12px;text-align:left;cursor:pointer}',
      '.dshgit-pop-item:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-pop-item:disabled{opacity:.55;cursor:default}',
      '.dshgit-pop-item:disabled:hover{background:0 0}',
      '.dshgit-pop-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}',
      '.dshgit-pop-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-pop-check{margin-left:auto;flex:none;color:var(--dsw-static-deepseek-500,#4176e6)}',
      '.dshgit-pop-form{display:flex;gap:4px;margin-top:3px;padding-top:5px;border-top:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}',
      '.dshgit-pop-form .dshgit-filter{flex:1 1 auto;width:auto;min-width:0;height:24px;padding:0 6px;border-radius:4px;font-size:11px}',
      '.dshgit-pop-open{flex:none;height:24px;padding:0 8px;border:none;border-radius:4px;background:var(--dsw-static-deepseek-500,#4176e6);color:#fff;font:inherit;font-size:11px;cursor:pointer}',
      '.dshgit-pop-open:disabled{opacity:.5;cursor:default}',
      '.dshgit-menu{position:fixed;z-index:41;min-width:172px;padding:4px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-overlay);box-shadow:0 10px 28px rgba(0,0,0,.22);transform-origin:top right;animation:dshgit-pop-in 120ms cubic-bezier(.2,.8,.2,1)}',
      '.dshgit-commitmenu{padding:4px}',
      '.dshgit-menuitem{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border:none;border-radius:5px;background:0 0;color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;text-align:left;cursor:pointer}',
      '.dshgit-menuitem:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-menuitem:disabled{opacity:.45;cursor:default}',
      '.dshgit-menuitem:disabled:hover{background:0 0}',
      '.dshgit-menuitem[data-danger=true]{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-menulabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dshgit-menusep{height:1px;margin:3px 4px;background:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}',
      '.dshgit-modal-backdrop{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35)}',
      '.dshgit-modal{width:min(320px,calc(100vw - 32px));padding:14px;border-radius:10px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-overlay);box-shadow:0 16px 40px rgba(0,0,0,.28)}',
      '.dshgit-modal-title{font-weight:500;margin-bottom:6px}',
      '.dshgit-modal-body{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.5;word-break:break-word;margin-bottom:12px}',
      '.dshgit-modal-actions{display:flex;justify-content:flex-end;gap:6px}',
      '.dshgit-cancel{padding:5px 12px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:5px;background:0 0;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer}',
      '.dshgit-cancel:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}',
      '.dshgit-danger{padding:5px 12px;border:none;border-radius:5px;background:var(--dsw-alias-state-error-primary);color:#fff;font:inherit;font-size:12px;cursor:pointer}',
      '.dshgit-title-glyph{flex:none;color:inherit;margin-right:6px;vertical-align:-3px}',
      '.dshgit-row{box-sizing:border-box;display:flex;align-items:center;width:100%;height:27px;border-radius:var(--dsw-radius-sm,4px);white-space:nowrap;overflow:hidden}',
      '.dshgit-row:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-rowmain{display:flex;align-items:center;gap:6px;flex:1 1 auto;min-width:0;height:100%;padding:0 7px;border:none;background:0 0;color:inherit;font:inherit;text-align:left;white-space:nowrap;cursor:pointer;overflow:hidden}',
      '.dshgit-rowmain:focus-visible{outline:2px solid var(--dsw-alias-interactive-bg-hover-accent);outline-offset:-2px}',
      '.dshgit-rowbtn{flex:none;width:20px;height:20px;margin-right:4px;display:inline-flex;align-items:center;justify-content:center;padding:0;border:none;border-radius:4px;background:0 0;color:var(--dsw-alias-label-tertiary);line-height:1;cursor:pointer;opacity:0;transition:opacity 120ms ease}',
      '.dshgit-row:hover .dshgit-rowbtn,.dshgit-row:focus-within .dshgit-rowbtn{opacity:1}',
      '.dshgit-rowbtn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}',
      '.dshgit-rowbtn:disabled{opacity:.4;cursor:default}',
      '@media (hover:none){.dshgit-rowbtn,.dshgit-groupact{opacity:1}}',
      '.dshgit-path{display:flex;align-items:center;gap:6px;min-width:0;flex:1 1 auto;overflow:hidden}',
      '.dshgit-name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary)}',
      '.dshgit-ext{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-dir{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-stats{flex:none;display:inline-flex;align-items:center;gap:5px;font-family:var(--ds-font-family-code,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-size:10px;font-variant-numeric:tabular-nums}',
      '.dshgit-add{color:var(--dsw-alias-state-success-primary)}',
      '.dshgit-del{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-status{flex:none;width:11px;text-align:center;font-size:11px;font-weight:600;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-status[data-s=M]{color:var(--dsw-alias-state-warn-primary)}',
      '.dshgit-status[data-s=A]{color:var(--dsw-alias-state-success-primary)}',
      '.dshgit-status[data-s=D]{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-status[data-s=R]{color:var(--dsw-alias-brand-primary)}',
      '.dshgit-status[data-s=C]{color:var(--dsw-alias-brand-primary)}',
      '.dshgit-status[data-s=T]{color:var(--dsw-alias-state-warn-primary)}',
      '.dshgit-status[data-s=U]{color:var(--dsw-alias-state-success-primary)}',
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
      '.dshgit-divider{flex:0 0 9px;position:relative;cursor:row-resize;outline:none;touch-action:none}',
      '.dshgit-divider:before{content:"";position:absolute;left:0;right:0;top:4px;height:1px;background:var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}',
      '.dshgit-divider:hover:before,.dshgit-divider:focus-visible:before{background:var(--dsw-alias-brand-primary)}',
      '.dshgit-commit{box-sizing:border-box;display:flex;align-items:center;gap:4px;width:100%;height:30px;padding:0 6px 0 0;border:none;border-radius:var(--dsw-radius-sm,4px);background:0 0;color:inherit;font:inherit;text-align:left;cursor:pointer;overflow:hidden}',
      '.dshgit-commit:hover,.dshgit-commit[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-graph{flex:none;display:block;overflow:visible}',
      '.dshgit-commit-text{display:flex;align-items:center;gap:5px;min-width:0;flex:1 1 auto;overflow:hidden}',
      '.dshgit-subject{min-width:0;flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}',
      '.dshgit-subject[data-head=true]{font-weight:600}',
      '.dshgit-author{flex:0 1 auto;min-width:0;max-width:40%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px}',
      '.dshgit-refs{flex:none;display:flex;align-items:center;gap:4px;max-width:52%;overflow:hidden}',
      '.dshgit-ref{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 6px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));font-size:10px;font-weight:500;line-height:16px;color:var(--dsw-alias-label-secondary)}',
      '.dshgit-ref[data-k=head]{flex:none;background:var(--dsw-static-deepseek-500,#4176e6);border-color:transparent;color:#fff;font-weight:600}',
      '.dshgit-ref[data-k=branch]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}',
      '.dshgit-ref[data-k=remote]{color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-business-primary) 38%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,transparent)}',
      '.dshgit-ref[data-k=tag]{color:var(--dsw-alias-state-warn-primary);border-color:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 35%,transparent);background:color-mix(in srgb,var(--dsw-alias-state-warn-primary) 10%,transparent)}',
      '.dshgit-hash{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-detailwrap{display:grid;grid-template-rows:0fr;transition:grid-template-rows 180ms cubic-bezier(.2,.8,.2,1)}',
      '.dshgit-detailwrap[data-open=true]{grid-template-rows:1fr}',
      '.dshgit-detailinner{min-height:0;overflow:hidden}',
      '.dshgit-commit-spinner{box-sizing:border-box;width:10px;height:10px;flex:none;border-radius:50%;border:1.5px solid color-mix(in srgb,var(--dsw-alias-label-secondary) 28%,transparent);border-top-color:var(--dsw-alias-label-secondary);animation:dshgit-spin .7s linear infinite}',
      '@keyframes dshgit-spin{to{transform:rotate(360deg)}}',
      '@media (prefers-reduced-motion:reduce){.dshgit-detailwrap{transition:none}.dshgit-commit-spinner{animation-duration:1.4s}}',
      '.dshgit-detail{display:flex;flex-direction:column;margin:0 4px 4px 12px;padding:1px 2px 4px 8px;border-left:1px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1))}',
      '.dshgit-detail-head{display:flex;align-items:center;gap:6px;padding:2px 4px 3px;color:var(--dsw-alias-label-tertiary);font-size:10px}',
      '.dshgit-detail-meta{margin-left:auto;display:flex;align-items:center;gap:6px;font-variant-numeric:tabular-nums}',
      '.dshgit-detail-empty{padding:2px 4px 4px;color:var(--dsw-alias-label-tertiary);font-size:11px}',
      '.dshgit-detail-error{color:var(--dsw-alias-state-error-primary)}',
      '.dshgit-diff{flex:1;min-height:0;display:flex;flex-direction:column}',
      '.dshgit-diffhead{flex:none;display:flex;align-items:center;gap:5px;height:37.5px;padding:0 6px;border-bottom:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l1));overflow:hidden}',
      '.dshgit-diffname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      '.dshgit-diffdir{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary);font-size:10px}',
      '.dshgit-diffbody{flex:1;min-height:0;overflow:auto;padding:4px 0 10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;line-height:1.55;tab-size:4}',
      '.dshgit-diffline{display:flex;align-items:flex-start;min-width:max-content;padding-right:12px}',
      '.dshgit-difflineno{flex:none;width:38px;padding-right:8px;text-align:right;color:var(--dsw-alias-label-tertiary);opacity:.7;font-variant-numeric:tabular-nums;user-select:none;box-sizing:border-box}',
      '.dshgit-difflinetext{white-space:pre;flex:1}',
      '.dshgit-diffline[data-t=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 13%,transparent)}',
      '.dshgit-diffline[data-t=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 13%,transparent)}',
      '.dshgit-diffline[data-t=hunk]{color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2);padding:2px 0}',
      '.dshgit-diffline[data-t=meta]{color:var(--dsw-alias-label-tertiary)}',
      '.dshgit-difftools{flex:none;display:flex;gap:4px;padding:4px 8px;border-bottom:.5px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dshgit-modebtn{height:20px;padding:0 7px;border:.5px solid var(--dsw-alias-border-l2,var(--dsw-alias-border-l1));border-radius:4px;background:0 0;color:var(--dsw-alias-label-tertiary);font:inherit;font-size:10px;cursor:pointer}',
      '.dshgit-modebtn[aria-pressed=true]{color:var(--dsw-alias-brand-primary);border-color:currentColor;background:color-mix(in srgb,currentColor 10%,transparent)}',
      '.dshgit-splitrow{display:grid;grid-template-columns:1fr 1fr;min-width:0}',
      '.dshgit-splitcell{display:flex;align-items:flex-start;min-width:0;overflow:hidden;white-space:pre}',
      '.dshgit-splitcell + .dshgit-splitcell{border-left:1px solid var(--dsw-alias-border-l3,var(--dsw-alias-border-l1))}',
      '.dshgit-splitcell[data-t=add]{background:color-mix(in srgb,var(--dsw-alias-state-success-primary) 13%,transparent)}',
      '.dshgit-splitcell[data-t=del]{background:color-mix(in srgb,var(--dsw-alias-state-error-primary) 13%,transparent)}',
      '.dshgit-splitcell[data-t=empty]{background:var(--dsw-alias-bg-layer-2);opacity:.45}',
      '.dshgit-splitcell .dshgit-difflinetext{overflow:hidden}',
      '.dshgit-splitcell .dshgit-difflineno{width:32px;padding-right:6px}',
      '.dshgit-diffbody-split .dshgit-diffline[data-t=hunk],.dshgit-diffbody-split .dshgit-diffline[data-t=meta]{padding-left:6px}',
      '.dshgit-lineno-btn{border:none;background:0 0;padding:0 5px 0 0;font:inherit;color:inherit;cursor:pointer;text-align:right}',
      '.dshgit-lineno-btn:hover{color:var(--dsw-alias-brand-primary);text-decoration:underline}',
      '.tok-comment{color:#7f8c98}',
      '.tok-string{color:#98c379}',
      '.tok-number{color:#d19a66}',
      '.tok-keyword{color:#c678dd}',
      '.tok-mark{background:rgba(255,196,0,.22);border-radius:2px}',
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