# WCI18n with Native Web Components
**NOTE:** This not at all the ideal solution, it is an example to better understand [wc-i18n](https://github.com/jshcrowthe/wc-i18n)  

Add this function to your component:
```js
setupI18n() {
  /* global WCI18n */
  // loop through functions and add them to this component
  Object.values(WCI18n())
    .filter(w => typeof w === 'function')
    .forEach(func => {
      this[func.name] = func;
    });
  // loop through properties and add them to this component
  Object.keys(WCI18n().properties)
    .forEach(p => {
      this[p] = WCI18n().properties[p];
    });
  this.fire = function(eventName) {
    var event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  };
  this.resolveUrl = function(url, baseURI) {
    // HACK: taken from Polymer source: https://github.com/Polymer/polymer/blob/0b23e746bf2232732a322b7614fd0dcf3a8b2a73/lib/utils/resolve-url.html#L51
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
  this.attached();//call our new attached function (no conflict since this isn't Polymer)
  this.__updateLanguage('es', 'en');//TODO: replace w/ real locale
}
```
Call the function in the `connectedCallback`:
`this.setupI18n();`

Load the translations into the component:
```js
let viewJson = document.querySelector('view-json');
viewJson.addEventListener('wc-i18n-translations-loaded', function(event) { // translation load/update
  viewJson.innerHTML = viewJson.i18n('hello');
});
```
