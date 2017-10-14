(function() {
  'use strict';
  customElements.define('view-json', class extends HTMLElement {
    constructor() {
      super(); // always always
      this.attachShadow({mode: 'open'});
    }
    connectedCallback() {
      let colors = { green: '#a3eea0', orange: '#d19a66', blue: '#4ba7ef', magenta: '#df9cf3', red: '#f9857b', black: '#282c34', white: '#dbdff4'};
      this.shadowRoot.innerHTML = `
      <style>
      :host pre { background-color: var(--background-color, ${colors.black}); color: var(--color, ${colors.white}); overflow: auto !important; }
      view-json pre { background-color: var(--background-color, ${colors.black}); color: var(--color, ${colors.white}); overflow: auto !important; }
      :host([inline]) > pre { display: inline; }
      view-json[inline] > pre { display: inline; }
      :host .string { color: var(--string-color, ${colors.green}); }/* :host is SHADOW ONLY */
      view-json .string { color: var(--string-color, ${colors.green}); }
      :host .number { color: var(--number-color, ${colors.orange}); }
      view-json .number { color: var(--number-color, ${colors.orange}); }/* when no shadow is available (shady/light/regular DOM) */
      :host .boolean { color: var(--boolean-color, ${colors.blue}); }
      view-json .boolean { color: var(--boolean-color, ${colors.blue}); }
      :host .null { color: var(--null-color, ${colors.magenta}); }
      view-json .null { color: var(--null-color, ${colors.magenta}); }
      :host .key { color: var(--key-color, ${colors.red}); }
      view-json .key { color: var(--key-color, ${colors.red}); }
      #view-json__pre { box-shadow: 0 2px 2px rgba(0, 0, 0, .3); overflow: scroll; padding: 5px; margin: 5px; }
      </style>
      <pre id="view-json__pre"></pre>
      `;
      this._refresh();
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.target.localName === 'view-json') this._refresh();
        }.bind(this));
      }.bind(this));
      observer.observe(this, { attributes: true, childList: true, characterData: true });
      this.setupI18n();
    }
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
        console.log('dispatching event', eventName);
        var event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
        this.dispatchEvent(event);
      };
      this.resolveUrl = function(url, baseURI) {
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
      this.attached();//call our new attached function (no conflict since this isn't Polymer)
      this.__updateLanguage('es', 'en');
    }
    disconnectedCallback() {}
    _refresh() {
      const preEl = this.shadowRoot.querySelector('#view-json__pre');
      try {
        if (Array.from(this.attributes).map(item => item.name).includes('no-parse')) preEl.innerHTML = this.textContent;
        else preEl.innerHTML = this._syntaxHighlight(this.textContent);
      } catch (e) {
        preEl.innerHTML = `<span class='key'>${e}</span>`;
      }
    }
    _syntaxHighlight(json) {//thanks: https://stackoverflow.com/a/7220510/4151489
      if (typeof json != 'string') json = JSON.stringify(json, null, 2);
      else json = JSON.stringify(JSON.parse(json), null, 2);
      json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let colorCode = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) colorCode = 'key';
          else colorCode = 'string';
        } else if (/true|false/.test(match)) colorCode = 'boolean';
        else if (/null/.test(match)) colorCode = 'null';
        return '<span class="' + colorCode + '">' + match + '</span>';
      });
    }
  });
}());
