import React, { useState, useCallback, useEffect } from 'react';
import { getFCPluginFrame } from '../../utils';
import IconFCCheck from './SVG/IconFCCheck';
import IconFCUncheck from './SVG/IconFCUncheck';

const TwitterQuickCast = ({parentElement}) => {
  const [checked, setChecked] = useState(true);
  const toggle = useCallback((e) => {
    e.stopPropagation();
    setChecked((current) => !current);
  }, []);
  useEffect(() => {
    const root = parentElement || document
    const element = root.querySelector(
      'div[data-testid*="tweetButton"]'
    );
    const clickListener = (e) => {
      const twitterTextInput = root.querySelector(
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
  }, [checked, parentElement]);
  return (
    <div
      className="buidler-theme buidler-tw-quick-cast-container normal-button"
      onClick={toggle}
    >
      {checked ? <IconFCCheck /> : <IconFCUncheck />}
      <span className="quick-cast-label">Cast on Farcaster</span>
    </div>
  );
};

export default TwitterQuickCast;
