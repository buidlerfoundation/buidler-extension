import Caller from '../../api/Caller';
import rules from './rules';

console.log('This is the background page.');
console.log('Put the background scripts here.');

const updateRules = (id, newAction) => {
  const newRules = rules.map((el) => {
    if (el.id === id && newAction) {
      return {
        ...el,
        action: newAction,
      };
    }
    return el;
  });
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: newRules.map((rule) => rule.id), // remove existing rules
    addRules: newRules,
  });
};

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
    const ottRes = await Caller.get('authentication/ott');
    if (sender?.tab?.id) {
      chrome.tabs.sendMessage(
        sender?.tab?.id,
        { type: 'on-inject-iframe', ottRes },
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

updateRules();
