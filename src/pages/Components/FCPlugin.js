import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import {
  apiBaseUrl,
  baseUrl,
  getCountByUrls,
  getWCUsername,
  toggleModalCompose,
  toggleModalReply,
  updateColorButtonDiscussion,
  updateColorButtonInsights,
} from '../../utils';
import Spinner from './Spinner';
import IconBuidlerLogo from './SVG/IconBuidlerLogo';
import IconMenuToggle from './SVG/IconMenuToggle';
import IconMenuPlus from './SVG/IconMenuPlus';
import IconMenuClose from './SVG/IconMenuClose';
import numeral from 'numeral';
import ModalCompose from './ModalCompose';
import { getMetadata } from '../Content/htmlParser';
import ModalReply from './ModalReply';
import ModalImage from './ModalImage';
import IconDiscussion from './SVG/IconDiscussion';
import IconMenuInsights from './SVG/IconMenuInsights';

const FCPlugin = ({ signerId, open, initialUsername, isWarpcast, uniqId }) => {
  const [openPlugin, setOpenPlugin] = useState(open === 'true');
  const [channels, setChannels] = useState([]);
  const [originSrc, setOriginSrc] = useState('');
  const [alertCastCount, setAlertCastCount] = useState(false);
  const iframeRef = useRef();
  const [openMenu, setOpenMenu] = useState(false);
  const [openComposeAfterLogin, setOpenComposeAfterLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const [user, setUser] = useState(null);
  const [castCount, setCastCount] = useState(0);
  const [parentCast, setParentCast] = useState(null);
  const castBadgeDisplay = useMemo(
    () => numeral(castCount).format('0[.][0]a'),
    [castCount]
  );
  const showMenu = useCallback(() => setOpenMenu(true), []);
  const hideMenu = useCallback(() => setOpenMenu(false), []);
  const togglePlugin = useCallback(
    () => setOpenPlugin((current) => !current),
    []
  );
  const isTwitter = useMemo(
    () => window.location.origin === 'https://twitter.com',
    []
  );
  const initialUrl = useMemo(() => window.location.href, []);
  useEffect(() => {
    fetch(apiBaseUrl + 'channels?limit=50').then((res) => {
      res.json().then((data) => {
        if (data.success) {
          setChannels(data.data);
        }
      });
    });
  }, []);
  useEffect(() => {
    if (dataSignerId) {
      fetch(apiBaseUrl + 'users/me', {
        headers: { 'Signer-Id': dataSignerId },
      }).then((res) => {
        res.json().then((data) => {
          if (data.success) {
            setUser(data.data);
          }
        });
      });
    }
  }, [dataSignerId]);
  useEffect(() => {
    chrome.storage.local.set({ Buidler_open_plugin: `${openPlugin}` });
  }, [isTwitter, openPlugin]);
  useEffect(() => {
    const twSidebar = document.querySelector(
      'div[data-testid="sidebarColumn"]'
    );
    if (twSidebar) {
      if (openPlugin) {
        twSidebar.style.display = 'none';
      } else {
        twSidebar.style.display = 'flex';
      }
    }
  }, [openPlugin]);
  const getCastCount = useCallback((url, firstLoad) => {
    getCountByUrls([url]).then((res) =>
      res.json().then((data) => {
        if (data.success) {
          try {
            const value = Object.values(data.data)?.[0] || 0;
            setCastCount(value);
            if (value > 0 && firstLoad) {
              setAlertCastCount(true);
              setTimeout(() => {
                setAlertCastCount(false);
              }, 5000);
            }
          } catch (error) {}
        }
      })
    );
  }, []);
  useEffect(() => {
    getCastCount(window.location.href, true);
  }, [getCastCount]);
  useEffect(() => {
    const event = (e) => {
      getCastCount(e.detail);
    };
    window.addEventListener('b-fc-update-tw-url', event);
    return () => {
      window.removeEventListener('b-fc-update-tw-url', event);
    };
  }, [getCastCount]);
  const onCreateClick = useCallback(
    (e) => {
      e?.stopPropagation?.();
      if (user) {
        toggleModalCompose();
      } else {
        setOpenComposeAfterLogin(true);
        iframeRef.current?.contentWindow?.postMessage?.(
          {
            type: 'b-fc-open-login',
          },
          '*'
        );
      }
    },
    [user]
  );
  const onDiscussionClick = useCallback((e) => {
    e.stopPropagation();
    setOpenPlugin(true);
    iframeRef.current?.contentWindow?.postMessage?.(
      {
        type: 'b-fc-navigate',
        payload: '/plugin-fc',
      },
      '*'
    );
    updateColorButtonInsights(false);
    updateColorButtonDiscussion(true);
  }, []);
  const onInsightsClick = useCallback((e) => {
    e.stopPropagation();
    setOpenPlugin(true);
    const username = getWCUsername();
    let url = '/plugin-fc/insights';
    if (username) {
      url += `/${username}`;
    }
    iframeRef.current?.contentWindow?.postMessage?.(
      {
        type: 'b-fc-navigate',
        payload: url,
      },
      '*'
    );
    updateColorButtonInsights(true);
    updateColorButtonDiscussion(false);
  }, []);
  const onOpenReply = useCallback((payload) => {
    setParentCast(payload);
    toggleModalReply();
  }, []);
  const onCloseReply = useCallback(() => {
    setParentCast(null);
    iframeRef.current?.contentWindow?.postMessage?.(
      {
        type: 'b-fc-close-reply',
      },
      '*'
    );
  }, []);
  useEffect(() => {
    const messageListener = (e) => {
      if (e?.data?.type === 'b-fc-plugin-update-current-url') {
        window.location.href = e?.data?.payload;
      }
      if (e?.data?.type === 'b-fc-plugin-close') {
        togglePlugin();
      }
      if (e?.data?.type === 'b-fc-plugin-logged') {
        setDataSignerId(e.data.signerId);
        const quickCast = document.getElementById('buidler-tweet-quick-cast');
        if (quickCast) {
          quickCast.style.display = 'block';
        }
        if (openComposeAfterLogin) {
          setOpenComposeAfterLogin(false);
          toggleModalCompose();
        }
      }
      if (e?.data?.type === 'b-fc-plugin-open-compose') {
        onCreateClick();
      }
      if (e?.data?.type === 'b-fc-plugin-open-reply') {
        onOpenReply(e?.data?.payload);
      }
      if (e?.data?.type === 'b-fc-plugin-open-image-fullscreen') {
        setOriginSrc(e?.data?.payload);
        const element = document.getElementById('fc-plugin-modal-image');
        if (element) {
          element.style.display = 'flex';
        }
      }
    };
    window.addEventListener('message', messageListener);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [onCreateClick, onOpenReply, openComposeAfterLogin, togglePlugin]);
  const onLoadIframe = useCallback(() => {
    const metadata = getMetadata();
    iframeRef.current?.contentWindow?.postMessage?.(
      {
        type: 'b-fc-initial-data',
        payload: {
          uniqId,
          signerId: signerId || '',
          q: initialUrl,
          ...metadata,
        },
      },
      '*'
    );
    setTimeout(() => {
      setLoaded(true);
    }, 500);
  }, [initialUrl, uniqId, signerId]);
  const onCancelClick = useCallback((e) => {
    e.stopPropagation();
    const element = document.getElementById('fc-plugin-confirm-modal');
    if (element) {
      element.style.display = 'none';
    }
  }, []);
  const preventParentClick = useCallback((e) => {
    e.stopPropagation();
  }, []);
  const onCloseClick = useCallback(
    (e) => {
      e.stopPropagation();
      hideMenu();
      setOpenPlugin(false);
      const element = document.getElementById('btn-fc-plugin');
      if (element) {
        element.style.display = 'none';
      }
    },
    [hideMenu]
  );
  return (
    <>
      <div
        className="buidler-theme b-fc-open-plugin-container b-fc-normal-button"
        id="btn-fc-plugin"
        onClick={togglePlugin}
      >
        <div
          className="btn-toggle-wrap"
          onMouseEnter={showMenu}
          onMouseLeave={hideMenu}
        >
          <div
            className={`plugin-menu ${openPlugin ? 'plugin-menu-open' : ''}`}
            style={{ display: openMenu || openPlugin ? 'flex' : 'none' }}
          >
            <div className="b-menu-item">
              <IconMenuToggle
                style={openPlugin ? { transform: 'rotate(180deg)' } : undefined}
              />
              <div className="menu-description">
                {openPlugin ? 'Minimize' : 'Open'}
              </div>
            </div>
            <div className="b-menu-item" onClick={onCreateClick}>
              <IconMenuPlus />
              <div className="menu-description">New post</div>
            </div>
            <div
              className="b-menu-item"
              style={{
                display: isWarpcast ? 'flex' : 'none',
                '--color-icon': 'var(--color-primary-text)',
                backgroundColor:
                  isWarpcast && !initialUsername
                    ? 'var(--color-background-5)'
                    : 'unset',
              }}
              onClick={onDiscussionClick}
              id="b-btn-discussion"
            >
              <IconDiscussion fill="var(--color-icon)" />
              <div className="menu-description">Discussions</div>
            </div>
            <div
              className="b-menu-item"
              style={{
                display: isWarpcast ? 'flex' : 'none',
                '--color-icon': initialUsername
                  ? 'var(--color-primary-text)'
                  : 'var(--color-secondary-text)',
                backgroundColor: initialUsername
                  ? 'var(--color-background-5)'
                  : 'unset',
              }}
              onClick={onInsightsClick}
              id="b-btn-insights"
            >
              <IconMenuInsights fill="var(--color-icon)" />
              <div className="menu-description">Profile Insight</div>
            </div>
            <div className="b-menu-item" onClick={onCloseClick}>
              <IconMenuClose />
              <div className="menu-description">Close</div>
            </div>
          </div>
          <div
            className={`btn-toggle ${
              castCount > 0 && alertCastCount && !openPlugin
                ? 'alert-active'
                : ''
            }`}
            style={{
              marginLeft:
                castCount > 0 && !openPlugin && !alertCastCount ? 10 : 0,
            }}
          >
            <div className="content-cast-count">
              <IconJumpIn />
              <span className="b-fc-label">Show {castCount} posts</span>
            </div>
            <IconBuidlerLogo />
          </div>
          {castCount > 0 && !alertCastCount && !openPlugin && (
            <div className="cast-badge">{castBadgeDisplay}</div>
          )}
        </div>
      </div>
      <div
        className={`buidler-theme b-fc-plugin-container ${
          openPlugin ? 'b-fc-plugin-open' : ''
        }`}
      >
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <iframe
            ref={iframeRef}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: 'var(--color-background-1)',
              colorScheme: 'auto',
              opacity: loaded ? 1 : 0,
              margin: 0,
            }}
            title="b-fc-plugin"
            src={
              baseUrl +
              'plugin-fc' +
              (initialUsername ? `/insights/${initialUsername}` : '')
            }
            id="fc-plugin-frame"
            onLoad={onLoadIframe}
            data-signer-id={dataSignerId}
            data-open={openPlugin}
          />
          {!loaded && <Spinner />}
        </div>
      </div>
      <div id="fc-plugin-alert" className="b-fc-alert-container"></div>
      <div
        id="fc-plugin-confirm-modal"
        className="buidler-theme b-fc-modal-container"
        style={{ display: 'none' }}
        onClick={onCancelClick}
      >
        <div className="b-fc-modal-wrap" onClick={preventParentClick}>
          <span className="modal-title">Cast to Farcaster</span>
          <span className="modal-description">
            Are you sure you'd like to cast this content to Farcaster?
          </span>
          <div className="modal-actions">
            <div className="btn-cancel" onClick={onCancelClick}>
              Cancel
            </div>
            <div id="b-fc-btn-cast" className="btn-cast">
              Cast
            </div>
          </div>
        </div>
      </div>
      {user && <ModalCompose user={user} channels={channels} />}
      {user && (
        <ModalReply user={user} cast={parentCast} onClose={onCloseReply} />
      )}
      <ModalImage src={originSrc} />
    </>
  );
};

export default FCPlugin;
