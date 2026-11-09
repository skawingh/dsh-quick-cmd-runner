// @local/dsh-quick-cmd-runner — sidebar quick command runner (client half)
window.__ModuleLoader__.load({
  id: '@local/dsh-quick-cmd-runner',
  factory: function (require) {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var h = React.createElement;
    var ReactDOM = null;
    try { ReactDOM = require('react-dom'); } catch (e) { ReactDOM = null; }

    var NS = 'quickCmdRunner';
    var PACKAGE_ID = '@local/dsh-quick-cmd-runner';
    var TAB_KIND = 'quickCmd';
    var STORAGE_KEY = '@local/dsh-quick-cmd-runner:v1';
    var SEED_FLAG_KEY = '@local/dsh-quick-cmd-runner:seeded';
    var CSS_KEY = '@local/dsh-quick-cmd-runner/panel.css';
    var MAX_ENTRIES = 200;
    var SHELL_OPTIONS = ['auto', 'powershell', 'cmd', 'bash'];
    var SHELL_LABELS = { powershell: 'PowerShell', cmd: 'cmd', bash: 'bash' };

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
      'status.reloadedOk': '已从 commands.json 重新加载',
      'status.reloadedNone': 'commands.json 为空或没有新命令',
      'status.reloadFailed': '重载失败'
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
      'status.reloadedOk': 'Reloaded from commands.json',
      'status.reloadedNone': 'commands.json is empty or has nothing new',
      'status.reloadFailed': 'Reload failed'
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

    function normalizeEntry(x) {
      if (!x || typeof x.command !== 'string' || !x.command.trim()) return null;
      return {
        id: typeof x.id === 'string' && x.id ? x.id : newId(),
        command: x.command,
        comment: typeof x.comment === 'string' ? x.comment : '',
        shell: SHELL_OPTIONS.indexOf(x.shell) >= 0 ? x.shell : 'auto',
        runs: Number.isFinite(x.runs) && x.runs > 0 ? x.runs : 0,
        lastRun: Number.isFinite(x.lastRun) ? x.lastRun : 0,
        created: Number.isFinite(x.created) ? x.created : Date.now()
      };
    }

    function sortCommands(list) {
      return list.slice().sort(function (a, b) {
        return (b.runs - a.runs) || (b.lastRun - a.lastRun) || (a.created - b.created);
      });
    }

    /* ---------- storage ---------- */

    var storeState = null;
    var storeListeners = new Set();

    function loadStore() {
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
        return { version: 1, commands: sortCommands(out) };
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

    function mutate(fn) {
      storeState = fn(getStoreSnapshot());
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(storeState)); } catch (e) {}
      storeListeners.forEach(function (listener) { try { listener(); } catch (e) {} });
      schedulePush();
    }

    function addCommand(entry) {
      var norm = normalizeEntry(entry);
      if (!norm) return;
      mutate(function (s) { return { version: 1, commands: sortCommands([norm].concat(s.commands)).slice(0, MAX_ENTRIES) }; });
    }

    function updateCommand(entry) {
      var norm = normalizeEntry(entry);
      if (!norm) return;
      mutate(function (s) {
        return { version: 1, commands: sortCommands(s.commands.map(function (c) { return c.id === norm.id ? norm : c; })) };
      });
    }

    function removeCommand(id) {
      mutate(function (s) { return { version: 1, commands: s.commands.filter(function (c) { return c.id !== id; }) }; });
    }

    function bumpCommand(id) {
      mutate(function (s) {
        return { version: 1, commands: sortCommands(s.commands.map(function (c) {
          return c.id === id ? Object.assign({}, c, { runs: c.runs + 1, lastRun: Date.now() }) : c;
        })) };
      });
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

    var CSS = '.qcr-root{display:flex;flex-direction:column;height:100%;min-height:220px;font-size:12px;color:inherit}' +
      '.qcr-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.25)}' +
      '.qcr-headtitle{font-weight:600}' +
      '.qcr-search{display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid rgba(127,127,127,.18)}' +
      '.qcr-search input{flex:1;min-width:0;background:transparent;border:1px solid rgba(127,127,127,.35);border-radius:4px;padding:3px 6px;color:inherit;font:inherit;outline:none}' +
      '.qcr-search input:focus{border-color:#4c6ef5}' +
      '.qcr-list{flex:1;overflow:auto;padding:4px 6px}' +
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
      '.qcr-tools{display:none;gap:2px;flex:none}' +
      '.qcr-row:hover .qcr-tools{display:flex}' +
      '.qcr-tool{background:transparent;border:1px solid rgba(127,127,127,.35);border-radius:3px;color:inherit;padding:1px 4px;cursor:pointer;font-size:10px;line-height:1.4}' +
      '.qcr-tool:hover{border-color:#4c6ef5}' +
      '.qcr-empty{padding:18px 10px;text-align:center;opacity:.65}' +
      '.qcr-status{margin:0 10px 6px;padding:4px 8px;border-radius:4px;font-size:11px}' +
      '.qcr-status-ok{background:rgba(60,160,90,.18)}' +
      '.qcr-status-error{background:rgba(200,60,60,.18)}' +
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

    async function openTerminalTab(ctx, sessionId, terminalId) {
      var sidebar = ctx && ctx.sidebarRight;
      if (sidebar && typeof sidebar.openTabIn === 'function') {
        await sidebar.openTabIn(sessionId, 'terminal', { params: { terminalId: terminalId } });
        return;
      }
      if (sidebar && typeof sidebar.openTab === 'function') {
        await sidebar.openTab('terminal', { params: { terminalId: terminalId } });
        return;
      }
      throw new Error('无法打开终端标签页');
    }

    async function executeCommand(ctx, sessionId, entry) {
      var command = String(entry.command || '').trim();
      if (!command) throw new Error('命令不能为空');
      if (!sessionId) throw new Error('无法获得当前会话');
      var pinned = entry.shell && entry.shell !== 'auto' ? entry.shell : null;
      var detected = detectShellKind(command);
      var kind = pinned || detected || null;
      var shells = await loadShellsFor(ctx, sessionId, signalAfter(5000));
      var shellPath = kind ? pickShellPath(kind, shells) : undefined;
      var created = valueOf(await ctx.remote.terminal.create(sessionId, {
        id: 'qcr-' + newId(), cols: 80, rows: 24, shellPath: shellPath
      }, signalAfter(10000)));
      var terminalId = null;
      if (created && typeof created === 'object') terminalId = created.id || created.terminalId || null;
      else if (typeof created === 'string') terminalId = created;
      if (!terminalId) throw new Error('创建终端失败');
      try {
        valueOf(await ctx.remote.terminal.rename(sessionId, terminalId, String(entry.comment || entry.command).slice(0, 60)));
      } catch (e) {}
      await writeCommand(ctx, sessionId, terminalId, command);
      await openTerminalTab(ctx, sessionId, terminalId);
      bumpCommand(entry.id);
    }

    /* ---------- host file sync (live store: ~/.dsh/quick-cmd-runner/commands.json) ---------- */

    var syncCtx = null;
    var syncSessionId = null;
    var pushTimer = null;

    function pushStore() {
      if (!syncCtx || !syncSessionId) return Promise.resolve(false);
      var remote = syncCtx.remote;
      if (!remote || !remote.commands || typeof remote.commands.execute !== 'function') return Promise.resolve(false);
      var payload = JSON.stringify(storeState ? storeState.commands : [], null, 2);
      return remote.commands.execute(syncSessionId, '/qcr-save ' + payload, [], signalAfter(15000)).then(function (raw) {
        var exec = valueOf(raw);
        if (!exec) throw new Error('commands 服务未返回结果');
        var result = exec.result || exec;
        if (result && result.kind === 'error') throw new Error(result.text || 'save failed');
        return true;
      });
    }

    function schedulePush() {
      if (!syncCtx || !syncSessionId) return;
      if (pushTimer) clearTimeout(pushTimer);
      pushTimer = setTimeout(function () {
        pushTimer = null;
        pushStore().catch(function (e) { console.warn('[QCR] sync to store file failed:', e); });
      }, 800);
    }

    async function reloadCommands(ctx, sessionId) {
      if (!ctx.remote || !ctx.remote.commands || typeof ctx.remote.commands.execute !== 'function') {
        throw new Error('commands 服务不可用');
      }
      var signal = signalAfter(10000);
      var raw = await ctx.remote.commands.execute(sessionId, '/qcr-reload', [], signal);
      var exec = valueOf(raw);
      if (!exec) throw new Error('commands 服务未返回结果');
      var result = exec.result || exec;
      if (result && result.kind === 'error') throw new Error(result.text || 'reload failed');
      var text = result && typeof result.text === 'string' ? result.text : '';
      var parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('commands.json 不是数组');
      var valid = [];
      for (var i = 0; i < parsed.length; i++) {
        var norm = normalizeEntry(parsed[i]);
        if (norm) valid.push(norm);
      }
      mutate(function (s) {
        var byId = new Map();
        for (var j = 0; j < s.commands.length; j++) byId.set(s.commands[j].id, s.commands[j]);
        for (var k = 0; k < valid.length; k++) {
          var existing = byId.get(valid[k].id);
          byId.set(valid[k].id, existing
            ? Object.assign({}, valid[k], { runs: existing.runs, lastRun: existing.lastRun, created: existing.created })
            : valid[k]);
        }
        try { localStorage.setItem(SEED_FLAG_KEY, '1'); } catch (e) {}
        return { version: 1, commands: sortCommands(Array.from(byId.values())).slice(0, MAX_ENTRIES) };
      });
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
      return h('div', {
        className: 'qcr-row' + (busy ? ' qcr-row-busy' : ''),
        role: 'button', tabIndex: 0,
        onClick: props.onRun,
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

    function QuickCmdPanel(props) {
      var t = props.t;
      var execute = props.execute;
      var loadShells = props.loadShells;
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

      // 启动同步: 面板装载后从 ~/.dsh/quick-cmd-runner/commands.json 合并一次(文件为准的内容 + 本地统计)
      React.useEffect(function () {
        if (typeof props.reload !== 'function' || !sessionId) return undefined;
        var cancelled = false;
        Promise.resolve(props.reload(sessionId)).then(function (n) {
          if (!cancelled && n) console.info('[QCR] startup sync merged ' + n + ' entry(ies) from store file');
        }).catch(function (e) { console.warn('[QCR] startup sync failed:', e); });
        return function () { cancelled = true; };
      }, [sessionId]);

      function showStatus(type, text) {
        if (statusTimer.current) clearTimeout(statusTimer.current);
        setStatus({ type: type, text: text });
        statusTimer.current = setTimeout(function () { setStatus(null); }, 4000);
      }

      function run(entry) {
        if (!execute) { showStatus('error', t('status.error')); return; }
        if (busyIds.has(entry.id)) return;
        var next = new Set(busyIds);
        next.add(entry.id);
        setBusyIds(next);
        Promise.resolve(execute(sessionId, entry))
          .then(function () { showStatus('ok', t('status.ok')); })
          .catch(function (err) { showStatus('error', String((err && err.message) || err)); })
          .then(function () {
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
        Promise.resolve(props.reload(sessionId))
          .then(function (count) {
            showStatus('ok', count > 0 ? t('status.reloadedOk') + '：' + count + ' 条' : t('status.reloadedNone'));
          })
          .catch(function (err) {
            showStatus('error', t('status.reloadFailed') + '：' + String((err && err.message) || err));
          })
          .then(function () { setReloading(false); });
      }

      var q = query.trim().toLowerCase();
      var rows = snap.commands.filter(function (c) {
        return !q || c.command.toLowerCase().indexOf(q) >= 0 || (c.comment || '').toLowerCase().indexOf(q) >= 0;
      });

      return h('div', { className: 'qcr-root' },
        h('div', { className: 'qcr-head' },
          h('span', { className: 'qcr-headtitle' }, t('panel.title')),
          h('span', { className: 'qcr-headbtns' },
            h('button', { className: 'qcr-btn', disabled: reloading, onClick: doReload },
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
        rows.length ? h('div', { className: 'qcr-list' }, (function () {
          function mk(entry) {
            return h(CommandRow, {
              key: entry.id, entry: entry, t: t, busy: busyIds.has(entry.id),
              onRun: function () { run(entry); },
              onEdit: function () { setDraft({ id: entry.id, command: entry.command, comment: entry.comment || '', shell: entry.shell || 'auto' }); },
              onClone: function () { setDraft({ command: entry.command, comment: entry.comment || '', shell: entry.shell || 'auto' }); },
              onDelete: function () {
                if (typeof window !== 'undefined' && window.confirm && window.confirm(t('row.deleteConfirm'))) removeCommand(entry.id);
              }
            });
          }
          var ran = rows.filter(function (e) { return isToday(e.lastRun); });
          var not = rows.filter(function (e) { return !isToday(e.lastRun); });
          var out = ran.map(mk);
          if (ran.length && not.length) out.push(h('div', { key: 'qcr-divider', className: 'qcr-divider' }));
          return out.concat(not.map(mk));
        })()) : h('div', { className: 'qcr-empty' }, q ? t('panel.noMatch') : t('panel.empty')),
        draft !== null ? h(CommandModal, {
          t: t, draft: draft, shells: shells,
          onSave: function (next) { if (draft.id) updateCommand(next); else addCommand(next); setDraft(null); },
          onCancel: function () { setDraft(null); }
        }) : null
      );
    }

    /* ---------- apply ---------- */

    function apply(ctx) {
      console.info('[QCR] client module loaded (v3, host-file sync)');
      syncCtx = ctx;
      var t = ctx.locale.bind(NS);
      ctx.effect(function () { return ctx.locale.register(NS, { zh: ZH, en: EN }); }, PACKAGE_ID + ': dictionaries');
      var execute = function (sessionId, entry) { return executeCommand(ctx, sessionId, entry); };
      var loadShells = function (sessionId) { return loadShellsFor(ctx, sessionId); };
      var reload = function (sessionId) { return reloadCommands(ctx, sessionId); };
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
      ctx.effect(function () {
        try {
          return ctx.slots.inject('sidebar.right.pane.tab', function () {
            return ctx.slots.register({
              name: 'sidebar.right.pane.tab',
              key: PACKAGE_ID,
              locale: NS,
              inject: function (sessionId) { if (sessionId) syncSessionId = sessionId; return { t: t, execute: execute, loadShells: loadShells, reload: reload, sessionId: sessionId }; }
            }, QuickCmdPanel);
          });
        } catch (e) { console.error('[QCR] panel slot failed', e); }
      }, PACKAGE_ID + ': panel');
      injectCss();
    }

    var inject = ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs', 'webTerminals', 'remote', 'remote.commands', 'remote.terminal'];
    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  }
});
