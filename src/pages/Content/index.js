import { host } from '../../constant';
import {
  handleMessage,
  injectFCPlugin,
  injectTwitterCast,
  handleTWChangeUrl,
  toggleBtnPlugin,
  injectHighlight,
} from '../../utils';
import { MediumHighlighter } from '../highlight/template';

window.customElements.define('medium-highlighter', MediumHighlighter);

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
    });
  }
  if (msg?.type === 'on-frame-focus') {
    // on-frame-focus
  }
  if (msg?.type === 'on-tab-update') {
    injectTwitterCast();
    handleTWChangeUrl(msg?.url);
  }
  if (msg?.type === 'on-frame-update') {
    // on-frame-update
  }
});

if (
  !window.location.origin.includes(`community.${host}`) &&
  !window.location.origin.includes(`beta.${host}`) &&
  !window.location.origin.includes(host) &&
  !window.location.origin.includes('localhost')
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
injectHighlight();
