const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);

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
      ]
    },
    condition: {
      urlFilter: '*',
      resourceTypes: allResourceTypes,
    }
  },
];

export default rules;
