import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const ignoredDirs = new Set([
  '.git',
  '.expo',
  '.expo-home',
  '.npm-cache',
  'node_modules',
  'coverage',
  'dist',
  'dist-web',
  'build',
  'android',
  'ios'
]);
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.lock']);

const patterns = [
  { name: 'OpenAI API key', regex: /sk-[A-Za-z0-9_-]{32,}/g },
  { name: 'Supabase JWT-like key', regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g },
  { name: 'Private key block', regex: /-----BEGIN (RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/g },
  { name: 'Android keystore property', regex: /(storePassword|keyPassword)\s*=\s*.+/g },
  { name: 'Generic assigned secret', regex: /(api[_-]?key|secret|token|password)\s*[:=]\s*['"]?[A-Za-z0-9_./+-]{24,}/gi }
];

function walk(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      if (!ignoredDirs.has(entry)) {
        files.push(...walk(path));
      }
      continue;
    }

    const lower = entry.toLowerCase();
    if ([...ignoredExtensions].some((extension) => lower.endsWith(extension))) {
      continue;
    }

    files.push(path);
  }

  return files;
}

const findings = [];

for (const file of walk(root)) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of patterns) {
    const matches = [...text.matchAll(pattern.regex)];
    for (const match of matches) {
      const before = text.slice(0, match.index);
      const line = before.split('\n').length;
      const value = match[0];
      if (value.includes('your_') || value.includes('your-') || value.includes('example')) {
        continue;
      }
      findings.push(`${relative(root, file)}:${line} ${pattern.name}`);
    }
  }
}

if (findings.length) {
  console.error('Potential secrets found:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('Secret scan passed.');
