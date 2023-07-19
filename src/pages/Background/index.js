import Caller from '../../api/Caller';
import rules from './rules';

const autoOffKey = 'Buidler_auto_off_plugin';

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
  response();
  if (msg.type === 'on-load') {
    const ottRes = await Caller.get('authentication/ott');
    const storageAutoOff = await chrome.storage.local.get(autoOffKey);
    const autoOff = storageAutoOff[autoOffKey];
    if (sender?.tab?.id) {
      chrome.tabs.sendMessage(
        sender?.tab?.id,
        { type: 'on-inject-iframe', ottRes, autoOff },
        (resCallback) => {
          // handle call back
        }
      );
    }
  }
  if (msg.type === 'buidler-plugin-set-cookie') {
    chrome.cookies.set({
      url: 'https://beta.buidler.app/',
      name: msg.key,
      value: `${msg.value}`,
      sameSite: 'no_restriction',
      secure: true,
    });
    chrome.storage.local.set({ [msg.key]: `${msg.value}` });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'loading') {
    chrome.webNavigation.getAllFrames({ tabId: tab.id }, (e) => {
      const frame = e.find(
        (el) =>
          el.parentFrameId === 0 &&
          !el.url.includes('https://verify.walletconnect.com')
      );
      if (frame) {
        chrome.tabs.sendMessage(
          tabId,
          {
            type: 'on-frame-update',
            frame,
          },
          (resCallback) => {
            // handle call back
          }
        );
      }
    });
  }
  if (changeInfo.url) {
    chrome.tabs.sendMessage(
      tabId,
      {
        type: 'on-tab-update',
        url: changeInfo.url,
      },
      (resCallback) => {
        // handle call back
      }
    );
  }
});

updateRules();
