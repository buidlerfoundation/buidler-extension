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
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: "content-security-policy",
        },
      ],
    },
    condition: {
      urlFilter: "https://bounties.gitcoin.co/",
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 4,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: "content-security-policy",
        },
      ],
    },
    condition: {
      urlFilter: "https://github.com/*",
      resourceTypes: allResourceTypes,
    },
  },
  {
    id: 5,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      responseHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.REMOVE,
          header: "content-security-policy",
        },
      ],
    },
    condition: {
      urlFilter: "https://github.com/*",
      resourceTypes: allResourceTypes,
    },
  },
];

export const actionUpdateGitCoinReqHeader: (
  value: string
) => chrome.declarativeNetRequest.RuleAction = (value) => ({
  type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
  requestHeaders: [
    {
      operation: chrome.declarativeNetRequest.HeaderOperation.SET,
      header: "cookie",
      value: `_is_human=${value}`,
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
});

export const actionUpdateGithubReqHeader: (value: string) => chrome.declarativeNetRequest.RuleAction =
  (value: string, octo?: string) => ({
    type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
    requestHeaders: [
      {
        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        header: "cookie",
        value,
      },
    ],
  });

export default rules;
