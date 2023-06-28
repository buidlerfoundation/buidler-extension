import Caller from '../../api/Caller';

console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url?.includes('http')) {
    // const res = await Caller.get('authentication/ott');
    chrome.tabs.sendMessage(
      tab.id,
      // { type: 'toggle-buidler-extension', ott: res?.data },
      { type: 'toggle-buidler-extension' },
      (resCallback) => {
        // handle call back
      }
    );
  }
});

chrome.runtime.onMessage.addListener(async (msg, sender, response) => {
  if (msg.type === 'on-load') {
    const externalRes = await Caller.get(`external?url=${msg.url}`);
    const ottRes = await Caller.get('authentication/ott');
    if (sender?.tab?.id) {
      chrome.tabs.sendMessage(
        sender?.tab?.id,
        { type: 'on-inject-iframe', externalRes, ottRes },
        (resCallback) => {
          // handle call back
        }
      );
    }
  }
  if (msg.type === 'buidler-plugin-set-cookie') {
    chrome.cookies.set({
      url: 'https://staging.community.buidler.app/',
      name: msg.key,
      value: `${msg.value}`,
      sameSite: 'no_restriction',
      secure: true,
    });
    chrome.storage.local.set({ [msg.key]: `${msg.value}` });
  }
  response();
});
