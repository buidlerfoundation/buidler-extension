import React from 'react';
import ReactDOM from 'react-dom/client';
import TwitterCast from '../pages/Components/TwitterCast';
import TwitterQuickCast from '../pages/Components/TwitterQuickCast';
import FCPlugin from '../pages/Components/FCPlugin';
import AlertItem from '../pages/Components/AlertItem';
import TwitterAction from '../pages/Components/TwitterAction';
import { getMetadata } from '../pages/Content/htmlParser';
import ProfileInsights from '../pages/Components/ProfileInsights';
import { host } from '../constant';

export const apiBaseUrl = 'https://prod.api.buidler.app/';
export const baseUrl = `https://${host}/`;
export const regexUsername =
  /^\/([a-zA-Z0-9.]+)(\/casts-and-replies|\/likes|\/channels)?$/;

let lastVerticalPosition = 'bottom';
let lastHorizontalPosition = 'right';
let updatedMetadata = false;

export let autoOffSetting = false;
export let isAuthenticated = false;

export const isMainUrl = () =>
  window.location.pathname === '/' &&
  !window.location.search &&
  !window.location.hash;

export const getBubbleHeight = () => {
  return isMainUrl() ? '130px' : '165px';
};

export const getBubbleHeightValue = () => {
  return isMainUrl() ? 130 : 165;
};

export const getLoadingHeight = () => {
  return isMainUrl() ? '90px' : '137px';
};

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

export const showFCAlert = (url) => {
  const alertContainer = document.getElementById('fc-plugin-alert');
  if (alertContainer) {
    const div = document.createElement('div');
    const id = `${Math.random()}`;
    div.id = id;
    if (!alertContainer.firstChild) {
      alertContainer.appendChild(div);
    } else {
      alertContainer.insertBefore(div, alertContainer.firstChild);
    }
    const element = ReactDOM.createRoot(div);
    element.render(<AlertItem url={url} id={id} />);
  }
};

const onClearData = () => {
  const quickCast = document.getElementById('buidler-tweet-quick-cast');
  const quickCastExpand = document.getElementById(
    'buidler-tweet-quick-cast-expand'
  );
  if (quickCast) {
    quickCast.style.display = 'none';
  }
  if (quickCastExpand) {
    quickCastExpand.style.display = 'none';
  }
};

export const handleEventClick = () => {
  window.addEventListener('click', (e) => {
    const fcPluginFrame = getFCPluginFrame();
    const dataOpen = fcPluginFrame?.getAttribute('data-open');
    if (dataOpen === 'true') {
      toggleBtnPlugin();
    }
  });
};

export const handleMessage = () => {
  window.addEventListener('message', (e) => {
    if (
      e.data.type === 'buidler-plugin-set-cookie' ||
      e.data.type === 'buidler-plugin-clear-cookie'
    ) {
      if (e.data.type === 'buidler-plugin-clear-cookie') {
        isAuthenticated = false;
        onClearData();
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
    if (e.data.type === 'b-fc-plugin-open-tab') {
      showFCAlert(e.data.url);
    }
    if (e.data.type === 'b-fc-copy-content') {
      navigator.clipboard.writeText(e.data.payload);
    }
    if (e.data.type === 'b-fc-update-theme') {
      document.body.className = e.data.payload;
    }
  });
};

export const getFCPluginFrame = () => {
  return document.querySelector('#fc-plugin-frame');
};

export const getFCPlugin = () => {
  return document.querySelector('#buidler-fc-plugin');
};

export const appendTwitterQuickCastExpand = () => {
  const quickCast = document.getElementById('buidler-tweet-quick-cast-expand');
  if (quickCast) return;
  const dialog = document.querySelector('div[role="dialog"]');
  if (!dialog) return;
  const toolBar = dialog.querySelector('div[data-testid="toolBar"]');
  if (!toolBar) return;
  const inlineButton = toolBar.querySelector('div[data-testid="tweetButton"]');
  if (inlineButton && inlineButton.innerText === 'Reply') return;
  const div = document.createElement('div');
  div.id = 'buidler-tweet-quick-cast-expand';
  const fcPluginFrame = getFCPluginFrame();
  if (!fcPluginFrame?.getAttribute('data-signer-id')) {
    div.style.display = 'none';
  }
  const postButtonEl = toolBar?.childNodes?.[1];
  postButtonEl?.insertBefore(div, postButtonEl.firstChild);
  const element = ReactDOM.createRoot(div);
  element.render(<TwitterQuickCast parentElement={dialog} />);
};

export const appendTwitterQuickCast = () => {
  const quickCast = document.getElementById('buidler-tweet-quick-cast');
  if (quickCast) return;
  const dialog = document.querySelector('div[role="dialog"]');
  if (dialog) return;
  const toolBar = document.querySelector('div[data-testid="toolBar"]');
  if (!toolBar) return;
  const div = document.createElement('div');
  div.id = 'buidler-tweet-quick-cast';
  const fcPluginFrame = getFCPluginFrame();
  if (!fcPluginFrame?.getAttribute('data-signer-id')) {
    div.style.display = 'none';
  }
  const postButtonEl = toolBar?.childNodes?.[1];
  postButtonEl?.insertBefore(div, postButtonEl.firstChild);
  const element = ReactDOM.createRoot(div);
  element.render(<TwitterQuickCast />);
};

export const twTheme = () => {
  const bg = document.body.style.backgroundColor;
  return bg === 'rgb(0, 0, 0)'
    ? 'dark'
    : bg === 'rgb(21, 32, 43)'
    ? 'dim'
    : 'light';
};

export const appendTwitterCastElement = () => {
  const articles = document.querySelectorAll('article');
  articles.forEach((article, idx) => {
    const dataTestId = article.getAttribute('data-testid');
    const tabIndex = article.getAttribute('tabindex');
    if (dataTestId === 'tweet') {
      const div = document.createElement('div');
      div.id = `buidler-tweet-cast`;
      div.style.display = 'none';
      if (!article.querySelector(`#buidler-tweet-cast`)) {
        if (tabIndex === '-1') {
          article.childNodes?.[0]?.appendChild(div);
        } else {
          const node =
            article.childNodes?.[0]?.childNodes?.[0]?.childNodes?.[1]
              ?.childNodes?.[1];
          node?.appendChild(div);
        }
        const element = ReactDOM.createRoot(div);
        element.render(
          <TwitterCast article={article} index={idx} theme={twTheme()} />
        );
        const actionElementGroup = article.querySelector('div[role="group"]');
        if (actionElementGroup) {
          const actionDiv = document.createElement('div');
          actionDiv.id = `tweet-cast-action`;
          actionDiv.style.flex = '1';
          actionDiv.style.alignSelf = 'center';
          actionElementGroup.insertBefore(
            actionDiv,
            actionElementGroup.lastChild
          );
          const FCElement = ReactDOM.createRoot(actionDiv);
          FCElement.render(
            <TwitterAction twCastElement={div} article={article} index={idx} />
          );
        }
      }
    }
  });
};

export const updateColorButtonDiscussion = (active) => {
  const btnDiscussion = document.getElementById('b-btn-discussion');
  if (btnDiscussion) {
    btnDiscussion.style.setProperty(
      '--color-icon',
      active ? 'var(--color-primary-text)' : 'var(--color-secondary-text)'
    );
    if (active) {
      btnDiscussion.style.backgroundColor = 'var(--color-background-5)';
    } else {
      btnDiscussion.style.backgroundColor = 'unset';
    }
  }
};

export const updateColorButtonInsights = (active) => {
  const btnInsights = document.getElementById('b-btn-insights');
  if (btnInsights) {
    btnInsights.style.setProperty(
      '--color-icon',
      active ? 'var(--color-primary-text)' : 'var(--color-secondary-text)'
    );
    if (active) {
      btnInsights.style.backgroundColor = 'var(--color-background-5)';
    } else {
      btnInsights.style.backgroundColor = 'unset';
    }
  }
};

export const handleTWChangeUrl = (url) => {
  updatedMetadata = false;
  const fcPluginFrame = getFCPluginFrame();
  const dataOpen = fcPluginFrame?.getAttribute('data-open');
  if (fcPluginFrame) {
    const btnDiscussion = document.getElementById('b-btn-discussion');
    const btnInsights = document.getElementById('b-btn-insights');
    const metadata = getMetadata();
    let username = '';
    if (url?.includes('https://warpcast.com')) {
      const path = url.replace('https://warpcast.com', '');
      username = regexUsername.exec(path)?.[1];
      btnDiscussion.style.display = 'flex';
      btnInsights.style.display = 'flex';
    } else {
      btnDiscussion.style.display = 'none';
      btnInsights.style.display = 'none';
    }
    if (!username) {
      fcPluginFrame?.contentWindow?.postMessage?.(
        {
          type: 'b-fc-navigate',
          payload: '/plugin-fc',
        },
        '*'
      );
      updateColorButtonInsights(false);
      updateColorButtonDiscussion(true);
    } else {
      fcPluginFrame?.contentWindow?.postMessage?.(
        {
          type: 'b-fc-navigate',
          payload: `/plugin-fc/insights/${username}`,
        },
        '*'
      );
      updateColorButtonInsights(true);
      updateColorButtonDiscussion(false);
    }
    if (url?.includes('https://twitter.com')) {
      const twSidebar = document.querySelector(
        'div[data-testid="sidebarColumn"]'
      );
      if (twSidebar) {
        if (dataOpen) {
          twSidebar.style.display = 'none';
        }
      }
    }
    if (dataOpen === 'true') {
      toggleBtnPlugin();
    }
    fcPluginFrame?.contentWindow?.postMessage?.(
      { type: 'b-fc-update-tw-url', payload: { url, ...metadata } },
      '*'
    );
    window.dispatchEvent(
      new CustomEvent('b-fc-update-tw-url', { detail: url })
    );
  }
};

// const handleTWTheme = () => {
//   if (
//     document.body.style.backgroundColor === 'rgb(255, 255, 255)' &&
//     !document.body.className.includes('light')
//   ) {
//     document.body.className = 'light';
//     const fcPluginFrame = getFCPluginFrame();
//     fcPluginFrame?.contentWindow?.postMessage?.(
//       { type: 'b-fc-update-tw-theme', payload: 'light' },
//       '*'
//     );
//   }
//   if (
//     document.body.style.backgroundColor === 'rgb(21, 32, 43)' &&
//     !document.body.className.includes('dim')
//   ) {
//     document.body.className = 'dim';
//     const fcPluginFrame = getFCPluginFrame();
//     fcPluginFrame?.contentWindow?.postMessage?.(
//       { type: 'b-fc-update-tw-theme', payload: 'dim' },
//       '*'
//     );
//   }
//   if (
//     document.body.style.backgroundColor === 'rgb(0, 0, 0)' &&
//     !document.body.className.includes('dark')
//   ) {
//     document.body.className = 'dark';
//     const fcPluginFrame = getFCPluginFrame();
//     fcPluginFrame?.contentWindow?.postMessage?.(
//       { type: 'b-fc-update-tw-theme', payload: 'dark' },
//       '*'
//     );
//   }
// };

const handleTWDialog = () => {
  const fcPlugin = getFCPlugin();
  const mask = document.querySelector('div[data-testid="mask"]');
  if (fcPlugin) {
    if (mask && fcPlugin.style.display !== 'none') {
      fcPlugin.style.display = 'none';
    }
    if (!mask && fcPlugin.style.display !== 'block') {
      fcPlugin.style.display = 'block';
    }
  }
};

export const appendProfileInsights = () => {
  if (!document.getElementById('profile-insights')) {
    const profileElement = document.querySelector('a[title*="Users followed"]')
      ?.parentNode?.parentNode;
    if (profileElement) {
      const div = document.createElement('div');
      div.id = 'profile-insights';
      profileElement.appendChild(div);
      const element = ReactDOM.createRoot(div);
      element.render(<ProfileInsights />);
    }
  }
};

export const getWCUsername = () => {
  if (window.location.origin === 'https://warpcast.com') {
    const username = regexUsername.exec(window.location.pathname)?.[1];
    return username;
  }
  return null;
};

export const injectWarpcastInsights = (path = window.location.pathname) => {
  if (window.location.origin === 'https://warpcast.com') {
    const username = regexUsername.exec(path)?.[1];
    if (username) {
      function onHTMLChange() {
        appendProfileInsights();
        if (document.getElementById('profile-insights')) {
          document.documentElement.removeEventListener(
            'DOMSubtreeModified',
            onHTMLChange
          );
        }
      }
      document.documentElement.removeEventListener(
        'DOMSubtreeModified',
        onHTMLChange
      );
      document.documentElement.addEventListener(
        'DOMSubtreeModified',
        onHTMLChange
      );
    }
  }
};

export const injectTwitterCast = () => {
  if (window.location.origin === 'https://twitter.com') {
    function onHTMLChange() {
      // appendTwitterQuickCast();
      // appendTwitterQuickCastExpand();
      appendTwitterCastElement();
      // handleTWDialog();
      const metadata = getMetadata();
      if (
        metadata.icon &&
        metadata.image &&
        metadata.site_name &&
        metadata.title &&
        !updatedMetadata
      ) {
        updateMetadata({
          metadata: { ...metadata, title: document.title },
          url: window.location.href,
        });
        updatedMetadata = true;
      }
    }
    document.documentElement.removeEventListener(
      'DOMSubtreeModified',
      onHTMLChange
    );
    document.documentElement.addEventListener(
      'DOMSubtreeModified',
      onHTMLChange
    );
  } else {
    if (!updatedMetadata) {
      const metadata = getMetadata();
      updateMetadata({
        metadata,
        url: window.location.href,
      });
      updatedMetadata = true;
    }
  }
};

export const injectFCPlugin = (params) => {
  const div = document.createElement('div');
  div.id = 'buidler-fc-plugin';
  document.body.appendChild(div);
  div.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  const element = ReactDOM.createRoot(div);
  const username = getWCUsername();
  element.render(
    <FCPlugin
      signerId={params?.signerId}
      initialUsername={username}
      uniqId={params?.uniqId}
      isWarpcast={window.location.origin === 'https://warpcast.com'}
    />
  );
};

export const toggleBtnPlugin = () => {
  const element = document.getElementById('btn-fc-plugin');
  if (element) {
    if (element.style.display === 'none') {
      element.style.display = 'block';
    } else {
      element?.click?.();
    }
  }
};

export const getCountByUrls = (urls) => {
  const params = new URLSearchParams();
  urls.forEach((url) => {
    params.append('urls[]', url);
  });
  return fetch(`${apiBaseUrl}counter/casts?${params}`);
};

export const getUsersByName = (name) => {
  return fetch(`${apiBaseUrl}users?username=${name}&limit=20`);
};

export const updateMetadata = (payload) => {
  fetch(apiBaseUrl + 'metadata/url', {
    method: 'post',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const toggleModalCompose = () => {
  const modalCompose = document.getElementById('fc-plugin-modal-compose');
  if (modalCompose.style.display === 'none') {
    modalCompose.style.display = 'block';
  } else {
    modalCompose.style.display = 'none';
  }
};

export const toggleModalReply = () => {
  const modalReply = document.getElementById('fc-plugin-modal-reply');
  if (modalReply.style.display === 'none') {
    modalReply.style.display = 'block';
  } else {
    modalReply.style.display = 'none';
  }
};

export const regexUrl =
  /((https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#(?&//=]*))/gim;

const insertHttpIfNeed = (str) => {
  if (!str) return '';
  if (str.includes('http')) {
    return str;
  }
  return `https://${str}`;
};

export const normalizeContentUrl = (string) => {
  return string
    .split(' ')
    .map((str) => {
      if (str.includes('..') || (str.includes('@') && !str.includes('/')))
        return str;
      return str.replace(
        regexUrl,
        `<a href='${insertHttpIfNeed(
          str.match(regexUrl)?.[0]
        )}' class='mention-string' target='_blank'>$1</a>`
      );
    })
    .join(' ');
};

export const normalizeContentCast = (cast) => {
  let res = cast.text;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder('utf-8');
  const byteArray = encoder.encode(cast.text);
  if (cast.mentions_positions.length > 0) {
    const outputByteArray = [];
    let start = 0;
    cast.mentions_positions.forEach((el, idx) => {
      if (cast.mentions?.[idx]) {
        const newByte = Array.from(
          encoder.encode(`@${cast.mentions?.[idx]?.username}`)
        );
        outputByteArray.push(...Array.from(byteArray.slice(start, el)));
        outputByteArray.push(...newByte);
        start = el;
      }
    });
    outputByteArray.push(
      ...Array.from(
        byteArray.slice(
          cast.mentions_positions[cast.mentions_positions.length - 1]
        )
      )
    );
    res = decoder.decode(new Uint8Array(outputByteArray));
  }
  res = res.split('\n').map(normalizeContentUrl).join('\n');
  cast.mentions.forEach((el) => {
    const regex = new RegExp(`@${el.username}`, 'gim');
    res = res.replace(
      regex,
      `<a href='https://warpcast.com/${el.username}' class="mention-string" target='_blank'>@${el.username}</a>`
    );
  });
  return res;
};

export const extractContent = (s) => {
  const span = document.createElement('span');
  span.innerHTML = s
    .replace(/<div>(.*?)<\/div>/gim, '<br>$1')
    .replace(/<br>/gim, '\n');
  return span.textContent || span.innerText;
};

export const getLastIndexOfMention = (s) => {
  const mentionRegex =
    /(<a class="mention-string" data-fid=".*?">)(.*?)(<\/a>)/g;
  const mentionMatches = s.match(mentionRegex) || [];
  if (mentionMatches?.length > 0) {
    return s.lastIndexOf(mentionMatches[mentionMatches.length - 1]);
  }
  return -1;
};

export const MAXIMUM_LENGTH = 320;

export const getTextLength = (s) => {
  const value = extractContent(s);
  const encoder = new TextEncoder();
  const byteArray = encoder.encode(value.trim());
  return byteArray.length;
};
