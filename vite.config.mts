import react from '@vitejs/plugin-react';
import { PluginOption, defineConfig, splitVendorChunkPlugin } from 'vite';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

const plugins = (mode: string): PluginOption[] => {
    return [
        react(),
        tsconfigPaths(),
        svgr(),
        eslint({
            failOnError: true,
            failOnWarning: true,
            emitError: true,
            emitWarning: true,
            useEslintrc: true,
        }),
        splitVendorChunkPlugin(),
    ];
};

export default defineConfig(({ mode }) => {
    return {
        plugins: plugins(mode),
        server: {
            port: 3000, // To run the app on port 3000
            open: true, // If we want to open the app once its started
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id: string) {
                        // Creating a chunk to lightweight charts deps. Reducing the vendor chunk size
                        if (id.includes('lightweight-charts')) {
                            return 'lightweight-charts';
                        }
                        if (id.includes('@rainbow-me/rainbowkit')) {
                            return '@rainbow-me/rainbowkit';
                        }
                        // Reducing the index (src) chunk size
                        // if (id.includes('src/constants/currency.ts')) {
                        //     return 'currency';
                        // }
                    },
                },
            },
        },
    };
});
