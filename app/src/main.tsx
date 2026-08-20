import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {clearRequestedFirestoreCacheBeforeStartup} from './lib/firebaseCacheCleanup.ts';
import {BrandedDialogProvider} from './components/BrandedDialogProvider.tsx';

const CHUNK_RELOAD_SIGNATURE_KEY = 'dr_racing_last_chunk_reload_signature';

function recoverFromStaleChunk(error: unknown, event?: Event) {
  const message = error instanceof Error ? error.message : String(error || '');
  if (!/Failed to fetch dynamically imported module|Importing a module script failed|module script/i.test(message)) {
    return;
  }

  const signature = message.match(/\/assets\/[^\s"']+\.js/i)?.[0] || message.slice(0, 300);
  if (sessionStorage.getItem(CHUNK_RELOAD_SIGNATURE_KEY) === signature) {
    return;
  }

  event?.preventDefault();
  sessionStorage.setItem(CHUNK_RELOAD_SIGNATURE_KEY, signature);
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set('__chunk_reload', String(Date.now()));
  window.location.replace(nextUrl.toString());
}

window.addEventListener('vite:preloadError', (event) => {
  recoverFromStaleChunk((event as Event & { payload?: unknown }).payload, event);
});
window.addEventListener('unhandledrejection', (event) => {
  recoverFromStaleChunk(event.reason, event);
});

async function bootstrap() {
  // Public demo build only (VITE_DEMO_MODE=true): seed fixed anonymized sample
  // data and a demo session before the app boots. Statically eliminated from
  // normal builds because Vite inlines the env value at build time.
  if (import.meta.env.VITE_DEMO_MODE === 'true') {
    const { seedDemoEnvironment } = await import('./demo/bootstrap.ts');
    seedDemoEnvironment();
  }

  try {
    await clearRequestedFirestoreCacheBeforeStartup();
  } catch (error) {
    console.warn('Firestore logout cache cleanup will retry on the next load.', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrandedDialogProvider>
        <App />
      </BrandedDialogProvider>
    </StrictMode>,
  );
}

void bootstrap();
