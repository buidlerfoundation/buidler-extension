import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import IconJumpIn from './SVG/IconJumpIn';
import { getCountByUrls, toggleModalCompose, twTheme } from '../../utils';
import Spinner from './Spinner';
import IconBuidlerLogo from './SVG/IconBuidlerLogo';
import IconMenuToggle from './SVG/IconMenuToggle';
import IconMenuPlus from './SVG/IconMenuPlus';
import IconMenuClose from './SVG/IconMenuClose';
import numeral from 'numeral';
import ModalCompose from './ModalCompose';
import { getMetadata } from '../Content/htmlParser';

const FCPlugin = ({ signerId, open }) => {
  const [openPlugin, setOpenPlugin] = useState(open === 'true');
  const [alertCastCount, setAlertCastCount] = useState(false);
  const iframeRef = useRef();
  const [openMenu, setOpenMenu] = useState(false);
  const [openComposeAfterLogin, setOpenComposeAfterLogin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [dataSignerId, setDataSignerId] = useState('');
  const [user, setUser] = useState(null);
  const initialTheme = useMemo(() => twTheme(), []);
  const [castCount, setCastCount] = useState(0);
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
    if (dataSignerId) {
      fetch('https://prod.api.buidler.app/xcaster/users/me', {
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
  useEffect(() => {
    const messageListener = (e) => {
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
    };
    window.addEventListener('message', messageListener);
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [onCreateClick, openComposeAfterLogin, togglePlugin]);
  const onLoadIframe = useCallback(() => {
    const metadata = getMetadata();
    iframeRef.current?.contentWindow?.postMessage?.(
      {
        type: 'b-fc-initial-data',
        payload: {
          signerId: signerId || '',
          q: initialUrl,
          theme: initialTheme,
          ...metadata,
        },
      },
      '*'
    );
    setTimeout(() => {
      setLoaded(true);
    }, 500);
  }, [initialTheme, initialUrl, signerId]);
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
          {(openMenu || openPlugin) && (
            <div
              className={`plugin-menu ${openPlugin ? 'plugin-menu-open' : ''}`}
            >
              <div className="b-menu-item">
                <IconMenuToggle
                  style={
                    openPlugin ? { transform: 'rotate(180deg)' } : undefined
                  }
                />
                <div className="menu-description">
                  {openPlugin ? 'Minimize' : 'Open'}
                </div>
              </div>
              <div className="b-menu-item" onClick={onCreateClick}>
                <IconMenuPlus />
                <div className="menu-description">New post</div>
              </div>
              <div className="b-menu-item" onClick={onCloseClick}>
                <IconMenuClose />
                <div className="menu-description">Close</div>
              </div>
            </div>
          )}
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
            src="https://buidler.app/plugin-fc"
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
      {user && <ModalCompose user={user} />}
    </>
  );
};

export default FCPlugin;
