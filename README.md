# dsh-sidebar-git

在 DeepSeek Harness 的右侧栏里查看**当前会话工作区**的 Git 改动和提交历史。仿 VS Code 源码管理面板，但把改动列表、提交树和 diff 收进了同一列，适合在写代码时随手看一眼仓库状态。

当前版本是只读的：不会执行暂存、提交、推送或任何会改动仓库的操作。

## 界面

```
┌────────────────────────────────────┐
│  Git   main  ↑1 ↓0              ⟳  │
├────────────────────────────────────┤
│  更改  5                  +12 -3   │
│  JS  app.js   src          +4 -1  M│
│  {}  package.json          +1 -0  M│
│  #   theme.css  src        +7 -2  M│
├────────────── 拖动 ────────────────┤
│  提交  12                          │
│  ● feat: add panel        abc1234  │
│  ● fix: splitter          def5678  │
│  ● Merge branch 'main'    9876543  │
└────────────────────────────────────┘
```

- **上半区**：工作区改动。单行显示文件名和目录，前面是文件类型图标，右侧是 `+N -N` 和状态字母（`M` 修改、`A` 新增、`D` 删除、`R` 重命名、`U` 未跟踪、`!` 冲突）。
- **下半区**：提交树。lane 连线的分支图、短 hash、`HEAD -> main` / `origin/main` / tag 徽标；合并提交会画出多条父边。
- **中间分割条**：上下拖动调整两栏高度，比例按会话记住（也可以聚焦后按 ↑/↓ 微调）。
- **点文件**：在面板内打开这个文件的统一 diff——双行号、红绿高亮、hunk 头，顶部可以返回、打开文件预览、重新读取差异。
- **点提交**：展开该提交改动过的文件列表（带状态和增删行数），再点一次收起；提交里的文件也能查看该提交的 diff。
- 顶部显示当前分支、ahead/behind 和刷新按钮；标签页可见时每 8 秒自动刷新。
- 文案跟随 Harness 界面语言（简体中文 / English），界面颜色使用 Harness 主题 token（分支连线与文件图标的配色除外），亮色和暗色主题都适配。

## 环境要求

- DeepSeek Harness 桌面版或 Web 版，右侧栏可用。
- `git` 在 Host 的 `PATH` 里。
- 没有额外的 npm 运行时依赖。

## 安装

本仓库是一个 Harness bundle 包（`dsh.bundle.patch` 指向 `cordis.patch.yml`），不是普通的 npm 应用。

**方式一：从 GitHub 安装（推荐）**

在 Harness 的插件管理页（侧边栏的插件入口）选择安装，填入：

```
github:Dream-Tian/dsh-sidebar-git
```

安装器会把它加入 profile 的依赖和 `dsh.profile.bundles`，并由包内的 patch 插入 `git-tab` 这一行。装好后刷新页面，开始页会多出一张 **Git** 卡片。

**方式二：从本地目录安装**

适合边改边用：

```bash
git clone https://github.com/Dream-Tian/dsh-sidebar-git.git
```

然后在插件管理里安装这个本地目录（绝对路径）。profile 里会变成：

```json
"dependencies": { "dsh-sidebar-git": "link:/path/to/dsh-sidebar-git" }
```

**方式三：手动改 profile（开发者）**

在 profile 的 `package.json` 中加入 `link:` 依赖（或 git spec），并把 `dsh-sidebar-git` 加进 `dsh.profile.bundles`，再重新组合 profile。不要手动改 `cordis.patch.yml` 去重复挂载，bundle 自带的 patch 会插入插件行。

> 插件会随所有会话生效。卸载时从插件管理里移除 `dsh-sidebar-git` bundle 即可。

## 使用

1. 打开一个**工作目录在 Git 仓库里**的会话（在仓库子目录里也可以，会自动向上找仓库根）。
2. 在开始页点 **Git** 卡片，或从右侧栏的标签添加入口打开指南页再选 Git。
3. 如果当前目录不是 Git 仓库，面板会直接提示，不会报错。

### diff 的细节

- 已跟踪文件：对比 `HEAD`，暂存区和未暂存的改动合并显示。
- 未跟踪文件：Host 读取文件内容，合成为“全部新增”的 diff。
- 删除的文件：显示为全部删除；重命名但内容没变时提示“只有元数据变更”。
- 提交详情里的文件：对比该提交的第一个父提交。
- 二进制文件、空 diff、文件过大都有单独提示；Host 最多返回 512 KB diff（未跟踪文件超过 256 KB 不合成），前端最多渲染 4000 行。

## 工作方式

- **Host 半**（`host.js`）：通过 Connection 注册三个需要浏览器认证的精确路由：
  - `POST /api/git-panel/snapshot` — 仓库根、分支、改动文件、提交列表
  - `POST /api/git-panel/commit` — 某个提交改动过的文件
  - `POST /api/git-panel/diff` — 某个文件的统一 diff
- **Git 采集**（`git.js`）：只调用 `rev-parse`、`status`、`log`、`diff`、`show`，全部只读；有超时、输出大小、文件数/提交数上限；路径拒绝绝对路径、`..` 和 NUL，diff 使用 `--literal-pathspecs`，未跟踪文件用 `realpath` 校验是否仍在仓库内。
- **Client 半**（`client.js`）：通过 `ctx.sidebarRightTabs` 注册 `gitpanel` 类型和开始页卡片，在 `sidebar.right.pane.tab` 里渲染 React 组件；不依赖任何 Harness Client 包，只使用 `--dsw-alias-*` 主题 token。

```
.
├── host.js            # Host 半：注册 /api 路由，参数校验
├── git.js             # 只读 Git 采集（status / log / numstat / show / diff）
├── client.js          # Client 半：侧栏类型、改动列表、提交树、diff 视图
├── cordis.patch.yml   # bundle 挂载行（id: git-tab）
├── package.json
├── icon.svg
└── locale/
    ├── zh.json        # 插件管理里显示的中文名称/描述
    └── en.json
```

## 已知限制

- 只跟随会话的工作目录，没有独立的“选择仓库”入口。
- 只读：不能暂存、提交、切分支或推送。
- 没有语法高亮，diff 是纯文本着色；超长行需要横向滚动。
- 文件类型图标按扩展名映射，未覆盖的扩展名使用通用文档图标。
- 合并提交的文件列表和 diff 都以第一个父提交为基准。

## 开发

- 改 `client.js` 后，在插件管理里重新应用一次 bundle（或重启 Harness）即可重建浏览器端模块。
- 改 `host.js` / `git.js` 后同样通过插件管理重新加载；已链接的本地包会在 profile 重新组合时替换模块，不需要重启进程。
- 样式只用主题 token，新增颜色请优先使用 `--dsw-alias-*`；文件类型图标的颜色属于图标本身，可以保留字面值。

## 反馈

问题或建议请开 issue：<https://github.com/Dream-Tian/dsh-sidebar-git/issues>