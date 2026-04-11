import { build } from 'esbuild'

const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  sourcemap: true,
  minify: false,

  banner: {
    js: `
      import { createRequire } from 'module';
      import { fileURLToPath as fileURLToPath_ } from 'url';
      import { dirname } from 'path';

      const require = createRequire(import.meta.url);
      const __filename = fileURLToPath_(import.meta.url);
      const __dirname = dirname(__filename);
    `.trim(),
  },
} // satisfies Parameters<typeof build>[0]

await Promise.all(
  [
    { in: 'src/index', out: 'dist/index' },
    { in: 'prisma/seed.deploy', out: 'prisma/seed.deploy' },
  ].map((point) =>
    build({
      ...sharedConfig,
      entryPoints: [`${point.in}.ts`],
      outfile: `${point.out}.js`,
      external: point.external,
    }),
  ),
)
