import { baseUrl, getUniqId, host } from '../../constant';

const autoOffKey = 'Buidler_auto_off_plugin';
const signerIdKey = 'Buidler_signer_id';
const openPluginKey = 'Buidler_open_plugin';

chrome.runtime.setUninstallURL('https://forms.gle/bPswAYF5VXttW9tH9');

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

try {
  chrome.runtime.onMessage.addListener(async (msg, sender, response) => {
    response();
    if (msg.type === 'on-load') {
      const storageSignerId = await chrome.storage.local.get(signerIdKey);
      const storageOpenPlugin = await chrome.storage.local.get(openPluginKey);
      const uniqId = await getUniqId();
      const signerId = storageSignerId[signerIdKey];
      const openPlugin = storageOpenPlugin[openPluginKey];
      if (sender?.tab?.id) {
        chrome.tabs.sendMessage(
          sender?.tab?.id,
          { type: 'on-inject-iframe', signerId, openPlugin, uniqId },
          (resCallback) => {
            // handle call back
          }
        );
      }
    }
    if (msg.type === 'buidler-plugin-set-cookie') {
      chrome.cookies.set({
        url: `${baseUrl}/`,
        name: msg.key,
        value: `${msg.value}`,
        sameSite: 'no_restriction',
        secure: true,
      });
      chrome.storage.local.set({ [msg.key]: `${msg.value}` });
    }
    if (msg.type === 'buidler-plugin-clear-cookie') {
      chrome.cookies.getAll({ domain: host }, function (cookies) {
        for (var i = 0; i < cookies.length; i++) {
          chrome.cookies.remove({
            url: baseUrl + cookies[i].path,
            name: cookies[i].name,
          });
        }
      });
      chrome.storage.local.clear();
    }
  });

  chrome.tabs.onActivated.addListener(async (info) => {
    if (info.tabId) {
      const storageAutoOff = await chrome.storage.local.get(autoOffKey);
      const autoOff = storageAutoOff[autoOffKey];
      chrome.tabs.sendMessage(
        info.tabId,
        { type: 'on-frame-focus', autoOff },
        (resCallback) => {
          // handle call back
        }
      );
    }
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
      chrome.webNavigation.getAllFrames({ tabId: tab.id }, (e) => {
        const frame = e?.find(
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
} catch (error) {
  console.log(error);
}

// chrome.declarativeNetRequest.updateDynamicRules({
//   removeRuleIds: rules.map((rule) => rule.id), // remove existing rules
//   addRules: rules,
// });

// let microsecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
// let oneWeekAgo = new Date().getTime() - microsecondsPerWeek;
// chrome.history.search(
//   {
//     text: '', // Return every history item....
//     startTime: oneWeekAgo, // that was accessed less than one week ago.
//   },
//   function (historyItems) {
//     console.log(historyItems);
//   }
// );
