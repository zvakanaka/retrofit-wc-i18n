# WCI18n with Native Web Components
**NOTE:** This not at all the ideal solution, it is an example to better understand [wc-i18n](https://github.com/jshcrowthe/wc-i18n)  

Make this function available:
```js
function setupI18n(el) {
  /* global WCI18n */
  // loop through functions and add them to this component
  Object.values(WCI18n())
    .filter(w => typeof w === 'function')
    .forEach(func => {
      el[func.name] = func;
    });
  // loop through properties and add them to el component
  Object.keys(WCI18n().properties)
    .forEach(p => {
      el[p] = WCI18n().properties[p];
    });
  el.fire = function(eventName) {
    console.log('dispatching event', eventName);
    var event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
  };
  el.resolveUrl = function(url, baseURI) {
    // HACK: ripped out of Polymer source: https://github.com/Polymer/polymer/blob/0b23e746bf2232732a322b7614fd0dcf3a8b2a73/lib/utils/resolve-url.html#L51
    if (!baseURI) baseURI = document.baseURI || window.location.href;
    let resolveDoc = document.implementation.createHTMLDocument('temp');
    resolveDoc.base = resolveDoc.createElement('base');
    resolveDoc.head.appendChild(resolveDoc.base);
    resolveDoc.anchor = resolveDoc.createElement('a');
    resolveDoc.body.appendChild(resolveDoc.anchor);
    resolveDoc.base.href = baseURI;
    resolveDoc.anchor.href = url;
    return resolveDoc.anchor.href || url;
  };
  el.attached();//call our new attached function (no conflict since el isn't Polymer)
  el.__updateLanguage('es', 'en');
}
```

Once defined, pass your component into the setupI18n function:
```js
customElements.whenDefined('view-json').then(() => {
  let viewJson = document.querySelector('view-json');
  setupI18n(viewJson);
  viewJson.addEventListener('wc-i18n-translations-loaded', function(event) { // translation load/update
    //react to changes here
    viewJson.innerHTML = viewJson.i18n('hello');
  });
});
```
