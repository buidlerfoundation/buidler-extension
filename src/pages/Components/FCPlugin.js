import React, { useState, useCallback, useEffect } from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import LogoFC from './SVG/LogoFC';

const FCPlugin = ({ signerId }) => {
  const [openPlugin, setOpenPlugin] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const togglePlugin = useCallback(
    () => setOpenPlugin((current) => !current),
    []
  );
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
  return (
    <>
      <div
        className="buidler-theme-light b-fc-open-plugin-container normal-button"
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
            backgroundColor: '#191919',
            colorScheme: 'auto',
          }}
          title="b-fc-plugin"
          src={`https://beta.buidler.app/plugin-fc/${signerId || ''}`}
          id="fc-plugin-frame"
          data-signer-id={signerId || dataSignerId}
          data-open={openPlugin}
        />
      </div>
    </>
  );
};

export default FCPlugin;
