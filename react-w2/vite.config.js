import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	// eslint-disable-next-line no-undef
	base: process.env.NODE_ENV === "production" ? "/react-demo/react-w2/" : "/",
	plugins: [react()],
});
