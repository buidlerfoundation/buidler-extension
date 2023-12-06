import React, { useCallback, useMemo, useState } from 'react';
import { MAXIMUM_LENGTH, getFCPluginFrame, getTextLength } from '../../utils';
import MentionPicker from './MentionPicker';

const TwitterCast = ({ article, index, theme }) => {
  const [value, setValue] = useState('');
  const length = useMemo(() => getTextLength(value), [value]);
  const left = useMemo(() => MAXIMUM_LENGTH - length, [length]);
  const disabled = useMemo(() => length > MAXIMUM_LENGTH, [length]);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const tweetUrl = useMemo(() => {
    const aTags = article.getElementsByTagName('a');
    // Gets all the <a> tags from the tweet element
    for (let aTag of aTags) {
      let href = aTag.getAttribute('href');
      // Gets the value of the href attribute
      if (href.includes('/status/') && !href.includes('/photo')) {
        return href;
      }
    }
  }, [article]);
  const isConversation = useMemo(
    () =>
      index === 0 &&
      window.location.pathname.includes('/status/') &&
      tweetUrl.includes(window.location.pathname),
    [index, tweetUrl]
  );
  const onCastClick = useCallback(
    (e) => {
      if (disabled) return;
      let url = tweetUrl;
      if (isConversation) {
        url = window.location.pathname;
      }
      const fcPluginFrame = getFCPluginFrame();
      const signerId = fcPluginFrame?.getAttribute('data-signer-id');
      let type = 'tw-cast-queue';
      if (signerId) {
        type = 'tw-cast';
      }
      const twUrl = `${window.location.origin}${url}`;
      const text = value.trim()
        ? value.trim() + `\n${twUrl}`
        : twUrl + '\n\ncast via ';
      const payload = {
        text,
        embeds: [{ url: `${window.location.origin}${url}` }],
      };
      if (!value.trim()) {
        const encoder = new TextEncoder();
        payload.mentions = [20108];
        payload.mentions_positions = [encoder.encode(text).length];
        payload.onlyLink = true;
      }
      const element = document.getElementById('fc-plugin-confirm-modal');
      const btnCast = document.getElementById('b-fc-btn-cast');
      btnCast.onclick = () => {
        // const dataOpen = fcPluginFrame?.getAttribute('data-open');
        // if (dataOpen === 'false') {
        //   document.querySelector('#btn-fc-plugin')?.click?.();
        // }
        fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
        setValue('');
        element.style.display = 'none';
      };
      element.style.display = 'block';
    },
    [disabled, isConversation, tweetUrl, value]
  );
  return (
    <div
      className={`buidler-theme buidler-theme-${theme} buidler-tweet-cast-container`}
      onClick={preventParentClick}
    >
      {!value && <span className="placeholder">What's on your mind</span>}
      <MentionPicker
        text={value}
        setText={setValue}
        inputClass="input"
        popupStyle={{ bottom: '100%', marginTop: 0 }}
      />
      <div
        style={{
          alignSelf: 'flex-end',
          color:
            left <= 10
              ? left > 0
                ? 'rgb(183, 138, 106)'
                : 'rgb(213, 19, 56)'
              : 'var(--color-placeholder)',
          fontWeight: 400,
          margin: '0px 5px 15px 5px',
          fontSize: 13,
        }}
      >
        {left <= 10 ? `${left} left` : ''}
      </div>
      <div
        className="btn-cast"
        onClick={onCastClick}
        style={{
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? 'default' : 'pointer',
        }}
      >
        <span>Cast to Farcaster</span>
      </div>
    </div>
  );
};

export default TwitterCast;
