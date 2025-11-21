/// <reference types="vite/client" />
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    // Load environment variables for the current mode
    const env = loadEnv(mode, process.cwd());
    const VITE_API_URL = env.VITE_API_URL;
    console.log('VITE_API_URL:', VITE_API_URL);

    return {
        plugins: [vue()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: VITE_API_URL,
                    changeOrigin: true,
                },
            },
        },
    };
});