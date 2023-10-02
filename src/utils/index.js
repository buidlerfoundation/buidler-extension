import React from 'react';
import ReactDOM from 'react-dom/client';
import TwitterCast from '../pages/Components/TwitterCast';
import TwitterQuickCast from '../pages/Components/TwitterQuickCast';
import FCPlugin from '../pages/Components/FCPlugin';
import AlertItem from '../pages/Components/AlertItem';
import TwitterAction from '../pages/Components/TwitterAction';

let lastVerticalPosition = 'bottom';
let lastHorizontalPosition = 'right';

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
  });
};

export const getFCPluginFrame = () => {
  return document.querySelector('#fc-plugin-frame');
};

const getFCPlugin = () => {
  return document.querySelector('#buidler-fc-plugin');
};

export const twTheme = () => {
  const bg = document.body.style.backgroundColor;
  return bg === 'rgb(0, 0, 0)'
    ? 'dark'
    : bg === 'rgb(21, 32, 43)'
    ? 'dim'
    : 'light';
};

export const appendTwitterQuickCastExpand = () => {
  const quickCast = document.getElementById('buidler-tweet-quick-cast-expand');
  if (quickCast) return;
  const dialog = document.querySelector('div[role="dialog"]');
  if (!dialog) return;
  const toolBar = dialog.querySelector('div[data-testid="toolBar"]');
  if (!toolBar) return;
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
        element.render(<TwitterCast article={article} index={idx} />);
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

export const handleTWChangeUrl = (url) => {
  const fcPluginFrame = getFCPluginFrame();
  if (fcPluginFrame) {
    if (url?.includes('https://twitter.com')) {
      const twSidebar = document.querySelector(
        'div[data-testid="sidebarColumn"]'
      );
      const dataOpen = fcPluginFrame?.getAttribute('data-open');
      if (twSidebar) {
        if (dataOpen) {
          twSidebar.style.display = 'none';
        }
      }
    }
    fcPluginFrame?.contentWindow?.postMessage?.(
      { type: 'b-fc-update-tw-url', payload: url },
      '*'
    );
  }
};

const handleTWTheme = () => {
  if (
    document.body.style.backgroundColor === 'rgb(255, 255, 255)' &&
    !document.body.className.includes('light')
  ) {
    document.body.className = 'light';
    const fcPluginFrame = getFCPluginFrame();
    fcPluginFrame?.contentWindow?.postMessage?.(
      { type: 'b-fc-update-tw-theme', payload: 'light' },
      '*'
    );
  }
  if (
    document.body.style.backgroundColor === 'rgb(21, 32, 43)' &&
    !document.body.className.includes('dim')
  ) {
    document.body.className = 'dim';
    const fcPluginFrame = getFCPluginFrame();
    fcPluginFrame?.contentWindow?.postMessage?.(
      { type: 'b-fc-update-tw-theme', payload: 'dim' },
      '*'
    );
  }
  if (
    document.body.style.backgroundColor === 'rgb(0, 0, 0)' &&
    !document.body.className.includes('dark')
  ) {
    document.body.className = 'dark';
    const fcPluginFrame = getFCPluginFrame();
    fcPluginFrame?.contentWindow?.postMessage?.(
      { type: 'b-fc-update-tw-theme', payload: 'dark' },
      '*'
    );
  }
};

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

export const injectTwitterCast = () => {
  if (window.location.origin === 'https://twitter.com') {
    function onHTMLChange() {
      appendTwitterQuickCast();
      appendTwitterQuickCastExpand();
      appendTwitterCastElement();
      handleTWTheme();
      handleTWDialog();
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
};

export const injectFCPlugin = (params) => {
  const div = document.createElement('div');
  div.id = 'buidler-fc-plugin';
  document.body.appendChild(div);
  const element = ReactDOM.createRoot(div);
  element.render(<FCPlugin signerId={params?.signerId} open={params?.open} />);
};
