import { baseUrl, host } from '../../constant';
import {
  autoOffSetting,
  getBubbleHeight,
  getLoadingHeight,
  handleMessage,
  injectTwitterCast,
  isAuthenticated,
} from '../../utils';
import { getMetadata } from './htmlParser';

document.documentElement.setAttribute('buidler-extension', true);
let loading = true;
let panelOpen = false;
let tabUpdated = false;
let timeoutTabUpdate = null;

// main -> 90px
// detail -> 137px

// plugin loading
var loadingPlugin = document.createElement('div');
loadingPlugin.className = 'buidler-loading-container';
loadingPlugin.style.height = getLoadingHeight();
var loader = document.createElement('div');
loader.className = 'buidler-loader';

// iframe plugin
const existed = !!document.getElementById('buidler-plugin-frame');
var pluginElement = document.createElement('div');
var iframePlugin = document.createElement('iframe');
var move = document.createElement('div');
if (!existed) {
  pluginElement.id = 'buidler-plugin';
  pluginElement.style.height = getBubbleHeight();
  pluginElement.style.opacity = 0;
  pluginElement.style.display = 'none';
  pluginElement.className = 'buidler-plugin-container';
  move.id = 'buidler-plugin-move';
  move.className = 'buidler-move-container';
  iframePlugin.id = 'buidler-plugin-frame';
  iframePlugin.frameBorder = 'none';
  iframePlugin.className = 'buidler-iframe-container';
  iframePlugin.onload = () => {
    pluginElement.style.opacity = 1;
    loader.remove();
    if (tabUpdated) {
      tabUpdated = false;
      if (timeoutTabUpdate) {
        clearTimeout(timeoutTabUpdate);
      }
      timeoutTabUpdate = setTimeout(() => {
        updateIFrame({
          url: window.location.href,
        });
      }, 1000);
    }
    // dragElement(pluginElement);
  };
  // pluginElement.appendChild(move);
  loadingPlugin.appendChild(loader);
  pluginElement.appendChild(iframePlugin);
  pluginElement.appendChild(loadingPlugin);
}

const toggle = () => {
  const el = document.getElementById('buidler-plugin');
  const pluginFrame = document.getElementById('buidler-plugin-frame');
  if (el && pluginFrame) {
    if (el.style.display === 'none') {
      el.style.display = 'block';
      if (el.style.height !== '100vh') {
        pluginFrame?.contentWindow?.postMessage?.(
          { type: 'toggle-plugin' },
          '*'
        );
      }
    } else {
      pluginFrame?.contentWindow?.postMessage?.({ type: 'toggle-plugin' }, '*');
    }
  }
};
function updateIFrame(params) {
  const { url } = params;
  const metadata = getMetadata();
  if (pluginElement.style.height !== '100vh') {
    loadingPlugin.style.height = getLoadingHeight();
    pluginElement.style.height = getBubbleHeight();
  }
  iframePlugin?.contentWindow?.postMessage?.(
    { type: 'update-external', payload: url, metadata },
    '*'
  );
}
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  response();
  if (msg?.type === 'toggle-buidler-extension') {
    if (!loading || existed) {
      toggle();
      panelOpen = !panelOpen;
    }
  }
  if (msg?.type === 'on-inject-iframe') {
    const { ottRes, autoOff, uniqId } = msg;
    autoOffSetting = autoOff === 'true';
    const path = 'plugin';
    const ott = ottRes?.data || '';
    isAuthenticated = !!ott;
    const metadata = getMetadata();
    const pluginUrl = `${baseUrl}/${path}?${new URLSearchParams({
      external_url: `${window.location.href}`,
      ott: `${ott}`,
      auto_off: `${autoOff || ''}`,
      extension_id: `${uniqId}`,
      metadata: `${JSON.stringify(metadata)}`,
    })}`;
    if (!autoOffSetting) {
      pluginElement.style.display = 'block';
    }
    if (path === 'plugin') {
      iframePlugin.src = pluginUrl;
      document.body.appendChild(pluginElement);
    }
    loading = false;
  }
  if (msg?.type === 'on-frame-focus') {
    const { ottRes, autoOff } = msg;
    autoOffSetting = autoOff === 'true';
    const ott = ottRes?.data || '';
    if (!!ott !== isAuthenticated) {
      const pluginFrame = document.getElementById('buidler-plugin-frame');
      isAuthenticated = !!ott;
      pluginFrame?.contentWindow?.postMessage?.(
        { type: 'update-authenticate', payload: { ott } },
        '*'
      );
    }
    // iframePlugin.src = `${baseUrl}/plugin?external_url=${
    //   window.location.href
    // }&ott=${ottRes?.data || ''}&auto_off=${autoOff || ''}`;
    if (!autoOffSetting) {
      pluginElement.style.display = 'block';
    }
  }
  if (msg?.type === 'on-tab-update') {
    const { url } = msg;
    injectTwitterCast();
    const el = document.getElementById('buidler-plugin');
    const pluginFrame = document.getElementById('buidler-plugin-frame');
    if (el && pluginFrame) {
      if (el.style.opacity === '1') {
        updateIFrame({
          url,
        });
      } else {
        tabUpdated = true;
      }
    }
  }
  if (msg?.type === 'on-frame-update') {
    const { frame } = msg;
    const currentIframe = document.getElementById('buidler-iframe');
    if (currentIframe) {
      window.postMessage({ type: 'frame-update', frame }, '*');
    }
  }
});

if (
  !window.location.origin.includes(`community.${host}`) &&
  !window.location.origin.includes(`beta.${host}`) &&
  !window.location.origin.includes(host) &&
  !window.location.origin.includes('localhost') &&
  !existed
) {
  if (window.location.href === 'https://www.tesla.com/') {
    document.body.style.height = '100vh';
  }
  chrome.runtime.sendMessage(
    {
      type: 'on-load',
      url: window.location.href,
    },
    (callback) => {}
  );
}

injectTwitterCast();
handleMessage();
