import React, { useCallback, useMemo, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { getFCPluginFrame } from '../../utils';

const TwitterCast = ({ article, index }) => {
  const [value, setValue] = useState('');
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const tweetUrl = useMemo(() => {
    const aTags = article.getElementsByTagName('a');
    // Gets all the <a> tags from the tweet element
    for (let aTag of aTags) {
      let href = aTag.getAttribute('href');
      // Gets the value of the href attribute
      if (href.includes('/status/')) {
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
        payload.mentions = [20386];
        payload.mentions_positions = [twUrl.length + 11];
      }
      const element = document.getElementById('fc-plugin-confirm-modal');
      const btnCast = document.getElementById('b-fc-btn-cast');
      btnCast.onclick = () => {
        const dataOpen = fcPluginFrame?.getAttribute('data-open');
        if (dataOpen === 'false') {
          document.querySelector('#btn-fc-plugin')?.click?.();
        }
        fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
        setValue('');
        element.style.display = 'none';
      };
      element.style.display = 'block';
    },
    [isConversation, tweetUrl, value]
  );
  const onChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return (
    <div
      className="buidler-theme buidler-tweet-cast-container"
      onClick={preventParentClick}
    >
      {!value && (
        <span className="placeholder">Start typing a new cast here...</span>
      )}
      <ContentEditable
        html={value}
        onChange={onChange}
        className="input"
        onKeyDown={preventParentClick}
      />
      <div className="btn-cast" onClick={onCastClick}>
        <span>Cast to Farcaster</span>
      </div>
    </div>
  );
};

export default TwitterCast;
