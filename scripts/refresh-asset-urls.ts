/** Verify the uploaded assets are live, push their URLs to Vercel env, then trigger a production redeploy. */
import { readFileSync } from 'node:fs';

const need = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k}`);
  return v;
};

async function main() {
  const { css, js } = JSON.parse(readFileSync('dist/asset-urls.json', 'utf8')) as { css: string; js: string };

  // Fail closed: both assets must answer 200 before the HTML is allowed to reference them.
  for (const u of [css, js]) {
    const r = await fetch(u, { method: 'HEAD' });
    if (!r.ok) throw new Error(`Asset not reachable (${r.status}): ${u}`);
  }

  const project = need('VERCEL_PROJECT_ID');
  const team = process.env.VERCEL_TEAM_ID ? `&teamId=${process.env.VERCEL_TEAM_ID}` : '';
  const r = await fetch(`https://api.vercel.com/v10/projects/${project}/env?upsert=true${team}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${need('VERCEL_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { key: 'ASSET_CSS_URL', value: css, type: 'encrypted', target: ['production', 'preview'] },
      { key: 'ASSET_JS_URL', value: js, type: 'encrypted', target: ['production', 'preview'] },
    ]),
  });
  if (!r.ok) throw new Error(`Vercel env update failed: ${r.status} ${await r.text()}`);

  const hook = await fetch(need('VERCEL_DEPLOY_HOOK_URL'), { method: 'POST' });
  if (!hook.ok) throw new Error(`Deploy hook failed: ${hook.status}`);
  console.log('Asset URLs refreshed; production redeploy triggered.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
