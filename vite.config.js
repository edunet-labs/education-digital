import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin_login: resolve(__dirname, 'admin/login.html'),
                admin_dashboard: resolve(__dirname, 'admin/admin.html'),
                superadmin: resolve(__dirname, 'admin/superadmin.html'),
                admin_forum: resolve(__dirname, 'admin/forum.html'),
                pages_forum: resolve(__dirname, 'pages/forum.html'),
                pages_quiz: resolve(__dirname, 'pages/quiz.html'),
                pages_lab: resolve(__dirname, 'pages/lab-virtual.html'),
                pages_kelas10: resolve(__dirname, 'pages/kelas-10.html'),
                pages_kelas11: resolve(__dirname, 'pages/kelas-11.html'),
                pages_kelas12: resolve(__dirname, 'pages/kelas-12.html'),
                pages_aij11: resolve(__dirname, 'pages/kelas-11/aij.html'),
                pages_asj11: resolve(__dirname, 'pages/kelas-11/asj.html'),
                pages_kj11: resolve(__dirname, 'pages/kelas-11/kj.html'),
                pages_aij12: resolve(__dirname, 'pages/kelas-12/aij.html'),
                pages_asj12: resolve(__dirname, 'pages/kelas-12/asj.html'),
                pages_kj12: resolve(__dirname, 'pages/kelas-12/kj.html'),
            },
        },
    },
});
