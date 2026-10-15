import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TWO_STAGE_PREVIEW_BRANCH = 'codex/oct24-two-stage-preview'
const TURNSTILE_ALWAYS_PASS_TEST_SITE_KEY = '1x00000000000000000000AA'

export default defineConfig(() => {
  const protectedTwoStagePreview = process.env.VERCEL_ENV === 'preview'
    && process.env.VERCEL_GIT_COMMIT_REF === TWO_STAGE_PREVIEW_BRANCH
  const turnstileSiteKey = process.env.VITE_TURNSTILE_SITE_KEY
    || (protectedTwoStagePreview ? TURNSTILE_ALWAYS_PASS_TEST_SITE_KEY : '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_TURNSTILE_SITE_KEY': JSON.stringify(turnstileSiteKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
