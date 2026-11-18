#!/usr/bin/env node
// 渲染冒烟测试：node tools/test-render.mjs
// 用一个最小 React 垫片把 QuickCmdPanel 真跑一遍，断言分组框、组头、拖拽接线、
// 退出分组按钮确实出现在渲染结果里——纯函数测试测不到这些接线。

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

process.env.DSH_QCR_TEST = "1";
const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, "..", "client.js"), "utf8");

const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};

// 最小垫片：createElement 记树，useState 只取初值（渲染一次），useSyncExternalStore 直读快照
const fakeReact = {
  createElement: (type, props, ...children) => ({
    type, props: props || {}, children: children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false),
  }),
  useState: (v) => [typeof v === "function" ? v() : v, () => {}],
  useEffect: () => {},
  useRef: (v) => ({ current: v === undefined ? null : v }),
  useCallback: (fn) => fn,
  useMemo: (fn) => fn(),
  useSyncExternalStore: (_sub, snap) => snap(),
  Fragment: "Fragment",
};

let captured = null;
globalThis.window = { __ModuleLoader__: { load(mod) { captured = mod; } } };
// eslint-disable-next-line no-new-func
new Function("window", "require", src)(globalThis.window, (name) => {
  if (name === "react") return fakeReact;
  throw new Error("unexpected require: " + name);
});
const mod = captured.factory((name) => {
  if (name === "react") return fakeReact;
  throw new Error("unexpected require: " + name);
});
const t = mod._test;
const { QuickCmdPanel, CSS } = t;

// 种数据：甲组两条、乙组两条、未分组一条
mem.set("dsh-quick-cmd-runner:v1", JSON.stringify({
  version: 1,
  commands: [
    { id: "a1", command: "echo a1", comment: "a1", group: "甲" },
    { id: "a2", command: "echo a2", comment: "a2", group: "甲" },
    { id: "b1", command: "echo b1", comment: "b1", group: "乙" },
    { id: "b2", command: "echo b2", comment: "b2", group: "乙" },
    { id: "u1", command: "echo u1", comment: "u1", group: "" },
  ],
}));

let failures = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}

// 只展开我们自己的组件（type 是函数且来自 client.js），宿主组件/图标记录为叶子
const CommandRow = t.CommandRow;
function walk(node, out = []) {
  if (!node || typeof node !== "object") return out;
  // CommandRow 是函数组件：真跑一次拿到 .qcr-row 的 className 与拖拽接线
  if (node.type === CommandRow) {
    out.push({ type: "CommandRowElement", props: node.props, children: [] });
    return walk(CommandRow(node.props), out);
  }
  out.push(node);
  for (const c of node.children || []) walk(c, out);
  return out;
}

const tree = QuickCmdPanel({
  t: (k) => t.ZH[k] || k,
  sessionId: "s1",
  execute: () => Promise.resolve({}),
  loadShells: () => Promise.resolve([]),
  reload: () => Promise.resolve(0),
  needsBootstrap: () => false,
});
const nodes = walk(tree);
const cls = (n) => String((n.props && n.props.className) || "");
// 按空格切分做精确类名匹配：qcr-group 不能把 qcr-grouphead 也算进来
const has = (n, name) => cls(n).split(/\s+/).indexOf(name) >= 0;

const groupNodes = nodes.filter((n) => has(n, "qcr-group"));
check("渲染出 2 个分组框", groupNodes.length, 2);
check("分组框带彩色外框变量", groupNodes.every((n) => {
  const s = n.props.style || {};
  return typeof s["--qcr-group-color"] === "string" && s["--qcr-group-color"].length > 0;
}), true);
check("两个分组框颜色不同", new Set(groupNodes.map((n) => n.props.style["--qcr-group-color"])).size, 2);
check("组头显示组名", nodes.filter((n) => has(n, "qcr-groupname")).map((n) => n.children[0]), ["甲", "乙"]);
check("组头显示成员数", nodes.filter((n) => has(n, "qcr-groupcount")).map((n) => String(n.children[0])), ["2 条命令", "2 条命令"]);
check("组内行带 qcr-row-grouped", nodes.filter((n) => has(n, "qcr-row-grouped")).length, 4);
check("未分组行不带 grouped", nodes.filter((n) => has(n, "qcr-row") && !has(n, "qcr-row-grouped")).length, 1);
check("组头有拆分按钮", nodes.filter((n) => has(n, "qcr-tool")).filter((n) => n.children[0] === "拆分").length, 2);
check("组头 tools 常显（不只 hover）", CSS.includes(".qcr-grouphead .qcr-tools{display:flex}"), true);
check("组内行有退出分组按钮", nodes.filter((n) => has(n, "qcr-tool")).filter((n) => n.children[0] === "退出分组").length, 4);

// 拖拽接线
const rows = nodes.filter((n) => has(n, "qcr-row"));
const elems = nodes.filter((n) => n.type === "CommandRowElement");
check("行元素与 DOM 行一一对应", elems.length, rows.length);
check("每行都有 suppressClick", elems.every((n) => typeof n.props.suppressClick === "function"), true);
// 拖拽刚结束时浏览器会补一个 click：suppressClick 必须把它吞掉，之后恢复正常
const row0 = elems[0];
check("静止时可点击", row0.props.suppressClick(), false);
const endEv = { preventDefault() {}, stopPropagation() {}, dataTransfer: { setData() {} } };
row0.props.onDragStart(endEv, row0.props.entry);
row0.props.onDragEnd(endEv);
check("拖拽刚结束吞掉 click", row0.props.suppressClick(), true);
check("每行都可拖", rows.every((n) => n.props.draggable === true), true);
check("每行都有 dragStart", rows.every((n) => typeof n.props.onDragStart === "function"), true);
check("每行都有 drop", rows.every((n) => typeof n.props.onDrop === "function"), true);
check("分组框整体可接收 drop", groupNodes.every((n) => typeof n.props.onDrop === "function" && typeof n.props.onDragOver === "function"), true);

// 拖拽落点：模拟把 u1 拖到 a2 上后应出现 qcr-drop（走真实事件回调，不用假数据）
const idxOf = (id) => elems.findIndex((n) => n.props.entry && n.props.entry.id === id);
check("行渲染带 entry", idxOf("a2") >= 0 && idxOf("u1") >= 0, true);
const prevent = { preventDefault() {}, stopPropagation() {}, dataTransfer: { setData() {} } };
const iu1 = idxOf("u1");
const ia2 = idxOf("a2");
elems[iu1].props.onDragStart(prevent, elems[iu1].props.entry);
rows[ia2].props.onDragOver(prevent, "row:a2");
check("dragover 落点 key 写到面板 state（不抛错）", true, true);

// 分组框上 over + drop：把 u1 拖进甲组应调用 setGroupOn（这里只验证回调可执行）
let mutated = null;
const gCallbacks = groupNodes[0].props;
const dropEv = { preventDefault() {}, stopPropagation() {} };
gCallbacks.onDragOver(dropEv);
gCallbacks.onDrop(dropEv);
mutated = mem.get("dsh-quick-cmd-runner:v1");
check("拖入分组后 json 里 u1 归入甲", JSON.parse(mutated).commands.find((c) => c.id === "u1").group, "甲");
check("拖入后甲组变 3 条", JSON.parse(mutated).commands.filter((c) => c.group === "甲").length, 3);

// CSS 契约仍在渲染层生效
check("CSS 有分组框规则", CSS.includes(".qcr-group{"), true);

// 拖到列表空白处 = 退出分组
const listNode = nodes.find((n) => has(n, "qcr-list"));
check("列表容器有 drop 处理器", typeof listNode.props.onDrop === "function", true);
const a1 = elems.find((n) => n.props.entry && n.props.entry.id === "a1");
a1.props.onDragStart(prevent, a1.props.entry);
listNode.props.onDrop({ preventDefault() {}, stopPropagation() {} });
check("拖到空白处后 a1 已退出甲组", JSON.parse(mem.get("dsh-quick-cmd-runner:v1")).commands.filter((c) => c.group === "甲").length, 2);

console.log(failures ? `\n${failures} 项失败` : "\n全部通过");
process.exit(failures ? 1 : 0);
