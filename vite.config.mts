import react from '@vitejs/plugin-react';
import { ConfigEnv, PluginOption, defineConfig, Plugin, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import fs from 'fs';

const particleWasmPlugin: Plugin | undefined = {
    name: 'particle-wasm',
    apply: (_, env: ConfigEnv) => {
        return env.mode === 'development';
    },
    buildStart: () => {
        const copiedPath = path.join(
            __dirname,
            './node_modules/@particle-network/thresh-sig/wasm/thresh_sig_wasm_bg.wasm' //@particle-network/thresh-sig dir
        );
        const dir = path.join(__dirname, 'node_modules/.vite/wasm');
        const resultPath = path.join(dir, 'thresh_sig_wasm_bg.wasm');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.copyFileSync(copiedPath, resultPath);
    },
};

const plugins = (mode: string): PluginOption[] => {
    return [
        react(),
        tsconfigPaths(),
        svgr(),
        checker({
            typescript: true,
        }),
        eslint({
            failOnError: true,
            failOnWarning: true,
            emitError: true,
            emitWarning: true,
            useEslintrc: true,
        }),
        particleWasmPlugin,
    ];
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        define: {
            'process.env': env,
        },
        plugins: plugins(mode),
        server: {
            port: 3000, // To run the app on port 3000
            open: true, // If we want to open the app once its started
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        rainbowkit: ['@rainbow-me/rainbowkit'],
                        lightweightCharts: ['lightweight-charts'],
                        lottie: ['lottie-react'],
                        router: ['react-router-dom'],
                        pyth: ['@pythnetwork/hermes-client'],
                        reduxToolkit: ['@reduxjs/toolkit'],
                        qrCode: ['react-qr-code'],
                        toastify: ['react-toastify'],
                        thales: ['thales-utils'],
                        styledComponents: ['styled-components'],
                        i18next: ['i18next'],
                        lodash: ['lodash'],
                        dateFns: ['date-fns'],
                        htmlToImage: ['html-to-image'],
                        buffer: ['buffer'],
                        history: ['history'],
                        i18nextBrowser: ['i18next-browser-languagedetector'],
                        queryString: ['query-string'],
                        tooltip: ['rc-tooltip'],
                        react: ['react'],
                        reactDom: ['react-dom'],
                        errorBoundary: ['react-error-boundary'],
                        reactI18next: ['react-i18next'],
                        modal: ['react-modal'],
                        redux: ['react-redux'],
                        select: ['react-select'],
                        webgl: ['react-unity-webgl'],
                        typescript: ['typescript'],
                        cookie: ['universal-cookie'],
                        wagmi: ['wagmi'],
                        vitals: ['web-vitals'],
                    },
                },
            },
        },
    };
});
