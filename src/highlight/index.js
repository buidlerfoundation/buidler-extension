// template - highlight element
// template - highlight toolbar
// template - highlight menu

// store - query string node
// store - start / end offset
// store - content highlight
// store - uuid highlight

// func - highlight by range, cast with highlight
// func - remove highlight by id, remove cast

export const removeHighlight = (id) => {
  // select element to unwrap
  var el = document.getElementById(id);

  // get the element's parent node
  var parent = el.parentNode;

  // move all children out of the element
  while (el.firstChild) parent.insertBefore(el.firstChild, el);

  // remove the empty element
  parent.removeChild(el);
};
