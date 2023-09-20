import { host } from '../../constant';
import { handleMessage, injectFCPlugin, injectTwitterCast } from '../../utils';

document.documentElement.setAttribute('buidler-extension', true);

const toggle = () => {};
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  response();
  if (msg?.type === 'toggle-buidler-extension') {
    toggle();
  }
  if (msg?.type === 'on-inject-iframe') {
    // on-inject-iframe
    injectFCPlugin(msg?.signerId);
  }
  if (msg?.type === 'on-frame-focus') {
    // on-frame-focus
  }
  if (msg?.type === 'on-tab-update') {
    injectTwitterCast();
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
