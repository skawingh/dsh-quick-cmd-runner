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
- **v1.4.0 命令分组**：把一条命令拖到另一条上即成组（弹窗填组名），组显示为带彩色外框的框，组头可「拆分」，组内行可「退出分组」；详见下文「命令分组（v1.4.0）」
- **v1.4.2 导出**：面板右上角「导出」按钮，把当前命令列表（含注释、分组、shell、运行统计）存为 JSON 文件；详见下文「导出（v1.4.2）」
- **v1.4.3 标签复用增强**：python 等认不出的命令改按宿主默认 shell 判型，也能带完成标记入池复用；页面刷新后台账自愈（重新挂观察器/按实况判死）；详见「集中终端（v1.3.0）」

## 导出（v1.4.2）

- 面板头部新增「导出」按钮，点击即下载 `quick-cmd-runner-YYYYMMDD-HHmmss.json`（本地时间命名，落到浏览器默认下载目录）
- 载荷为自描述 JSON：`{ app, schema: 1, exportedAt, count, commands }`，`commands` 每条含 `id / command / comment / shell / group / runs / lastRun / created` 全部字段并逐字段归一
- 列表为空时提示「列表为空，没有可导出的命令」，不生成空文件
- 该格式为后续「导入」预留（schema 版本化），当前版本仅提供导出

## 命令分组（v1.4.0）

- **建组**：按住一条命令拖到另一条命令上松手 → 弹窗填组名 → 两条一起入组
- **入组**：把命令拖到已有分组的任意一行或组框上 → 直接加入该组（不再问名字）；拖到另一组的命令上 = 从原组挪到新组
- **成组**：把组内命令拖到一条未分组的命令上 → 两者组成一个新组（重新命名）
- **出组**：组内行悬停出现「退出分组」，或把它拖到列表空白处；组内只剩一条时分组自动解散
- **拆分**：组头「拆分」，成员留在列表里但不再成组
- **颜色**：由组名确定性推导（同名永远同色），组数未超过 8 个时保证两两不同
- 分组是数据文件里的 `group` 字段，手改文件同样生效
- **v1.4.1 一致性修复**：编辑组内命令不再把它踢出组；删到只剩一条自动解散（不再留单条组框）；建组撞上已有组名会提示"会并进那个组"；组名内部连续空格折叠成一个（`数  据` = `数 据`）

## 集中终端（v1.3.0）

- 命令终端不再散落在当前聊天会话，而是集中到名为 **「QCR 终端」** 的专用会话，一个会话多标签、历史全保留
- 面板会自动 cd 到发起命令的聊天会话工作目录再执行（cmd / PowerShell / bash 各自语法）
- **完成检测与标签复用**：命令末尾自动附加一次性完成标记（shell 拼接拆分写入，回显行不会误判）；标记出现 → 该标签记为空闲 → 下次同类 shell 的命令**复用这个标签**（改标题后继续用）；进程退出 → 标记失效。cmd 因回显机制按「两次命中」判定；`set -x`（bash）与 PSReadLine 重绘均不误判
- **无法识别 shell 的命令**（v1.4.3 起）：先按宿主声明的默认 shell 补判类型，判出即与普通命令一样带完成标记、可复用标签；连默认 shell 都推不出时才原样执行（不加 cd、不加标记、不复用，宁可少功能不破坏命令）
- **台账自愈**（v1.4.3）：页面刷新导致完成标记观察器丢失后，下次执行命令会自动重挂观察器（并立即核对当前输出）；终端已退出、标签已关闭、running 超 24h 的记录自动判死，复用池不会只减不增
- **v1.3.2 修复终端 tab 打不开**：v1.3.0 曾以 extension 优先级接管 terminal tab 类型求 keepMounted 保活，但未按宿主契约（一个 tab 类型 = 共用 id 的定义 + 同 key 正文 slot 两次注册）自带正文，导致**所有**终端 tab 渲染「这类内容还没有可用的查看方式」。已撤销接管，终端恢复官方查看器；keepMounted 收益一并放弃（宿主无 per-tab 保活入口）
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
| `group` | 分组名（同名的命令归一组，留空 = 未分组；组内只剩一条会自动清除） |
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
- `tools/test-core.mjs` — 核心逻辑单测（201 项：shell 检测 / shell 选择 / 条目规范化 / 排序 / 镜像重载语义 / 编辑保历史回归 / 滚动容器 CSS 回归 / cd 补偿与转义 / 完成标记包装 / ANSI 剥离 / 标记扫描器（分帧、snapshot、cmd 双命中）/ 标签台账（持久化、上限、对账、自愈清理）/ 复用选择（两级匹配）/ 集中文案）
- `tools/install-dsh.mjs` — 独立安装器（vendor + node_modules 双副本，脱离源码盘运行）
- `cordis.patch.yml` — bundle 装载声明；`locale/` — 中英文案；`icon.svg` — 图标
- `market/index.json` + `market/icons/` — DSH 插件市场索引（Git 源按 commit 固定；每次发布新版本要更新 `version` / `commit` / `publishTimestamp` 并 push）
- 独立安装后改源码需重跑 `tools/install-dsh.mjs` 刷新副本，再重启 DSH（模块在启动时装载）

## 测试

```bash
npm test    # 两套都跑
node tools/test-core.mjs    # 纯函数：shell 检测 / 排序 / 镜像重载 / 分组算法
node tools/test-render.mjs  # 渲染冒烟：真跑面板组件，验证分组框与拖拽接线
```

## 运行形态

- 本插件 UI 在 **web/desktop GUI 平面**：需要带 webServer 的 profile（如 desktop）。headless 一次性 CLI 下面板不出现属正常，Host 半的 `/qcr-reload`、`/qcr-save` 仍会注册。
- 验证加载：启动日志应出现 `[QCR] client module loaded (v10, command groups)`；面板 Ctrl+Alt+B → 「常用命令行」Tab。

## 许可

MIT
