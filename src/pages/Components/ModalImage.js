import React, { useCallback } from 'react';
import IconClose from './SVG/IconClose';

const ModalImage = ({ src }) => {
  const onClose = useCallback(() => {
    const element = document.getElementById('fc-plugin-modal-image');
    if (element) {
      element.style.display = 'none';
    }
  }, []);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  return (
    <div
      id="fc-plugin-modal-image"
      className="buidler-theme b-fc-modal-container"
      style={{
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={preventParentClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          alt="fullscreen"
          src={src}
          style={{
            maxHeight: '90vh',
            maxWidth: '90vw',
            width: 'auto',
            height: 'auto',
          }}
        />
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            width: 25,
            height: 25,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
          onClick={onClose}
        >
          <IconClose />
        </div>
      </div>
    </div>
  );
};

export default ModalImage;
