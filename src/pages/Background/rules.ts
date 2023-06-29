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
          header: 'x-frame-options',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: 'X-Frame-Options',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: 'content-security-policy',
        },
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: 'frame-ancestors',
        },
      ],
    },
    condition: {
      urlFilter: '*',
      resourceTypes: allResourceTypes,
    },
  },
];

export default rules;
