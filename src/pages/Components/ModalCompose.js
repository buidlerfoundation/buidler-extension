import React, { useCallback, useMemo, useState } from 'react';
import { MAXIMUM_LENGTH, getFCPluginFrame, getTextLength } from '../../utils';
import IconEmbed from './SVG/IconEmbed';
import MentionPicker from './MentionPicker';

const ModalCompose = ({ user }) => {
  const [value, setValue] = useState('');
  const length = useMemo(() => getTextLength(value), [value]);
  const left = useMemo(() => MAXIMUM_LENGTH - length, [length]);
  const disabled = useMemo(
    () => !value.trim() || length > MAXIMUM_LENGTH,
    [length, value]
  );
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
    if (disabled) return;
    const fcPluginFrame = getFCPluginFrame();
    const type = 'tw-cast';
    const payload = {
      text: value.trim(),
      embeds: [{ url: window.location.href }],
    };
    fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
    setValue('');
    onCancelClick();
  }, [disabled, onCancelClick, value]);
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            color:
              left <= 10
                ? left > 0
                  ? 'rgb(183, 138, 106)'
                  : 'rgb(213, 19, 56)'
                : 'var(--color-placeholder)',
            fontWeight: 400,
            marginTop: 5,
            fontSize: 13,
          }}
        >
          {left <= 10 ? `${left} left` : ''}
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
            style={{
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            Post
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCompose;
