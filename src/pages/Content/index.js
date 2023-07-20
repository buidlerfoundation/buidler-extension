let loading = true;
let panelOpen = false;
let autoOffSetting = false;

const getBubbleHeight = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? '130px' : '165px';
};

// main -> 110px
// detail -> 145px

// iframe plugin
var iframePlugin = document.createElement('iframe');
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
iframePlugin.onload = () => {
  iframePlugin.style.opacity = 1;
};

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
    if (iframePlugin.style.display === 'none') {
      iframePlugin.style.display = 'block';
      if (iframePlugin.style.height !== '100vh') {
        iframePlugin?.contentWindow?.postMessage?.(
          { type: 'toggle-plugin' },
          '*'
        );
      }
    } else {
      iframePlugin?.contentWindow?.postMessage?.(
        { type: 'toggle-plugin' },
        '*'
      );
    }
  }
};
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  response();
  if (msg?.type === 'toggle-buidler-extension') {
    if (!loading) {
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
    if (path === 'plugin') {
      iframePlugin.src = pluginUrl;
      document.body.appendChild(iframePlugin);
    } else {
      iframe.src = pluginUrl;
      document.body.appendChild(iframe);
    }
    document.addEventListener('click', function (e) {
      if (panelOpen) {
        iframe.style.transform = 'translateX(0px)';
        panelOpen = false;
      }
    });
    loading = false;
  }
  if (msg?.type === 'on-tab-update') {
    const { url } = msg;
    const pluginFrame = document.getElementById('buidler-plugin-frame');
    if (pluginFrame) {
      if (iframePlugin.style.height !== '100vh') {
        iframePlugin.style.height = getBubbleHeight();
      }
      iframePlugin?.contentWindow?.postMessage?.(
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
  !window.location.origin.includes('localhost')
) {
  chrome.runtime.sendMessage(
    {
      type: 'on-load',
      url: window.location.href,
    },
    (callback) => {}
  );
}

window.addEventListener('message', (e) => {
  if (e.data.type === 'buidler-plugin-set-cookie') {
    chrome.runtime.sendMessage(e.data, (resCallback) => {
      // handle call back
    });
  }
  if (e.data === 'show-plugin') {
    if (!autoOffSetting) {
      iframePlugin.style.display = 'block';
    }
  }
  if (e.data === 'hide-plugin') {
    iframePlugin.style.display = 'none';
  }
  if (e.data === 'toggle-panel') {
    toggle();
    panelOpen = !panelOpen;
  }
  if (e.data === 'open-plugin') {
    iframePlugin.style.height = '100vh';
  }
  if (e.data === 'close-plugin') {
    iframePlugin.style.height = getBubbleHeight();
  }
  if (e.data === 'open-plugin-menu') {
    iframePlugin.style.height = '650px';
  }
  if (e.data === 'close-plugin-menu') {
    iframePlugin.style.height = getBubbleHeight();
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

// document.onmouseup = (e) => {
//   const selection = window.getSelection();
//   const p1 = getParentParagraph(selection.anchorNode);
//   const p2 = getParentParagraph(selection.focusNode);
//   if (p1 && p2 && p1.innerText === p2.innerText) {
//     const { layerX, layerY } = e;
//     const offset1 = getTextOffset(
//       p1.innerText,
//       selection.anchorNode,
//       selection.anchorOffset
//     );
//     const offset2 = getTextOffset(
//       p1.innerText,
//       selection.focusNode,
//       selection.focusOffset
//     );
//     const startOffset = Math.min(offset1, offset2);
//     const endOffset = Math.max(offset1, offset2);
//     const str = p1.innerText.substring(startOffset, endOffset);
//     const parentElement = [...document.querySelectorAll('p')].find(
//       (el) => el.innerText === p1.innerText
//     );
//     const textNode1 = document.createTextNode(
//       p1.innerText?.substring(0, startOffset)
//     );
//     const textNode2 = document.createTextNode(
//       p1.innerText?.substring(endOffset)
//     );
//     const spanNode = document.createElement('span');
//     spanNode.style.background = 'red';
//     spanNode.innerText = p1.innerText?.substring(startOffset, endOffset);
//     parentElement.replaceChildren([]);
//     parentElement.appendChild(textNode1);
//     parentElement.appendChild(spanNode);
//     parentElement.appendChild(textNode2);
//     // let start = 0;
//     // parentElement?.childNodes?.forEach((node, index) => {
//     //   const content = node.textContent || node.innerText;
//     //   const length = content.length;
//     //   const end = start + length;
//     //   // if (start >= startOffset && end <= endOffset) {
//     //   //   const spanNode = document.createElement('span');
//     //   //   spanNode.innerText = content;
//     //   //   spanNode.style.background = 'red';
//     //   //   node.replaceWith(spanNode);
//     //   // } else if (start <= startOffset && end >= endOffset) {

//     //   // }
//     //   // console.log('XXX: ', node, index, start, end);
//     //   const textNode1 = document.createTextNode(
//     //     content?.substring(0, startOffset - start)
//     //   );
//     //   const textNode2 = document.createTextNode(
//     //     content?.substring(end - endOffset)
//     //   );
//     //   const spanNode = document.createElement('span');
//     //   spanNode.style.background = 'red';
//     //   spanNode.innerText = content?.substring(
//     //     startOffset - start,
//     //     end - endOffset
//     //   );
//     //   start = end;
//     // });
//     console.log(
//       parentElement?.childNodes,
//       selection,
//       startOffset,
//       endOffset,
//       str
//     );
//     // const nodeValue = selection?.focusNode?.nodeValue;
//     // const { anchorOffset, focusOffset } = selection;
//     // const startOffset = Math.min(anchorOffset, focusOffset);
//     // const endOffset = Math.max(anchorOffset, focusOffset);
//     // const selectionValue = nodeValue?.substring(startOffset, endOffset);
//     // const selectedElement = [...parentElement.childNodes].find(
//     //   (el) => el.nodeName === '#text' && el.nodeValue === nodeValue
//     // );
//     // const textNode1 = document.createTextNode(
//     //   nodeValue?.substring(0, startOffset)
//     // );
//     // const textNode2 = document.createTextNode(nodeValue?.substring(endOffset));
//     // const spanNode = document.createElement('span');
//     // spanNode.style.background = 'red';
//     // spanNode.innerText = selectionValue;
//     // parentElement.insertBefore(textNode1, selectedElement);
//     // parentElement.insertBefore(spanNode, selectedElement);
//     // parentElement.insertBefore(textNode2, selectedElement);
//     // parentElement.removeChild(selectedElement);
//     // console.log(
//     //   selection,
//     //   layerX,
//     //   layerY,
//     //   startOffset,
//     //   endOffset,
//     //   selectionValue,
//     //   selectedElement
//     // );
//   }
// };
