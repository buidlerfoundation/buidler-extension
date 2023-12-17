import {
  handleMessage,
  injectFCPlugin,
  injectTwitterCast,
  handleTWChangeUrl,
  toggleBtnPlugin,
  handleEventClick,
  injectWarpcastInsights,
  getFCPlugin,
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
  if (msg?.type === 'show-plugin-from-popup') {
    const existedPlugin = getFCPlugin();
    if (!existedPlugin) {
      chrome.runtime.sendMessage(
        {
          type: 'on-load',
          url: window.location.href,
          host: window.location.host,
        },
        (callback) => {}
      );
    } else {
      existedPlugin.style.display = 'block';
    }
  }
  if (msg?.type === 'hide-plugin-from-popup') {
    const existedPlugin = getFCPlugin();
    if (existedPlugin) {
      existedPlugin.style.display = 'none';
    }
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
    host: window.location.host,
  },
  (callback) => {}
);

injectTwitterCast();
injectWarpcastInsights();
handleMessage();
handleEventClick();
