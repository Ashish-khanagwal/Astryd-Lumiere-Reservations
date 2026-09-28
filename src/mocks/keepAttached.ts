/**
 * MSW's service worker tracks connected tabs in memory only. Chrome routinely stops an idle service worker
 * (e.g. while the tab is in the background); when it restarts that list is empty, so it lets every request
 * through to the real API origin - which isn't running in mock mode - and screens sit on skeletons until a
 * reload. Re-sending MSW's own "MOCK_ACTIVATE" handshake re-registers this tab (MSW's client listens for the
 * reply only once, so repeats are silent).
 */
const REATTACH_INTERVAL_MS = 5000;
const REPLY_TIMEOUT_MS = 1500;

function reattach(): Promise<void> {
  const controller = navigator.serviceWorker?.controller;
  if (!controller) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
      window.clearTimeout(timer);
      resolve();
    };
    const onMessage = (event: MessageEvent) => {
      if ((event.data as { type?: string } | null)?.type === 'MOCKING_ENABLED') done();
    };
    const timer = window.setTimeout(done, REPLY_TIMEOUT_MS);
    navigator.serviceWorker.addEventListener('message', onMessage);
    controller.postMessage('MOCK_ACTIVATE');
  });
}

export function keepMockWorkerAttached(): () => Promise<void> {
  const nudge = () => void reattach();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') nudge();
  });
  window.addEventListener('focus', nudge);
  window.addEventListener('pageshow', nudge);
  window.setInterval(nudge, REATTACH_INTERVAL_MS);
  return reattach;
}
