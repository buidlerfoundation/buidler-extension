import rules from "./rules";

const updateRules = (cookie: chrome.cookies.Cookie) => {
  let newRules = rules;
  if (cookie && cookie.value) {
    newRules = newRules.map((el) => {
      if (el.id === 3) {
        return {
          ...el,
          action: {
            type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
            requestHeaders: [
              {
                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                header: "cookie",
                value: `_is_human=${cookie.value}`,
              },
              {
                operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                header: "referer",
                value: "https://bounties.gitcoin.co/grants/4268/zkrollupsxyz",
              },
            ],
            responseHeaders: [
              {
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                header: "x-frame-options",
              },
              {
                operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
                header: "content-security-policy",
              },
            ],
          },
        };
      }
      return el;
    });
  }
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: newRules.map((rule) => rule.id), // remove existing rules
    addRules: newRules,
  });
};

chrome.cookies.onChanged.addListener(({ cookie }) => {
  if (
    cookie &&
    cookie.domain === ".bounties.gitcoin.co" &&
    cookie.name === "_is_human" &&
    cookie.value
  ) {
    updateRules(cookie);
  }
});

chrome.cookies.get(
  { name: "_is_human", url: "https://bounties.gitcoin.co" },
  updateRules
);

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (
      details.method === "POST" &&
      details.initiator === "https://bounties.gitcoin.co"
    ) {
      const responseHeaders = details.responseHeaders;
      const cookieHeader = responseHeaders.find(
        (el) => el.name === "set-cookie"
      );
      const cookieValue = cookieHeader ? cookieHeader.value : null;
      if (cookieValue) {
        const splitted = cookieValue.split(";");
        splitted.forEach((el) => {
          if (el.includes("_is_human=")) {
            const humanId = el.split("=")?.[1];
            if (humanId) {
              chrome.cookies.set({
                domain: ".bounties.gitcoin.co",
                name: "_is_human",
                value: humanId,
                url: "https://bounties.gitcoin.co",
              });
            }
          }
        });
      }
    }
  },
  {
    urls: ["https://*.gitcoin.co/*"],
  },
  ["responseHeaders", "extraHeaders"]
);
