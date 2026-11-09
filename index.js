/** Host half of @local/dsh-quick-cmd-runner.
 *  Live store: ~/.dsh/quick-cmd-runner/commands.json (pretty JSON, hand-editable in Notepad).
 *  /qcr-reload -> returns store text (seeds from plugin commands.json on first run).
 *  /qcr-save   <- rawInput = JSON array, atomically persisted back to the store file. */
export const inject = ['commands'];

export function apply(ctx) {
  var fs = null, path = null, os = null;
  try { fs = process.getBuiltinModule('node:fs'); } catch (e) { fs = null; }
  try { path = process.getBuiltinModule('node:path'); } catch (e) { path = null; }
  try { os = process.getBuiltinModule('node:os'); } catch (e) { os = null; }
  if (!fs || !path || !os || !ctx.commands) {
    console.error('[QCR] host: node:fs/path/os or commands service unavailable, quick-command sync disabled');
    return undefined;
  }
  var storeDir = path.join(os.homedir(), '.dsh', 'quick-cmd-runner');
  var storeFile = path.join(storeDir, 'commands.json');
  var seedUrl = new URL('./commands.json', import.meta.url);

  function ensureStore() {
    if (fs.existsSync(storeFile)) return;
    fs.mkdirSync(storeDir, { recursive: true });
    var seed = '[]';
    try { seed = fs.readFileSync(seedUrl, 'utf8'); } catch (e) { console.warn('[QCR] seed read failed:', e); }
    fs.writeFileSync(storeFile, seed);
    console.info('[QCR] live store created at ' + storeFile);
  }

  return ctx.effect(function () {
    var offs = [];
    try {
      offs.push(ctx.commands.register({
        name: 'qcr-reload',
        description: 'Read the quick-command store file',
        recordInput: false,
        handler: function () {
          try {
            ensureStore();
            return { kind: 'success', text: fs.readFileSync(storeFile, 'utf8') };
          } catch (e) {
            return { kind: 'error', text: String((e && e.message) || e) };
          }
        }
      }));
      offs.push(ctx.commands.register({
        name: 'qcr-save',
        description: 'Persist the quick-command list to the store file',
        recordInput: false,
        input: { hint: '<json array>' },
        handler: function (invocation) {
          try {
            var text = String((invocation && invocation.rawInput) || '').trim();
            var parsed = JSON.parse(text);
            if (!Array.isArray(parsed)) return { kind: 'error', text: '数据不是数组，未写入' };
            fs.mkdirSync(storeDir, { recursive: true });
            var tmp = storeFile + '.tmp';
            fs.writeFileSync(tmp, JSON.stringify(parsed, null, 2) + '\n');
            fs.renameSync(tmp, storeFile);
            return { kind: 'success', text: 'ok' };
          } catch (e) {
            return { kind: 'error', text: String((e && e.message) || e) };
          }
        }
      }));
    } catch (e) {
      console.error('[QCR] host register failed:', e);
    }
    return function () {
      for (var i = 0; i < offs.length; i++) { try { offs[i](); } catch (e) {} }
    };
  }, 'quick-cmd-runner host commands');
}
