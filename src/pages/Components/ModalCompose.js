import React, { useCallback, useMemo, useState } from 'react';
import { MAXIMUM_LENGTH, getFCPluginFrame, getTextLength } from '../../utils';
import IconEmbed from './SVG/IconEmbed';
import MentionPicker from './MentionPicker';
import IconChannelHome from './SVG/IconChannelHome';

const ModalCompose = ({ user, channels }) => {
  const [value, setValue] = useState('');
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [anchorPopup, setAnchorPopup] = useState(null);
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
    if (selectedChannel?.parent_url) {
      payload.parent_url = selectedChannel?.parent_url;
    }
    fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
    setSelectedChannel(null);
    setValue('');
    onCancelClick();
  }, [disabled, onCancelClick, selectedChannel?.parent_url, value]);
  const getPosition = useCallback(() => {
    if (!anchorPopup) return {};
    const rect = anchorPopup.getBoundingClientRect();
    return {
      top: rect.top + rect.height,
      left: rect.left,
    };
  }, [anchorPopup]);
  return (
    <>
      <div
        id="fc-plugin-modal-compose"
        className="buidler-theme b-fc-modal-container"
        style={{ display: 'none' }}
        onClick={onCancelClick}
      >
        <div className="b-fc-modal-compose" onClick={preventParentClick}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
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
                height: 35,
                display: 'flex',
                alignItems: 'center',
                padding: '0 10px',
                gap: 5,
                borderRadius: 10,
                border: '1px solid var(--color-stroke)',
                cursor: 'pointer',
              }}
              onClick={(e) => setAnchorPopup(e.currentTarget)}
            >
              {selectedChannel?.image ? (
                <img
                  alt="channel"
                  src={selectedChannel?.image}
                  style={{ width: 20, height: 20 }}
                />
              ) : (
                <IconChannelHome fill="var(--color-secondary-text)" />
              )}
              <span
                style={{
                  color: 'var(--color-secondary-text)',
                  fontWeight: 600,
                  fontSize: 16,
                }}
              >
                {selectedChannel?.name || 'Home'}
              </span>
            </div>
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
      {!!anchorPopup && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000000 }}
          onClick={() => setAnchorPopup(null)}
          className="buidler-theme"
        >
          <div
            className="ex-popup-mention__container"
            style={{ ...getPosition(), width: 'fit-content' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '8px 20px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSelectedChannel(null);
                setAnchorPopup(null);
              }}
            >
              <IconChannelHome />
              <span
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  color: 'var(--color-primary-text)',
                }}
              >
                Home
              </span>
            </div>
            {channels.map((c) => (
              <div
                key={c.channel_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '8px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setSelectedChannel(c);
                  setAnchorPopup(null);
                }}
              >
                <img
                  alt="channel"
                  src={c?.image}
                  style={{ width: 20, height: 20 }}
                />
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--color-primary-text)',
                  }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ModalCompose;
