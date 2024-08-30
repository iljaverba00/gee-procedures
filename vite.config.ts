import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "path";
import vue from "@vitejs/plugin-vue";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";

export default defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [
        vue({
          template: { transformAssetUrls },
        }),
        quasar(),
      ],
      server: {
        open: "/src/demo/index.html",
        https: false,
        port: 8082,
        proxy: {
          "/ActionServlet": "http://localhost",
          "/ows": "http://localhost",
          "/api": "http://localhost",
          "/wfe": "http://192.168.0.230:8080",
          "/maps": "http://localhost",
        },
      },
    };
  } else {
    return {
      plugins: [
        vue(),
        dts({
          insertTypesEntry: true,
        }),
      ],
      build: {
        lib: {
          entry: path.resolve(__dirname, "src/main.ts"),
          name: "GeeProcedure",
          formats: ["es", "umd"],
          fileName: (format) => `gee-procedure.${format}.js`,
        },
        rollupOptions: {
          external: ["vue"],
          output: {
            globals: {
              vue: "Vue",
            },
          },
        },
      },
    };
  }
});
