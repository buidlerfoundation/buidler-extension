import React, { useCallback, useEffect, useState } from 'react';
import SwitchButton from './SwitchButton';
import { disabledDomainKey, disabledSidebarKey } from '../../constant';

const ModalClose = ({ open, handleClose, onClosePlugin }) => {
  const [disableDomain, setDisableDomain] = useState(false);
  const [disablePages, setDisablePages] = useState(false);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const onSaveClick = useCallback(async () => {
    if (disableDomain || disablePages) {
      const storage = await chrome.storage.local.get([disabledDomainKey]);
      let domains = storage[disabledDomainKey];
      const host = window.location.host;
      if (disableDomain) {
        domains = domains ? `${domains},${host}` : host;
      }
      chrome.storage.local.set({
        [disabledSidebarKey]: JSON.stringify(disablePages),
        [disabledDomainKey]: domains,
      });
    }
    handleClose();
    onClosePlugin();
  }, [disableDomain, disablePages, handleClose, onClosePlugin]);
  useEffect(() => {
    if (open) {
      setDisableDomain(false);
      setDisablePages(false);
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="buidler-theme b-fc-modal-container" onClick={handleClose}>
      <div
        className="b-fc-modal-compose"
        onClick={preventParentClick}
        style={{ gap: 14, width: 440 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-primary-text)',
            fontWeight: 400,
            fontSize: 15,
          }}
        >
          <span>
            Disable sidebar for{' '}
            <span style={{ fontWeight: 600 }}>{window.location.host}</span>
          </span>
          <SwitchButton active={disableDomain} onChange={setDisableDomain} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--color-primary-text)',
            fontWeight: 400,
            fontSize: 15,
          }}
        >
          <span>Turn off sidebar for all pages</span>
          <SwitchButton active={disablePages} onChange={setDisablePages} />
        </div>
        <div
          style={{
            marginTop: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-secondary-text)',
              fontWeight: 400,
              lineHeight: '18px',
            }}
          >
            Go to <span style={{ fontWeight: 500 }}>Settings</span> to turn it
            on anytime
          </span>
          <div
            style={{
              height: 40,
              width: '100%',
              borderRadius: 10,
              backgroundColor: '#0584fe',
              color: 'white',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="b-fc-normal-button"
            onClick={onSaveClick}
          >
            OK
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalClose;
