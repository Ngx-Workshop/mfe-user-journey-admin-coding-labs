import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const advisories = [];
function inspect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'contracts') inspect(path);
      continue;
    }
    if (path.endsWith('.spec.ts')) {
      failures.push(`${path}: move application specs to the matching testing/app directory.`);
      continue;
    }
    if (!path.endsWith('.ts')) continue;
    const source = readFileSync(path, 'utf8');
    const isApi = path.includes('/api/');
    const isStore = path.includes('/state/');
    if (!isApi && /\bHttpClient\b/.test(source) && source.includes("from '@angular/common/http'")) {
      failures.push(`${path}: HTTP belongs in the data access layer.`);
    }
    if (!isApi && !isStore && /\bCodingLabsApiClient\b/.test(source)) {
      failures.push(`${path}: consume CodingLabsStore instead of the HTTP client.`);
    }
    if (!source.includes('@Component(')) continue;
    if (/\b(templateUrl|styleUrls?)\s*:/.test(source)) {
      failures.push(`${path}: colocate component templates and styles in TypeScript.`);
    }
    for (const match of source.matchAll(/(?:\bclass="([^"]*)"|\[class\.([\w-]+)\])/g)) {
      for (const name of (match[1] ?? match[2]).split(/\s+/).filter(Boolean)) {
        if (!/^[a-z][a-z0-9-]*(?:__[a-z0-9-]+)?(?:--[a-z0-9-]+)?$/.test(name)) {
          failures.push(`${path}: invalid BEM class ${name}.`);
        }
        // A plain block name is valid BEM; element/modifier names are checked above.
      }
    }
    const lines = source.trimEnd().split('\n').length;
    if (lines > 230) advisories.push(`${path}: ${lines} lines (230 is an advisory guideline).`);
  }
}
inspect('src/app');
function inspectTesting(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { inspectTesting(path); continue; }
    if (!path.endsWith('.spec.ts')) continue;
    const source = path.replace(/^testing\//, 'src/').replace(/\.spec\.ts$/, '.ts');
    if (!existsSync(source)) failures.push(`${path}: no matching application source at ${source}.`);
  }
}
inspectTesting('testing/app');
for (const message of advisories) console.log(`Note: ${message}`);
if (failures.length) {
  for (const message of failures) console.error(message);
  process.exitCode = 1;
} else console.log('Architecture checks passed.');
