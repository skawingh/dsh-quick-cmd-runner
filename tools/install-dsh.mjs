#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
const args = process.argv.slice(2);
const profileFlagIdx = args.indexOf('--profile');
const profileArg = profileFlagIdx >= 0 ? args[profileFlagIdx + 1] : null;
const noVendor = args.includes('--no-vendor');
const profile = profileArg ? path.resolve(profileArg) : path.join(os.homedir(), '.dsh', 'profiles', 'desktop');
const pkg = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));
const name = pkg.name;
const bakSuffix = '.bak-' + name;
const fileSpecs = Array.isArray(pkg.files) ? pkg.files : ['.'];
const VENDOR_SPEC = 'file:./vendor/' + name;

function copyFile(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.git' || ent.name.endsWith('.log')) continue;
    const s = path.join(src, ent.name);
    const d = path.join(dst, ent.name);
    if (ent.isDirectory()) copyDir(s, d);
    else copyFile(s, d);
  }
}

function removeExisting(dest) {
  let st = null;
  try { st = fs.lstatSync(dest); } catch (e) { return; }
  if (st.isSymbolicLink()) { fs.rmSync(dest, { force: true }); return; }
  fs.rmSync(dest, { recursive: true, force: true });
}

function installCopy(dest) {
  removeExisting(dest);
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const spec of fileSpecs) {
    if (spec === 'package.json') continue;
    if (spec.endsWith('/*.json')) {
      const dir = spec.slice(0, -'/*.json'.length);
      const srcDir = path.join(pkgRoot, dir);
      if (!fs.existsSync(srcDir)) continue;
      for (const f of fs.readdirSync(srcDir)) {
        if (f.endsWith('.json')) { copyFile(path.join(srcDir, f), path.join(dest, dir, f)); n += 1; }
      }
    } else if (spec.endsWith('/')) {
      const srcDir = path.join(pkgRoot, spec);
      if (fs.existsSync(srcDir)) { copyDir(srcDir, path.join(dest, spec)); n += 1; }
    } else {
      const srcFile = path.join(pkgRoot, spec);
      if (fs.existsSync(srcFile)) { copyFile(srcFile, path.join(dest, spec)); n += 1; }
    }
  }
  copyFile(path.join(pkgRoot, 'package.json'), path.join(dest, 'package.json'));
  return n;
}

function updateProfilePackage() {
  const pkgPath = path.join(profile, 'package.json');
  const prof = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let changed = false;
  const dep = prof.dependencies ? prof.dependencies[name] : undefined;
  if (dep !== VENDOR_SPEC && (dep === undefined || String(dep).startsWith('link:'))) {
    if (!fs.existsSync(pkgPath + bakSuffix)) fs.copyFileSync(pkgPath, pkgPath + bakSuffix);
    prof.dependencies = prof.dependencies || {};
    prof.dependencies[name] = VENDOR_SPEC;
    changed = true;
  }
  const profDsh = prof.dsh || {};
  const host = profDsh.profile && Array.isArray(profDsh.profile.bundles) ? profDsh.profile
    : (Array.isArray(profDsh.bundles) ? profDsh : null);
  if (host && !host.bundles.includes(name)) {
    if (!fs.existsSync(pkgPath + bakSuffix)) fs.copyFileSync(pkgPath, pkgPath + bakSuffix);
    host.bundles.push(name);
    changed = true;
  }
  if (changed) fs.writeFileSync(pkgPath, JSON.stringify(prof, null, 2) + '\n', 'utf8');
  const depNow = prof.dependencies ? prof.dependencies[name] : null;
  return { changed, dep: depNow };
}

if (!fs.existsSync(profile)) {
  console.error('profile 目录不存在: ' + profile);
  process.exit(1);
}

const nodeModulesDest = path.join(profile, 'node_modules', name);
const vendorDest = path.join(profile, 'vendor', name);
const n1 = installCopy(nodeModulesDest);
console.log('node_modules 副本: ' + nodeModulesDest + '（' + n1 + ' 项 files 条目）');
if (!noVendor) {
  const n2 = installCopy(vendorDest);
  console.log('vendor 副本: ' + vendorDest + '（' + n2 + ' 项 files 条目）');
  const r = updateProfilePackage();
  console.log('profile package.json: ' + (r.changed ? '已更新 dependencies[' + name + '] → ' + r.dep : '无需修改（dependencies=' + r.dep + '）'));
} else {
  console.log('--no-vendor：跳过 vendor 副本与 package.json 修改');
}
console.log('完成。重启 DSH 生效；pnpm-lock.yaml 的 importer 条目请同步为 ' + VENDOR_SPEC + '（下次成功的 pnpm install 会自动对账）。');
