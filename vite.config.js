import { defineConfig } from 'vite';
import { resolve } from 'path';
import glob from 'fast-glob';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    build: {
        rollupOptions: {
            input: Object.fromEntries(
                glob.sync('**/*.html', {
                    ignore: ['dist/**', 'node_modules/**'],
                    cwd: __dirname
                }).map(file => {
                    // Create an entry name based on the file path, removing the extension
                    // e.g. "pages/materi.html" -> "pages/materi"
                    const name = file.replace(/\.html$/, '');
                    const path = resolve(__dirname, file);
                    return [name, path];
                })
            ),
        },
    },
});
