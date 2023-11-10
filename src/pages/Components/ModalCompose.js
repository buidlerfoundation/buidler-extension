import React, { useCallback, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { getFCPluginFrame } from '../../utils';
import IconEmbed from './SVG/IconEmbed';
import MentionPicker from './MentionPicker';

const ModalCompose = ({ user }) => {
  const [value, setValue] = useState('');
  const onCancelClick = useCallback(() => {
    const element = document.getElementById('fc-plugin-modal-compose');
    if (element) {
      element.style.display = 'none';
    }
  }, []);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const onPostClick = useCallback(() => {
    if (!value.trim()) return;
    const fcPluginFrame = getFCPluginFrame();
    const type = 'tw-cast';
    const payload = {
      text: value.trim(),
      embeds: [{ url: window.location.href }],
    };
    fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
    onCancelClick();
  }, [onCancelClick, value]);
  return (
    <div
      id="fc-plugin-modal-compose"
      className="buidler-theme b-fc-modal-container"
      style={{ display: 'none' }}
      onClick={onCancelClick}
    >
      <div className="b-fc-modal-compose" onClick={preventParentClick}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {user?.pfp?.url && (
            <img
              alt="avatar"
              src={user?.pfp?.url}
              style={{
                width: 25,
                height: 25,
                borderRadius: '50%',
                marginRight: 15,
                backgroundColor: 'var(--color-background-3)',
              }}
            />
          )}
          <span className="modal-compose-display-name">
            {user.display_name}
          </span>
        </div>
        <div
          style={{
            position: 'relative',
            marginTop: 20,
            overflowY: 'auto',
          }}
        >
          {!value && (
            <span className="compose-placeholder">What's on your mind</span>
          )}
          <MentionPicker
            inputClass="compose-input"
            text={value}
            setText={setValue}
          />
        </div>
        <div className="compose-embed">
          <IconEmbed />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginLeft: 20,
              flex: 1,
            }}
            className="truncate-flex"
          >
            <span className="embed-title truncate">{document.title}</span>
            <span className="embed-url truncate">{window.location.href}</span>
          </div>
        </div>
        <div className="modal-actions">
          <div className="btn-cancel" onClick={onCancelClick}>
            Cancel
          </div>
          <div
            id="b-fc-btn-post"
            className="btn-main"
            onClick={onPostClick}
            style={{ opacity: !value.trim() ? 0.6 : 1 }}
          >
            Post
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCompose;
