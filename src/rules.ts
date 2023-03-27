const allResourceTypes = Object.values(
  chrome.declarativeNetRequest.ResourceType
);

const rules: chrome.declarativeNetRequest.Rule[] = [
  {
    id: 1,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: "x-frame-options",
        },
      ],
    },
    condition: {
      urlFilter: "*",
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 2,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: "frame-ancestors",
        },
      ],
    },
    condition: {
      urlFilter: "*",
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 3,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: "cookie",
          value: "",
        },
      ],
    },
    condition: {
      urlFilter: "https://bounties.gitcoin.co/",
      resourceTypes: allResourceTypes,
    },
  },
];

export default rules;
