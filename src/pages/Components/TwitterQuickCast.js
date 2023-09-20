import React, { useState, useCallback, useEffect } from 'react';
import { getFCPluginFrame } from '../../utils';

const TwitterQuickCast = ({ isDark }) => {
  const [checked, setChecked] = useState(false);
  const onChange = useCallback((e) => {
    setChecked(e.target.checked);
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
      } buidler-tw-quick-cast-container`}
    >
      <input
        type="checkbox"
        className="checkbox"
        onChange={onChange}
        checked={checked}
      />
      <span className="quick-cast-label">Cast on Farcaster</span>
    </div>
  );
};

export default TwitterQuickCast;
