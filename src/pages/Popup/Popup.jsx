import React, { useCallback, useEffect } from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import './Popup.css';

const Popup = () => {
  // return <iframe title='xxx' src='https://community.buidler.app/' width={720} height={1080} />
  // useEffect(() => {
  //   chrome.windows.create({
  //     // Just use the full URL if you need to open an external page
  //     url: 'https://community.buidler.app/',
  //     width: 300,
  //     height: 200,
  //     setSelfAsOpener: true,
  //     type: 'popup',
  //   });
  // }, [])
  const callback = useCallback((content) => {
    console.log('XXX: ', content);
  }, []);
  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { from: 'popup', subject: 'DOMInfo' },
          callback
        );
      }
    );
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>xxx</p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
      </header>
    </div>
  );
};

export default Popup;
