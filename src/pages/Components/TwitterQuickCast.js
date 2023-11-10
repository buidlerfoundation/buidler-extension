import React, { useState, useCallback, useEffect } from 'react';
import { getFCPluginFrame } from '../../utils';
import IconFCCheck from './SVG/IconFCCheck';
import IconFCUncheck from './SVG/IconFCUncheck';

const storageCheckedKey = 'Buidler_cast_checked_key';

const TwitterQuickCast = ({ parentElement }) => {
  const [checked, setChecked] = useState(false);
  const toggle = useCallback((e) => {
    e.stopPropagation();
    setChecked((current) => !current);
  }, []);
  const initialCheckedState = useCallback(async () => {
    const storageChecked = await chrome.storage.local.get(storageCheckedKey);
    const initialChecked = storageChecked[storageCheckedKey];
    if (initialChecked === 'true') {
      setChecked(true);
    } else {
      setChecked(false);
    }
  }, []);
  useEffect(() => {
    initialCheckedState();
  }, [initialCheckedState]);
  useEffect(() => {
    chrome.storage.local.set({ [storageCheckedKey]: `${checked}` });
  }, [checked]);
  useEffect(() => {
    const root = parentElement || document;
    const element = root.querySelector('div[data-testid*="tweetButton"]');
    const clickListener = (e) => {
      const twitterTextInput = root.querySelector(
        'div[data-testid="tweetTextarea_0"]'
      );
      if (twitterTextInput?.innerText && checked) {
        const fcPluginFrame = getFCPluginFrame();
        const payload = {
          text: twitterTextInput?.innerText,
        };
        if (window.location.pathname.includes('/status/')) {
          payload.embeds = [{ url: window.location.href }];
        }
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
      className="buidler-theme buidler-tw-quick-cast-container b-fc-normal-button"
      onClick={toggle}
    >
      {checked ? <IconFCCheck /> : <IconFCUncheck />}
      <span className="quick-cast-label">Cast on Farcaster</span>
    </div>
  );
};

export default TwitterQuickCast;
