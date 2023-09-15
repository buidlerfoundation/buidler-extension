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

export const handleMessage = () => {
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
  });
};
