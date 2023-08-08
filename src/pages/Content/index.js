let loading = true;
let panelOpen = false;
let autoOffSetting = false;

const getBubbleHeight = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? '130px' : '165px';
};

const getLoadingHeight = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? '90px' : '137px';
};

// main -> 90px
// detail -> 137px

// plugin loading
var loadingPlugin = document.createElement('div');
loadingPlugin.className = 'loading-container';
loadingPlugin.style.height = getLoadingHeight();
var loader = document.createElement('div');
loader.className = 'loader';

// iframe plugin
const existed = !!document.getElementById('buidler-plugin-frame');
var iframePlugin = document.createElement('iframe');
if (!existed) {
  iframePlugin.id = 'buidler-plugin-frame';
  iframePlugin.style.height = getBubbleHeight();
  iframePlugin.style.maxHeight = '1080px';
  iframePlugin.style.width = '430px';
  iframePlugin.frameBorder = 'none';
  iframePlugin.style.position = 'fixed';
  iframePlugin.style.zIndex = '9000000000000000000';
  iframePlugin.style.bottom = '0px';
  iframePlugin.style.right = '0px';
  iframePlugin.style.opacity = 0;
  iframePlugin.style.colorScheme = 'auto';
  iframePlugin.style.display = 'none';
  iframePlugin.style.border = 'none';
  iframePlugin.onload = () => {
    iframePlugin.style.opacity = 1;
    setTimeout(() => {
      loadingPlugin.remove();
    }, 2000);
  };
}

// iframe panel
var iframe = document.createElement('iframe');
iframe.id = 'buidler-panel-frame';
iframe.style.height = 'calc(100% - 40px)';
iframe.style.maxHeight = '1080px';
iframe.style.width = '390px';
iframe.style.position = 'fixed';
iframe.style.bottom = '20px';
iframe.style.right = '-390px';
iframe.style.zIndex = '9000000000000000000';
iframe.style.borderRadius = '10px';
iframe.frameBorder = 'none';
iframe.style.transition = 'transform 0.5s ease-out 0s';
iframe.style.transform = 'translateX(0px)';
iframe.style.boxShadow = '8px 8px 20px 0 #00000040';
iframe.style.colorScheme = 'auto';
iframe.onload = () => {};
const toggle = () => {
  const frame = document.getElementById('buidler-panel-frame');
  const pluginFrame = document.getElementById('buidler-plugin-frame');
  if (frame) {
    if (frame.style.transform === 'translateX(0px)') {
      frame.style.transform = 'translateX(calc(-410px))';
    } else {
      frame.style.transform = 'translateX(0px)';
    }
  }
  if (pluginFrame) {
    if (pluginFrame.style.display === 'none') {
      pluginFrame.style.display = 'block';
      if (pluginFrame.style.height !== '100vh') {
        pluginFrame?.contentWindow?.postMessage?.(
          { type: 'toggle-plugin' },
          '*'
        );
      }
    } else {
      pluginFrame?.contentWindow?.postMessage?.({ type: 'toggle-plugin' }, '*');
    }
  }
};
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  response();
  if (msg?.type === 'toggle-buidler-extension') {
    if (!loading || existed) {
      toggle();
      panelOpen = !panelOpen;
    }
  }
  if (msg?.type === 'on-inject-iframe') {
    const { ottRes, autoOff } = msg;
    autoOffSetting = autoOff === 'true';
    const path = 'plugin';
    const baseUrl = 'https://beta.buidler.app';
    const pluginUrl = `${baseUrl}/${path}?external_url=${
      window.location.href
    }&ott=${ottRes?.data || ''}&auto_off=${autoOff || ''}`;
    if (!autoOffSetting) {
      iframePlugin.style.display = 'block';
      loadingPlugin.appendChild(loader);
      document.body.appendChild(loadingPlugin);
    }
    if (path === 'plugin') {
      iframePlugin.src = pluginUrl;
      document.body.appendChild(iframePlugin);
    } else {
      iframe.src = pluginUrl;
      document.body.appendChild(iframe);
    }
    loading = false;
  }
  if (msg?.type === 'on-tab-update') {
    const { url } = msg;
    const pluginFrame = document.getElementById('buidler-plugin-frame');
    if (pluginFrame) {
      if (pluginFrame.style.height !== '100vh') {
        pluginFrame.style.height = getBubbleHeight();
      }
      pluginFrame?.contentWindow?.postMessage?.(
        { type: 'update-external', payload: url },
        '*'
      );
    }
  }
  if (msg?.type === 'on-frame-update') {
    const { frame } = msg;
    const currentIframe = document.getElementById('buidler-iframe');
    if (currentIframe) {
      window.postMessage({ type: 'frame-update', frame }, '*');
    }
  }
});

if (
  !window.location.origin.includes('community.buidler.app') &&
  !window.location.origin.includes('beta.buidler.app') &&
  !window.location.origin.includes('localhost') &&
  !existed
) {
  if (window.location.href === 'https://www.tesla.com/') {
    document.body.style.height = '100vh';
  }
  chrome.runtime.sendMessage(
    {
      type: 'on-load',
      url: window.location.href,
    },
    (callback) => {}
  );
}

window.addEventListener('message', (e) => {
  const pluginFrame = document.getElementById('buidler-plugin-frame');
  if (
    e.data.type === 'buidler-plugin-set-cookie' ||
    e.data.type === 'buidler-plugin-clear-cookie'
  ) {
    chrome.runtime.sendMessage(e.data, (resCallback) => {
      // handle call back
    });
  }
  if (pluginFrame) {
    if (e.data === 'show-plugin') {
      if (!autoOffSetting) {
        pluginFrame.style.display = 'block';
      }
    }
    if (e.data === 'hide-plugin') {
      pluginFrame.style.display = 'none';
    }
    if (e.data === 'open-plugin') {
      pluginFrame.style.height = '100vh';
    }
    if (e.data === 'close-plugin') {
      pluginFrame.style.height = getBubbleHeight();
    }
    if (e.data === 'open-plugin-menu') {
      pluginFrame.style.height = '650px';
    }
    if (e.data === 'close-plugin-menu') {
      pluginFrame.style.height = getBubbleHeight();
    }
  }
  if (e.data === 'toggle-panel') {
    toggle();
    panelOpen = !panelOpen;
  }
});

// highlight

// var selectionMenu = document.createElement('div');
// selectionMenu.id = 'selection-menu';

// function getParentParagraph(node) {
//   if (!node) return null;
//   if (node?.nodeName === 'P') {
//     return node;
//   } else {
//     return getParentParagraph(node?.parentNode);
//   }
// }

// function getTextOffset(parentContent, node, offset) {
//   return parentContent.indexOf(node.nodeValue) + offset;
// }

// document.addEventListener('click', function (e) {
//   if (panelOpen) {
//     iframe.style.transform = 'translateX(0px)';
//     panelOpen = false;
//   }
// });

// document.onmouseup = (e) => {
//   const selection = window.getSelection();
//   if (selection.toString()) {
//     console.log('XXX: ', e);
//     const p1 = getParentParagraph(selection.anchorNode);
//     const p2 = getParentParagraph(selection.focusNode);
//     if (p1 && p2 && p1.innerText === p2.innerText) {
//       const { layerX, layerY } = e;
//       const offset1 = getTextOffset(
//         p1.innerText,
//         selection.anchorNode,
//         selection.anchorOffset
//       );
//       const offset2 = getTextOffset(
//         p1.innerText,
//         selection.focusNode,
//         selection.focusOffset
//       );
//       const startOffset = Math.min(offset1, offset2);
//       const endOffset = Math.max(offset1, offset2);
//       const str = p1.innerText.substring(startOffset, endOffset);
//       const parentElement = [...document.querySelectorAll('p')].find(
//         (el) => el.innerText === p1.innerText
//       );
//       const newParent = parentElement.cloneNode();
//       let start = 0;
//       parentElement?.childNodes?.forEach((node, index) => {
//         const content = node.textContent || node.innerText;
//         const length = content.length;
//         const end = start + length;
//         const t1 = content?.substring(
//           0,
//           startOffset < start ? 0 : startOffset - start
//         );
//         const t2 = content?.substring(
//           startOffset < start ? 0 : startOffset - start,
//           endOffset - start
//         );
//         const t3 = content?.substring(endOffset - start);
//         if (node.childNodes?.length > 0) {
//           const newNode = node.cloneNode();
//           if (t1) {
//             newNode.appendChild(document.createTextNode(t1));
//           }
//           if (t2) {
//             const markNode = document.createElement('mark');
//             markNode.setAttribute('data-highlight', true);
//             markNode.innerText = t2;
//             newNode.appendChild(markNode);
//           }
//           if (t3) {
//             newNode.appendChild(document.createTextNode(t3));
//           }
//           newParent.appendChild(newNode);
//         } else {
//           if (t1) {
//             newParent.appendChild(document.createTextNode(t1));
//           }
//           if (t2) {
//             const markNode = document.createElement('mark');
//             markNode.setAttribute('data-highlight', true);
//             markNode.innerText = t2;
//             newParent.appendChild(markNode);
//           }
//           if (t3) {
//             newParent.appendChild(document.createTextNode(t3));
//           }
//         }
//         start = end;
//       });
//       parentElement.replaceWith(newParent);
//     }
//   }
// };
