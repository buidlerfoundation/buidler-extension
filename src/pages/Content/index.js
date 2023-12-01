import {
  handleMessage,
  injectFCPlugin,
  injectTwitterCast,
  handleTWChangeUrl,
  toggleBtnPlugin,
  handleEventClick,
  injectWarpcastInsights,
} from '../../utils';

document.documentElement.setAttribute('buidler-extension', true);

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  response();
  if (msg?.type === 'toggle-buidler-extension') {
    toggleBtnPlugin();
  }
  if (msg?.type === 'on-inject-iframe') {
    const search = new URLSearchParams(window.location.search);
    injectFCPlugin({
      signerId: msg?.signerId || search?.get('b-signer-id'),
      open: msg?.openPlugin,
      uniqId: msg?.uniqId,
    });
  }
  if (msg?.type === 'on-frame-focus') {
    // on-frame-focus
  }
  if (msg?.type === 'on-tab-update') {
    injectTwitterCast();
    handleTWChangeUrl(msg?.url);
    if (msg?.url) {
      const path = new URL(msg?.url).pathname;
      injectWarpcastInsights(path);
    }
  }
  if (msg?.type === 'on-frame-update') {
    // on-frame-update
  }
});

chrome.runtime.sendMessage(
  {
    type: 'on-load',
    url: window.location.href,
  },
  (callback) => {}
);

injectTwitterCast();
injectWarpcastInsights();
handleMessage();
handleEventClick();
