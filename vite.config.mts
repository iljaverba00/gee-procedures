import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import eslint from 'vite-plugin-eslint';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      resolve: {
        alias: {
          src: path.resolve(__dirname, './src')
        },
      },
      plugins: [
        vue({
          template: { transformAssetUrls },
        }),
        quasar(),
        eslint()
      ],
      server: {
        https: false,
        port: 3000
      },
    };
  } else {
    return {
      resolve: {
        alias: {
          src: path.resolve(__dirname, './src'),
        },
      },
      plugins: [
        vue(),
        dts({
          insertTypesEntry: true,
        }),
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/main.ts'),
          name: 'GeeProceduresModule',
          formats: ['es', 'umd'],
          fileName: format => `gee-procedure.${format}.js`,
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            globals: {
              vue: 'Vue',
            },
          },
        },
      },
      exclude: ['demo/**'],
    }
  }
});
