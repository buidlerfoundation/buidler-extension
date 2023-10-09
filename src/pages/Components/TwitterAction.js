import React, { useCallback, useEffect, useMemo, useState } from 'react';
import IconLogoFC from './SVG/IconLogoFC';
import IconCastCount from './SVG/IconCastCount';
import { getCountByUrls } from '../../utils';

const TwitterAction = ({ twCastElement, article, index }) => {
  const [count, setCount] = useState(0);
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
  const willNotGetCount = useMemo(
    () => window.location.pathname.includes('/status/') && index !== 0,
    [index]
  );
  const url = useMemo(() => {
    let res = tweetUrl;
    if (isConversation) {
      res = window.location.pathname;
    }
    return `${window.location.origin}${res}`;
  }, [isConversation, tweetUrl]);
  useEffect(() => {
    if (url && !willNotGetCount) {
      getCountByUrls([url]).then((res) =>
        res.json().then((data) => {
          if (data.success) {
            try {
              const value = Object.values(data.data)?.[0];
              setCount(value || 0);
            } catch (error) {}
          }
        })
      );
    }
  }, [url, willNotGetCount]);
  const onClick = useCallback(
    (e) => {
      if (count > 0 && !isConversation) return;
      e.stopPropagation();
      if (twCastElement.style.display !== 'none') {
        twCastElement.style.display = 'none';
      } else {
        twCastElement.style.display = 'block';
      }
    },
    [count, isConversation, twCastElement.style]
  );
  return (
    <div className="buidler-theme f-tw-action" onClick={onClick}>
      {count > 0 ? (
        <>
          <IconCastCount />
          <span style={{ marginLeft: 8 }}>{count}</span>
        </>
      ) : (
        <>
          <IconLogoFC />
          <span style={{ marginLeft: 8 }}>Cast</span>
        </>
      )}
    </div>
  );
};

export default TwitterAction;
