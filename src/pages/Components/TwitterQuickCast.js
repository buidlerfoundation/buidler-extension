import React, { useState, useCallback, useEffect } from 'react';
import { getFCPluginFrame } from '../../utils';
import IconFCCheck from './SVG/IconFCCheck';
import IconFCUncheck from './SVG/IconFCUncheck';

const TwitterQuickCast = ({ isDark }) => {
  const [checked, setChecked] = useState(true);
  const toggle = useCallback((e) => {
    e.stopPropagation();
    setChecked((current) => !current);
  }, []);
  useEffect(() => {
    const element = document.querySelector(
      'div[data-testid="tweetButtonInline"]'
    );
    const clickListener = (e) => {
      const twitterTextInput = document.querySelector(
        'div[data-testid="tweetTextarea_0"]'
      );
      if (twitterTextInput?.innerText && checked) {
        const fcPluginFrame = getFCPluginFrame();
        const payload = {
          text: twitterTextInput?.innerText,
        };
        const dataOpen = fcPluginFrame?.getAttribute('data-open');
        if (dataOpen === 'false') {
          document.querySelector('#btn-fc-plugin')?.click?.();
        }
        fcPluginFrame?.contentWindow?.postMessage?.(
          { type: 'tw-cast', payload },
          '*'
        );
      }
    };
    element?.addEventListener('click', clickListener);
    return () => {
      element?.removeEventListener('click', clickListener);
    };
  }, [checked]);
  return (
    <div
      className={`buidler-theme-light ${
        isDark ? 'buidler-theme-dark' : ''
      } buidler-tw-quick-cast-container normal-button`}
      onClick={toggle}
    >
      {checked ? <IconFCCheck /> : <IconFCUncheck />}
      <span className="quick-cast-label">Cast on Farcaster</span>
    </div>
  );
};

export default TwitterQuickCast;
