

(function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
})('$script', function () {

  var scriptStatus = {},
  urlArgs,
  isDev = false,
  baseUrl = false,
  doc = document,
  head = doc.getElementsByTagName('head')[0];

  $script.clearGlobal = function () {
      scriptStatus = {};
      urlArgs = '';
  }

  $script.urlArgs = function (str) {
      urlArgs = str;
  }

  $script.isDev = function (o, b) {
      isDev = o;
      baseUrl = b;
  }

  function $script() {
      var scripts = [], styles = [], callback, stylesXml = [], scriptsXml = [], xhttp, configs;

      if (arguments && arguments.length) {

          if (typeof arguments[0] === 'object' && Object.prototype.toString.call(arguments[0]) === "[object Object]") {
              if (arguments[0].scripts) scripts = arguments[0].scripts;
              if (arguments[0].styles) styles = arguments[0].styles;
              if (arguments[0].callback) callback = arguments[0].callback;
              if (arguments[0].stylesXml) stylesXml = arguments[0].stylesXml;
              if (arguments[0].scriptsXml) scriptsXml = arguments[0].scriptsXml;
              if (arguments[0].configs) configs = arguments[0].configs;
          } else {
              scripts = arguments[0];

              if (arguments[arguments.length - 1] && arguments[arguments.length - 1].call) {
                  callback = arguments[arguments.length - 1];
              }

              if (arguments.length > 1 && arguments[1] && !arguments[1].call) {
                  styles = arguments[1];
              }

              if (arguments.length > 2 && arguments[2] && !arguments[2].call) {
                  scriptsXml = arguments[2];
              }

              if (arguments.length > 3 && arguments[3] && !arguments[3].call) {
                  stylesXml = arguments[3];
              }

              if (scripts) {
                  scripts = scripts['push'] ? scripts : [scripts];
              }

              if (styles) {
                  styles = styles['push'] ? styles : [styles];
              }

              if (scriptsXml) {
                  scriptsXml = scriptsXml['push'] ? scriptsXml : [scriptsXml];
              }

              if (stylesXml) {
                  stylesXml = stylesXml['push'] ? stylesXml : [stylesXml];
              }
          }
      }

      var loadSync = function (scripts, styles, callback) {
          if (scripts && scripts.length) {
              var cb = callback;

              for (var i = scripts.length - 1; i >= 0; i--) {
                  if (i == 0) {
                      cb = (function (a, b, c) { return function () { load([a], b, c) }; }(scripts[i], styles, cb));
                  } else {
                      cb = (function (a, b, c) { return function () { load([a], b, c) }; }(scripts[i], [], cb));
                  }
              }

              cb();
          } else {
              load(scripts, styles, callback);
          }
      }

      var load = function (scripts, styles, callback) {
          if (scripts) {
              scripts = scripts['push'] ? scripts : [scripts];
          }

          if (styles) {
              styles = styles['push'] ? styles : [styles];
          }

          if (scripts.length || styles.length) {
              var errors, complete;

              var onprocessed = function (e, success) {
                  if (e && e.target) {
                      var el = e.target;

                      el.onerror = el.onload = null;

                      var customEvent;

                      if (e.target.src) {
                          if (complete) {
                              complete(e.target.src, success);
                          }

                          customEvent = new Event('$script_loaded_' + e.target.src.toLowerCase());
                      } else if (e.target.href) {
                          if (complete) {
                              complete(e.target.href, success);
                          }

                          customEvent = new Event('$script_loaded_' + e.target.href.toLowerCase());
                      }

                      if (customEvent) document.dispatchEvent(customEvent);
                  }
              }

              var onload = function (e) {
                  onprocessed(e, true);
              }

              var onerror = function (e) {
                  onprocessed(e, false);
              }

              var setScriptStatus = function (path) {
                  var key = path.toLowerCase();

                  if (scriptStatus[key] == 2) {
                      if (complete) {
                          complete(path, true);
                      }
                      return;
                  }

                  if (scriptStatus[key] == 1) {
                      document.addEventListener('$script_loaded_' + key, complete, false);
                      return;
                  }

                  return key;
              }

              if (callback && callback.call) {
                  var processedCount = scripts.length + styles.length;

                  complete = function (path, success) {
                      if (path) {
                          var key = path.toLowerCase();

                          scriptStatus[key] = success ? 2 : 3;

                          if (!success) {
                              if (!errors) {
                                  errors = [];
                              }

                              errors.push(path);
                          }

                          processedCount--;

                          if (!processedCount) {
                              callback(errors);
                          }
                      }
                  }
              }

              for (var i = 0; i < styles.length; i++) {
                  var path = styles[i];

                  if (path) {
                      var key = setScriptStatus(path);

                      if (key) {
                          var el = doc.createElement('link');

                          el.onload = onload;
                          el.onerror = onerror;

                          el.setAttribute("rel", "stylesheet")
                          el.setAttribute("type", "text/css")
                          el.setAttribute("href", urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path);
                          head.insertBefore(el, head.lastChild)

                          scriptStatus[key] = 1;
                      }
                  }
              }

              for (var i = 0; i < scripts.length; i++) {
                  var path = scripts[i];

                  if (path) {
                      var key = setScriptStatus(path);

                      if (key) {
                          var el = doc.createElement('script');

                          el.onload = onload;
                          el.onerror = onerror;

                          el.async = configs && configs.sync ? 0 : 1;
                          el.src = urlArgs ? path + (path.indexOf('?') === -1 ? '?' : '&') + urlArgs : path;
                          head.insertBefore(el, head.lastChild)

                          scriptStatus[key] = 1;
                      }
                  }
              }
          }
      };

      if (isDev && (stylesXml.length || scriptsXml.length)) {
          var styleIdx = stylesXml.length, scriptIdx = scriptsXml.length;

          styles.length = 0;
          scripts.length = 0;

          for (var i = 0; i < scriptsXml.length; i++) {
              var xhttp = new XMLHttpRequest();
              xhttp.onreadystatechange = function () {
                  if (this.readyState == 4 && this.status == 200) {
                      var xml = (new window.DOMParser()).parseFromString(this.response, "text/xml");
                      var fileElements = xml.documentElement.getElementsByTagName('file');

                      for (var j = 0; j < fileElements.length; j++) {
                          scripts.push((baseUrl ? baseUrl : window.baseUrl) + fileElements[j].childNodes[0].textContent);
                      }

                      scriptIdx--;
                      if (scriptIdx == 0 && styleIdx == 0) {
                          loadSync(scripts, styles, callback);
                      }
                  }
              };
              xhttp.open("GET", scriptsXml[i], true);
              xhttp.send();
          }

          for (var i = 0; i < stylesXml.length; i++) {
              var xhttp = new XMLHttpRequest();
              xhttp.onreadystatechange = function () {
                  if (this.readyState == 4 && this.status == 200) {
                      var xml = (new window.DOMParser()).parseFromString(this.response, "text/xml");
                      var fileElements = xml.documentElement.getElementsByTagName('file');
                      for (var k = 0; k < fileElements.length; k++) {
                          styles.push(window.baseUrl + fileElements[k].childNodes[0].textContent);
                      }

                      styleIdx--;
                      if (scriptIdx == 0 && styleIdx == 0) {
                          loadSync(scripts, styles, callback);
                      }
                  }
              };
              xhttp.open("GET", stylesXml[i], true);
              xhttp.send();
          }
      } else {
          load(scripts, styles, callback);
      }

      return $script;
  }

  return $script;
});
