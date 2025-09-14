import { defineConfig } from 'tsup';
import path from 'path';
import postcss from 'postcss';
import postcssModules from 'postcss-modules';
import { promises as fsPromises } from 'fs';

// zenn-* は devDependencies にしてバンドルに含める
export default defineConfig({
  entry: ['src/index.ts'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  dts: true,
  clean: true,
  sourcemap: true,
  platform: 'browser',
  format: ['esm'],
  esbuildPlugins: [
    // ISSUE: https://github.com/egoist/tsup/issues/536#issuecomment-1302012400
    {
      name: 'css-module',
      setup(build): void {
        build.onResolve(
          { filter: /\.module\.css$/, namespace: 'file' },
          (args) => {
            return {
              path: `${path.join(args.resolveDir, args.path, '#css-module')}`,
              namespace: 'css-module',
              pluginData: {
                pathDir: path.join(args.resolveDir, args.path),
              },
            };
          }
        );
        build.onLoad(
          { filter: /#css-module$/, namespace: 'css-module' },
          async (args) => {
            const { pluginData } = args as {
              pluginData: { pathDir: string };
            };

            const source = await fsPromises.readFile(
              pluginData.pathDir,
              'utf8'
            );

            let cssModule = {};
            const result = await postcss([
              postcssModules({
                getJSON(_, json) {
                  cssModule = json;
                },
              }),
            ]).process(source, { from: pluginData.pathDir });

            return {
              pluginData: { css: result.css },
              contents: `import "${
                pluginData.pathDir
              }"; export default ${JSON.stringify(cssModule)}`,
            };
          }
        );
        build.onResolve(
          { filter: /\.module\.css$/, namespace: 'css-module' },
          (args) => {
            return {
              path: path.join(args.resolveDir, args.path, '#css-module-data'),
              namespace: 'css-module',
              pluginData: args.pluginData as { css: string },
            };
          }
        );
        build.onLoad(
          { filter: /#css-module-data$/, namespace: 'css-module' },
          (args) => {
            return {
              contents: (args.pluginData as { css: string }).css,
              loader: 'css',
            };
          }
        );
      },
    },
  ],
});
