// dsh-quick-cmd-runner — sidebar quick command runner (client half)
window.__ModuleLoader__.load({
  id: 'dsh-quick-cmd-runner',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var h = React.createElement;
    var ReactDOM = null;
    try { ReactDOM = require('react-dom'); } catch (e) { ReactDOM = null; }

    var NS = 'quickCmdRunner';
    var PACKAGE_ID = 'dsh-quick-cmd-runner';
    var TAB_KIND = 'quickCmd';
    var STORAGE_KEY = 'dsh-quick-cmd-runner:v1';
    var SEED_FLAG_KEY = 'dsh-quick-cmd-runner:seeded';
    var SYNC_SESSION_KEY = 'dsh-quick-cmd-runner:sync-session';
    var TERM_SESSION_KEY = 'dsh-quick-cmd-runner:term-session';
    var TERM_RECORDS_KEY = 'dsh-quick-cmd-runner:term-records';
    var TERM_SESSION_TITLE = 'QCR 终端';
    var TERM_RECORDS_MAX = 12;
    var MARKER_HEAD = '__QCR_DONE_';
    var MARKER_TAIL = '__';
    var CSS_KEY = 'dsh-quick-cmd-runner/panel.css';
    var LEGACY_STORAGE_KEY = '@local/dsh-quick-cmd-runner:v1';
    var LEGACY_SEED_FLAG_KEY = '@local/dsh-quick-cmd-runner:seeded';
    var MAX_ENTRIES = 200;
    var SHELL_OPTIONS = ['auto', 'powershell', 'cmd', 'bash'];
    var SHELL_LABELS = { powershell: 'PowerShell', cmd: 'cmd', bash: 'bash' };
    // 分组只是条目上的一个名字（group 字段），不另建注册表：commands.json 仍是
    // 命令数组，host 的数组校验和手改文件都保持不变。颜色由名字确定性推导。
    var GROUP_COLORS = ['#4c6ef5', '#12b886', '#f59f00', '#e8590c', '#7048e8',
                        '#1098ad', '#d6336c', '#5c940d'];
    var GROUP_NAME_MAX = 40;

    var ZH = {
      'tab.title': '常用命令行',
      'guide.title': '常用命令行',
      'guide.description': '管理常用命令，一键在终端执行',
      'panel.title': '常用命令行',
      'panel.add': '新增',
      'panel.search': '搜索命令或注释',
      'panel.clear': '清除',
      'panel.empty': '还没有命令，点击右上角新增',
      'panel.noMatch': '没有匹配的命令',
      'status.ok': '已发送到终端',
      'status.error': '发送失败',
      'modal.add': '新增命令',
      'modal.edit': '编辑命令',
      'modal.command': '命令',
      'modal.commandPlaceholder': '例如: python E:\\demo\\main.py',
      'modal.comment': '注释',
      'modal.commentPlaceholder': '例如: 跑概念成分入库',
      'modal.shell': 'Shell',
      'modal.shellAuto': '自动',
      'modal.detected': '检测到',
      'modal.save': '保存',
      'modal.cancel': '取消',
      'row.edit': '编辑',
      'row.clone': '克隆',
      'row.delete': '删除',
      'row.lastRun': '上次运行',
      'row.deleteConfirm': '确定删除这条命令？',
      'panel.reload': '重载',
      'hint.reloadMirror': '以数据文件为准重载：手改的增、删、改都会生效',
      'status.reloadedOk': '已从 commands.json 重新加载',
      'status.reloadedNone': 'commands.json 为空，本地列表已同步清空',
      'status.reloadFailed': '重载失败',
      'status.okCentral': '已在「QCR 终端」会话运行',
      'status.fallback': '「QCR 终端」会话本次启动还没打开过，本次在当前会话运行',
      'bootstrap.hint': '在左侧会话列表打开一次「QCR 终端」会话，之后命令都会集中到那里的多标签终端执行',
      'group.new': '新建分组',
      'group.namePlaceholder': '例如: 数据入库',
      'group.nameRequired': '分组名不能为空',
      'group.members': '条命令',
      'group.nameTaken': '已有同名分组，保存后会并进那个组',
      'group.split': '拆分',
      'group.splitConfirm': '拆分后组内命令仍在列表里，只是不再成组。确定拆分「{name}」？',
      'group.dragHint': '把一条命令拖到另一条上即可建组',
      'row.leaveGroup': '退出分组',
      'panel.export': '导出',
      'hint.export': '把当前命令列表导出为 JSON 文件（含注释、分组与运行统计）',
      'status.exportedOk': '已导出',
      'status.exportFailed': '导出失败',
      'status.exportEmpty': '列表为空，没有可导出的命令'
    };
    var EN = {
      'tab.title': 'Quick Commands',
      'guide.title': 'Quick Commands',
      'guide.description': 'Manage commands and run each in a new terminal',
      'panel.title': 'Quick Commands',
      'panel.add': 'Add',
      'panel.search': 'Search commands or comments',
      'panel.clear': 'Clear',
      'panel.empty': 'No commands yet, click Add on the right',
      'panel.noMatch': 'No matching commands',
      'status.ok': 'Sent to terminal',
      'status.error': 'Send failed',
      'modal.add': 'Add command',
      'modal.edit': 'Edit command',
      'modal.command': 'Command',
      'modal.commandPlaceholder': 'e.g. python E:\\demo\\main.py',
      'modal.comment': 'Comment',
      'modal.commentPlaceholder': 'e.g. run concept import',
      'modal.shell': 'Shell',
      'modal.shellAuto': 'Auto',
      'modal.detected': 'Detected',
      'modal.save': 'Save',
      'modal.cancel': 'Cancel',
      'row.edit': 'Edit',
      'row.clone': 'Clone',
      'row.delete': 'Delete',
      'row.lastRun': 'Last run',
      'row.deleteConfirm': 'Delete this command?',
      'panel.reload': 'Reload',
      'hint.reloadMirror': 'Reload from the data file: hand edits (add/remove/change) all take effect',
      'status.reloadedOk': 'Reloaded from commands.json',
      'status.reloadedNone': 'commands.json is empty; the local list was cleared to match',
      'status.reloadFailed': 'Reload failed',
      'status.okCentral': 'Running in the "QCR Terminal" session',
      'status.fallback': 'The "QCR Terminal" session has not been opened since launch; running in the current session',
      'bootstrap.hint': 'Open the "QCR Terminal" session in the session list once; commands will then centralize into its multi-tab terminals',
      'group.new': 'New group',
      'group.namePlaceholder': 'e.g. data import',
      'group.nameRequired': 'Group name required',
      'group.members': 'commands',
      'group.nameTaken': 'A group with this name exists; saving will merge into it',
      'group.split': 'Split',
      'group.splitConfirm': 'Splitting keeps the commands in the list, just no longer grouped. Split "{name}"?',
      'group.dragHint': 'Drag one command onto another to create a group',
      'row.leaveGroup': 'Leave group',
      'panel.export': 'Export',
      'hint.export': 'Export the command list to a JSON file (comments, groups and run stats included)',
      'status.exportedOk': 'Exported',
      'status.exportFailed': 'Export failed',
      'status.exportEmpty': 'List is empty, nothing to export'
    };

    /* ---------- utilities ---------- */

    function valueOf(result) {
      if (result && typeof result === 'object' && 'ok' in result) {
        if (result.ok) return result.value;
        var err = result.error || {};
        throw new Error(err.message || err.reason || 'remote call failed');
      }
      return result;
    }

    function signalAfter(ms) {
      try {
        if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
      } catch (e) {}
      return undefined;
    }

    // 宿主 44.x client api 按参数个数严格校验：session/create 与 session/rename 的描述符
    // 没有 cancellation 字段（只收 1 个参数，传 AbortSignal 会报
    // "client api: session/create expected 1 argument(s), got 2"）；超时只能客户端兜底，
    // 慢成功落为孤儿会话，无害
    function withTimeout(promise, ms) {
      promise.catch(function () {}); // 慢结果输了竞速也补上 rejection 处理，避免 unhandled rejection
      return Promise.race([
        promise,
        new Promise(function (_, reject) { setTimeout(function () { reject(new Error('session call timed out')); }, ms); })
      ]);
    }

    function newId() {
      try { if (crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
      return 'id-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    // 本地时区格式化; full=true 带秒(悬浮提示), 否则短显(当年省年份)
    function formatLastRun(ts, full) {
      if (!Number.isFinite(ts) || ts <= 0) return '';
      var d = new Date(ts);
      var y = d.getFullYear(), mo = pad2(d.getMonth() + 1), da = pad2(d.getDate());
      var hh = pad2(d.getHours()), mi = pad2(d.getMinutes()), ss = pad2(d.getSeconds());
      if (full) return y + '-' + mo + '-' + da + ' ' + hh + ':' + mi + ':' + ss;
      if (y === new Date().getFullYear()) return mo + '-' + da + ' ' + hh + ':' + mi;
      return y + '-' + mo + '-' + da;
    }

    // 本地日界: 今天 00:00 起算
    function isToday(ts) {
      if (!Number.isFinite(ts) || ts <= 0) return false;
      var d = new Date(ts);
      var n = new Date();
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    }

    function detectShellKind(command) {
      var text = String(command == null ? '' : command);
      if (!text.trim()) return null;
      // 批处理文件优先：避免 "tool New-Index.bat" 这类参数先误命中下面的 Get-Xxx PowerShell 模式
      if (/\.(bat|cmd)\b/i.test(text)) return 'cmd';
      if (/(^|[\s;&|(])([A-Z][a-z]+)-([A-Z][A-Za-z0-9]*)\b/.test(text)) return 'powershell';
      if (/\bpwsh\b|\bpowershell\b|\$env:|\$\w+\s*=|@\{/i.test(text)) return 'powershell';
      if (/%[\w.-]+%|\bfor\s+\/[fldr]\b|\bset\s+\w+\s*=|\.bat\b|\.cmd\b/i.test(text)) return 'cmd';
      if (/^#!|\.\/|\bbash\b|\bwsl\b|\bzsh\b|\bgrep\b|\bawk\b|\bsed\b|\bchmod\b|\bchown\b|\bwc\b/i.test(text)) return 'bash';
      return null;
    }

    function kindOfShellPath(shell) {
      var text = String((shell && (shell.path || shell.name)) || shell || '');
      if (!text) return null;
      if (/pwsh|powershell/i.test(text)) return 'powershell';
      if (/(^|[\\/])cmd(\.exe)?$/i.test(text)) return 'cmd';
      if (/bash|wsl|zsh/i.test(text)) return 'bash';
      return null;
    }

    function pickShellPath(kind, shells) {
      var list = Array.isArray(shells) ? shells : [];
      if (!list.length || !kind) return undefined;
      var patterns = kind === 'powershell' ? [/pwsh/i, /powershell/i]
        : kind === 'cmd' ? [/(^|[\\/])cmd(\.exe)?$/i]
        : [/bash/i, /wsl/i, /zsh/i];
      for (var i = 0; i < patterns.length; i++) {
        for (var j = 0; j < list.length; j++) {
          var item = list[j];
          var text = String((item && (item.path || item.name)) || item || '');
          if (patterns[i].test(text)) return item.path || text;
        }
      }
      return undefined;
    }

    /* ---------- v1.3.0：集中终端会话的纯函数 ---------- */

    function escQuotePosix(s) { return String(s).replace(/'/g, "'\\''"); }
    function escQuotePs(s) { return String(s).replace(/'/g, "''"); }

    // cwd 补偿前缀：集中终端跑在「QCR 终端」会话里，须显式 cd 到发起会话的工作目录；
    // kind 未知时不猜语法（cmd/PS 互不兼容），宁可不 cd 也不把命令写坏
    function cdPrefix(kind, dir) {
      if (!dir || !kind) return '';
      var d = String(dir);
      if (kind === 'cmd') return 'cd /d "' + d + '" & ';
      if (kind === 'powershell') return "cd '" + escQuotePs(d) + "'; ";
      return "cd '" + escQuotePosix(d) + "' && ";
    }

    // 完成标记包装。非 cmd 把 marker 从倒数第 2 字符处拆开加 ""：
    // shell 会拼接成完整 marker 输出，而回显行里只有拆开形态 → 输入回显永不误判完成；
    // cmd 不支持引号拼接，用原样 marker，由扫描器按「回显+输出共两次命中」判定。
    function wrapCommand(command, kind, marker) {
      if (kind === 'cmd') return command + ' & echo ' + marker;
      return command + '; echo ' + marker.slice(0, marker.length - 2) + '""' + marker.slice(-2);
    }

    // 按目标 tab 的 shell kind 组装最终命令（cd 前缀 + 完成标记包装）。
    // kind 未知时不猜语法：不加 cd、不包装（宁可不增强也不把命令写坏）。
    function composeCommand(command, cwd, kind, marker) {
      if (!kind) return command;
      return cdPrefix(kind, cwd) + (marker ? wrapCommand(command, kind, marker) : command);
    }

    // 台账清理：running 超过 24h 仍未见完成标记的记录判死（防观察器丢失后永久占用）
    function sweepStaleRecords(records, now) {
      var list = Array.isArray(records) ? records : [];
      var changed = false;
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r && r.state === 'running' && now - (r.startedAt || 0) > 24 * 60 * 60 * 1000) {
          r.state = 'dead';
          changed = true;
        }
      }
      return changed;
    }

    function stripAnsi(text) {
      return String(text)
        .replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '')
        .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
        .replace(/\x1b[@-Z\\-_]/g, '');
    }

    var markerBoot = Math.random().toString(36).slice(2, 8);
    var markerSeq = 0;
    function nextMarker() {
      markerSeq += 1;
      return MARKER_HEAD + markerBoot + '_' + markerSeq.toString(36) + MARKER_TAIL;
    }

    // 被动扫描器：喂入 render 帧（snapshot → frame.screen，output → frame.data），
    // ANSI 剥离 + 去空白后累计搜索 marker；snapshot 重置累计（重连后旧内容作废）。
    // need=1（POSIX/PS，拆分回显不误判）或 2（cmd，回显一次+输出一次）。
    function makeMarkerScanner(marker, need) {
      var acc = '';
      var hits = 0;
      return {
        push: function (chunk, isSnapshot) {
          acc = (isSnapshot ? '' : acc) + stripAnsi(chunk).replace(/\s+/g, '');
          if (acc.length > 8192) acc = acc.slice(-4096);
          var from = 0;
          for (;;) {
            var at = acc.indexOf(marker, from);
            if (at < 0) break;
            hits += 1;
            from = at + 1;
            if (hits >= need) return true;
          }
          return false;
        },
        hits: function () { return hits; }
      };
    }

    // 复用两级匹配：优先取同 kind 的最新 idle 记录（cd/marker 语法按 shell 走，
    // 错配会直接把命令写坏）；只有 kind 未知（连宿主默认 shell 都推不出）的命令
    // 才允许落到任意最新 idle 记录上，写命令时按目标 tab 的 kind 包装。
    function pickReusable(records, kind) {
      var list = Array.isArray(records) ? records : [];
      var best = null;
      var any = null;
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (!r || r.state !== 'idle') continue;
        var ts = r.startedAt || 0;
        if (kind) {
          if (r.kind === kind && (!best || ts > (best.startedAt || 0))) best = r;
        } else if (!any || ts > (any.startedAt || 0)) {
          any = r;
        }
      }
      return best || (kind ? null : any);
    }


    function normalizeEntry(x) {
      if (!x || typeof x.command !== 'string' || !x.command.trim()) return null;
      return {
        id: typeof x.id === 'string' && x.id ? x.id : newId(),
        command: x.command,
        comment: typeof x.comment === 'string' ? x.comment : '',
        shell: SHELL_OPTIONS.indexOf(x.shell) >= 0 ? x.shell : 'auto',
        group: normalizeGroupName(x.group),
        runs: Number.isFinite(x.runs) && x.runs > 0 ? x.runs : 0,
        lastRun: Number.isFinite(x.lastRun) ? x.lastRun : 0,
        created: Number.isFinite(x.created) ? x.created : Date.now()
      };
    }

    // 组名归一：非字符串一律当未分组，去首尾空白、连续空白折叠成一个空格，再按上限截断。
    // 「数  据」与「数 据」在中文里看不出差别，不折叠就会变成两个组、两种颜色。
    function normalizeGroupName(name) {
      if (typeof name !== 'string') return '';
      return name.trim().replace(/\s+/g, ' ').slice(0, GROUP_NAME_MAX);
    }

    // 按使用价值排序（runs→lastRun→created），仅用于超过 MAX_ENTRIES 时决定留存哪些条目
    function rankByUsage(list) {
      return list.slice().sort(function (a, b) {
        return (b.runs - a.runs) || (b.lastRun - a.lastRun) || (a.created - b.created);
      });
    }

    // 展示排序：title（comment，缺省回退 command）拼音升序 → 最近调用优先 → 调用次数优先 → 创建时间稳定兜底
    function sortCommands(list) {
      return list.slice().sort(function (a, b) {
        var ta = String(a.comment || a.command || '');
        var tb = String(b.comment || b.command || '');
        var byTitle = ta.localeCompare(tb, 'zh');
        if (byTitle !== 0) return byTitle;
        return (b.lastRun - a.lastRun) || (b.runs - a.runs) || (a.created - b.created);
      });
    }

    /* ---------- 分组（纯函数） ---------- */

    function groupOf(entry) {
      // 统一走归一：存量数据/手改文件里的多空格名不能分裂成多个组
      return entry ? normalizeGroupName(entry.group) : '';
    }

    // 现存组名：去重、非空、拼音升序（与命令排序同一套中文比较规则）
    function groupNames(list) {
      var seen = Object.create(null);
      var out = [];
      for (var i = 0; i < (list || []).length; i++) {
        var g = groupOf(list[i]);
        if (g && !seen[g]) { seen[g] = 1; out.push(g); }
      }
      return out.sort(function (a, b) { return a.localeCompare(b, 'zh'); });
    }

    function hashName(name) {
      var h = 0;
      for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0x7fffffff;
      return h;
    }

    // 组名 → 颜色：同名永远同色（手改文件、重启、重载都不跳色）；组数没超过
    // 调色板时保证互不重复，超了才允许复用
    function groupColorMap(list) {
      var names = groupNames(list);
      var used = Object.create(null);
      var map = Object.create(null);
      for (var i = 0; i < names.length; i++) {
        var start = hashName(names[i]) % GROUP_COLORS.length;
        var picked = -1;
        for (var k = 0; k < GROUP_COLORS.length; k++) {
          var idx = (start + k) % GROUP_COLORS.length;
          if (!used[idx]) { picked = idx; break; }
        }
        if (picked < 0) picked = start; // 组数超过调色板，放弃唯一性
        else used[picked] = 1;
        map[names[i]] = GROUP_COLORS[picked];
      }
      return map;
    }

    // 渲染分区：组在前（按组名拼音升序），未分组在後；组内按 sortCommands 排序
    // colorSource 传全量命令，搜索过滤时颜色不会因命中集合变化而跳色
    function buildSections(list, colorSource) {
      var colors = groupColorMap(colorSource || list);
      var names = groupNames(list);
      var buckets = Object.create(null);
      var loose = [];
      for (var i = 0; i < (list || []).length; i++) {
        var e = list[i];
        var g = groupOf(e);
        if (!g) { loose.push(e); continue; }
        if (!buckets[g]) buckets[g] = [];
        buckets[g].push(e);
      }
      var groups = names.map(function (name) {
        return { name: name, color: colors[name], entries: sortCommands(buckets[name] || []) };
      });
      return { groups: groups, loose: sortCommands(loose) };
    }

    // 组内不足两条自动解散：拖剩下一条时不该还留个空框
    function normalizeGroups(list) {
      var counts = Object.create(null);
      for (var i = 0; i < (list || []).length; i++) {
        var g = groupOf(list[i]);
        if (g) counts[g] = (counts[g] || 0) + 1;
      }
      return (list || []).map(function (e) {
        var g = groupOf(e);
        if (!g || counts[g] >= 2) return e;
        return Object.assign({}, e, { group: '' });
      });
    }

    function setGroupOn(list, ids, name) {
      var g = normalizeGroupName(name);
      if (!g) return list;
      var want = Object.create(null);
      for (var i = 0; i < ids.length; i++) want[ids[i]] = 1;
      return (list || []).map(function (e) {
        return want[e.id] ? Object.assign({}, e, { group: g }) : e;
      });
    }

    // 拖一条叠到另一条上：两条都归入新组（原组关系被覆盖）
    function createGroupFrom(list, idA, idB, name) {
      var g = normalizeGroupName(name);
      if (!g) return list;
      var has = Object.create(null);
      for (var i = 0; i < (list || []).length; i++) has[list[i].id] = 1;
      if (!has[idA] || !has[idB] || idA === idB) return list;
      return setGroupOn(list, [idA, idB], g);
    }

    function removeFromGroup(list, ids) {
      var want = Object.create(null);
      for (var i = 0; i < ids.length; i++) want[ids[i]] = 1;
      var cleared = (list || []).map(function (e) {
        return want[e.id] && groupOf(e) ? Object.assign({}, e, { group: '' }) : e;
      });
      return normalizeGroups(cleared);
    }

    function splitGroup(list, name) {
      var g = normalizeGroupName(name);
      if (!g) return list;
      return (list || []).map(function (e) {
        return groupOf(e) === g ? Object.assign({}, e, { group: '' }) : e;
      });
    }

    // 已存在同名组？建组时用来提示"会并进已有组"，避免静默合并
    function hasGroup(list, name) {
      var g = normalizeGroupName(name);
      if (!g) return false;
      for (var i = 0; i < (list || []).length; i++) if (groupOf(list[i]) === g) return true;
      return false;
    }

    /* ---------- storage ---------- */

    // 1.1.0 包名去掉 @local 前缀: 一次性把旧 localStorage 键迁到新键(数据与运行统计不丢)
    function migrateLegacyKeys() {
      try {
        if (!localStorage.getItem(STORAGE_KEY) && localStorage.getItem(LEGACY_STORAGE_KEY)) {
          localStorage.setItem(STORAGE_KEY, localStorage.getItem(LEGACY_STORAGE_KEY));
        }
        if (!localStorage.getItem(SEED_FLAG_KEY) && localStorage.getItem(LEGACY_SEED_FLAG_KEY)) {
          localStorage.setItem(SEED_FLAG_KEY, '1');
        }
      } catch (e) {}
    }

    var storeState = null;
    var storeListeners = new Set();

    function loadStore() {
      migrateLegacyKeys();
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var data = raw ? JSON.parse(raw) : null;
        var list = Array.isArray(data && data.commands) ? data.commands : [];
        var out = [];
        for (var i = 0; i < list.length; i++) {
          var norm = normalizeEntry(list[i]);
          if (norm) out.push(norm);
        }
        if (!out.length) {
          try {
            if (!localStorage.getItem(SEED_FLAG_KEY)) {
              var seeds = require('./commands.json');
              if (seeds && !Array.isArray(seeds) && Array.isArray(seeds.default)) seeds = seeds.default;
              if (Array.isArray(seeds)) {
                for (var d = 0; d < seeds.length; d++) {
                  var sn = normalizeEntry(seeds[d]);
                  if (sn) out.push(sn);
                }
                localStorage.setItem(SEED_FLAG_KEY, '1');
                console.info('[QCR] seeded ' + out.length + ' command(s) from commands.json');
              } else {
                console.warn('[QCR] commands.json did not yield an array:', typeof seeds);
              }
            }
          } catch (e2) {
            console.warn('[QCR] seed from commands.json failed:', e2);
          }
        }
        return { version: 1, commands: normalizeGroups(sortCommands(out)) };
      } catch (e) {
        return { version: 1, commands: [] };
      }
    }

    function getStoreSnapshot() {
      if (!storeState) storeState = loadStore();
      return storeState;
    }

    function subscribeStore(fn) {
      storeListeners.add(fn);
      return function () { storeListeners.delete(fn); };
    }

    function mutate(fn, silent) {
      storeState = fn(getStoreSnapshot());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState)); } catch (e) {}
      storeListeners.forEach(function (listener) { try { listener(); } catch (e) {} });
      if (!silent) schedulePush();
    }

    function addCommand(entry) {
      var norm = normalizeEntry(entry);
      if (!norm) return;
      mutate(function (s) { return { version: 1, commands: sortCommands(rankByUsage([norm].concat(s.commands)).slice(0, MAX_ENTRIES)) }; });
    }

    function updateCommand(entry) {
      var norm = normalizeEntry(entry);
      if (!norm) return;
      mutate(function (s) {
        // 编辑只改 command/comment/shell；运行统计（runs/lastRun/created）与分组沿自原条目。
        // 分组不能跟着 draft 走——编辑弹窗根本不带 group 字段，跟着走就是改个标题把命令踢出组。
        return { version: 1, commands: sortCommands(normalizeGroups(s.commands.map(function (c) {
          return c.id === norm.id ? Object.assign({}, norm, { group: c.group, runs: c.runs, lastRun: c.lastRun, created: c.created }) : c;
        }))) };
      });
    }

    function removeCommand(id) {
      // 删掉组里另一条时组会只剩一条，必须重跑一次自动解散，否则界面上留个单条组框
      mutate(function (s) { return { version: 1, commands: normalizeGroups(s.commands.filter(function (c) { return c.id !== id; })) }; });
    }

    function bumpCommand(id) {
      mutate(function (s) {
        return { version: 1, commands: sortCommands(s.commands.map(function (c) {
          return c.id === id ? Object.assign({}, c, { runs: c.runs + 1, lastRun: Date.now() }) : c;
        })) };
      });
    }

    /* ---------- 导出（纯函数，供 _test 单测） ---------- */

    var EXPORT_SCHEMA = 1;

    // 导出文件名：quick-cmd-runner-YYYYMMDD-HHmmss.json（本地时间，秒级补零）
    function exportFileName(at) {
      var d = (typeof at === 'number' && Number.isFinite(at)) ? new Date(at) : new Date();
      var p2 = function (n) { return (n < 10 ? '0' : '') + n; };
      return 'quick-cmd-runner-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate())
        + '-' + p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds()) + '.json';
    }

    // 导出载荷：只收纯数据字段并逐字段归一，深拷贝，外部改原数组不影响已生成载荷
    function exportPayload(commands, exportedAt) {
      var list = Array.isArray(commands) ? commands : [];
      var out = [];
      for (var i = 0; i < list.length; i++) {
        var c = list[i] || {};
        out.push({
          id: typeof c.id === 'string' ? c.id : '',
          command: typeof c.command === 'string' ? c.command : '',
          comment: typeof c.comment === 'string' ? c.comment : '',
          shell: SHELL_OPTIONS.indexOf(c.shell) >= 0 ? c.shell : 'auto',
          group: normalizeGroupName(c.group),
          runs: Number.isFinite(c.runs) && c.runs > 0 ? c.runs : 0,
          lastRun: Number.isFinite(c.lastRun) ? c.lastRun : 0,
          created: Number.isFinite(c.created) ? c.created : 0
        });
      }
      var d = (exportedAt == null) ? new Date() : new Date(exportedAt);
      if (isNaN(d.getTime())) d = new Date();
      return {
        app: PACKAGE_ID,
        schema: EXPORT_SCHEMA,
        exportedAt: d.toISOString(),
        count: out.length,
        commands: out
      };
    }

    // 浏览器侧下载（仅在面板点击时调用，不进单测）
    function downloadJsonFile(filename, text) {
      var blob = new Blob([text], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 1000);
    }

    function useStoreSnapshot() {
      if (React.useSyncExternalStore) {
        return React.useSyncExternalStore(subscribeStore, getStoreSnapshot, getStoreSnapshot);
      }
      var state = React.useState(getStoreSnapshot());
      var snap = state[0];
      var setSnap = state[1];
      React.useEffect(function () { return subscribeStore(function () { setSnap(getStoreSnapshot()); }); }, []);
      return snap;
    }

    /* ---------- icons ---------- */

    function svgIcon(children, size, className) {
      return h('svg', {
        width: size || 14, height: size || 14, viewBox: '0 0 16 16',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
        strokeLinecap: 'round', strokeLinejoin: 'round', className: className || ''
      }, children);
    }
    function TerminalIcon(props) {
      return svgIcon([h('path', { key: 'a', d: 'M3 4.5 L6.5 8 L3 11.5' }), h('path', { key: 'b', d: 'M8.5 11.5 H13' })], props.size, props.className);
    }
    function PlayIcon(props) {
      return h('svg', { width: props.size || 12, height: props.size || 12, viewBox: '0 0 16 16', fill: 'currentColor', className: props.className || '' }, h('path', { d: 'M4 2.5 L13 8 L4 13.5 Z' }));
    }
    function EditIcon(props) {
      return svgIcon([h('path', { key: 'a', d: 'M2.5 12.5 L3.5 9.5 L11 2 L14 5 L6.5 12.5 Z' }), h('path', { key: 'b', d: 'M10 3 L13 6' })], props.size, props.className);
    }
    function TrashIcon(props) {
      return svgIcon([h('path', { key: 'a', d: 'M3 4.5 H13' }), h('path', { key: 'b', d: 'M5.5 4.5 V2.5 H10.5 V4.5' }), h('path', { key: 'c', d: 'M5 4.5 L5.8 13.5 H10.2 L11 4.5' })], props.size, props.className);
    }
    function PlusIcon(props) {
      return svgIcon([h('path', { key: 'a', d: 'M8 3 V13' }), h('path', { key: 'b', d: 'M3 8 H13' })], props.size, props.className);
    }
    function CloseIcon(props) {
      return svgIcon([h('path', { key: 'a', d: 'M4 4 L12 12' }), h('path', { key: 'b', d: 'M12 4 L4 12' })], props.size, props.className);
    }

    /* ---------- css ---------- */

    var CSS =       '.qcr-root{display:flex;flex-direction:column;height:100%;font-size:12px;color:inherit}' +
      '.qcr-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.25)}' +
      '.qcr-headtitle{font-weight:600}' +
      '.qcr-search{display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid rgba(127,127,127,.18)}' +
      '.qcr-search input{flex:1;min-width:0;background:transparent;border:1px solid rgba(127,127,127,.35);border-radius:4px;padding:3px 6px;color:inherit;font:inherit;outline:none}' +
      '.qcr-search input:focus{border-color:#4c6ef5}' +
      '.qcr-list{flex:1;min-height:0;overflow:auto;padding:4px 6px}' +
      '.qcr-list::-webkit-scrollbar{width:8px}' +
      '.qcr-list::-webkit-scrollbar-track{background:transparent}' +
      '.qcr-list::-webkit-scrollbar-thumb{background:rgba(127,127,127,.35);border-radius:4px}' +
      '.qcr-list::-webkit-scrollbar-thumb:hover{background:rgba(127,127,127,.55)}' +
      '.qcr-row{display:flex;align-items:center;gap:6px;padding:5px 6px;border-radius:4px;cursor:pointer;border:1px solid transparent}' +
      '.qcr-row:hover{background:rgba(127,127,127,.12)}' +
      '.qcr-row:focus-visible{outline:1px solid #4c6ef5}' +
      '.qcr-row-busy{opacity:.6;cursor:progress}' +
      '.qcr-play{flex:none;display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px}' +
      '.qcr-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}' +
      '.qcr-rowtitle{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.qcr-cmd{font-family:Consolas,monospace;font-size:11px;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.qcr-badge{min-width:18px;text-align:center;background:rgba(127,127,127,.18);border-radius:8px;padding:0 5px;font-size:10px;flex:none}' +
      '.qcr-time{font-size:10px;opacity:.6;white-space:nowrap;flex:none}' +
      '.qcr-divider{height:0;border-top:2px solid rgba(127,127,127,.45);margin:8px 2px;flex:none}' +
      // 分组框：靠 --qcr-group-color 传色，边框 + 极淡底色做区分；组内行左侧留白显示归属
      '.qcr-group{--qcr-group-color:#4c6ef5;border:1px solid var(--qcr-group-color);border-left-width:3px;border-radius:6px;margin:6px 0;padding:2px 4px 4px;background:rgba(127,127,127,.06);background:color-mix(in srgb,var(--qcr-group-color) 7%,transparent)}' +
      '.qcr-grouphead{display:flex;align-items:center;gap:6px;padding:3px 4px;font-size:11px;font-weight:600;color:var(--qcr-group-color)}' +
      '.qcr-groupdot{width:7px;height:7px;border-radius:50%;background:var(--qcr-group-color);flex:none}' +
      '.qcr-groupname{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.qcr-groupcount{font-weight:400;opacity:.7;flex:none}' +
      '.qcr-row-grouped{padding-left:14px}' +
      '.qcr-tools{display:none;gap:2px;flex:none}' +
      '.qcr-row:hover .qcr-tools{display:flex}' +
      // 组头不是 .qcr-row，hover 选择器不生效：拆分按钮常显
      '.qcr-grouphead .qcr-tools{display:flex}' +
      '.qcr-row.qcr-drop{outline:2px dashed #4c6ef5;outline-offset:-2px;background:rgba(76,110,245,.14)}' +
      '.qcr-group.qcr-drop{border-style:dashed;background:rgba(76,110,245,.14)}' +
      '.qcr-tool{background:transparent;border:1px solid rgba(127,127,127,.35);border-radius:3px;color:inherit;padding:1px 4px;cursor:pointer;font-size:10px;line-height:1.4}' +
      '.qcr-tool:hover{border-color:#4c6ef5}' +
      '.qcr-empty{padding:18px 10px;text-align:center;opacity:.65}' +
      '.qcr-status{margin:0 10px 6px;padding:4px 8px;border-radius:4px;font-size:11px}' +
      '.qcr-status-ok{background:rgba(60,160,90,.18)}' +
      '.qcr-status-error{background:rgba(200,60,60,.18)}' +
      '.qcr-status-warn{background:rgba(200,150,50,.22)}' +
      '.qcr-bootstrap{margin:6px 10px 0;padding:5px 8px;border-radius:4px;font-size:11px;background:rgba(200,150,50,.22)}' +
      '.qcr-spin{display:inline-block;width:10px;height:10px;border:2px solid rgba(127,127,127,.4);border-top-color:transparent;border-radius:50%;animation:qcr-rotate .8s linear infinite;vertical-align:middle}' +
      '@keyframes qcr-rotate{to{transform:rotate(360deg)}}' +
      '.qcr-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999}' +
      '.qcr-modal{width:420px;max-width:92vw;max-height:86vh;overflow:auto;background:#1f1f24;color:#e6e6e6;border:1px solid rgba(127,127,127,.4);border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:10px}' +
      '.qcr-modal h3{margin:0;font-size:13px}' +
      '.qcr-field{display:flex;flex-direction:column;gap:4px}' +
      '.qcr-field label{font-size:11px;opacity:.8}' +
      '.qcr-field textarea,.qcr-field input,.qcr-field select{background:#2a2a30;color:inherit;border:1px solid rgba(127,127,127,.4);border-radius:4px;padding:5px 7px;font:inherit;width:100%;box-sizing:border-box}' +
      '.qcr-field textarea{font-family:Consolas,monospace;min-height:64px;resize:vertical}' +
      '.qcr-hint{font-size:11px;opacity:.75}' +
      '.qcr-hint-warn{color:#f59f00;opacity:.95}' +
      '.qcr-actions{display:flex;justify-content:flex-end;gap:8px}' +
      '.qcr-btn{border:1px solid rgba(127,127,127,.4);background:transparent;color:inherit;border-radius:4px;padding:4px 12px;cursor:pointer;font:inherit;display:inline-flex;align-items:center;gap:4px}' +
      '.qcr-btn:hover{border-color:#4c6ef5}' +
      '.qcr-btn-primary{background:#4c6ef5;border-color:#4c6ef5;color:#fff}' +
      '.qcr-btn:disabled{opacity:.45;cursor:not-allowed}' +
      '.qcr-headbtns{display:flex;align-items:center;gap:6px}' +
      '.qcr-headbtns .qcr-spin{margin-right:4px}';

    function injectCss() {
      try {
        if (typeof document === 'undefined') return;
        if (document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_KEY) + ']') !== null) return;
        var tag = document.createElement('style');
        tag.dataset.plugin = PACKAGE_ID;
        tag.dataset.pluginCss = CSS_KEY;
        tag.textContent = CSS;
        document.head.appendChild(tag);
      } catch (e) {}
    }

    /* ---------- terminal execution ---------- */

    function loadShellsFor(ctx, sessionId, signal) {
      if (ctx && ctx.webTerminals && typeof ctx.webTerminals.launchShells === 'function') {
        return Promise.resolve(ctx.webTerminals.launchShells(sessionId, signal)).then(function (result) {
          if (result && Array.isArray(result.shells)) return result.shells;
          if (Array.isArray(result)) return result;
          return [];
        }).catch(function () { return []; });
      }
      return Promise.resolve([]);
    }

    function frameStreamOf(handle) {
      if (!handle) return null;
      if (typeof handle[Symbol.asyncIterator] === 'function') return handle;
      if (handle.frames && typeof handle.frames[Symbol.asyncIterator] === 'function') return handle.frames;
      if (typeof handle.next === 'function') {
        var self = handle;
        return { next: function (arg) { return self.next(arg); }, [Symbol.asyncIterator]: function () { return this; } };
      }
      return null;
    }

    async function writeCommand(ctx, sessionId, terminalId, command) {
      var ac = new AbortController();
      var timer = setTimeout(function () { ac.abort(); }, 8000);
      var sent = false;
      try {
        var handle = valueOf(await ctx.remote.terminal.attach(sessionId, terminalId, ac.signal));
        var stream = frameStreamOf(handle);
        if (!stream) throw new Error('终端连接不可用');
        var iter = stream[Symbol.asyncIterator]();
        while (true) {
          var step = await iter.next();
          if (step.done) break;
          var frame = step.value;
          if (!sent && frame && (frame.type === 'snapshot' || frame.type === 'state') && frame.writable !== false) {
            sent = true;
            handle.send({ type: 'write', sequence: 1, data: command + '\r' });
          } else if (sent && frame && frame.type === 'ack' && frame.sequence === 1) {
            if (frame.refusal) throw new Error(String(frame.refusal));
            break;
          }
        }
        if (!sent) throw new Error('终端尚未就绪');
      } finally {
        clearTimeout(timer);
        ac.abort();
      }
    }

    async function openTerminalTab(ctx, sessionId, params) {
      var sidebar = ctx && ctx.sidebarRight;
      if (sidebar && typeof sidebar.openTabIn === 'function') {
        await sidebar.openTabIn(sessionId, 'terminal', { params: params });
        return;
      }
      if (sidebar && typeof sidebar.openTab === 'function') {
        await sidebar.openTab('terminal', { params: params });
        return;
      }
      throw new Error('无法打开终端标签页');
    }

    function listTerminalIds(ctx, sessionId) {
      return Promise.resolve(ctx.remote.terminal.list(sessionId))
        .then(function (result) {
          var items = valueOf(result);
          if (!Array.isArray(items)) return [];
          return items.map(function (info) { return info && info.id; }).filter(Boolean);
        })
        .catch(function () { return []; });
    }

    // openTabs.getSnapshot() 条目形状是 { sessionId, tabId, kind, contentId }（宿主
    // 投影里没有 id 字段）；早先用 tab.id 取到 undefined，view 键错位成孤儿视图，
    // 主路径必然超时落入抢席位的兜底 → 标签页永远"只读+接管输入"。一律用 tabId。
    function tabKeyOf(tab) { return tab && (tab.tabId != null ? tab.tabId : tab.id); }

    function terminalTabIds(ctx) {
      try {
        var tabs = ctx.sidebarRight.openTabs.getSnapshot() || [];
        return tabs.filter(function (tab) { return tab && tab.kind === 'terminal'; }).map(tabKeyOf);
      } catch (e) { return []; }
    }

    function terminalTabKeysOf(ctx, sessionId) {
      var out = [];
      try {
        var tabs = ctx.sidebarRight.openTabs.getSnapshot() || [];
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          if (tab && tab.kind === 'terminal' && tab.sessionId === sessionId) out.push(tabKeyOf(tab));
        }
      } catch (e) {}
      return out;
    }

    function findTerminalTabIn(ctx, sessionId, beforeKeys) {
      try {
        var tabs = ctx.sidebarRight.openTabs.getSnapshot() || [];
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          if (tab && tab.kind === 'terminal' && tab.sessionId === sessionId && beforeKeys.indexOf(tabKeyOf(tab)) < 0) return tab;
        }
      } catch (e) {}
      return null;
    }

    function discoverTabIn(ctx, sessionId, beforeKeys, timeoutMs) {
      var deadline = Date.now() + (timeoutMs || 3000);
      return new Promise(function (resolve) {
        function poll() {
          var tab = findTerminalTabIn(ctx, sessionId, beforeKeys);
          if (tab) { resolve(tab); return; }
          if (Date.now() >= deadline) { resolve(null); return; }
          setTimeout(poll, 150);
        }
        poll();
      });
    }

    function listTerminals(ctx, sessionId) {
      return Promise.resolve(ctx.remote.terminal.list(sessionId))
        .then(function (result) {
          var items = valueOf(result);
          return Array.isArray(items) ? items : [];
        })
        .catch(function () { return []; });
    }

    function findTerminalTab(ctx, beforeTabIds) {
      try {
        var tabs = ctx.sidebarRight.openTabs.getSnapshot() || [];
        for (var i = 0; i < tabs.length; i++) {
          var tab = tabs[i];
          if (tab && tab.kind === 'terminal' && beforeTabIds.indexOf(tabKeyOf(tab)) < 0) return tab;
        }
      } catch (e) {}
      return null;
    }

    function discoverTab(ctx, beforeTabIds, timeoutMs) {
      var deadline = Date.now() + (timeoutMs || 8000);
      return new Promise(function (resolve) {
        function poll() {
          var tab = findTerminalTab(ctx, beforeTabIds);
          if (tab) { resolve(tab); return; }
          if (Date.now() >= deadline) { resolve(null); return; }
          setTimeout(poll, 200);
        }
        poll();
      });
    }

    function waitForWritable(view, timeoutMs) {
      var deadline = Date.now() + (timeoutMs || 12000);
      return new Promise(function (resolve, reject) {
        function poll() {
          var st = null;
          try { st = view.state.getSnapshot(); } catch (e) { reject(new Error('终端状态不可读')); return; }
          if (st && st.phase === 'failed') { reject(new Error('终端创建失败')); return; }
          if (st && st.writable === true && st.info) { resolve(st); return; }
          if (Date.now() >= deadline) { reject(new Error('终端等待超时')); return; }
          setTimeout(poll, 200);
        }
        poll();
      });
    }

    function discoverTerminal(ctx, sessionId, beforeIds, timeoutMs) {
      var deadline = Date.now() + (timeoutMs || 12000);
      return new Promise(function (resolve, reject) {
        function poll() {
          listTerminalIds(ctx, sessionId).then(function (ids) {
            for (var i = 0; i < ids.length; i++) {
              if (beforeIds.indexOf(ids[i]) < 0) { resolve(ids[i]); return; }
            }
            if (Date.now() >= deadline) { reject(new Error('终端未能自动创建，请重试')); return; }
            setTimeout(poll, 300);
          });
        }
        setTimeout(poll, 250);
      });
    }

    function writeWithRetry(ctx, sessionId, terminalId, command, attempts) {
      return writeCommand(ctx, sessionId, terminalId, command).catch(function (err) {
        if (attempts <= 1) throw err;
        return new Promise(function (resolve) { setTimeout(resolve, 600); })
          .then(function () { return writeWithRetry(ctx, sessionId, terminalId, command, attempts - 1); });
      });
    }

    /* The tab view allocates the terminal itself (external create + explicit
       terminalId lands on the "restore" path, which reads a session-cached
       inventory that never contains plugin-created terminals -> "此终端已不
       存在"). And an external attach STEALS the single input seat (last
       attach wins; on detach the seat goes to nobody -> tab shows 只读 +
       接管输入). So: open a fresh tab, grab its TerminalView via the shared
       webTerminals service and type through the tab's own attachment. */
    function attachFallback(ctx, sessionId, beforeTerms, command, entry, view) {
      return discoverTerminal(ctx, sessionId, beforeTerms, 12000)
        .then(function (terminalId) {
          return Promise.resolve(ctx.remote.terminal.rename(sessionId, terminalId, String(entry.comment || entry.command).slice(0, 60)))
            .catch(function () { return null; })
            .then(function () { return writeWithRetry(ctx, sessionId, terminalId, command, 3); })
            .then(function () {
              // 兜底 attach 抢走了输入席位, 写完让标签页自己重连抢回 (等价于用户点"接管输入")
              if (view && typeof view.connect === 'function') { try { view.connect(); } catch (e) {} }
            });
        });
    }

    var runningIds = new Set();
    var execChain = Promise.resolve();

    // 旧行为回退：命令在当前聊天会话里新开终端 tab（无 cwd 补偿、无完成跟踪）
    function runLegacy(ctx, sessionId, entry, command) {
      var pinned = entry.shell && entry.shell !== 'auto' ? entry.shell : null;
      var detected = detectShellKind(command);
      var kind = pinned || detected || null;
      var params = {};
      var beforeTabs = [];
      var beforeTerms = [];
      var step = Promise.resolve();
      if (kind) {
        step = loadShellsFor(ctx, sessionId, signalAfter(5000)).then(function (shells) {
          var shellPath = pickShellPath(kind, shells);
          if (shellPath) params.shellPath = shellPath;
        });
      }
      return step
        .then(function () {
          return Promise.all([
            Promise.resolve(terminalTabIds(ctx)),
            listTerminalIds(ctx, sessionId)
          ]);
        })
        .then(function (r) {
          beforeTabs = r[0];
          beforeTerms = r[1];
          return openTerminalTab(ctx, sessionId, params);
        })
        .then(function () { return discoverTab(ctx, beforeTabs, 8000); })
        .then(function (tab) {
          if (!tab) throw new Error('终端标签未能打开，请重试');
          var view = null;
          try { view = ctx.webTerminals.view(sessionId, tabKeyOf(tab), tab.contentId, void 0, params.shellPath); } catch (e) { view = null; }
          if (!(view && typeof view.write === 'function' && view.state && typeof view.state.getSnapshot === 'function')) {
            return attachFallback(ctx, sessionId, beforeTerms, command, entry);
          }
          try {
            if (typeof view.refresh === 'function' && view.state.getSnapshot().phase === 'idle') view.refresh();
          } catch (e) {}
          return waitForWritable(view, 12000)
            .then(function (st) {
              var title = String(entry.comment || entry.command).slice(0, 60);
              var rename = st.info && st.info.id
                ? Promise.resolve(ctx.remote.terminal.rename(sessionId, st.info.id, title)).catch(function () { return null; })
                : Promise.resolve();
              return rename.then(function () { view.write(command + '\r'); });
            })
            .catch(function () { return attachFallback(ctx, sessionId, beforeTerms, command, entry, view); });
        })
        .then(function () { bumpCommand(entry.id); });
    }

    /* ---------- v1.3.0：集中式执行 ----------
       优先把命令发进专用「QCR 终端」会话；该会话的侧栏 store 没被宿主 adopt
       （每次应用启动后从未点开过）时 openTabIn 静默无效 → 校验轮询发现新 tab
       没出现就抛 not-adopted，退回旧行为并在面板提示用户打开一次。 */

    function notAdoptedError() {
      var err = new Error('「QCR 终端」会话尚未被打开（未 adopt）');
      err.reason = 'not-adopted';
      return err;
    }

    async function runCentralized(ctx, sessionId, entry, command) {
      var termId = await getTermSession(ctx, false);
      if (!termId) { var ne = new Error('宿主不支持 remote.session.create'); ne.reason = 'no-central'; throw ne; }
      if (!termValidated) {
        // 缓存的集中会话可能已被删除（adoption 残留会是黑洞）：启动后首条命令
        // 先用 environment 探活，拒绝则强制重建；新会话本轮必然未 adopt，自然
        // 走 not-adopted 回退并提示。
        try {
          valueOf(await ctx.remote.terminal.environment(termId, signalAfter(4000)));
        } catch (e) {
          termId = await getTermSession(ctx, true);
          if (!termId) throw new Error('重建「QCR 终端」会话失败');
        }
        termValidated = true;
      }
      var pinned = entry.shell && entry.shell !== 'auto' ? entry.shell : null;
      var kind = pinned || detectShellKind(command) || null;
      var shells = null;
      if (!kind) {
        // 认不出的命令（python 等）改用宿主声明的默认 shell 补判 kind，
        // 让它们也能带完成标记入池复用；推导失败才退回旧行为（无标记新 tab）。
        try {
          shells = await loadShellsFor(ctx, termId, signalAfter(5000));
          if (shells && shells.length && shells[0] && shells[0].path) {
            kind = kindOfShellPath(shells[0].path) || null;
          }
        } catch (e) { shells = null; }
      }
      var cwd = null;
      try {
        var env = valueOf(await ctx.remote.terminal.environment(sessionId, signalAfter(4000)));
        cwd = (env && env.cwd) || null;
      } catch (e) { cwd = null; }
      var marker = kind ? nextMarker() : null;
      reconcileRecords(ctx, termId);
      await sweepTermRecords(ctx, termId);
      var rec = pickReusable(loadTermRecords(termId), kind);
      if (rec && await tryReuse(ctx, termId, rec, entry, command, cwd, marker)) {
        return { centralized: true };
      }
      var params = {};
      if (kind) {
        if (!shells) shells = await loadShellsFor(ctx, termId, signalAfter(5000));
        var shellPath = pickShellPath(kind, shells);
        if (shellPath) params.shellPath = shellPath;
      }
      return await openCentralizedTab(ctx, termId, entry, params, command, cwd, marker, kind);
    }

    async function tryReuse(ctx, termId, rec, entry, command, cwd, marker) {
      var infos = await listTerminals(ctx, termId);
      var alive = false;
      for (var i = 0; i < infos.length; i++) {
        if (infos[i] && infos[i].id === rec.terminalId && infos[i].state === 'running') { alive = true; break; }
      }
      if (!alive) { setRecordState(termId, rec.tabKey, 'dead'); return false; }
      var view = null;
      try { view = ctx.webTerminals.view(termId, rec.tabKey, rec.contentId, void 0, void 0); } catch (e) { view = null; }
      var st = null;
      try { st = view && view.state ? view.state.getSnapshot() : null; } catch (e) { st = null; }
      // 复用要求连接已就绪（writable 同步可读）；未连接不等待，直接开新 tab
      if (!st || st.writable !== true || !view || typeof view.write !== 'function') return false;
      var title = String(entry.comment || entry.command).slice(0, 60);
      if (st.info && st.info.id) {
        try { await ctx.remote.terminal.rename(termId, st.info.id, title); } catch (e) {}
      }
      // 目标 tab 的 shell kind 可能与命令推导 kind 不同（kind 未知的兜底复用）：
      // cd/包装一律按目标 tab 的 kind 来，避免把命令写坏。
      var tabKind = rec.kind || 'powershell';
      view.write(composeCommand(command, cwd, tabKind, marker) + '\r');
      upsertRecord(termId, {
        tabKey: rec.tabKey, contentId: rec.contentId, terminalId: rec.terminalId,
        command: String(entry.command || ''), comment: String(entry.comment || ''),
        marker: marker, kind: rec.kind || null,
        state: marker ? 'running' : 'untracked',
        startedAt: Date.now()
      });
      if (marker) armWatcher(ctx, termId, rec.tabKey, view, marker, rec.kind);
      return true;
    }

    async function openCentralizedTab(ctx, termId, entry, params, command, cwd, marker, kind) {
      var fullCommand = composeCommand(command, cwd, kind, marker);
      var beforeKeys = terminalTabKeysOf(ctx, termId);
      var beforeTerms = (await listTerminals(ctx, termId))
        .map(function (info) { return info && info.id; })
        .filter(Boolean);
      await openTerminalTab(ctx, termId, params);
      var tab = await discoverTabIn(ctx, termId, beforeKeys, 2500);
      if (!tab) throw notAdoptedError();
      var view = null;
      try { view = ctx.webTerminals.view(termId, tabKeyOf(tab), tab.contentId, void 0, params.shellPath); } catch (e) { view = null; }
      if (!(view && typeof view.write === 'function' && view.state && typeof view.state.getSnapshot === 'function')) {
        return attachFallback(ctx, termId, beforeTerms, fullCommand, entry, null)
          .then(function () { return { centralized: true }; });
      }
      try {
        if (typeof view.refresh === 'function' && view.state.getSnapshot().phase === 'idle') view.refresh();
      } catch (e) {}
      var st;
      try {
        st = await waitForWritable(view, 12000);
      } catch (e) {
        // 集中会话里也得跑起来：兜底 attach 写入，不记台账（不可跟踪）
        return attachFallback(ctx, termId, beforeTerms, fullCommand, entry, view)
          .then(function () { return { centralized: true }; });
      }
      var title = String(entry.comment || entry.command).slice(0, 60);
      var terminalId = st.info && st.info.id;
      if (terminalId) {
        try { await ctx.remote.terminal.rename(termId, terminalId, title); } catch (e) {}
      }
      view.write(fullCommand + '\r');
      var tabKey = tabKeyOf(tab);
      upsertRecord(termId, {
        tabKey: tabKey, contentId: tab.contentId, terminalId: terminalId || null,
        command: String(entry.command || ''), comment: String(entry.comment || ''),
        marker: marker, kind: kind,
        state: marker ? 'running' : 'untracked',
        startedAt: Date.now()
      });
      if (marker) armWatcher(ctx, termId, tabKey, view, marker, kind);
      return { centralized: true };
    }

    function executeCommand(ctx, sessionId, entry) {
      var run = function () {
        var command = String(entry.command || '').trim();
        if (!command) return Promise.reject(new Error('命令不能为空'));
        if (!sessionId) return Promise.reject(new Error('无法获得当前会话'));
        return runCentralized(ctx, sessionId, entry, command)
          .then(function (r) { bootstrapHint = false; bumpCommand(entry.id); return r; })
          .catch(function (err) {
            if (err && err.reason === 'not-adopted') {
              bootstrapHint = true;
              return runLegacy(ctx, sessionId, entry, command).then(function () { return { fallback: true }; });
            }
            if (err && err.reason !== 'no-central') {
              console.warn('[QCR] centralized run failed, falling back to current session:', err);
            }
            return runLegacy(ctx, sessionId, entry, command).then(function () { return {}; });
          });
      };
      var result = execChain.then(run, run);
      execChain = result.catch(function () { return null; });
      return result;
    }

    /* ---------- host file sync (live store: ~/.dsh/quick-cmd-runner/commands.json) ----------
       All /qcr-* commands run in a dedicated hidden sync session (created once via
       remote.session.create, id cached in localStorage), so the user's current task
       view never shows sync cards. Falls back to the visible session if the harness
       exposes no session.create. */

    var syncCtx = null;
    var syncSessionId = null;
    var chatSessionId = null;
    var syncPromise = null;
    var pushTimer = null;

    function cachedSyncId() { try { return localStorage.getItem(SYNC_SESSION_KEY); } catch (e) { return null; } }
    function setCachedSyncId(id) { try { if (id) localStorage.setItem(SYNC_SESSION_KEY, id); else localStorage.removeItem(SYNC_SESSION_KEY); } catch (e) {} }

    function canCreateSession(ctx) {
      return !!(ctx.remote && ctx.remote.session && typeof ctx.remote.session.create === 'function');
    }

    async function createSyncSession(ctx) {
      var created = valueOf(await withTimeout(ctx.remote.session.create({}), 15000));
      var id = created && (created.sessionId || created.id);
      if (!id) throw new Error('session.create returned no sessionId');
      try { valueOf(await withTimeout(ctx.remote.session.rename({ sessionId: id, title: 'QCR Sync' }), 5000)); } catch (e) {}
      setCachedSyncId(id);
      return id;
    }

    function getSyncSession(ctx, forceNew) {
      if (forceNew) { setCachedSyncId(null); syncSessionId = null; syncPromise = null; }
      if (syncSessionId) return Promise.resolve(syncSessionId);
      if (!syncPromise) {
        syncPromise = (async function () {
          if (!canCreateSession(ctx)) return null;
          var id = cachedSyncId();
          if (id) return id;
          return await createSyncSession(ctx);
        })();
        syncPromise.catch(function () { syncPromise = null; });
      }
      return syncPromise.then(function (id) { if (id) syncSessionId = id; return id; });
    }

    async function execSyncCommand(ctx, line, timeoutMs) {
      if (!ctx.remote || !ctx.remote.commands || typeof ctx.remote.commands.execute !== 'function') {
        throw new Error('commands 服务不可用');
      }
      var hidden = canCreateSession(ctx);
      var id = hidden ? await getSyncSession(ctx, false) : chatSessionId;
      if (!id) throw new Error('无法获得同步会话');
      var exec;
      try {
        exec = valueOf(await ctx.remote.commands.execute(id, line, [], signalAfter(timeoutMs || 15000)));
      } catch (e) {
        if (!hidden) throw e;
        // 缓存的同步会话可能已被删除: 重建一次并重试
        id = await getSyncSession(ctx, true);
        exec = valueOf(await ctx.remote.commands.execute(id, line, [], signalAfter(timeoutMs || 15000)));
      }
      if (!exec) throw new Error('commands 服务未返回结果');
      var result = exec.result || exec;
      if (result && result.kind === 'error') throw new Error(result.text || 'command failed');
      return result;
    }

    var pushChain = Promise.resolve();

    function pushStore() {
      if (!syncCtx || !storeState) return Promise.resolve(false);
      var payload = JSON.stringify(storeState.commands); // 紧凑传输：host 落盘时自行 pretty
      var ctxRef = syncCtx;
      var next = pushChain
        .then(function () { return execSyncCommand(ctxRef, '/qcr-save ' + payload, 15000); })
        .then(function () { return true; });
      pushChain = next.catch(function () { return false; });
      return next;
    }

    function schedulePush() {
      if (!syncCtx) return;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(function () {
        pushTimer = null;
        pushStore().catch(function (e) { console.warn('[QCR] sync to store file failed:', e); });
      }, 800);
    }

    /* ---------- v1.3.0：集中终端会话（「QCR 终端」）----------
       所有命令终端集中开在一个专用会话里（多 tab），从任何聊天都能在会话列表
       找到它。会话的侧栏 store 只有被打开过一次才会被宿主 adopt（openTabIn
       才生效），因此每次应用启动后首条命令先验证 tab 真出现，没出现就回退到
       当前会话执行并提示用户打开一次。 */

    var termSessionId = null;
    var termPromise = null;
    var termValidated = false;
    var bootstrapHint = false;

    function cachedTermId() { try { return localStorage.getItem(TERM_SESSION_KEY); } catch (e) { return null; } }
    function setCachedTermId(id) { try { if (id) localStorage.setItem(TERM_SESSION_KEY, id); else localStorage.removeItem(TERM_SESSION_KEY); } catch (e) {} }

    async function createTermSession(ctx) {
      var created = valueOf(await withTimeout(ctx.remote.session.create({}), 15000));
      var id = created && (created.sessionId || created.id);
      if (!id) throw new Error('session.create returned no sessionId');
      try { valueOf(await withTimeout(ctx.remote.session.rename({ sessionId: id, title: TERM_SESSION_TITLE }), 5000)); } catch (e) {}
      setCachedTermId(id);
      return id;
    }

    function getTermSession(ctx, forceNew) {
      if (forceNew) { setCachedTermId(null); termSessionId = null; termPromise = null; }
      if (termSessionId) return Promise.resolve(termSessionId);
      if (!termPromise) {
        termPromise = (async function () {
          if (!canCreateSession(ctx)) return null;
          var id = cachedTermId();
          if (id) return id;
          return await createTermSession(ctx);
        })();
        termPromise.catch(function () { termPromise = null; });
      }
      return termPromise.then(function (id) { if (id) termSessionId = id; return id; });
    }

    /* ---------- v1.3.0：终端 tab 台账（复用依据）---------- */

    var termRecordsCache = null;
    var termWatchers = new Map();

    function normalizeRecord(r) {
      if (!r || !r.tabKey || !r.state) return null;
      return {
        tabKey: String(r.tabKey),
        contentId: r.contentId != null ? r.contentId : null,
        terminalId: r.terminalId != null ? r.terminalId : null,
        command: String(r.command || ''),
        comment: String(r.comment || ''),
        marker: r.marker != null ? String(r.marker) : null,
        kind: r.kind || null,
        state: String(r.state),
        startedAt: Number.isFinite(r.startedAt) ? r.startedAt : 0
      };
    }

    function loadTermRecords(sessionId) {
      if (termRecordsCache && termRecordsCache.session === sessionId) return termRecordsCache.records;
      var parsed = null;
      try { parsed = JSON.parse(localStorage.getItem(TERM_RECORDS_KEY) || 'null'); } catch (e) { parsed = null; }
      var records = [];
      if (parsed && parsed.version === 1 && parsed.session === sessionId && Array.isArray(parsed.records)) {
        for (var i = 0; i < parsed.records.length; i++) {
          var norm = normalizeRecord(parsed.records[i]);
          if (norm) records.push(norm);
        }
      }
      termRecordsCache = { version: 1, session: sessionId, records: records };
      return records;
    }

    function saveTermRecords() {
      if (!termRecordsCache) return;
      try { localStorage.setItem(TERM_RECORDS_KEY, JSON.stringify(termRecordsCache)); } catch (e) {}
    }

    function upsertRecord(sessionId, rec) {
      var records = loadTermRecords(sessionId);
      var norm = normalizeRecord(rec);
      if (!norm) return null;
      var at = -1;
      for (var i = 0; i < records.length; i++) if (records[i].tabKey === norm.tabKey) { at = i; break; }
      if (at >= 0) records[at] = norm;
      else records.unshift(norm);
      if (records.length > TERM_RECORDS_MAX) {
        records.sort(function (a, b) { return (b.startedAt || 0) - (a.startedAt || 0); });
        records.length = TERM_RECORDS_MAX;
      }
      saveTermRecords();
      return norm;
    }

    function setRecordState(sessionId, tabKey, state) {
      var records = loadTermRecords(sessionId);
      for (var i = 0; i < records.length; i++) {
        if (records[i].tabKey === tabKey) {
          records[i].state = String(state);
          saveTermRecords();
          return;
        }
      }
    }

    function removeRecord(sessionId, tabKey) {
      var records = loadTermRecords(sessionId);
      var next = records.filter(function (r) { return r.tabKey !== tabKey; });
      if (next.length !== records.length) {
      termRecordsCache.records = next;
      saveTermRecords();
      }
    }

    // 台账对账：用户已关闭的 tab（openTabs 里没了）记录作废
    function reconcileRecords(ctx, sessionId) {
      var open = terminalTabKeysOf(ctx, sessionId);
      var records = loadTermRecords(sessionId);
      var next = records.filter(function (r) { return open.indexOf(r.tabKey) >= 0; });
      var changed = next.length !== records.length;
      if (changed) {
        termRecordsCache.records = next;
        saveTermRecords();
      }
      return changed;
    }

    // 台账自愈（v1.4.3）：①running 超 24h 判死；②页面刷新后观察器丢失、但 tab
    // 还开着的 running 记录按终端实况判死或重新挂观察器，避免复用池只减不增。
    async function sweepTermRecords(ctx, sessionId) {
      var records = loadTermRecords(sessionId);
      if (sweepStaleRecords(records, Date.now())) saveTermRecords();
      var states = null;
      try {
        var infos = await listTerminals(ctx, sessionId);
        states = {};
        for (var k = 0; k < infos.length; k++) {
          if (infos[k] && infos[k].id) states[infos[k].id] = infos[k].state;
        }
      } catch (e) { states = null; }
      var open = terminalTabKeysOf(ctx, sessionId);
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (!r || r.state !== 'running' || !r.marker) continue;
        var tstate = r.terminalId && states ? states[r.terminalId] : undefined;
        if ((tstate && tstate !== 'running') || open.indexOf(r.tabKey) < 0) {
          setRecordState(sessionId, r.tabKey, 'dead');
          continue;
        }
        if (!tstate || termWatchers.has(r.tabKey)) continue;
        var view = null;
        try { view = ctx.webTerminals.view(sessionId, r.tabKey, r.contentId, void 0, void 0); } catch (e) { view = null; }
        if (!view || !view.state) continue;
        armWatcher(ctx, sessionId, r.tabKey, view, r.marker, r.kind);
      }
    }

    function disarmWatcher(tabKey) {
      var off = termWatchers.get(tabKey);
      if (off) { try { off(); } catch (e) {} termWatchers.delete(tabKey); }
    }

    // 被动观察：只订阅 TerminalView.state，绝不调 consume/acknowledge/mount，
    // 帧的推进与确认全由挂载中的终端 UI 负责（隐藏 xterm 也在持续消费），无抢帧风险。
    function armWatcher(ctx, sessionId, tabKey, view, marker, kind) {
      disarmWatcher(tabKey);
      if (!marker || !view || !view.state || typeof view.state.subscribe !== 'function') return;
      var scanner = makeMarkerScanner(marker, kind === 'cmd' ? 2 : 1);
      var lastRevision = -1;
      var done = false;
      function onStore() {
        if (done) return;
        var st = null;
        try { st = view.state.getSnapshot(); } catch (e) { return; }
        if (st && st.info && st.info.state === 'exited') return finish('dead');
        if (st && (st.phase === 'failed' || st.phase === 'closed')) return finish('dead');
        var r = st && st.render;
        if (!r || r.revision === lastRevision) return;
        lastRevision = r.revision;
        var frame = r.frame || {};
        var isSnapshot = frame.type === 'snapshot';
        var chunk = isSnapshot ? frame.screen : frame.data;
        if (typeof chunk !== 'string') return;
        if (scanner.push(chunk, isSnapshot)) return finish('idle');
      }
      var off = view.state.subscribe(onStore);
      function finish(state) {
        if (done) return;
        done = true;
        try { off(); } catch (e) {}
        if (termWatchers.get(tabKey) === off) termWatchers.delete(tabKey);
        setRecordState(sessionId, tabKey, state);
      }
      termWatchers.set(tabKey, off);
      onStore(); // 补挂时立即查一次当前快照：命令可能已在观察器空窗期完成
    }


    // reload 的镜像语义：以文件为准（手改的增/删/改都生效，本地独有条目不保留），
    // 仅对双方都存在的同 id 条目沿用本地的运行统计（runs/lastRun/created）。
    function mirrorReload(current, fileEntries) {
      var curById = new Map();
      var cur = Array.isArray(current) ? current : [];
      for (var j = 0; j < cur.length; j++) curById.set(cur[j].id, cur[j]);
      var out = [];
      for (var k = 0; k < fileEntries.length; k++) {
        var existing = curById.get(fileEntries[k].id);
        out.push(existing
          ? Object.assign({}, fileEntries[k], { runs: existing.runs, lastRun: existing.lastRun, created: existing.created })
          : fileEntries[k]);
      }
      return normalizeGroups(sortCommands(rankByUsage(out).slice(0, MAX_ENTRIES)));
    }

    async function reloadCommands(ctx) {
      var result = await execSyncCommand(ctx, '/qcr-reload', 10000);
      var text = result && typeof result.text === 'string' ? result.text : '';
      var parsed = text.trim() ? JSON.parse(text) : []; // 手动清空文件视为空列表, 不报 JSON 错
      if (!Array.isArray(parsed)) throw new Error('commands.json 不是数组');
      var valid = [];
      for (var i = 0; i < parsed.length; i++) {
        var norm = normalizeEntry(parsed[i]);
        if (norm) valid.push(norm);
      }
      var mirrored = mirrorReload(storeState ? storeState.commands : [], valid);
      try { localStorage.setItem(SEED_FLAG_KEY, '1'); } catch (e) {}
      var mirroredJson = JSON.stringify(mirrored);
      if (mirroredJson !== JSON.stringify(storeState ? storeState.commands : [])) {
        mutate(function () { return { version: 1, commands: mirrored }; }, true); // silent: 以文件为准, 不回写文件
      }
      if (mirroredJson !== JSON.stringify(valid)) {
        pushStore().catch(function (e) { console.warn('[QCR] store file update failed:', e); });
      }
      return valid.length;
    }

    /* ---------- session helpers ---------- */

    function currentSessionId(ctx) {
      var sessions = ctx && ctx.sessions;
      if (!sessions) return null;
      try {
        if (typeof sessions.current === 'function') {
          var c = sessions.current();
          if (typeof c === 'string' && c) return c;
          if (c && c.id) return c.id;
        }
      } catch (e) {}
      try {
        if (typeof sessions.list === 'function') {
          var l = sessions.list();
          var arr = Array.isArray(l) ? l : (l && Array.isArray(l.items) ? l.items : []);
          var first = arr[0];
          if (typeof first === 'string' && first) return first;
          if (first && first.id) return first.id;
        }
      } catch (e) {}
      return null;
    }

    /* ---------- components ---------- */

    function CommandRow(props) {
      var entry = props.entry;
      var t = props.t;
      var busy = props.busy;
      var grouped = !!groupOf(entry);
      return h('div', {
        className: 'qcr-row' + (busy ? ' qcr-row-busy' : '') + (grouped ? ' qcr-row-grouped' : '') +
          (props.dropOn ? ' qcr-drop' : ''),
        role: 'button', tabIndex: 0,
        draggable: !busy,
        onClick: function (ev) {
          // 拖拽松手后浏览器会补一个 click：别让"拖一下"变成"执行一次"
          if (props.suppressClick && props.suppressClick()) { ev.preventDefault(); return; }
          props.onRun();
        },
        onDragStart: function (ev) { props.onDragStart(ev, entry); },
        onDragEnd: props.onDragEnd,
        onDragOver: function (ev) { props.onDragOver(ev, 'row:' + entry.id); },
        onDragLeave: props.onDragLeave,
        onDrop: function (ev) { props.onDrop(ev, entry); },
        onKeyDown: function (ev) {
          if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); props.onRun(); }
        }
      },
        h('span', { className: 'qcr-play' }, busy ? h('span', { className: 'qcr-spin' }) : h(PlayIcon, { size: 11 })),
        h('span', { className: 'qcr-main' },
          h('span', { className: 'qcr-rowtitle' }, entry.comment || entry.command),
          entry.comment ? h('span', { className: 'qcr-cmd' }, entry.command) : null
        ),
        h('span', { className: 'qcr-badge' }, String(entry.runs || 0)),
        entry.lastRun > 0 ? h('span', { className: 'qcr-time', title: t('row.lastRun') + ': ' + formatLastRun(entry.lastRun, true) }, formatLastRun(entry.lastRun)) : null,
        h('span', { className: 'qcr-tools' },
          grouped ? h('button', { className: 'qcr-tool', title: t('row.leaveGroup'), onClick: function (ev) { ev.stopPropagation(); props.onLeaveGroup(); } }, t('row.leaveGroup')) : null,
          h('button', { className: 'qcr-tool', title: t('row.edit'), onClick: function (ev) { ev.stopPropagation(); props.onEdit(); } }, t('row.edit')),
          h('button', { className: 'qcr-tool', title: t('row.clone'), onClick: function (ev) { ev.stopPropagation(); props.onClone(); } }, t('row.clone')),
          h('button', { className: 'qcr-tool', title: t('row.delete'), onClick: function (ev) { ev.stopPropagation(); props.onDelete(); } }, t('row.delete'))
        )
      );
    }

    function Portal(props) {
      var nodeState = React.useState(function () {
        try { return document.createElement('div'); } catch (e) { return null; }
      });
      var node = nodeState[0];
      React.useEffect(function () {
        if (!node) return undefined;
        document.body.appendChild(node);
        return function () { if (node.parentNode) node.parentNode.removeChild(node); };
      }, [node]);
      if (!node) return h('div', null, props.children);
      return ReactDOM.createPortal(props.children, node);
    }

    function CommandModal(props) {
      var t = props.t;
      var draft = props.draft;
      var shells = props.shells || [];
      var commandState = React.useState(draft.command || '');
      var command = commandState[0];
      var setCommand = commandState[1];
      var commentState = React.useState(draft.comment || '');
      var comment = commentState[0];
      var setComment = commentState[1];
      var shellState = React.useState(draft.shell || 'auto');
      var shell = shellState[0];
      var setShell = shellState[1];
      var taRef = React.useRef(null);
      React.useEffect(function () {
        var el = taRef.current;
        if (!el) return;
        el.style.height = 'auto';
        var max = Math.floor(window.innerHeight * 0.4);
        el.style.height = Math.max(64, Math.min(el.scrollHeight + 2, max)) + 'px';
      }, [command]);
      var valid = command.trim() !== '';
      var detected = detectShellKind(command);
      var kinds = ['auto'];
      shells.forEach(function (s) {
        var k = kindOfShellPath(s);
        if (k && kinds.indexOf(k) < 0) kinds.push(k);
      });
      if (kinds.indexOf(shell) < 0) kinds.push(shell);
      if (kinds.indexOf(draft.shell) < 0) kinds.push(draft.shell);

      function save() {
        if (!valid) return;
        props.onSave({ id: draft.id, command: command.trim(), comment: comment.trim(), shell: shell });
      }

      var body = h('div', {
        className: 'qcr-modal', role: 'dialog', onKeyDown: function (ev) {
          if (ev.key === 'Escape') { ev.stopPropagation(); props.onCancel(); }
        }
      },
        h('h3', null, draft.id ? t('modal.edit') : t('modal.add')),
        h('div', { className: 'qcr-field' },
          h('label', null, t('modal.command')),
          h('textarea', {
            ref: taRef,
            autoFocus: true, spellCheck: false, value: command,
            placeholder: t('modal.commandPlaceholder'),
            onChange: function (ev) { setCommand(ev.target.value); }
          })
        ),
        h('div', { className: 'qcr-field' },
          h('label', null, t('modal.comment')),
          h('input', {
            type: 'text', value: comment,
            placeholder: t('modal.commentPlaceholder'),
            onChange: function (ev) { setComment(ev.target.value); }
          })
        ),
        h('div', { className: 'qcr-field' },
          h('label', null, t('modal.shell')),
          h('select', { value: shell, onChange: function (ev) { setShell(ev.target.value); } },
            kinds.map(function (k) {
              return h('option', { key: k, value: k }, k === 'auto' ? t('modal.shellAuto') : (SHELL_LABELS[k] || k));
            })
          )
        ),
        shell === 'auto' && command.trim()
          ? h('div', { className: 'qcr-hint' }, t('modal.detected') + ': ' + (SHELL_LABELS[detected] || t('modal.shellAuto')))
          : null,
        h('div', { className: 'qcr-actions' },
          h('button', { className: 'qcr-btn', onClick: props.onCancel }, t('modal.cancel')),
          h('button', { className: 'qcr-btn qcr-btn-primary', disabled: !valid, onClick: save }, t('modal.save'))
        )
      );

      var content = h('div', {
        className: 'qcr-mask',
        onClick: function (ev) { if (ev.target === ev.currentTarget) props.onCancel(); }
      }, body);
      if (ReactDOM && ReactDOM.createPortal) return h(Portal, null, content);
      return content;
    }

    // 建组时要一个名字：复用命令弹窗那套遮罩/字段样式，保持观感一致
    function GroupNameModal(props) {
      var t = props.t;
      var nameState = React.useState(props.initial || '');
      var name = nameState[0];
      var setName = nameState[1];
      var ref = React.useRef(null);
      React.useEffect(function () { if (ref.current) ref.current.focus(); }, []);
      var trimmed = normalizeGroupName(name);
      var taken = Array.isArray(props.takenNames) && props.takenNames.indexOf(trimmed) >= 0;
      function save() { if (trimmed) props.onSave(trimmed); }
      var body = h('div', {
        className: 'qcr-modal', role: 'dialog',
        onKeyDown: function (ev) {
          if (ev.key === 'Escape') { ev.stopPropagation(); props.onCancel(); }
          if (ev.key === 'Enter') { ev.preventDefault(); save(); }
        }
      },
        h('h3', null, t('group.new')),
        h('div', { className: 'qcr-field' },
          h('label', null, t('group.new')),
          h('input', {
            ref: ref, type: 'text', value: name, maxLength: GROUP_NAME_MAX,
            placeholder: t('group.namePlaceholder'),
            onChange: function (ev) { setName(ev.target.value); }
          }),
          // 撞名提示：不改名会直接并进已有组，先让用户知道，别静默合并
          taken ? h('div', { className: 'qcr-hint qcr-hint-warn' }, t('group.nameTaken')) : null
        ),
        h('div', { className: 'qcr-actions' },
          h('button', { className: 'qcr-btn', onClick: props.onCancel }, t('modal.cancel')),
          h('button', { className: 'qcr-btn qcr-btn-primary', disabled: !trimmed, onClick: save }, t('modal.save'))
        )
      );
      var content = h('div', {
        className: 'qcr-mask',
        onClick: function (ev) { if (ev.target === ev.currentTarget) props.onCancel(); }
      }, body);
      if (ReactDOM && ReactDOM.createPortal) return h(Portal, null, content);
      return content;
    }

    function QuickCmdPanel(props) {
      var t = props.t;
      var execute = props.execute;
      var loadShells = props.loadShells;
      var needsBootstrap = props.needsBootstrap;
      var snap = useStoreSnapshot();
      var queryState = React.useState('');
      var query = queryState[0];
      var setQuery = queryState[1];
      var busyState = React.useState(function () { return new Set(); });
      var busyIds = busyState[0];
      var setBusyIds = busyState[1];
      var statusState = React.useState(null);
      var status = statusState[0];
      var setStatus = statusState[1];
      var draftState = React.useState(null);
      var draft = draftState[0];
      var setDraft = draftState[1];
      var shellsState = React.useState([]);
      var shells = shellsState[0];
      var setShells = shellsState[1];
      var statusTimer = React.useRef(null);
      React.useEffect(function () {
        return function () { if (statusTimer.current) clearTimeout(statusTimer.current); };
      }, []);
      var reloadState = React.useState(false);
      var reloading = reloadState[0];
      var setReloading = reloadState[1];
      var sessionId = props.sessionId;

      React.useEffect(function () {
        if (typeof loadShells !== 'function') return undefined;
        var cancelled = false;
        Promise.resolve(loadShells(sessionId)).then(function (list) {
          if (!cancelled) setShells(list || []);
        }).catch(function () {});
        return function () { cancelled = true; };
      }, [sessionId]);

      // 启动同步: 面板装载后从 commands.json 合并一次(隐藏同步会话执行, 当前视图无噪音; 每次装载仅一次)
      React.useEffect(function () {
        if (typeof props.reload !== 'function') return undefined;
        var cancelled = false;
        Promise.resolve(props.reload()).then(function (n) {
          if (!cancelled && n) console.info('[QCR] startup sync merged ' + n + ' entry(ies) from store file');
        }).catch(function (e) { console.warn('[QCR] startup sync failed:', e); });
        return function () { cancelled = true; };
      }, []);

      function showStatus(type, text) {
        if (statusTimer.current) clearTimeout(statusTimer.current);
        setStatus({ type: type, text: text });
        statusTimer.current = setTimeout(function () { setStatus(null); }, 4000);
      }

      function run(entry) {
        if (!execute) { showStatus('error', t('status.error')); return; }
        if (runningIds.has(entry.id)) return; // 同步防抖: 同一渲染帧内连点也只跑一次
        runningIds.add(entry.id);
        var next = new Set(busyIds);
        next.add(entry.id);
        setBusyIds(next);
        Promise.resolve(execute(sessionId, entry))
          .then(function (r) {
            if (r && r.fallback) showStatus('warn', t('status.fallback'));
            else if (r && r.centralized) showStatus('ok', t('status.okCentral'));
            else showStatus('ok', t('status.ok'));
          })
          .catch(function (err) { showStatus('error', String((err && err.message) || err)); })
          .then(function () {
            runningIds.delete(entry.id);
            setBusyIds(function (prev) {
              var copy = new Set(prev);
              copy.delete(entry.id);
              return copy;
            });
          });
      }

      function doReload() {
        if (reloading) return;
        if (!props.reload) { showStatus('error', t('status.reloadFailed')); return; }
        setReloading(true);
        Promise.resolve(props.reload())
          .then(function (count) {
            showStatus('ok', count > 0 ? t('status.reloadedOk') + '：' + count + ' 条' : t('status.reloadedNone'));
          })
          .catch(function (err) {
            showStatus('error', t('status.reloadFailed') + '：' + String((err && err.message) || err));
          })
          .then(function () { setReloading(false); });
      }

      function doExport() {
        var cmds = (snap && snap.commands) || [];
        if (!cmds.length) { showStatus('warn', t('status.exportEmpty')); return; }
        try {
          var now = Date.now();
          var payload = exportPayload(cmds, now);
          downloadJsonFile(exportFileName(now), JSON.stringify(payload, null, 2));
          showStatus('ok', t('status.exportedOk') + '：' + cmds.length + ' 条');
        } catch (e) {
          showStatus('error', t('status.exportFailed') + '：' + String((e && e.message) || e));
        }
      }

      var q = query.trim().toLowerCase();
      var rows = snap.commands.filter(function (c) {
        return !q || c.command.toLowerCase().indexOf(q) >= 0 || (c.comment || '').toLowerCase().indexOf(q) >= 0;
      });

      // 拖拽状态放在 ref 里（拖动过程不该触发重渲染），只有落点高亮进 state
      var dragIdRef = React.useRef(null);
      var dragEndedAtRef = React.useRef(0);   // 拖拽刚结束 200ms 内的 click 一律吞掉
      var dropState = React.useState(null);
      var dropKey = dropState[0];
      var setDropKey = dropState[1];
      var pendingState = React.useState(null);
      var pending = pendingState[0];
      var setPending = pendingState[1];

      function entryById(id) {
        for (var i = 0; i < snap.commands.length; i++) if (snap.commands[i].id === id) return snap.commands[i];
        return null;
      }

      // 所有分组变更都走这里：先改成员关系，再收拾只剩一条的孤儿组
      function commitGroups(fn) {
        mutate(function (s) { return { version: 1, commands: normalizeGroups(sortCommands(fn(s.commands))) }; });
      }

      function applyDrop(targetEntry) {
        var id = dragIdRef.current;
        dragIdRef.current = null;
        setDropKey(null);
        if (!id || !targetEntry || id === targetEntry.id) return;
        if (targetEntry.group) { commitGroups(function (l) { return setGroupOn(l, [id], targetEntry.group); }); return; }
        setPending({ ids: [id, targetEntry.id] });
      }

      function dropIntoGroup(name) {
        var id = dragIdRef.current;
        dragIdRef.current = null;
        setDropKey(null);
        var dragged = id ? entryById(id) : null;
        if (!dragged || !name || dragged.group === name) return;
        commitGroups(function (l) { return setGroupOn(l, [id], name); });
      }

      function dragHandlers(key) {
        return {
          onDragStart: function (ev, entry) {
            dragIdRef.current = entry.id;
            try {
              ev.dataTransfer.effectAllowed = 'move';
              ev.dataTransfer.setData('text/plain', entry.id);
            } catch (e) {}
          },
          onDragEnd: function () { dragIdRef.current = null; dragEndedAtRef.current = Date.now(); setDropKey(null); },
          onDragOver: function (ev, k) {
            if (!dragIdRef.current) return;
            ev.preventDefault();
            ev.stopPropagation();
            if (dropKey !== k) setDropKey(k);
          },
          onDragLeave: function () { if (dropKey === key) setDropKey(null); },
          onDrop: function (ev, entry) { ev.preventDefault(); ev.stopPropagation(); applyDrop(entry); }
        };
      }

      function mk(entry, inGroup) {
        var d = dragHandlers('row:' + entry.id);
        return h(CommandRow, {
          key: entry.id, entry: entry, t: t, busy: busyIds.has(entry.id),
          dropOn: dropKey === 'row:' + entry.id,
          suppressClick: function () { return Date.now() - dragEndedAtRef.current < 200; },
          onDragStart: d.onDragStart, onDragEnd: d.onDragEnd,
          onDragOver: d.onDragOver, onDragLeave: d.onDragLeave, onDrop: d.onDrop,
          onRun: function () { run(entry); },
          onEdit: function () { setDraft({ id: entry.id, command: entry.command, comment: entry.comment || '', shell: entry.shell || 'auto' }); },
          onClone: function () { setDraft({ command: entry.command, comment: entry.comment || '', shell: entry.shell || 'auto' }); },
          onDelete: function () {
            if (typeof window !== 'undefined' && window.confirm && window.confirm(t('row.deleteConfirm'))) removeCommand(entry.id);
          },
          onLeaveGroup: inGroup ? function () {
            commitGroups(function (l) { return removeFromGroup(l, [entry.id]); });
          } : null
        });
      }

      function renderSection(sec) {
        var out = [];
        sec.groups.forEach(function (g) {
          var headDrop = dropKey === 'group:' + g.name;
          out.push(h('div', {
            key: 'grp:' + g.name,
            className: 'qcr-group' + (headDrop ? ' qcr-drop' : ''),
            style: { '--qcr-group-color': g.color },
            onDragOver: function (ev) { if (!dragIdRef.current) return; ev.preventDefault(); ev.stopPropagation(); if (dropKey !== 'group:' + g.name) setDropKey('group:' + g.name); },
            onDragLeave: function (ev) { if (ev.currentTarget === ev.target) setDropKey(null); },
            onDrop: function (ev) { ev.preventDefault(); ev.stopPropagation(); dropIntoGroup(g.name); }
          },
            h('div', { className: 'qcr-grouphead' },
              h('span', { className: 'qcr-groupdot' }),
              h('span', { className: 'qcr-groupname', title: g.name }, g.name),
              h('span', { className: 'qcr-groupcount' }, g.entries.length + ' ' + t('group.members')),
              h('span', { className: 'qcr-tools' },
                h('button', {
                  className: 'qcr-tool', title: t('group.split'),
                  onClick: function () {
                    if (typeof window !== 'undefined' && window.confirm && window.confirm(t('group.splitConfirm').replace('{name}', g.name))) {
                      commitGroups(function (l) { return splitGroup(l, g.name); });
                    }
                  }
                }, t('group.split'))
              )
            ),
            g.entries.map(function (e) { return mk(e, true); })
          ));
        });
        var loose = sec.loose;
        var ran = loose.filter(function (e) { return isToday(e.lastRun); });
        var not = loose.filter(function (e) { return !isToday(e.lastRun); });
        var looseNodes = ran.map(function (e) { return mk(e, false); });
        if (ran.length && not.length) looseNodes.push(h('div', { key: 'qcr-divider', className: 'qcr-divider' }));
        return out.concat(looseNodes, not.map(function (e) { return mk(e, false); }));
      }

      // 拖到列表空白处 = 退出分组（也可以点行内「退出分组」按钮）
      function dropOnBlank(ev) {
        var id = dragIdRef.current;
        dragIdRef.current = null;
        setDropKey(null);
        var dragged = id ? entryById(id) : null;
        if (!dragged || !dragged.group) return;
        ev.preventDefault();
        commitGroups(function (l) { return removeFromGroup(l, [id]); });
      }

      return h('div', { className: 'qcr-root' },
        h('div', { className: 'qcr-head' },
          h('span', { className: 'qcr-headtitle' }, t('panel.title')),
          h('span', { className: 'qcr-headbtns' },
            h('button', { className: 'qcr-btn', onClick: doExport, title: t('hint.export') }, t('panel.export')),
            h('button', { className: 'qcr-btn', disabled: reloading, onClick: doReload, title: t('hint.reloadMirror') },
              reloading ? h('span', { className: 'qcr-spin' }) : null, t('panel.reload')),
            h('button', { className: 'qcr-btn', onClick: function () { setDraft({ command: '', comment: '', shell: 'auto' }); } },
              h(PlusIcon, { size: 12 }), t('panel.add'))
          )
        ),
        h('div', { className: 'qcr-search' },
          h('input', {
            type: 'text', value: query, placeholder: t('panel.search'),
            onChange: function (ev) { setQuery(ev.target.value); }
          }),
          query ? h('button', { className: 'qcr-tool', onClick: function () { setQuery(''); } }, t('panel.clear')) : null
        ),
        status ? h('div', { className: 'qcr-status qcr-status-' + status.type }, status.text) : null,
        typeof needsBootstrap === 'function' && needsBootstrap()
          ? h('div', { className: 'qcr-bootstrap' }, t('bootstrap.hint'))
          : null,
        rows.length ? h('div', {
          className: 'qcr-list',
          onDragOver: function (ev) { if (dragIdRef.current) { ev.preventDefault(); if (dropKey) setDropKey(null); } },
          onDrop: dropOnBlank
        }, renderSection(buildSections(rows, snap.commands))) : h('div', { className: 'qcr-empty' }, q ? t('panel.noMatch') : t('panel.empty')),
        pending !== null ? h(GroupNameModal, {
          t: t,
          takenNames: groupNames(snap.commands),
          onSave: function (name) {
            var ids = pending.ids;
            setPending(null);
            commitGroups(function (l) { return setGroupOn(l, ids, name); });
          },
          onCancel: function () { setPending(null); }
        }) : null,
        draft !== null ? h(CommandModal, {
          t: t, draft: draft, shells: shells,
          onSave: function (next) { if (draft.id) updateCommand(next); else addCommand(next); setDraft(null); },
          onCancel: function () { setDraft(null); }
        }) : null
      );
    }

    /* ---------- apply ---------- */

    function apply(ctx) {
      console.info('[QCR] client module loaded (v1.4.3, terminal reuse v2)');
      syncCtx = ctx;
      var t = ctx.locale.bind(NS);
      ctx.effect(function () { return ctx.locale.register(NS, { zh: ZH, en: EN }); }, PACKAGE_ID + ': dictionaries');
      var execute = function (sessionId, entry) { return executeCommand(ctx, sessionId, entry); };
      var loadShells = function (sessionId) { return loadShellsFor(ctx, sessionId); };
      var reload = function () { return reloadCommands(ctx); };
      ctx.effect(function () {
        try {
          return ctx.sidebarRightTabs.register({
            id: PACKAGE_ID,
            kind: TAB_KIND,
            multiple: false,
            keepMounted: true,
            title: function () { return t('tab.title'); },
            guide: [{
              id: 'open', order: 20,
              title: function () { return t('guide.title'); },
              description: function () { return t('guide.description'); },
              icon: TerminalIcon
            }]
          });
        } catch (e) { console.error('[QCR] tab register failed', e); }
      }, PACKAGE_ID + ': tab type');
      // v1.3.2：不再以 extension 接管 terminal 类型。宿主正文席位按「生效定义 id」
      // 分发（sidebar-right 契约：一个 tab 类型 = 共用 id 的定义 + 同 key 正文 slot
      // 两次注册），接管后必须自带正文组件；官方 LazyTerminalBody 不可复用，
      // 缺位则所有终端 tab 渲染「这类内容还没有可用的查看方式」。
      // keepMounted 保活收益随之放弃（宿主无 per-tab keepMounted 入口）。
      ctx.effect(function () {
        try {
          return ctx.slots.inject('sidebar.right.pane.tab', function () {
            return ctx.slots.register({
              name: 'sidebar.right.pane.tab',
              key: PACKAGE_ID,
              locale: NS,
              inject: function (sessionId) {
                if (sessionId) chatSessionId = sessionId;
                return {
                  t: t, execute: execute, loadShells: loadShells, reload: reload,
                  sessionId: sessionId,
                  needsBootstrap: function () { return bootstrapHint; }
                };
              }
            }, QuickCmdPanel);
          });
        } catch (e) { console.error('[QCR] panel slot failed', e); }
      }, PACKAGE_ID + ': panel');
      ctx.effect(function () {
        injectCss();
        return function () {
          try {
            var el = document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_KEY) + ']');
            if (el && el.parentNode) el.parentNode.removeChild(el);
          } catch (e) {}
        };
      }, PACKAGE_ID + ': css');
      ctx.effect(function () {
        return function () { if (pushTimer) { clearTimeout(pushTimer); pushTimer = null; } };
      }, PACKAGE_ID + ': push timer');
    }

    // 仅供 tools/test-core.mjs 使用：浏览器里 process 不存在，这段不会执行
    try {
      if (typeof process !== 'undefined' && process.env && process.env.DSH_QCR_TEST) {
        exports._test = {
          detectShellKind: detectShellKind, kindOfShellPath: kindOfShellPath, pickShellPath: pickShellPath,
          normalizeEntry: normalizeEntry, sortCommands: sortCommands, rankByUsage: rankByUsage,
          formatLastRun: formatLastRun, isToday: isToday, updateCommand: updateCommand, removeCommand: removeCommand,
          mirrorReload: mirrorReload, MAX_ENTRIES: MAX_ENTRIES, CSS: CSS,
          escQuotePosix: escQuotePosix, escQuotePs: escQuotePs, cdPrefix: cdPrefix,
          wrapCommand: wrapCommand, stripAnsi: stripAnsi, makeMarkerScanner: makeMarkerScanner,
          pickReusable: pickReusable, composeCommand: composeCommand, sweepStaleRecords: sweepStaleRecords,
          normalizeRecord: normalizeRecord,
          nextMarker: nextMarker, upsertRecord: upsertRecord, setRecordState: setRecordState,
          removeRecord: removeRecord, loadTermRecords: loadTermRecords, reconcileRecords: reconcileRecords,
          MARKER_HEAD: MARKER_HEAD, MARKER_TAIL: MARKER_TAIL, TERM_RECORDS_MAX: TERM_RECORDS_MAX,
          TERM_RECORDS_KEY: TERM_RECORDS_KEY, TERM_SESSION_KEY: TERM_SESSION_KEY,
          GROUP_COLORS: GROUP_COLORS, GROUP_NAME_MAX: GROUP_NAME_MAX,
          normalizeGroupName: normalizeGroupName, groupOf: groupOf, groupNames: groupNames,
          groupColorMap: groupColorMap, buildSections: buildSections, normalizeGroups: normalizeGroups,
          setGroupOn: setGroupOn, createGroupFrom: createGroupFrom,
          removeFromGroup: removeFromGroup, splitGroup: splitGroup, hasGroup: hasGroup,
          exportFileName: exportFileName, exportPayload: exportPayload, EXPORT_SCHEMA: EXPORT_SCHEMA,
          QuickCmdPanel: QuickCmdPanel, CommandRow: CommandRow,
          resetStore: function () { storeState = null; },
          ZH: ZH, EN: EN
        };
      }
    } catch (e) { /* 测试钩子不可用时静默 */ }
    var inject = ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'webTerminals', 'remote', 'remote.commands', 'remote.terminal', 'remote.session'];
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
