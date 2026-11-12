#!/usr/bin/env node
// 核心逻辑单测：node tools/test-core.mjs
// 通过 DSH_QCR_TEST 钩子直接测 client.js 里的纯函数：
// shell 检测 / shell 选择 / 条目规范化 / 排序 / 镜像重载语义（手改增删改都生效）。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

process.env.DSH_QCR_TEST = "1";
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "client.js"), "utf8");

let captured = null;
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.window = {
  __ModuleLoader__: { load(mod) { captured = mod; } },
};
const fakeReact = {
  createElement: () => null,
  useState: (v) => [typeof v === "function" ? v() : v, () => {}],
  useEffect: () => {},
  useRef: () => ({ current: null }),
  useCallback: (fn) => fn,
};

// eslint-disable-next-line no-new-func
new Function("window", "require", src)(globalThis.window, (name) => {
  if (name === "react") return fakeReact;
  throw new Error("unexpected require: " + name);
});
const mod = captured.factory((name) => {
  if (name === "react") return fakeReact;
  throw new Error("unexpected require: " + name);
});
const {
  detectShellKind, kindOfShellPath, pickShellPath, normalizeEntry,
  sortCommands, rankByUsage, formatLastRun, isToday, updateCommand, mirrorReload, MAX_ENTRIES, CSS,
} = mod._test;

let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

// --- detectShellKind ---
check("Get-ChildItem → powershell", detectShellKind("Get-ChildItem G:\\data"), "powershell");
check("pwsh -File → powershell", detectShellKind("pwsh -File run.ps1"), "powershell");
check("$env: 引用 → powershell", detectShellKind("echo $env:PATH"), "powershell");
check("%VAR% → cmd", detectShellKind("echo %PATH%"), "cmd");
check("for /f 循环 → cmd", detectShellKind("for /f %i in (1,2,3) do echo %i"), "cmd");
check("shebang → bash", detectShellKind("#!/bin/bash\necho hi"), "bash");
check("./相对路径 → bash", detectShellKind("./run.sh --fast"), "bash");
check("python 脚本 → 无法识别（auto）", detectShellKind("python E:\\demo\\main.py"), null);
check("空字符串 → null", detectShellKind(""), null);
check("批处理优先于 Get-Xxx 误报", detectShellKind("tool New-Index.bat"), "cmd");
check("普通 .bat → cmd", detectShellKind("build.bat"), "cmd");
check("反斜杠路径连字符词不误报", detectShellKind("D:\\Data-Backup\\tool.exe"), null);

// --- kindOfShellPath / pickShellPath ---
check("pwsh 路径识别", kindOfShellPath("C:\\Program Files\\PowerShell\\7\\pwsh.exe"), "powershell");
check("cmd.exe 路径识别", kindOfShellPath("C:\\Windows\\System32\\cmd.exe"), "cmd");
check("bash 路径识别", kindOfShellPath("/usr/bin/bash"), "bash");
check("对象 {path} 识别", kindOfShellPath({ path: "pwsh.exe" }), "powershell");
check("pickShellPath 选 pwsh", pickShellPath("powershell", [{ path: "cmd.exe" }, { path: "pwsh.exe" }]), "pwsh.exe");
check("pickShellPath 选 cmd", pickShellPath("cmd", [{ path: "pwsh.exe" }, { path: "C:\\Windows\\System32\\cmd.exe" }]), "C:\\Windows\\System32\\cmd.exe");
check("pickShellPath 空列表 → undefined", pickShellPath("bash", []), undefined);

// --- normalizeEntry ---
check("无 command 返回 null", normalizeEntry({ comment: "x" }), null);
const norm1 = normalizeEntry({ command: "echo hi" });
check("自动补 id", typeof norm1.id === "string" && norm1.id.length > 0, true);
check("默认 shell=auto", norm1.shell, "auto");
check("默认 runs=0 / lastRun=0", [norm1.runs, norm1.lastRun], [0, 0]);
check("非法 shell 归一为 auto", normalizeEntry({ command: "ls", shell: "zsh" }).shell, "auto");
check("保留既有 id", normalizeEntry({ id: "abc", command: "ls" }).id, "abc");
check("负 runs 归零", normalizeEntry({ command: "ls", runs: -3 }).runs, 0);

// --- sortCommands：title（comment，缺省回退 command）拼音升序优先 ---
const sortInput = [
  { id: "a", command: "a", runs: 1, lastRun: 100, created: 5 },
  { id: "b", command: "b", runs: 5, lastRun: 50, created: 6 },
  { id: "c", command: "c", runs: 5, lastRun: 90, created: 7 },
  { id: "d", command: "d", runs: 0, lastRun: 0, created: 1 },
];
const sorted = sortCommands(sortInput);
check("无 comment 时按 command 拼音序", sorted.map((x) => x.id).join(","), "a,b,c,d");
check("sortCommands 不改原数组", sortInput.map((x) => x.id).join(","), "a,b,c,d");
check("title 优先于 runs/lastRun", sortCommands([
  { id: "x", command: "zzz", comment: "b标题", runs: 99, lastRun: 999, created: 1 },
  { id: "y", command: "aaa", comment: "a标题", runs: 1, lastRun: 1, created: 2 },
]).map((x) => x.id).join(","), "y,x");
check("同 title 按 lastRun 降序", sortCommands([
  { id: "p", command: "p", comment: "同", lastRun: 100, runs: 1, created: 1 },
  { id: "q", command: "q", comment: "同", lastRun: 200, runs: 1, created: 2 },
]).map((x) => x.id).join(","), "q,p");
check("同 title+lastRun 按 runs 降序", sortCommands([
  { id: "m", command: "m", comment: "同", lastRun: 100, runs: 1, created: 1 },
  { id: "n", command: "n", comment: "同", lastRun: 100, runs: 2, created: 2 },
]).map((x) => x.id).join(","), "n,m");
check("中文 title 按拼音序（chu < shang）", sortCommands([
  { id: "s1", command: "s1", comment: "上传数据" },
  { id: "s2", command: "s2", comment: "除权除息" },
]).map((x) => x.id).join(","), "s2,s1");
check("rankByUsage 按 runs→lastRun→created 留存排序", rankByUsage(sortInput).map((x) => x.id).join(","), "c,b,a,d");

// --- formatLastRun / isToday ---
check("formatLastRun(0) → ''", formatLastRun(0), "");
check("formatLastRun(NaN) → ''", formatLastRun(NaN), "");
check("当年短格式 MM-DD HH:mm", /^\d{2}-\d{2} \d{2}:\d{2}$/.test(formatLastRun(Date.now())), true);
check("full 带秒 YYYY-MM-DD HH:mm:ss", /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(formatLastRun(Date.now(), true)), true);
const oldTs = new Date(new Date().getFullYear() - 1, 0, 15, 10, 30).getTime();
check("往年只显日期", /^\d{4}-\d{2}-\d{2}$/.test(formatLastRun(oldTs)), true);
check("isToday(现在) = true", isToday(Date.now()), true);
check("isToday(26 小时前) = false", isToday(Date.now() - 26 * 3600 * 1000), false);
check("isToday(0) = false", isToday(0), false);

// --- mirrorReload：以文件为准（手改增/删/改都生效），统计沿自本地 ---
const A = normalizeEntry({ id: "a", command: "echo a", runs: 5, lastRun: 123, created: 1 });
const B = normalizeEntry({ id: "b", command: "echo b", runs: 2, lastRun: 456, created: 2 });
const A2 = normalizeEntry({ id: "a", command: "echo a2", runs: 0, lastRun: 0, created: 9 }); // 手改内容后的 a
const C = normalizeEntry({ id: "c", command: "echo c", runs: 0, lastRun: 0, created: 10 });
check("手改删除的条目不再复活（回归）", mirrorReload([A, B], [A]).map((x) => x.id).join(","), "a");
check("手改新增的条目生效", mirrorReload([A], [A, C]).map((x) => x.id).join(","), "a,c");
check("手改内容生效", mirrorReload([A], [A2])[0].command, "echo a2");
check("runs 沿自本地同 id 条目", mirrorReload([A], [A2])[0].runs, 5);
check("lastRun 沿自本地同 id 条目", mirrorReload([A], [A2])[0].lastRun, 123);
check("空文件清空本地列表", mirrorReload([A, B], []), []);
check("文件新增条目无统计时用文件值", mirrorReload([A], [A, C]).find((x) => x.id === "c").runs, 0);
const many = [];
for (let i = 0; i < 205; i++) many.push(normalizeEntry({ id: "e" + i, command: "echo " + i, runs: i }));
const mirroredMany = mirrorReload([], many);
check("超过上限截断到 MAX_ENTRIES", mirroredMany.length, 200);
check("截断保留 runs 最高的条目", mirroredMany.every((x) => x.runs >= 5), true);

// --- updateCommand：编辑不丢运行统计（回归：改 title 曾把「今日已运行」清零） ---
mem.clear();
localStorage.setItem("dsh-quick-cmd-runner:v1", JSON.stringify({ version: 1, commands: [
  { id: "e1", command: "echo old", comment: "旧标题", shell: "auto", runs: 7, lastRun: Date.now(), created: 12345 },
]}));
updateCommand({ id: "e1", command: "echo new", comment: "新标题", shell: "powershell" });
const edited = JSON.parse(localStorage.getItem("dsh-quick-cmd-runner:v1")).commands.find((x) => x.id === "e1");
check("编辑后 runs 保留", edited.runs, 7);
check("编辑后 lastRun 保留（今日徽标不丢）", isToday(edited.lastRun), true);
check("编辑后 created 保留", edited.created, 12345);
check("编辑后 command/comment/shell 生效", [edited.command, edited.comment, edited.shell], ["echo new", "新标题", "powershell"]);

// --- 常量 ---
check("MAX_ENTRIES = 200", MAX_ENTRIES, 200);

// --- 滚动容器回归（v1.2.1：命令多时无滚动条、被裁命令点不到） ---
check("qcr-list 是合格 flex 滚动容器（min-height:0 + overflow:auto）",
  CSS.includes(".qcr-list{flex:1;min-height:0;overflow:auto;padding:4px 6px}"), true);
check("qcr-list 有可见滚动条样式", CSS.includes(".qcr-list::-webkit-scrollbar{width:8px}"), true);
check("滚动条 thumb 有悬停反馈", CSS.includes(".qcr-list::-webkit-scrollbar-thumb:hover"), true);
check("qcr-root 不再用 min-height:220px 撑破矮面板（裁切根因）",
  CSS.includes(".qcr-root{display:flex;flex-direction:column;height:100%;"), true);
check("qcr-root 无 min-height 残留", /\.qcr-root\{[^}]*min-height/.test(CSS), false);

// ================= v1.3.0：集中终端会话 =================
const {
  escQuotePosix, escQuotePs, cdPrefix, wrapCommand, stripAnsi, makeMarkerScanner,
  pickReusable, normalizeRecord, nextMarker, upsertRecord, setRecordState,
  removeRecord, loadTermRecords, reconcileRecords,
  MARKER_HEAD, TERM_RECORDS_KEY, TERM_RECORDS_MAX, ZH, EN,
} = mod._test;

// --- escQuote / cdPrefix ---
check("escQuotePosix 单引号转义", escQuotePosix("a'b"), "a'\\''b");
check("escQuotePs 单引号转义", escQuotePs("a'b"), "a''b");
check("cdPrefix cmd 加引号 + & 连接", cdPrefix("cmd", "C:\\work dir"), 'cd /d "C:\\work dir" & ');
check("cdPrefix powershell 单引号转义", cdPrefix("powershell", "D:\\it's"), "cd 'D:\\it''s'; ");
check("cdPrefix bash 单引号转义", cdPrefix("bash", "/a'b"), "cd '/a'\\''b' && ");
check("cdPrefix 无目录 → 空", cdPrefix("bash", null), "");
check("cdPrefix kind null → 空（不猜语法）", cdPrefix(null, "/tmp"), "");

// --- wrapCommand：回显不含完整 marker，输出可还原 ---
const MK = "__QCR_DONE_ab12cd_9__";
check("wrapCommand cmd 原样 + & echo", wrapCommand("dir", "cmd", MK), "dir & echo " + MK);
const psW = wrapCommand("Get-X", "powershell", MK);
check("wrapCommand PS 拆分后回显不含完整 marker", psW.includes(MK), false);
check("wrapCommand PS shell 拼接还原完整 marker", psW.split("; echo ")[1].replace('""', ""), MK);
const shW = wrapCommand("ls -l", "bash", MK);
check("wrapCommand bash 同样拆分", shW.includes(MK), false);
check("wrapCommand bash 还原", shW.split("; echo ")[1].replace('""', ""), MK);

// --- stripAnsi ---
check("stripAnsi CSI 序列", stripAnsi("\x1b[31mred\x1b[0m"), "red");
check("stripAnsi OSC 序列", stripAnsi("\x1b]0;title\x07ok"), "ok");
check("stripAnsi 混合", stripAnsi("a\x1b[2Kb\x1b]8;;x\x1b\\c"), "abc");

// --- makeMarkerScanner ---
const sc1 = makeMarkerScanner("__QCR_DONE_aa_1__", 1);
check("scanner: 输入回显含拆分形不误判", sc1.push("echo __QCR_DONE_aa_1\"\"__\r\n", false), false);
check("scanner: 输出帧命中", sc1.push("\x1b[32m__QCR_DONE_aa_1__\r\n", false), true);
const sc2 = makeMarkerScanner("__QCR_DONE_aa_2__", 2);
check("cmd scanner: 回显一次未完成", sc2.push("C:\\>dir & echo __QCR_DONE_aa_2__\r\n", false), false);
check("cmd scanner: 输出第二次命中", sc2.push("__QCR_DONE_aa_2__\r\n", false), true);
const sc3 = makeMarkerScanner("__QCR_DONE_aa_3__", 1);
check("scanner: marker 被换行打散仍命中", sc3.push("echo __QCR_DONE_aa_\r\n3__\r\n", false), true);
const sc4 = makeMarkerScanner("__QCR_DONE_aa_4__", 1);
sc4.push("xx __QCR_DONE_a", false);
check("scanner: 跨帧拼接命中", sc4.push("a_4__ yy", false), true);
const sc5 = makeMarkerScanner("__QCR_DONE_aa_5__", 1);
sc5.push("__QCR_DONE_aa_", false);
sc5.push("fresh screen", true);
check("scanner: snapshot 重置后旧半截不再拼接", sc5.push("5__", false), false);
const sc6 = makeMarkerScanner("__QCR_DONE_aa_6__", 1);
check("scanner: 无 marker 不命中", sc6.push("plain output\r\ndone\r\n", false), false);

// --- nextMarker ---
const m1 = nextMarker();
const m2 = nextMarker();
check("nextMarker 格式", /^__QCR_DONE_[0-9a-z]{6}_[0-9a-z]{1,8}__$/.test(m1), true);
check("nextMarker 序号递增不重复", m1 !== m2, true);

// --- pickReusable / normalizeRecord ---
const recs = [
  { tabKey: "t1", state: "idle", kind: "bash", startedAt: 100 },
  { tabKey: "t2", state: "running", kind: "bash", startedAt: 300 },
  { tabKey: "t3", state: "idle", kind: "cmd", startedAt: 200 },
  { tabKey: "t4", state: "idle", kind: "bash", startedAt: 50 },
];
check("pickReusable 取 idle+kind 匹配中最新", pickReusable(recs, "bash").tabKey, "t1");
check("pickReusable kind 不匹配 → null", pickReusable(recs, "powershell"), null);
check("pickReusable kind null 不复用", pickReusable(recs, null), null);
check("pickReusable untracked 永不入选", pickReusable([
  { tabKey: "u1", state: "untracked", kind: "bash", startedAt: 999 },
], "bash"), null);
check("normalizeRecord 基本形状", normalizeRecord({ tabKey: "a", contentId: 3, terminalId: "tid", command: "c", comment: "m", marker: "M", kind: "bash", state: "running", startedAt: 5 }),
  { tabKey: "a", contentId: 3, terminalId: "tid", command: "c", comment: "m", marker: "M", kind: "bash", state: "running", startedAt: 5 });
check("normalizeRecord 缺 tabKey → null", normalizeRecord({ state: "idle" }), null);
check("normalizeRecord 缺 state → null", normalizeRecord({ tabKey: "a" }), null);

// --- term records 持久化 ---
mem.clear();
const sid = "sess-records-1";
upsertRecord(sid, { tabKey: "k1", contentId: 1, terminalId: "t1", command: "echo 1", comment: "", marker: "M1", kind: "bash", state: "running", startedAt: 10 });
upsertRecord(sid, { tabKey: "k2", contentId: 2, terminalId: "t2", command: "echo 2", comment: "", marker: "M2", kind: "cmd", state: "running", startedAt: 20 });
setRecordState(sid, "k1", "idle");
check("records 持久化 + 状态更新（新记录在前）", JSON.parse(localStorage.getItem(TERM_RECORDS_KEY)).records.map((r) => [r.tabKey, r.state]), [["k2", "running"], ["k1", "idle"]]);
check("loadTermRecords 按会话读取", loadTermRecords(sid).length, 2);
check("loadTermRecords 换会话为空", loadTermRecords("other").length, 0);
removeRecord(sid, "k1");
check("removeRecord 生效", loadTermRecords(sid).map((r) => r.tabKey), ["k2"]);
mem.clear();
for (let i = 0; i < 15; i++) upsertRecord("s3", { tabKey: "k" + i, state: "idle", kind: "bash", startedAt: i });
check("records 超上限截断到 TERM_RECORDS_MAX", loadTermRecords("s3").length, TERM_RECORDS_MAX);
check("截断保留 startedAt 最新", loadTermRecords("s3").every((r) => Number(r.tabKey.slice(1)) >= 3), true);

// --- reconcileRecords：已关闭 tab 的记录作废 ---
mem.clear();
upsertRecord("s2", { tabKey: "k1", state: "idle", kind: "bash", startedAt: 1 });
upsertRecord("s2", { tabKey: "k2", state: "idle", kind: "bash", startedAt: 2 });
const fakeOpenTabs = { tabs: [], getSnapshot() { return this.tabs; } };
const ctxR = { sidebarRight: { openTabs: fakeOpenTabs } };
fakeOpenTabs.tabs = [{ sessionId: "s2", tabId: "k2", kind: "terminal" }, { sessionId: "other", tabId: "k9", kind: "terminal" }];
check("reconcileRecords 返回变更标记", reconcileRecords(ctxR, "s2"), true);
check("reconcile 后只剩未关闭 tab", loadTermRecords("s2").map((r) => r.tabKey), ["k2"]);
check("reconcile 无变更返回 false", reconcileRecords(ctxR, "s2"), false);

// --- v1.3.0 CSS / locale ---
check("qcr-status-warn 样式存在", CSS.includes(".qcr-status-warn{background:rgba(200,150,50,.22)}"), true);
check("qcr-bootstrap 横幅样式存在", CSS.includes(".qcr-bootstrap{"), true);
check("zh 集中成功文案", ZH["status.okCentral"], "已在「QCR 终端」会话运行");
check("zh 回退文案", ZH["status.fallback"].includes("还没打开过"), true);
check("zh bootstrap 提示", ZH["bootstrap.hint"].includes("QCR 终端"), true);
check("en 集中成功文案", EN["status.okCentral"], 'Running in the "QCR Terminal" session');
check("term.* 三件套已随接管路线移除", [ZH["term.title"], ZH["term.new"], ZH["term.description"], EN["term.title"], EN["term.new"], EN["term.description"]], [void 0, void 0, void 0, void 0, void 0, void 0]);

// --- tab 类型定义 / 正文 slot 配对契约 ---
// 宿主 sidebar.right.pane.tab 按「生效定义 id」分发正文（extension 盖过 builtin 后
// entryKey 变成 extension 的 id）；没有同 key 正文 slot 的 kind 一律渲染
// 「这类内容还没有可用的查看方式」。见官方文档 sidebar-right：一个 tab 类型 =
// 共用 id 的两次注册。
const tabDefs = [];
const slotEntries = [];
const fakeCtx = {
  effect: (fn) => { const d = fn(); return typeof d === "function" ? d : () => {}; },
  locale: { bind: () => (key) => String(key), register: () => () => {} },
  sidebarRightTabs: { register: (definition) => { tabDefs.push(definition); return () => {}; } },
  slots: {
    inject: (name, factory) => { factory(); return () => {}; },
    register: (options) => { slotEntries.push({ name: options.name, key: options.key }); return () => {}; },
  },
};
mod.apply(fakeCtx);
const unpaired = tabDefs.filter((d) => !slotEntries.some((e) => e.key === d.id)).map((d) => d.id);
check("每个 tab 类型定义都有以自身 id 为 key 的正文 slot", unpaired, []);
check("quickCmd 面板 tab 类型仍在", tabDefs.some((d) => d.kind === "quickCmd"), true);
check("quickCmd 面板正文 slot key 与定义 id 一致", slotEntries.some((e) => e.key === tabDefs.find((d) => d.kind === "quickCmd").id), true);

console.log(failures ? `\n${failures} 项失败` : "\n全部通过");
process.exit(failures ? 1 : 0);
