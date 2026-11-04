/**
 * Upload the hashed build output (dist/) to Shopify and write dist/asset-urls.json.
 * ASSET_HOME=files (recommended; survives theme publishes) | theme (needs re-run on theme publish).
 * Any failure exits non-zero, which blocks the Vercel promotion (AC-21 / FR-54).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};
const API = '2025-10';
const shop = need('SHOPIFY_STORE_DOMAIN');
const token = need('SHOPIFY_ADMIN_TOKEN');
const home = process.env.ASSET_HOME ?? 'files';
const MIME: Record<string, string> = { '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2' };
const mimeOf = (f: string) => MIME[f.slice(f.lastIndexOf('.'))] ?? 'application/octet-stream';

async function gql<T>(query: string, variables: unknown): Promise<T> {
  const r = await fetch(`https://${shop}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables }),
  });
  const j = (await r.json()) as { data?: T; errors?: unknown };
  if (!r.ok || j.errors || !j.data) throw new Error(`GraphQL failed: ${JSON.stringify(j.errors ?? r.status)}`);
  return j.data;
}

async function uploadToFiles(path: string): Promise<string> {
  const filename = basename(path);
  const mimeType = mimeOf(filename);
  const bytes = readFileSync(path);

  const staged = await gql<{ stagedUploadsCreate: { stagedTargets: { url: string; resourceUrl: string; parameters: { name: string; value: string }[] }[]; userErrors: { message: string }[] } }>(
    `mutation($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}`,
    { input: [{ resource: 'FILE', filename, mimeType, httpMethod: 'POST', fileSize: String(bytes.length) }] },
  );
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (!target || staged.stagedUploadsCreate.userErrors.length) throw new Error(`stagedUploadsCreate: ${JSON.stringify(staged.stagedUploadsCreate.userErrors)}`);

  const form = new FormData();
  target.parameters.forEach((p) => form.append(p.name, p.value));
  form.append('file', new Blob([bytes], { type: mimeType }), filename);
  const up = await fetch(target.url, { method: 'POST', body: form });
  if (!up.ok) throw new Error(`staged upload failed for ${filename}: ${up.status}`);

  const created = await gql<{ fileCreate: { files: { id: string }[]; userErrors: { message: string }[] } }>(
    `mutation($files:[FileCreateInput!]!){fileCreate(files:$files){files{id} userErrors{message}}}`,
    { files: [{ originalSource: target.resourceUrl, contentType: 'FILE', filename }] },
  );
  const id = created.fileCreate.files[0]?.id;
  if (!id || created.fileCreate.userErrors.length) throw new Error(`fileCreate: ${JSON.stringify(created.fileCreate.userErrors)}`);

  for (let i = 0; i < 30; i++) {
    const n = await gql<{ node: { fileStatus?: string; url?: string } | null }>(
      `query($id:ID!){node(id:$id){... on GenericFile{fileStatus url}}}`,
      { id },
    );
    if (n.node?.fileStatus === 'FAILED') throw new Error(`Shopify failed to process ${filename}`);
    if (n.node?.fileStatus === 'READY' && n.node.url) return n.node.url;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for ${filename}`);
}

async function uploadToTheme(path: string): Promise<string> {
  const theme = need('SHOPIFY_THEME_ID');
  const key = `assets/${basename(path)}`;
  const r = await fetch(`https://${shop}/admin/api/${API}/themes/${theme}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ asset: { key, attachment: readFileSync(path).toString('base64') } }),
  });
  if (!r.ok) throw new Error(`theme asset PUT failed: ${r.status}`);
  const j = (await r.json()) as { asset?: { public_url?: string } };
  if (!j.asset?.public_url) throw new Error(`no public_url returned for ${key}`);
  return j.asset.public_url;
}

async function main() {
  const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8')) as Record<string, { file: string; css?: string[]; isEntry?: boolean }>;
  const entries = Object.values(manifest);
  const entry = entries.find((m) => m.isEntry);
  const jsFile = entry?.file;
  // With cssCodeSplit:false Vite lists the CSS as its own manifest entry ("style.css"),
  // not under the JS entry's `css` array, so accept either shape.
  const cssFile = entry?.css?.[0] ?? entries.find((m) => m.file.endsWith('.css'))?.file;
  if (!jsFile || !cssFile) throw new Error('Could not find built JS and CSS in manifest');

  const up = home === 'theme' ? uploadToTheme : uploadToFiles;
  const js = await up(join('dist', jsFile));
  const css = await up(join('dist', cssFile));
  for (const u of [js, css]) if (!u.startsWith('https://cdn.shopify.com/')) throw new Error(`Unexpected asset host: ${u}`);

  writeFileSync('dist/asset-urls.json', JSON.stringify({ css, js }, null, 2));
  console.log('Uploaded:', { css, js });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
