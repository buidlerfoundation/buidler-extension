import React, { useCallback, useMemo, useState } from 'react';
import { getFCPluginFrame, normalizeContentCast } from '../../utils';
import ContentEditable from 'react-contenteditable';

const ModalReply = ({ cast, user, onClose }) => {
  const [value, setValue] = useState('');
  const onCancelClick = useCallback(() => {
    const element = document.getElementById('fc-plugin-modal-reply');
    if (element) {
      element.style.display = 'none';
    }
    onClose();
  }, [onClose]);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const onChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  const disabled = useMemo(() => !value.trim() || !cast, [cast, value]);
  const onPostClick = useCallback(() => {
    if (disabled) return;
    const fcPluginFrame = getFCPluginFrame();
    const type = 'tw-cast';
    const payload = {
      text: value.trim(),
      parent_cast_id: {
        hash: cast?.hash,
        fid: cast?.author?.fid,
      },
    };
    fcPluginFrame?.contentWindow?.postMessage?.({ type, payload }, '*');
    setValue('');
    onCancelClick();
  }, [cast?.author?.fid, cast?.hash, disabled, onCancelClick, value]);
  return (
    <div
      id="fc-plugin-modal-reply"
      className="buidler-theme b-fc-modal-container"
      style={{ display: 'none' }}
      onClick={onCancelClick}
    >
      <div className="b-fc-modal-compose" onClick={preventParentClick}>
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <a
              href={`https://warpcast.com/${cast?.author?.username}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                alt="cast-avatar"
                src={cast?.author?.pfp?.url}
                style={{
                  width: 45,
                  height: 45,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-background-3)',
                }}
              />
            </a>
            <div
              style={{
                height: '100%',
                width: 1,
                backgroundColor: 'var(--color-stroke)',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginLeft: 10,
              wordBreak: 'break-word',
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                className="truncate"
                style={{
                  fontSize: 15,
                  color: 'var(--color-primary-text)',
                  fontWeight: 700,
                }}
              >
                {cast?.author?.display_name}
              </span>
              <span
                className="truncate"
                style={{
                  fontSize: 15,
                  color: 'var(--color-secondary-text)',
                  fontWeight: 400,
                  marginLeft: 5,
                }}
              >
                @{cast?.author?.username}
              </span>
            </div>
            <div
              style={{
                color: 'var(--color-primary-text)',
                fontSize: 15,
                fontWeight: 400,
                whiteSpace: 'pre-line',
                marginTop: 3,
              }}
              dangerouslySetInnerHTML={{
                __html: cast ? normalizeContentCast(cast) : '',
              }}
            />
            <span
              style={{
                marginTop: 8,
                color: 'var(--color-secondary-text)',
                fontSize: 14,
              }}
            >
              Replying to{' '}
              <a
                className="mention-string"
                href={`https://warpcast.com/${cast?.author?.username}`}
                target="_blank"
                rel="noreferrer"
              >
                @{cast?.author?.username}
              </a>
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', position: 'relative' }}>
          {user?.pfp?.url && (
            <img
              alt="avatar"
              src={user?.pfp?.url}
              style={{
                width: 45,
                height: 45,
                borderRadius: '50%',
                marginRight: 10,
                backgroundColor: 'var(--color-background-3)',
              }}
            />
          )}
          <div
            style={{
              position: 'relative',
              marginTop: 15,
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {!value && (
              <span className="compose-placeholder">
                What's on your mind
              </span>
            )}
            <ContentEditable
              html={value}
              onChange={onChange}
              className="compose-input"
            />
          </div>
        </div>
        <div className="modal-actions" style={{ marginTop: 20 }}>
          <div className="btn-cancel" onClick={onCancelClick}>
            Cancel
          </div>
          <div
            id="b-fc-btn-post"
            className="btn-main"
            onClick={onPostClick}
            style={{ opacity: disabled ? 0.6 : 1 }}
          >
            Reply
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalReply;
