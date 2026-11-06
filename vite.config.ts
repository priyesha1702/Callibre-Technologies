import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const websiteRoot = fileURLToPath(new URL('./website', import.meta.url));

export default defineConfig({
  root: websiteRoot,
  server: {
    host: '0.0.0.0',
    port: 5175,
    strictPort: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./website/index.html', import.meta.url)),
        projects: fileURLToPath(new URL('./website/projects.html', import.meta.url)),
        project: fileURLToPath(new URL('./website/project.html', import.meta.url)),
        enroll: fileURLToPath(new URL('./website/enroll.html', import.meta.url)),
        team: fileURLToPath(new URL('./website/team.html', import.meta.url)),
        admin: fileURLToPath(new URL('./website/admin.html', import.meta.url)),
        'admin-login': fileURLToPath(new URL('./website/admin-login.html', import.meta.url))
      }
    }
  }
});