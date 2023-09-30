import React, { useState, useCallback, useEffect, useMemo } from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import LogoFC from './SVG/LogoFC';
import { twTheme } from '../../utils';

const FCPlugin = ({ signerId, open }) => {
  const [openPlugin, setOpenPlugin] = useState(open === 'true');
  const [loaded, setLoaded] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const initialTheme = useMemo(() => twTheme(), []);
  const togglePlugin = useCallback(
    () => setOpenPlugin((current) => !current),
    []
  );
  const isTwitter = useMemo(
    () => window.location.origin === 'https://twitter.com',
    []
  );
  useEffect(() => {
    chrome.storage.local.set({ Buidler_open_plugin: `${openPlugin}` });
    if (isTwitter) {
      setLoaded(false);
    }
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
  return (
    <>
      <div
        className="buidler-theme b-fc-open-plugin-container normal-button"
        id="btn-fc-plugin"
        onClick={togglePlugin}
      >
        <IconJumpIn />
        <span className="b-fc-label">Open Farcaster</span>
        <LogoFC />
      </div>
      <div
        className={`buidler-theme b-fc-plugin-container ${
          openPlugin ? 'b-fc-plugin-open' : ''
        }`}
      >
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
            q: window.location.href,
          })}`}
          id="fc-plugin-frame"
          onLoad={onLoadIframe}
          data-signer-id={signerId || dataSignerId}
          data-open={openPlugin}
          key={isTwitter ? `${openPlugin}` : undefined}
        />
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
