const allResourceTypes = Object.values(
  chrome.declarativeNetRequest.ResourceType
);

const rules: any = [
  {
    id: 1,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      responseHeaders: [
        {
          operation: 'remove',
          header: 'x-frame-options',
        },
        {
          operation: 'remove',
          header: 'X-Frame-Options',
        },
        {
          operation: 'remove',
          header: 'content-security-policy',
        },
        {
          operation: 'remove',
          header: 'frame-ancestors',
        },
      ],
    },
    condition: {
      urlFilter: '*',
      resourceTypes: ['main_frame', 'sub_frame'],
    },
  },
];

export default rules;
