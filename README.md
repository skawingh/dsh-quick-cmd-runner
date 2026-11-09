# dsh-quick-cmd-runner

DeepSeek Harness (dsh) 侧边栏插件：**常用命令行**。把常用的命令行存成带注释的列表，点一下就在 DSH 终端里执行，自动判断用 PowerShell / cmd / bash。

## 功能

- 侧边栏（Ctrl+Alt+B）出现「常用命令行」卡片，点开是独立面板 Tab
- 每条命令 = 命令内容 + 注释文字（列表主标题显示注释）
- 左键点击命令 → 新建一个终端 Tab 执行（各次执行互不干扰），终端标题自动用注释命名
- Shell 自动识别（可手动固定 auto / powershell / cmd / bash）：
  - `Get-Something`、`$env:`、`pwsh|powershell` → PowerShell
  - `%VAR%`、`for /f`、`set x=`、`.bat|.cmd` → cmd
  - `#!/`、`./`、`grep|awk|sed|chmod|bash|wsl` 等 → bash
  - 其余 → 终端默认 shell
- 新增 / 编辑 / 克隆 / 删除 / 搜索；按运行次数与最近运行时间排序
- 行内显示上次运行时间（本地时区），今天已运行与未运行之间有一条分界横杠
- 「重载」按钮：从数据文件重新读取（手改文件后点它生效）
- 数据实时同步落盘，升级插件 / 清缓存不丢

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

改完保存后点面板「重载」即可生效。插件目录内的 `commands.json` 只是首次建库的种子示例。

## 安装

### 方式零：插件市场「发现」页安装（最简单）

1. DSH 插件页 → **实验性插件**旁的**更多** → 打开 **自定义插件市场** 开关
2. 插件页出现 **发现** 标签 → **添加索引源**，输入：
   ```
   https://raw.giteeusercontent.com/stone-axe/dsh-quick-cmd-runner/raw/master/market/index.json
   ```
   （注意用这个 raw.giteeusercontent.com 域名：gitee.com 的 raw 地址会 302 重定向，DSH 索引源要求无重定向）
3. 在市场里找到「常用命令行」→ **安装**（确认框会显示来源为本仓库 Git 提交）

### 方式一：install-bundle（推荐先试）

```
dsh plugin install-bundle <本目录绝对路径> --profile <profile名>
```

注意：Electron 应用托管的 profile（如 desktop）可能拒绝 CLI 安装，此时用方式二。

### 方式二：手动挂载（junction）

1. 把本目录放到任意位置，例如 `G:\dsh_plugins\dsh-quick-cmd-runner`
2. 在 profile 目录建链接（管理员或开发者模式）：
   ```
   mklink /J "%USERPROFILE%\.dsh\profiles\desktop\node_modules\@local\dsh-quick-cmd-runner" "G:\dsh_plugins\dsh-quick-cmd-runner"
   ```
3. 编辑 `%USERPROFILE%\.dsh\profiles\desktop\package.json`：
   - `dependencies` 加一行：`"@local/dsh-quick-cmd-runner": "link:G:/dsh_plugins/dsh-quick-cmd-runner"`
   - `dsh.profile.bundles` 数组加一项：`"@local/dsh-quick-cmd-runner"`
4. 重启 DSH 应用

## 开发结构

- `index.js` — Host 半边：注册 `/qcr-reload`（读数据文件）与 `/qcr-save`（原子写回）两个 session command
- `client.js` — Client 半边：`window.__ModuleLoader__.load` 工厂，面板 UI + 执行链 + 0.8s 防抖落盘同步
- `cordis.patch.yml` — bundle 装载声明；`locale/` — 中英文案；`icon.svg` — 图标
- `market/index.json` + `market/icons/` — DSH 插件市场索引（Git 源按 commit 固定；每次发布新版本要更新 `version` / `commit` / `publishTimestamp` 并 push）
- 改动任何文件后需重启 DSH 应用（模块在启动时装载）

## 许可

MIT
