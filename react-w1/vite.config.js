import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	base: "/react-demo/react-w1/",
	plugins: [react()],
});
