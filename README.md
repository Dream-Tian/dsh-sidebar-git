# dsh-sidebar-git

在 DeepSeek Harness 的右侧栏里查看并操作**当前会话工作区**的 Git 仓库。仿 VS Code 源码管理面板：改动列表、暂存与提交、提交树、分支同步和 diff 都在同一列里。

写操作会直接作用于工作区。丢弃改动这种不可撤销的操作会有二次确认。

## 功能

**改动**
- 「更改」和「提交图」都可以折叠；暂存区和未暂存区也各有折叠按钮。
- 按「暂存的更改 / 更改」分组，单行显示文件名、目录、文件类型图标、`+N -N` 和状态字母（`M` `A` `D` `R` `U` `!`）。
- 每行悬停出现 `+` / `−` 暂存或取消暂存；分区标题悬停出现全部暂存 / 全部取消暂存，右侧是文件数徽标。
- 支持按路径过滤。
- 右键菜单：查看差异、暂存/取消暂存、复制路径、在 Finder 中显示、丢弃改动（未跟踪文件是删除文件，都会二次确认）。

**提交**
- 提交信息框在「更改」顶部，按 Enter 提交已暂存内容。
- 主按钮平时是「提交」；提交完成、工作区干净后自动变成「推送」。按钮右侧的下拉可以直接「提交并推送」或单独推送。
- 提交树显示 lane 分支图、加粗的 HEAD、作者和 `HEAD -> main` / `origin/main` / tag 徽标，合并提交画出多条父边。
- 点提交展开该提交的文件列表（状态 + 增删行数），再点收起。
- 支持「加载更多」和按消息/作者/hash 搜索已加载的提交。

**分支与同步**
- 面板固定使用当前会话的工作目录；目录在仓库子目录里时自动向上找仓库根。
- 「提交图」标题行右侧是分支下拉和 Fetch / Pull / Push 图标；ahead/behind 数量直接标在拉取 / 推送按钮上。
- 点分支名打开分支菜单：切换本地分支、新建分支。
- Pull 只做 `--ff-only`，不自动合并。

**Diff**
- 点文件在面板内打开统一 diff：双行号、红绿行、hunk 头、词级高亮。
- 工具栏可切换「并排 / 统一」「只看改动」「语法高亮」；选项全局记住。
- 点行号在侧栏文件预览里打开对应行（文件在当前会话工作区内时）。
- 未跟踪文件会合成为「全部新增」的 diff；删除、重命名、二进制、过大文件都有单独提示。

**其它**
- 上下两栏可拖动分割，比例按会话记住；折叠某一栏时会自动让出空间。
- 标签页可见时每 8 秒自动刷新，也可以手动刷新。
- 中文 / English 跟随 Harness 界面语言，颜色使用主题 token，亮暗主题都适配。

## 环境要求

- DeepSeek Harness 桌面版或 Web 版，右侧栏可用。
- `git` 在 Host 的 `PATH` 里。
- 没有额外的 npm 运行时依赖。

## 安装

本仓库是一个 Harness bundle 包（`dsh.bundle.patch` 指向 `cordis.patch.yml`），不是普通的 npm 应用。

**方式一：从 GitHub 安装（推荐）**

在 Harness 的插件管理页选择安装，填入：

```
github:Dream-Tian/dsh-sidebar-git
```

安装器会把它加入 profile 的依赖和 `dsh.profile.bundles`，并由包内的 patch 插入 `git-tab` 这一行。装好后刷新页面，开始页会多出一张 **Git** 卡片。

**方式二：从本地目录安装**

```bash
git clone https://github.com/Dream-Tian/dsh-sidebar-git.git
```

在插件管理里安装这个本地目录（绝对路径）。profile 里会变成：

```json
"dependencies": { "dsh-sidebar-git": "link:/path/to/dsh-sidebar-git" }
```

**方式三：手动改 profile（开发者）**

在 profile 的 `package.json` 中加入 `link:` 依赖（或 git spec），并把 `dsh-sidebar-git` 加进 `dsh.profile.bundles`，再重新组合 profile。不要手动改 `cordis.patch.yml` 去重复挂载，bundle 自带的 patch 会插入插件行。

> 插件会随所有会话生效。卸载时从插件管理里移除 `dsh-sidebar-git` bundle 即可。

## 使用

1. 打开一个**工作目录在 Git 仓库里**的会话（子目录也可以，会自动向上找仓库根）。
2. 在开始页点 **Git** 卡片，或从右侧栏的标签添加入口打开指南页再选 Git。
3. 当前目录不是仓库时面板会直接提示，并给出会话目录路径。

### 暂存与提交

- 悬停文件行点 `+` 暂存，点 `−` 取消暂存；分区标题悬停时的 `+` / `−` 作用于该组全部。
- 暂存后在顶部写提交信息，点「提交」或按 Enter。没有暂存内容或信息为空时主按钮不可用。
- 提交后主按钮变成「推送」；也可以打开右侧下拉选择「提交并推送」。
- 提交使用 Host 的 git 身份配置；没有配置时会显示 git 的报错。

### 分支与同步

- 点「提交图」标题行的分支名：菜单里列出本地分支（当前分支带 ✓），点其它分支切换；输入名字后「新建分支」会创建并切过去。
- 标题行的 Fetch / Pull / Push 图标分别执行对应操作；Pull 只做 fast-forward，不自动合并。
- 当前分支没有 upstream 时，Push 会自动执行 `git push -u origin <branch>`。
- 工作区有未提交改动时，切换分支是否成功由 git 决定，失败信息会显示出来。

### 右键菜单

- **丢弃改动**：已跟踪文件恢复到 `HEAD`（同时清掉暂存区），未跟踪文件直接删除。都会弹出确认框，不可撤销。
- **在 Finder 中显示**：macOS 用 `open -R`，Windows 用资源管理器，Linux 用 `xdg-open`。
- **复制路径**：复制仓库内绝对路径。

### diff 的细节

- 已跟踪文件：对比 `HEAD`，暂存区和未暂存的改动合并显示。
- 未跟踪文件：Host 读取文件内容，合成为“全部新增”的 diff。
- 删除的文件：显示为全部删除；重命名但内容没变时提示“只有元数据变更”。
- 提交详情里的文件：对比该提交的第一个父提交。
- 词级高亮只对成对的删除/新增行做公共前缀/后缀标记；并排视图按顺序配对删除与新增行。
- 语法高亮是轻量的逐行 token 着色（注释、字符串、数字、关键字），多行字符串/跨行注释可能不准确，可以关掉。
- 二进制文件、空 diff、文件过大都有单独提示；Host 最多返回 512 KB diff（未跟踪文件超过 256 KB 不合成），前端最多渲染 4000 行。

## 工作方式

- **Host 半**（`host.js`）：通过 Connection 注册需要浏览器认证的精确路由：
  - 读：`snapshot`、`commit`、`diff`、`branches`
  - 写：`stage`、`unstage`、`commit-create`、`discard`、`reveal`、`branch`、`sync`
  - 写操作在 Host 内串行执行，避免并发操作 git index；丢弃改动由客户端二次确认。
- **Git 操作**（`git.js`）：读操作使用 `rev-parse`、`status`、`log`、`diff`、`show`；写操作使用 `add`、`restore`、`rm --cached`、`commit`、`switch`、`fetch`、`pull --ff-only`、`push`。没有 shell 拼接，全部走参数数组。
- **路径与参数**：拒绝绝对路径、`..`、NUL 和路径魔术（`--literal-pathspecs`）；未跟踪文件操作前用 `realpath` 确认仍在仓库内；分支名限制为安全的 ASCII 字符集。
- **Client 半**（`client.js`）：通过 `ctx.sidebarRightTabs` 注册 `gitpanel` 类型和开始页卡片，在 `sidebar.right.pane.tab` 里渲染 React 组件；不依赖任何 Harness Client 包，只使用 `--dsw-alias-*` 主题 token。

```
.
├── host.js            # Host 半：/api 路由、参数校验、写操作串行
├── git.js             # Git 读写操作（status / log / numstat / show / diff / add / commit / branch / sync）
├── client.js          # Client 半：改动列表、提交框、提交树、diff、分支菜单
├── cordis.patch.yml   # bundle 挂载行（id: git-tab）
├── package.json
├── icon.svg
└── locale/
    ├── zh.json        # 插件管理里显示的中文名称/描述
    └── en.json
```

## 已知限制

- 写操作直接作用于工作区，没有额外的「只读模式」开关；丢弃改动确认后不可撤销。
- 只能按文件暂存，不能按 hunk/行暂存。
- Pull 只支持 fast-forward；没有 merge、rebase、force push、cherry-pick 等操作。
- 分支名限制为字母、数字和 `._/-`，不支持空格或非 ASCII 分支名。
- 语法高亮和并排视图都是轻量实现：逐行 token、按顺序配对删除/新增行，不保证与完整 diff 算法一致。
- 合并提交的文件列表和 diff 都以第一个父提交为基准。
- 文件类型图标按扩展名映射，未覆盖的扩展名使用通用文档图标。
- 没有 stash、blame、submodule 或冲突解决界面。

## 开发

- 改 `client.js` 后，在插件管理里重新应用一次 bundle（或重启 Harness）即可重建浏览器端模块。
- 改 `host.js` / `git.js` 后同样通过插件管理重新加载；已链接的本地包会在 profile 重新组合时替换模块，不需要重启进程。
- 样式只用主题 token，新增颜色请优先使用 `--dsw-alias-*`；文件类型图标和语法 token 的颜色属于内容配色，可以保留字面值。

## 反馈

问题或建议请开 issue：<https://github.com/Dream-Tian/dsh-sidebar-git/issues>