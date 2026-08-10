import { build } from 'esbuild';
import { mkdirSync, existsSync } from 'fs';

const outdir = 'dist';
if (!existsSync(outdir)) mkdirSync(outdir, { recursive: true });

const handlers = ['health', 'extract-intake', 'validate-and-flag', 'care-plan-crud'];

for (const handler of handlers) {
  await build({
    entryPoints: [`src/handlers/${handler}.ts`],
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'esm',
    outfile: `${outdir}/${handler}/index.mjs`,
    external: ['@aws-sdk/*'],
    sourcemap: true,
    minify: true,
    banner: {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    },
  });
  console.log(`Built: ${handler}`);
}
