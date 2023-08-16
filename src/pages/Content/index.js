import { baseUrl, host } from '../../constant';

document.documentElement.setAttribute('buidler-extension', true);
let loading = true;
let panelOpen = false;
let autoOffSetting = false;
let lastVerticalPosition = 'bottom';
let lastHorizontalPosition = 'right';
let isAuthenticated = false;

const getBubbleHeight = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? '130px' : '165px';
};

const getBubbleHeightValue = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? 130 : 165;
};

const getLoadingHeight = () => {
  const isMainUrl = window.location.pathname === '/';
  return isMainUrl ? '90px' : '137px';
};

// main -> 90px
// detail -> 137px

// plugin loading
var loadingPlugin = document.createElement('div');
loadingPlugin.className = 'buidler-loading-container';
loadingPlugin.style.height = getLoadingHeight();
var loader = document.createElement('div');
loader.className = 'buidler-loader';

// iframe plugin
const existed = !!document.getElementById('buidler-plugin-frame');
var pluginElement = document.createElement('div');
var iframePlugin = document.createElement('iframe');
var move = document.createElement('div');
if (!existed) {
  pluginElement.id = 'buidler-plugin';
  pluginElement.style.height = getBubbleHeight();
  pluginElement.style.maxHeight = '1080px';
  pluginElement.style.width = '430px';
  pluginElement.style.position = 'fixed';
  pluginElement.style.bottom = '0px';
  pluginElement.style.right = '0px';
  pluginElement.style.zIndex = '9000000000000000000';
  pluginElement.style.opacity = 0;
  pluginElement.style.colorScheme = 'auto';
  pluginElement.style.display = 'none';
  move.id = 'buidler-plugin-move';
  move.className = 'buidler-move-container';
  iframePlugin.id = 'buidler-plugin-frame';
  iframePlugin.style.height = '100%';
  iframePlugin.style.width = '100%';
  iframePlugin.frameBorder = 'none';
  iframePlugin.style.border = 'none';
  iframePlugin.style.setProperty('margin', '0', 'important');
  iframePlugin.onload = () => {
    pluginElement.style.opacity = 1;
    loader.remove();
    // dragElement(pluginElement);
  };
  // pluginElement.appendChild(move);
  loadingPlugin.appendChild(loader);
  pluginElement.appendChild(iframePlugin);
  pluginElement.appendChild(loadingPlugin);
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
  const el = document.getElementById('buidler-plugin');
  const pluginFrame = document.getElementById('buidler-plugin-frame');
  if (frame) {
    if (frame.style.transform === 'translateX(0px)') {
      frame.style.transform = 'translateX(calc(-410px))';
    } else {
      frame.style.transform = 'translateX(0px)';
    }
  }
  if (el && pluginFrame) {
    if (el.style.display === 'none') {
      el.style.display = 'block';
      if (el.style.height !== '100vh') {
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
    const { ottRes, autoOff, uniqId } = msg;
    autoOffSetting = autoOff === 'true';
    const path = 'plugin';
    const ott = ottRes?.data || '';
    isAuthenticated = !!ott;
    const pluginUrl = `${baseUrl}/${path}?external_url=${
      window.location.href
    }&ott=${ott}&auto_off=${autoOff || ''}&extension_id=${uniqId}`;
    if (!autoOffSetting) {
      pluginElement.style.display = 'block';
    }
    if (path === 'plugin') {
      iframePlugin.src = pluginUrl;
      document.body.appendChild(pluginElement);
    } else {
      iframe.src = pluginUrl;
      document.body.appendChild(iframe);
    }
    loading = false;
  }
  if (msg?.type === 'on-frame-focus') {
    const { ottRes, autoOff } = msg;
    autoOffSetting = autoOff === 'true';
    const ott = ottRes?.data || '';
    if (!!ott !== isAuthenticated) {
      const pluginFrame = document.getElementById('buidler-plugin-frame');
      isAuthenticated = !!ott;
      pluginFrame?.contentWindow?.postMessage?.(
        { type: 'update-authenticate', payload: { ott } },
        '*'
      );
    }
    // iframePlugin.src = `${baseUrl}/plugin?external_url=${
    //   window.location.href
    // }&ott=${ottRes?.data || ''}&auto_off=${autoOff || ''}`;
    if (!autoOffSetting) {
      pluginElement.style.display = 'block';
    }
  }
  if (msg?.type === 'on-tab-update') {
    const { url } = msg;
    const el = document.getElementById('buidler-plugin');
    const pluginFrame = document.getElementById('buidler-plugin-frame');
    if (el && pluginFrame) {
      if (el.style.height !== '100vh') {
        loadingPlugin.style.height = getLoadingHeight();
        el.style.height = getBubbleHeight();
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
  !window.location.origin.includes(`community.${host}`) &&
  !window.location.origin.includes(`beta.${host}`) &&
  !window.location.origin.includes(host) &&
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
  const el = document.getElementById('buidler-plugin');
  const pluginFrame = document.getElementById('buidler-plugin-frame');
  if (
    e.data.type === 'buidler-plugin-set-cookie' ||
    e.data.type === 'buidler-plugin-clear-cookie'
  ) {
    if (e.data.type === 'buidler-plugin-clear-cookie') {
      isAuthenticated = false;
    }
    if (
      e.data.type === 'buidler-plugin-set-cookie' &&
      e.data.key === 'Buidler_access_token'
    ) {
      isAuthenticated = true;
    }
    chrome.runtime.sendMessage(e.data, (resCallback) => {
      // handle call back
    });
  }
  if (pluginFrame && el) {
    if (e.data === 'show-plugin') {
      if (!autoOffSetting) {
        el.style.display = 'block';
      }
    }
    if (e.data === 'hide-plugin') {
      el.style.display = 'none';
    }
    if (e.data === 'open-plugin') {
      // el.style.inset = `0px 0px 0px ${el.offsetLeft}px`;
      el.style.height = '100vh';
    }
    if (e.data === 'close-plugin') {
      // const top =
      //   lastVerticalPosition === 'top'
      //     ? 0
      //     : window.innerHeight - getBubbleHeightValue();
      // el.style.inset = `${top}px 0px 0px ${el.offsetLeft}px`;
      el.style.height = getBubbleHeight();
    }
    if (e.data === 'open-plugin-menu') {
      el.style.height = '650px';
    }
    if (e.data === 'close-plugin-menu') {
      el.style.height = getBubbleHeight();
    }
  }
  if (e.data === 'toggle-panel') {
    toggle();
    panelOpen = !panelOpen;
  }
});

function dragElement(elmnt) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  if (document.getElementById('buidler-plugin-move')) {
    // if present, the header is where you move the DIV from:
    document.getElementById('buidler-plugin-move').onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + 'px';
    elmnt.style.left = elmnt.offsetLeft - pos1 + 'px';
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
    console.log(
      elmnt.style.top,
      elmnt.style.left,
      elmnt.offsetTop - pos2,
      elmnt.offsetLeft - pos1
    );
    elmnt.style.top = getTop();
    elmnt.style.left = getLeft();
    const pluginFrame = document.getElementById('buidler-plugin-frame');
    pluginFrame?.contentWindow?.postMessage?.(
      {
        type: 'update-plugin-position',
        payload: {
          lastVerticalPosition,
          lastHorizontalPosition,
        },
      },
      '*'
    );
  }

  function getTop() {
    const lastTop = elmnt.offsetTop - pos2 + getBubbleHeightValue() / 2;
    if (lastTop / window.innerHeight >= 0.5) {
      lastVerticalPosition = 'bottom';
      return `calc(100% - ${getBubbleHeight()})`;
    }
    lastVerticalPosition = 'top';
    return '0px';
  }
  function getLeft() {
    const lastLeft = elmnt.offsetLeft - pos1 + 215;
    if (lastLeft / window.innerWidth >= 0.5) {
      lastHorizontalPosition = 'right';
      return 'calc(100% - 430px)';
    }
    lastHorizontalPosition = 'left';
    return '0px';
  }
}

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
