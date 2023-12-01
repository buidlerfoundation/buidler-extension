import React, { useCallback } from 'react';
import IconInsights from './SVG/IconInsights';
import { getFCPluginFrame, regexUsername } from '../../utils';

const ProfileInsights = () => {
  const onInsightsClick = useCallback((e) => {
    e.stopPropagation();
    const username = regexUsername.exec(window.location.pathname)?.[1];
    const fcPluginFrame = getFCPluginFrame();
    const dataOpen = fcPluginFrame?.getAttribute('data-open');
    if (fcPluginFrame && username) {
      if (dataOpen === 'false') {
        fcPluginFrame?.contentWindow?.postMessage?.(
          {
            type: 'b-fc-navigate',
            payload: `/plugin-fc/insights/${username}`,
          },
          '*'
        );
        document.getElementById('btn-fc-plugin')?.click?.();
      }
    }
  }, []);
  return (
    <div
      className="buidler-theme"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 35,
        padding: '0 15px',
        marginTop: 10,
        width: 'fit-content',
        borderRadius: 10,
        border: '1px solid var(--color-wc-stroke)',
        gap: 10,
        cursor: 'pointer',
      }}
      onClick={onInsightsClick}
    >
      <IconInsights />
      <span
        style={{
          color: 'var(--color-secondary-text)',
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: '1.5rem',
        }}
      >
        Profile Insight
      </span>
    </div>
  );
};

export default ProfileInsights;
