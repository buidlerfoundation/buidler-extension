import React, { useState, useCallback, useEffect } from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import LogoFC from './SVG/LogoFC';

const FCPlugin = ({ signerId, open }) => {
  const [openPlugin, setOpenPlugin] = useState(open === 'true');
  const [loaded, setLoaded] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const togglePlugin = useCallback(
    () => setOpenPlugin((current) => !current),
    []
  );
  useEffect(() => {
    chrome.storage.local.set({ Buidler_open_plugin: `${openPlugin}` });
  }, [openPlugin]);
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
        className={`b-fc-plugin-container ${
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
          src={`https://beta.buidler.app/plugin-fc/${signerId || ''}`}
          id="fc-plugin-frame"
          onLoad={onLoadIframe}
          data-signer-id={signerId || dataSignerId}
          data-open={openPlugin}
        />
      </div>
    </>
  );
};

export default FCPlugin;
