import React, { useCallback, useEffect, useRef } from 'react';
import IconClose from './SVG/IconClose';

const AlertItem = ({ url, id }) => {
  const timeout = useRef();
  const onClose = useCallback(() => {
    document.getElementById(id)?.remove?.();
  }, [id]);
  const openCast = useCallback(() => {
    window.open(url, '_blank');
    onClose();
  }, [onClose, url]);
  const removeTimeout = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }, []);
  const hideAlertDelay = useCallback(() => {
    removeTimeout();
    timeout.current = setTimeout(() => {
      onClose();
    }, 4000);
  }, [removeTimeout, onClose]);
  useEffect(() => {
    hideAlertDelay();
  }, [hideAlertDelay]);
  return (
    <div
      className="buidler-theme b-fc-alert-item"
      onMouseEnter={removeTimeout}
      onMouseLeave={hideAlertDelay}
    >
      <span className="alert-title">Your cast has been posted.</span>
      <a className="alert-url" href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
      <div className="b-fc-normal-button alert-action" onClick={openCast}>
        <span>Open cast</span>
      </div>
      <div className="b-fc-normal-button alert-close" onClick={onClose}>
        <IconClose />
      </div>
    </div>
  );
};

export default AlertItem;
