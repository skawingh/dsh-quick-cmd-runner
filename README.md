# dsh-quick-cmd-runner

DeepSeek Harness (dsh) 侧边栏插件：**常用命令行**。把常用的命令行存成带注释的列表，点一下就在 DSH 终端里执行，自动判断用 PowerShell / cmd / bash。

主仓库（gitee）：https://gitee.com/stone-axe/dsh-quick-cmd-runner ｜ GitHub 镜像：https://github.com/skawingh/dsh-quick-cmd-runner

## 功能

- 侧边栏（Ctrl+Alt+B）出现「常用命令行」卡片，点开是独立面板 Tab
- 每条命令 = 命令内容 + 注释文字（列表主标题显示注释）
- 左键点击命令 → 新建一个终端 Tab 执行（各次执行互不干扰），终端标题自动用注释命名
- Shell 自动识别（可手动固定 auto / powershell / cmd / bash）：
  - `Get-Something`、`$env:`、`pwsh|powershell` → PowerShell
  - `%VAR%`、`for /f`、`set x=`、`.bat|.cmd` → cmd
  - `#!/`、`./`、`grep|awk|sed|chmod|bash|wsl` 等 → bash
  - 其余 → 终端默认 shell
- 新增 / 编辑 / 克隆 / 删除 / 搜索；列表按 **title 拼音升序**（无 title 回退 command）→ 最近运行优先 → 运行次数优先 → 创建时间排序；编辑只改命令本体，运行统计与「今日已运行」状态不丢
- 行内显示上次运行时间（本地时区），今天已运行与未运行之间有一条分界横杠
- 「重载」按钮：**以数据文件为准做镜像同步**——手改文件的增、删、改都生效（删除的条目不会复活，同 id 条目保留本地运行统计）
- 列表上限 200 条，超出时淘汰**运行次数最少**的条目（不是最旧的）
- 数据实时同步落盘，升级插件 / 清缓存不丢
- 命令列表为滚动容器（细滚动条 + 悬停加深），命令再多也不裁切、全部可达
- **v1.3.0 集中终端**：命令终端集中开在专用「QCR 终端」会话（多标签），任何聊天会话里点命令都汇入那里，会话列表随时可查；详见下文「集中终端（v1.3.0）」

## 集中终端（v1.3.0）

- 命令终端不再散落在当前聊天会话，而是集中到名为 **「QCR 终端」** 的专用会话，一个会话多标签、历史全保留
- 面板会自动 cd 到发起命令的聊天会话工作目录再执行（cmd / PowerShell / bash 各自语法）
- **完成检测与标签复用**：命令末尾自动附加一次性完成标记（shell 拼接拆分写入，回显行不会误判）；标记出现 → 该标签记为空闲 → 下次同类 shell 的命令**复用这个标签**（改标题后继续用）；进程退出 → 标记失效。cmd 因回显机制按「两次命中」判定；`set -x`（bash）与 PSReadLine 重绘均不误判
- **无法识别 shell 的命令**（kind=null）：原样执行，不加 cd、不加标记，不复用标签（宁可少功能不破坏命令）
- **切终端标签迟滞修复**：以 extension 优先级接管终端 tab 类型（keepMounted），切走再切回不再整屏重挂；插件卸载自动回退官方终端
- **一次性引导**：宿主的会话侧栏要被打开过一次才会接受程序开 tab，因此**每次应用启动后**第一条命令会在当前会话执行并提示「打开一次 QCR 终端会话」；打开一次后，本轮启动内所有命令都集中执行
- 集中会话被删除：下一条命令自动重建并回到引导态，不会黑洞

## 数据文件

真实数据在（与插件目录分离，插件更新不影响）：

```
~/.dsh/quick-cmd-runner/commands.json
```

格式化 JSON，记事本可直接编辑。每条字段：

| 字段 | 说明 |
|---|---|
| `id` | 唯一标识，手改时可删（自动补新 id） |
| `command` | 完整命令行字符串 |
| `comment` | 注释文字（列表主标题） |
| `shell` | `auto` / `powershell` / `cmd` / `bash` |
| `runs` / `lastRun` / `created` | 运行次数 / 上次运行毫秒时间戳 / 创建时间戳，可省略 |

改完保存后点面板「重载」即可生效（文件里删除的条目会同步从列表移除）。插件目录内的 `commands.json` 只是首次建库的种子示例。

## 安装

### 方式零：插件市场「发现」页安装（最简单）

1. DSH 插件页 → **实验性插件**旁的**更多** → 打开 **自定义插件市场** 开关
2. 插件页出现 **发现** 标签 → **添加索引源**，输入：
   ```
   https://raw.giteeusercontent.com/stone-axe/dsh-quick-cmd-runner/raw/master/market/index.json
   ```
   （注意用这个 raw.giteeusercontent.com 域名：gitee.com 的 raw 地址会 302 重定向，DSH 索引源要求无重定向）
3. 在市场里找到「常用命令行」→ **安装**（确认框会显示来源为本仓库 Git 提交）

### 方式一：独立安装器（推荐，**不依赖源码盘符**）

```
node tools/install-dsh.mjs
```

安装器把插件复制进 profile 的 `vendor/`（持久源）与 `node_modules/`（运行副本），
并把 profile `package.json` 的依赖从 `link:G:/...`（或缺失）改写为 `file:./vendor/dsh-quick-cmd-runner`，
备份后缀 `.bak-dsh-quick-cmd-runner`。装完源码盘删除/移走也不影响 DSH 运行；
改源码后重跑一次安装器刷新副本，再重启 DSH。

### 方式二：install-bundle

```
dsh plugin install-bundle <本目录绝对路径> --profile <profile名>
```

注意：Electron 应用托管的 profile（如 desktop）可能拒绝 CLI 安装，此时用方式一或方式三。

### 方式三：手动挂载（junction）

1. 把本目录放到任意位置，例如 `G:\dsh_plugins\dsh-quick-cmd-runner`
2. 在 profile 目录建链接（管理员或开发者模式）：
   ```
   mklink /J "%USERPROFILE%\.dsh\profiles\desktop\node_modules\dsh-quick-cmd-runner" "G:\dsh_plugins\dsh-quick-cmd-runner"
   ```
3. 编辑 `%USERPROFILE%\.dsh\profiles\desktop\package.json`：
   - `dependencies` 加一行：`"dsh-quick-cmd-runner": "link:G:/dsh_plugins/dsh-quick-cmd-runner"`
   - `dsh.profile.bundles` 数组加一项：`"dsh-quick-cmd-runner"`
4. 重启 DSH 应用

## 开发结构

- `index.js` — Host 半边：注册 `/qcr-reload`（读数据文件）与 `/qcr-save`（原子写回）两个 session command
- `client.js` — Client 半边：`window.__ModuleLoader__.load` 工厂，面板 UI + 执行链 + 0.8s 防抖落盘同步
- `tools/test-core.mjs` — 核心逻辑单测（109 项：shell 检测 / shell 选择 / 条目规范化 / 排序 / 镜像重载语义 / 编辑保历史回归 / 滚动容器 CSS 回归 / cd 补偿与转义 / 完成标记包装 / ANSI 剥离 / 标记扫描器（分帧、snapshot、cmd 双命中）/ 标签台账（持久化、上限、对账）/ 复用选择 / 集中文案）
- `tools/install-dsh.mjs` — 独立安装器（vendor + node_modules 双副本，脱离源码盘运行）
- `cordis.patch.yml` — bundle 装载声明；`locale/` — 中英文案；`icon.svg` — 图标
- `market/index.json` + `market/icons/` — DSH 插件市场索引（Git 源按 commit 固定；每次发布新版本要更新 `version` / `commit` / `publishTimestamp` 并 push）
- 独立安装后改源码需重跑 `tools/install-dsh.mjs` 刷新副本，再重启 DSH（模块在启动时装载）

## 测试

```bash
npm test    # 或 node tools/test-core.mjs
```

## 运行形态

- 本插件 UI 在 **web/desktop GUI 平面**：需要带 webServer 的 profile（如 desktop）。headless 一次性 CLI 下面板不出现属正常，Host 半的 `/qcr-reload`、`/qcr-save` 仍会注册。
- 验证加载：启动日志应出现 `[QCR] client module loaded (v8, centralized term session + keepMounted)`；面板 Ctrl+Alt+B → 「常用命令行」Tab。

## 许可

MIT
