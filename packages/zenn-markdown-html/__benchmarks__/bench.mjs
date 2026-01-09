/**
 * zenn-markdown-html ベンチマーク
 *
 * 使い方:
 *   # リリース版をテスト（package.json の version）
 *   pnpm bench
 *
 *   # ローカル版をテスト
 *   pnpm bench:local
 *
 * バージョン変更:
 *   package.json の zenn-markdown-html のバージョンを変更して pnpm install
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const isLocal = process.argv.includes('--local');

// ローカル版またはインストール版を動的にインポート
// どちらも CommonJS なので require を使用
const modulePath = isLocal ? '../../lib/index.js' : 'zenn-markdown-html';
const mod = require(modulePath);
const markdownToHtml = mod.default || mod;

console.log(`\n📦 Testing: ${isLocal ? 'LOCAL' : 'npm'} version\n`);
console.log('='.repeat(60));

// ------------------------------------------------------------
// テストケース
// ------------------------------------------------------------

const testCases = {
  'コードブロックなし': `
# タイトル

これは段落です。**太字**と*イタリック*があります。

- リスト1
- リスト2
- リスト3

> 引用文
`.trim(),

  'コードブロック1個 (JavaScript)': `
# タイトル

\`\`\`javascript
console.log('hello');
const x = 1;
const y = 2;
\`\`\`
`.trim(),

  'コードブロック5個 (異なる言語)': `
# 記事タイトル

## JavaScript

\`\`\`javascript
console.log('hello');
\`\`\`

## TypeScript

\`\`\`typescript
const x: number = 1;
interface User { name: string; }
\`\`\`

## Python

\`\`\`python
def hello():
    print("hello")
\`\`\`

## HTML

\`\`\`html
<div class="container">
  <p>Hello</p>
</div>
\`\`\`

## CSS

\`\`\`css
.container {
  display: flex;
  justify-content: center;
}
\`\`\`
`.trim(),

  'diff モード': `
# 変更点

\`\`\`javascript diff
-const old = 1;
+const new = 2;
 const unchanged = 3;
-removed();
+added();
\`\`\`
`.trim(),

  '大きなコードブロック (50行)': `
# Large Code

\`\`\`javascript
${Array.from({ length: 50 }, (_, i) => `const line${i} = ${i};`).join('\n')}
\`\`\`
`.trim(),
};

// ------------------------------------------------------------
// ベンチマーク実行
// ------------------------------------------------------------

async function runBenchmark(name, markdown, iterations = 10) {
  // ウォームアップ
  await markdownToHtml(markdown);

  const times = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await markdownToHtml(markdown);
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`\n📝 ${name}`);
  console.log(`   平均: ${avg.toFixed(2)} ms`);
  console.log(`   最小: ${min.toFixed(2)} ms`);
  console.log(`   最大: ${max.toFixed(2)} ms`);

  return { name, avg, min, max };
}

// メイン実行
const results = [];

for (const [name, markdown] of Object.entries(testCases)) {
  const result = await runBenchmark(name, markdown);
  results.push(result);
}

// サマリー
console.log('\n' + '='.repeat(60));
console.log('📊 サマリー (平均時間)');
console.log('='.repeat(60));

for (const r of results) {
  const bar = '█'.repeat(Math.ceil(r.avg / 5));
  console.log(`${r.name.padEnd(35)} ${r.avg.toFixed(2).padStart(8)} ms ${bar}`);
}

console.log('\n');
