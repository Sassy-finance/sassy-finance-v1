import typescript from '@rollup/plugin-typescript';
import reactRefresh from '@vitejs/plugin-react-refresh';
import tsconfigPaths from 'vite-tsconfig-paths';
import {defineConfig, loadEnv} from 'vite';
import {resolve} from 'path';
import nodePolyfills from 'rollup-plugin-polyfill-node';
const production = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, 'env');

  // Plugin so we can use default %env_variable%
  const htmlEnvPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, (_, p1) => {
          return env[p1];
        });
      },
    };
  };

  return {
    base: '',
    plugins: [
      htmlEnvPlugin(),
      reactRefresh(),
      tsconfigPaths(),
      typescript({tsconfig: './tsconfig.json'}),
      !production &&
        nodePolyfills({
          include: [
            'node_modules/**/*.js',
            new RegExp('node_modules/.vite/.*js'),
          ],
        }),
    ],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          nested: resolve(__dirname, 'ipfs-404.html'),
        },
        plugins: [
          // ↓ Needed for build
          nodePolyfills(),
        ],
      },
      // ↓ Needed for build if using WalletConnect and other providers
      commonjsOptions: {
        transformMixedEsModules: true,
      },
    },
  };
});
