// template - highlight element
// template - highlight toolbar
// template - highlight menu

// store - query string node
// store - start / end offset
// store - content highlight
// store - uuid highlight

// func - highlight by range, cast with highlight
// func - remove highlight by id, remove cast

function removeHighlight(id) {
  // select element to unwrap
  const elements = document.querySelectorAll(`#${id}`);
  elements.forEach((el) => {
    var parent = el.parentNode;

    // move all children out of the element
    while (el.firstChild) parent.insertBefore(el.firstChild, el);

    // remove the empty element
    parent.removeChild(el);
  });
}

function elementFromQuery(storedQuery) {
  const re = />textNode:nth-of-type\(([0-9]+)\)$/iu;
  const result = re.exec(storedQuery);

  if (result) {
    // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
    const textNodeIndex = parseInt(result[1], 10);
    storedQuery = storedQuery.replace(re, '');
    const parent = robustQuerySelector(storedQuery);

    if (!parent) return undefined;

    return parent.childNodes[textNodeIndex];
  }

  return robustQuerySelector(storedQuery);
}

function robustQuerySelector(query) {
  try {
    return document.querySelector(query);
  } catch (error) {
    // It is possible that this query fails because of an invalid CSS selector that actually exists in the DOM.
    // This was happening for example here: https://lawphil.net/judjuris/juri2013/sep2013/gr_179987_2013.html
    // where there is a tag <p"> that is invalid in HTML5 but was still rendered by the browser
    // In this case, manually find the element:
    let element = document;
    for (const queryPart of query.split('>')) {
      if (!element) return null;

      const re = /^(.*):nth-of-type\(([0-9]+)\)$/iu;
      const result = re.exec(queryPart);
      const [, tagName, index] = result || [undefined, queryPart, 1];
      element = Array.from(element.childNodes).filter(
        (child) => child.localName === tagName
      )[index - 1];
    }
    return element;
  }
}

// From an DOM element, get a query to that DOM element
function getQuery(element) {
  if (element.id) return `#${escapeCSSString(element.id)}`;
  if (element.localName === 'html') return 'html';

  const parent = element.parentNode;

  const parentSelector = getQuery(parent);
  // The element is a text node
  if (!element.localName) {
    // Find the index of the text node:
    const index = Array.prototype.indexOf.call(parent.childNodes, element);
    return `${parentSelector}>textNode:nth-of-type(${index})`;
  } else {
    const index =
      Array.from(parent.childNodes)
        .filter((child) => child.localName === element.localName)
        .indexOf(element) + 1;
    return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
  }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, '\\$1');
}

export { removeHighlight, elementFromQuery, getQuery };
