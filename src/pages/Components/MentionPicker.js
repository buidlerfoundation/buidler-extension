import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import {
  extractContent,
  getLastIndexOfMention,
  getUsersByName,
} from '../../utils';

const MentionItem = ({
  fid,
  name,
  displayName,
  url,
  index,
  selectedMentionIndex,
  onEnter,
  enterMention,
}) => {
  const onMouseEnter = useCallback(() => onEnter(index), [index, onEnter]);
  return (
    <div
      id={fid}
      style={{
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 15,
        cursor: 'pointer',
        backgroundColor:
          index === selectedMentionIndex
            ? 'var(--color-highlight-action)'
            : 'unset',
      }}
      onMouseEnter={onMouseEnter}
      onClick={enterMention}
    >
      <img
        alt="avatar"
        style={{ width: 35, height: 35, borderRadius: '50%' }}
        src={url}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontSize: 15,
            lineHeight: '19px',
            fontWeight: 600,
            color: 'var(--color-primary-text)',
          }}
        >
          {displayName}
        </span>
        <span
          style={{
            fontSize: 14,
            lineHeight: '17px',
            color: 'var(--color-secondary-text)',
          }}
        >
          @{name}
        </span>
      </div>
    </div>
  );
};

const MentionItemMemo = memo(MentionItem);

const MentionPicker = ({
  inputClass,
  inputStyle,
  text,
  setText,
  popupStyle,
}) => {
  const timeOutGetUser = useRef();
  const timeout = useRef();
  const inputRef = useRef();
  const [anchorPopup, setPopup] = useState(false);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPos, setMentionPos] = useState({
    start: -1,
    end: -1,
    character: '',
  });
  const [mentionStr, setMentionStr] = useState(null);
  const [loadingDataUser, setLoadingDataUser] = useState(false);
  const [dataUsers, setDataUsers] = useState([]);
  const getCaretIndex = useCallback((element) => {
    let position = 0;
    if (!element) return position;
    const isSupported = typeof window.getSelection !== 'undefined';
    if (isSupported) {
      const selection = window.getSelection();
      if (selection.rangeCount !== 0) {
        const range = window?.getSelection?.()?.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        position = preCaretRange.toString().replaceAll('\n', '').length;
      }
    }
    return position;
  }, []);
  const onCloseMention = useCallback(() => {
    setPopup(false);
    inputRef?.current?.focus();
    setMentionPos({ start: -1, end: -1, character: '' });
    setDataUsers([]);
  }, [inputRef]);
  const findMentionIndexHtml = useCallback(() => {
    const idx = getCaretIndex(inputRef?.current);
    const str = extractContent(text).replaceAll('\n', '');
    const mStr = str.substring(mentionPos.start + 1, idx);
    const regex = new RegExp(`${mentionPos.character}${mStr}`, 'g');
    let result1;
    let result2;
    const indices1 = [];
    const indices2 = [];
    while ((result1 = regex.exec(str.substring(0, idx)))) {
      indices1.push(result1.index);
    }
    while ((result2 = regex.exec(text))) {
      indices2.push(result2.index);
    }
    return indices2[indices1.length - 1];
  }, [getCaretIndex, inputRef, mentionPos.character, mentionPos.start, text]);
  const mentionSelected = useCallback(() => {
    if (mentionPos.character === '@') {
      const el = dataUsers[selectedMentionIndex];
      const idx = findMentionIndexHtml();
      const mentionValue = `<a class='mention-string' data-fid='${el.fid}'>@${el.username}</a>&nbsp;`;
      const newText = `${text.substring(0, idx)}${mentionValue}${text.substring(
        idx + 1 + (mentionStr?.length || 0)
      )}`;
      setText(newText);
      setDataUsers([]);
      setTimeout(onCloseMention, 0);
    }
  }, [
    dataUsers,
    findMentionIndexHtml,
    mentionPos.character,
    mentionStr?.length,
    onCloseMention,
    selectedMentionIndex,
    setText,
    text,
  ]);
  const enterMention = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(mentionSelected, 50);
  }, [mentionSelected]);
  const checkTriggerMention = useCallback(
    (value) => {
      const idx = getCaretIndex(inputRef?.current);
      const str = extractContent(value || text).replaceAll('\n', '');
      const lastIndexMentionUser = str.substring(0, idx).lastIndexOf('@');
      const start = lastIndexMentionUser;
      setMentionPos({
        start,
        end: idx,
        character: '@',
      });
      setSelectedMentionIndex(0);
    },
    [getCaretIndex, inputRef, text]
  );
  const handleMentionEnter = useCallback(
    (index) => setSelectedMentionIndex(index),
    []
  );
  const handleChangeText = useCallback(
    (e) => {
      const value = e.target.value
        .replace(/<div><br><\/div>/gim, '<br>')
        .replace(/<div>(.*?)<\/div>/gim, '<br>$1');
      const valueTrimmed = value.trim();
      if (
        extractContent(text).trim() === extractContent(e.target.value).trim() &&
        valueTrimmed[0] === '<' &&
        valueTrimmed[valueTrimmed.length - 1] === '>' &&
        valueTrimmed
          .replace(/&nbsp;/g, '')
          .substring(valueTrimmed.length - 4) !== '<br>'
      ) {
        setText('');
      } else if (
        valueTrimmed
          .replace(/&nbsp;/g, '')
          .substring(valueTrimmed.length - 4) === '</a>'
      ) {
        const lastIdx = getLastIndexOfMention(valueTrimmed);
        if (lastIdx === 0) {
          setText('');
        } else if (lastIdx > 0) {
          setText(valueTrimmed.replace(/&nbsp;/g, '').substring(0, lastIdx));
        } else {
          setText(valueTrimmed);
        }
      } else {
        setText(value);
        checkTriggerMention(value);
      }
    },
    [checkTriggerMention, setText, text]
  );
  const renderMentionItem = useCallback(
    (item, index) => (
      <MentionItemMemo
        key={item.fid}
        url={item.pfp?.url}
        name={item.username}
        displayName={item.display_name}
        index={index}
        fid={item.fid}
        selectedMentionIndex={selectedMentionIndex}
        onEnter={handleMentionEnter}
        enterMention={mentionSelected}
      />
    ),
    [handleMentionEnter, mentionSelected, selectedMentionIndex]
  );
  useEffect(() => {
    const keyDownListener = (e) => {
      if (e.key === 'Escape') {
        if (anchorPopup) {
          setPopup(false);
        } else {
          inputRef?.current?.blur?.();
        }
      } else if (e.code === 'ArrowDown' && !!anchorPopup) {
        e.preventDefault();
        setSelectedMentionIndex((current) => {
          const nextIndex = current === dataUsers.length - 1 ? 0 : current + 1;
          const element = document.getElementById(dataUsers[nextIndex].fid);
          if (element) {
            element?.scrollIntoView({ block: 'nearest' });
          }
          return nextIndex;
        });
      } else if (e.code === 'ArrowUp' && !!anchorPopup) {
        e.preventDefault();
        setSelectedMentionIndex((current) => {
          const nextIndex = current === 0 ? dataUsers.length - 1 : current - 1;
          const element = document.getElementById(dataUsers[nextIndex].fid);
          if (element) {
            element?.scrollIntoView({ block: 'nearest' });
          }
          return nextIndex;
        });
      }
      if (e.code === 'Enter' && !!anchorPopup) {
        e.preventDefault();
        enterMention();
      }
    };
    document.onclick = () => {
      if (anchorPopup) {
        setPopup(false);
      }
    };
    window.addEventListener('keydown', keyDownListener);
    return () => {
      window.removeEventListener('keydown', keyDownListener);
    };
  }, [anchorPopup, enterMention, text, inputRef, dataUsers]);
  useEffect(() => {
    const str = extractContent(text).replaceAll('\n', '');
    if (mentionPos.start >= 0 && mentionPos.start < str.length) {
      const res = str.substring(mentionPos.start + 1, mentionPos.end);
      if (/\s/.test(res)) {
        setMentionStr(null);
      } else {
        setMentionStr(res);
      }
    } else {
      setMentionStr(null);
    }
  }, [mentionPos, text]);
  useEffect(() => {
    if (mentionStr !== null && dataUsers.length > 0 && text.length > 0) {
      setPopup(true);
    } else {
      setPopup(null);
    }
  }, [dataUsers.length, mentionStr, text.length]);
  useEffect(() => {
    if (mentionPos.character === '@' && !!mentionStr) {
      if (timeOutGetUser.current) {
        clearTimeout(timeOutGetUser.current);
      }
      timeOutGetUser.current = setTimeout(() => {
        setLoadingDataUser(true);
        // api get users
        getUsersByName(mentionStr)
          .then((res) => {
            res.json().then((data) => {
              setDataUsers(data.data);
            });
          })
          .finally(() => {
            setLoadingDataUser(false);
          });
      }, 200);
    }
  }, [mentionPos.character, mentionStr]);
  const handlePaste = useCallback((event) => {
    event.preventDefault();
    if (!event.clipboardData.types.includes('Files')) {
      const text = event.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
  }, []);
  return (
    <>
      <ContentEditable
        html={text}
        onChange={handleChangeText}
        className={inputClass}
        innerRef={inputRef}
        style={inputStyle}
        onKeyDown={(e) => e.stopPropagation()}
        onPaste={handlePaste}
      />
      {!loadingDataUser && anchorPopup && (
        <div className="ex-popup-mention__container" style={popupStyle}>
          {dataUsers.map(renderMentionItem)}
        </div>
      )}
    </>
  );
};

export default memo(MentionPicker);
