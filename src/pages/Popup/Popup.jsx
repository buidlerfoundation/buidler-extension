import React, { useCallback, useEffect, useRef, useState } from 'react';
import './Popup.css';
import IconClose from '../Components/SVG/IconClose';
import { disabledDomainKey, disabledSidebarKey } from '../../constant';
import SwitchButton from '../Components/SwitchButton';
import { getCountByUrls, regexUrl } from '../../utils';

const Popup = () => {
  const tabUrl = useRef();
  const tabId = useRef();
  const castCount = useRef(0);
  const firstCheck = useRef(false);
  const [inputDomain, setInputDomain] = useState();
  const [disabledAll, setDisabledAll] = useState(false);
  const [disabledDomains, setDisabledDomains] = useState([]);
  const callback = useCallback((content) => {}, []);
  const onClosePopup = useCallback(() => {
    window.close();
  }, []);
  const onSwitchChange = useCallback((active) => {
    setDisabledAll(active);
  }, []);
  const onAddDomain = useCallback(() => {
    if (!inputDomain || !regexUrl.test(inputDomain)) return;
    setDisabledDomains((current) => {
      if (current.includes(inputDomain)) return current;
      return [...current, inputDomain];
    });
    setInputDomain('');
  }, [inputDomain]);
  const initialConfig = useCallback(async () => {
    const storageConfig = await chrome.storage.local.get([
      disabledSidebarKey,
      disabledDomainKey,
    ]);
    if (storageConfig[disabledDomainKey]) {
      setDisabledDomains(storageConfig[disabledDomainKey]?.split?.(',') || []);
    }
    try {
      setDisabledAll(JSON.parse(storageConfig[disabledSidebarKey]));
    } catch (error) {
      console.log(error);
    }
  }, []);
  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        if (tabs[0]?.url) {
          tabUrl.current = new URL(tabs[0].url).host;
          getCountByUrls([tabs[0]?.url]).then((res) =>
            res.json().then((data) => {
              if (data.success) {
                try {
                  const value = Object.values(data.data)?.[0] || 0;
                  castCount.current = value;
                } catch (error) {}
              }
            })
          );
        }
        tabId.current = tabs[0].id;
        chrome.tabs.sendMessage(
          tabs[0].id,
          { from: 'popup', subject: 'DOMInfo' },
          callback
        );
      }
    );
  }, [callback]);
  useEffect(() => {
    initialConfig();
  }, [initialConfig]);
  useEffect(() => {
    if (firstCheck.current) {
      chrome.storage.local
        .set({
          [disabledSidebarKey]: JSON.stringify(disabledAll),
          [disabledDomainKey]: disabledDomains.join(','),
        })
        .then(() => {
          if (tabUrl.current && tabId.current) {
            if (!disabledAll && !disabledDomains.includes(tabUrl.current)) {
              chrome.action.setBadgeText({
                text: '',
                tabId: tabId.current,
              });
              chrome.tabs.sendMessage(
                tabId.current,
                { type: 'show-plugin-from-popup' },
                () => {}
              );
            } else {
              if (castCount.current > 0) {
                chrome.action.setBadgeText({
                  text: `${castCount.current}`,
                  tabId: tabId.current,
                });
              }
              chrome.tabs.sendMessage(
                tabId.current,
                { type: 'hide-plugin-from-popup' },
                () => {}
              );
            }
          }
        });
    } else {
      firstCheck.current = true;
    }
  }, [disabledAll, disabledDomains]);
  return (
    <div className="buidler-theme app">
      <div className="title">
        Setting
        <div
          className="normal-button-clear"
          style={{ padding: 4 }}
          onClick={onClosePopup}
        >
          <IconClose size={20} fill="var(--color-primary-text)" />
        </div>
      </div>
      <div className="body">
        <div className="setting-item">
          <div className="label-item">Sidebar Config</div>
          <div className="config-item">
            Turn off sidebar for all pages
            <SwitchButton active={disabledAll} onChange={onSwitchChange} />
          </div>
        </div>
        <div className="setting-item">
          <div className="label-item">Disable Domains</div>
          <span className="setting-description">
            The sidebar won't be displayed for URLs from this domains
          </span>
          <div className="input-box">
            <input
              className="input"
              placeholder="ex: google.com"
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
            />
            <div className="btn-add normal-button-clear" onClick={onAddDomain}>
              Add
            </div>
          </div>
          <div className="domain-lists">
            {disabledDomains.map((el) => (
              <div className="config-item" key={el}>
                {el}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 30,
                    height: 30,
                  }}
                  className="normal-button-clear"
                  onClick={() =>
                    setDisabledDomains((current) =>
                      current.filter((str) => str !== el)
                    )
                  }
                >
                  <IconClose />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;
