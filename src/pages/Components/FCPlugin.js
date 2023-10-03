import React, { useState, useCallback, useEffect, useMemo } from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import LogoFC from './SVG/LogoFC';
import { twTheme } from '../../utils';
import IconMenuMini from './SVG/IconMenuMini';
import IconMenuClose from './SVG/IconMenuClose';
import Spinner from './Spinner';

const FCPlugin = ({ signerId, open }) => {
  const [openPlugin, setOpenPlugin] = useState(open === 'true');
  const [openMenu, setOpenMenu] = useState(false);
  const [isMinimized, setMinimized] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const initialTheme = useMemo(() => twTheme(), []);
  const showMenu = useCallback(() => setOpenMenu(true), []);
  const hideMenu = useCallback(() => setOpenMenu(false), []);
  const togglePlugin = useCallback(
    () => setOpenPlugin((current) => !current),
    []
  );
  const isTwitter = useMemo(
    () => window.location.origin === 'https://twitter.com',
    []
  );
  const initialUrl = useMemo(() => window.location.href, []);
  useEffect(() => {
    chrome.storage.local.set({ Buidler_open_plugin: `${openPlugin}` });
  }, [isTwitter, openPlugin]);
  useEffect(() => {
    const twSidebar = document.querySelector(
      'div[data-testid="sidebarColumn"]'
    );
    if (twSidebar) {
      if (openPlugin) {
        twSidebar.style.display = 'none';
      } else {
        twSidebar.style.display = 'flex';
      }
    }
  }, [openPlugin]);
  useEffect(() => {
    const messageListener = (e) => {
      if (e?.data?.type === 'b-fc-plugin-close') {
        togglePlugin();
      }
      if (e?.data?.type === 'b-fc-plugin-logged') {
        setDataSignerId(e.data.signerId);
        const quickCast = document.getElementById('buidler-tweet-quick-cast');
        if (quickCast) {
          quickCast.style.display = 'block';
        }
      }
    };
    window.addEventListener('message', messageListener);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [togglePlugin]);
  const onLoadIframe = useCallback(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 500);
  }, []);
  const onCancelClick = useCallback((e) => {
    e.stopPropagation();
    const element = document.getElementById('fc-plugin-confirm-modal');
    if (element) {
      element.style.display = 'none';
    }
  }, []);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const onMinimizeClick = useCallback(
    (e) => {
      e.stopPropagation();
      setMinimized(true);
      hideMenu();
    },
    [hideMenu]
  );
  const onCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      hideMenu();
      const element = document.getElementById('btn-fc-plugin');
      if (element) {
        element.style.display = 'none';
      }
    },
    [hideMenu]
  );
  return (
    <>
      <div
        className="buidler-theme b-fc-open-plugin-container normal-button"
        id="btn-fc-plugin"
        onClick={togglePlugin}
      >
        <div
          className="btn-toggle-wrap"
          onMouseEnter={showMenu}
          onMouseLeave={hideMenu}
        >
          <div
            className="btn-toggle"
            style={isMinimized ? { opacity: 0.7 } : {}}
          >
            {!isMinimized && (
              <>
                <IconJumpIn />
                <span className="b-fc-label">Open Farcaster</span>
              </>
            )}
            <LogoFC />
          </div>
          {openMenu && (
            <div className="plugin-menu">
              <div
                className="menu-item"
                style={{ display: isMinimized ? 'none' : 'flex' }}
                onClick={onMinimizeClick}
              >
                <IconMenuMini />
                <span style={{ marginLeft: 15 }}>Minimize</span>
              </div>
              <div className="menu-item" onClick={onCloseClick}>
                <IconMenuClose />
                <span style={{ marginLeft: 15 }}>Close</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div
        className={`buidler-theme b-fc-plugin-container ${
          openPlugin ? 'b-fc-plugin-open' : ''
        }`}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'var(--color-background-1)',
              colorScheme: 'auto',
              opacity: loaded ? 1 : 0,
            }}
            title="b-fc-plugin"
            src={`https://buidler.app/plugin-fc?${new URLSearchParams({
              theme: initialTheme,
              signer_id: signerId || '',
              q: initialUrl,
            })}`}
            id="fc-plugin-frame"
            onLoad={onLoadIframe}
            data-signer-id={dataSignerId}
            data-open={openPlugin}
          />
          {!loaded && <Spinner />}
        </div>
      </div>
      <div id="fc-plugin-alert" className="b-fc-alert-container"></div>
      <div
        id="fc-plugin-confirm-modal"
        className="buidler-theme b-fc-modal-container"
        style={{ display: 'none' }}
        onClick={onCancelClick}
      >
        <div className="b-fc-modal-wrap" onClick={preventParentClick}>
          <span className="modal-title">Cast to Farcaster</span>
          <span className="modal-description">
            Are you sure you'd like to cast this content to Farcaster?
          </span>
          <div className="modal-actions">
            <div className="btn-cancel" onClick={onCancelClick}>
              Cancel
            </div>
            <div id="b-fc-btn-cast" className="btn-cast">
              Cast
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FCPlugin;
