var loadCecApplication = function () {
  if (window.localStorage) window.localStorage.FEK = '0wtdrB-16kF-11F-11G3C-8qr==';
  var showError = function (err) {
    if (window.cecCordovaApp) {
      window.cecCordovaApp.isError = true;
      window.cecCordovaApp.showError(err);
    }

    if (window.cecPreferences && window.cecPreferences['com.careered.environment'] && window.cecPreferences['com.careered.environment'].toLowerCase() != "prod") {
      alert(err);
    } else {
      console.log(err);
    }
  }


  var getDefinedCss = function (s) {
    try {
      if (!document.styleSheets) return '';
      if (typeof s == 'string') s = RegExp('\\b' + s + '\\b', 'i'); // IE capitalizes html selectors

      var A, S, DS = document.styleSheets, n = DS.length, SA = [];

      while (n) {
        S = DS[--n];

        if (S) {
          A = (S.rules) ? S.rules : S.cssRules;

          if (A) {
            for (var i = 0, L = A.length; i < L; i++) {
              tem = A[i].selectorText ? [A[i].selectorText, A[i].style.cssText] : [A[i] + ''];
              if (s.test(tem[0])) SA[SA.length] = tem;
            }
          }
        }
      }

      return SA.join('\n\n');
    } catch (ex) { }

    return '';
  }

  /*
  window.onbeforeunload = function () {
      //return "Do you really want to leave our brilliant application?";
      //if we return nothing here (just calling return;) then there will be no pop-up question at all
      //return false;
  };
  */




  if (window.hasOwnProperty('$script')) {
    var url = window.cecPreferences['com.careered.url'];
    var themeId = window.cecPreferences['com.careered.theme_id'] || 9;
    var UAPropertyId;

    var appEnv = window.cecPreferences['com.careered.environment'];

    var gaCECIT = 'UA-58507729-';
    var gaCTU;
    var gaAIU;

    if (appEnv === 'dev') {
      gaCTU = '33';
      gaAIU = '34';
    }
    if (appEnv === 'int') {
      gaCTU = '35';
      gaAIU = '36';
    }
    if (appEnv === 'reg') {
      gaCTU = '37';
      gaAIU = '38';
    }

    window['trackIfDelayedLoad'] = function (ws) {
      if (themeId === 9) {
       //ctu
        UAPropertyId = gaCECIT + gaCTU;
      } else if (themeId === 18) {
       //aiu
        UAPropertyId = gaCECIT + gaAIU;
      }
      if (appEnv === 'prod') {
        if (themeId === 9) {
          UAPropertyId = 'UA-54437226-13';
        } else if (themeId === 18) {
          UAPropertyId = 'UA-56976903-6';
        }
      }

      try {
        var uuidStorage = window.localStorage.getItem('uuidStorage') ? window.localStorage.getItem('uuidStorage') : 'undefined';
      }
      catch (err) {
        console.log("error: " + err);
      }
      if (uuidStorage === 'undefined') {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        window.localStorage.setItem('uuidStorage', uuid);
      } else {
        uuid = uuidStorage;
      }
      (function (i, s, o, g, r, a, m) { i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments); }, i[r].l = 1 * new Date(); a = s.createElement(o), m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m); })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga_dev');

      var gaEventAction = ws === 'true' ? 'User is seeing white screen and is stuck' : 'User is seeing splash screen for over 25sec';
      window['ga_dev']('create', UAPropertyId, { 'storage': 'none', 'clientId': uuid });

      window['ga_dev']('set', 'checkProtocolTask', null);

      window['ga_dev']('set', 'forceSSL', true);

      window['ga_dev']('set', 'transport', 'image');

      window['ga_dev']('send',
        {
          'hitType': 'event',
          'eventCategory': 'BlankPageNotRunningApp',
          'eventAction': gaEventAction,
          'eventLabel': 'BlankPageNotRunningApp'
        }
      );
    };
    window['trackIfDelayedLoadTo'] = 0;
  // window['trackIfDelayedLoadTo'] = setTimeout(window['trackIfDelayedLoad'], 25000);

    if (url && themeId) {

      isChacheBust = true;
      (function (i, s, o, g, r, a, m) { i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function () { (i[r].q = i[r].q || []).push(arguments); }, i[r].l = 1 * new Date(); a = s.createElement(o), m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m); })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');


      var dt = window.cecPreferences['com.careered.cacheSuffix'] || (new Date()).getTime();

      $script({ styles: ['https://fonts.googleapis.com/css?family=Open+Sans|Oswald|Roboto'] });

      $script({

        styles: [url + 'loader/loading/loading.css?dt=' + dt],
        callback: function (isError) {
          if (isError && !getDefinedCss('cec-loading-completed')) {
            showError('There was a problem loading the application (E1.1)');
            return;
          }

          var callback = function (isError) {
            if (isError) {
              showError('There was a problem loading the application (E1.2)');
              return;
            }


            setTimeout(function () {
                setTimeout(function () {
                  $script({
                    scripts: [url + 'config.js?dt=' + dt, url + '../polyfills.js?dt=' + dt, url + '../runtime.js?dt=' + dt, url + '../vendor.js?dt=' + dt, url + '../main.js?dt=' + dt, url + '../common.js?dt=' + dt ],
                    styles: [url + '../styles.css?dt=' + dt],
                    callback: function (isError) {
                      if (isError && !getDefinedCss('app-main-loading-complete')) {
                        showError('There was a problem loading the application (E1.3)');
                        return;
                      }
                      // $script({
                      //   scripts: [url + '../main.js?dt=' + dt],

                      //   callback: function (isError) {
                      //     if (isError) {
                      //       showError('There was a problem loading the application (E1.4)');
                      //       return;
                      //     }
                      //   }
                      // });
                      // $script({
                      //   scripts: [url + '../sendbird.min.js?dt=' + dt]
                      // });
                    }
                  });

                }, 100);
            }, 100);
          }
          if (window.location && window.location.hash && window.location.hash.toLowerCase().indexOf('firstload') >= 0) {
            callback();
          } else {
            setTimeout(function () {
              $script({
                scripts: [url + 'loader/loading/loading.js?dt=' + dt],
                callback: callback
              });
            }, 100);
          }
        }
      });
      return;
    }
  }

  showError("There was a problem initializing the application  (E2)");
}
loadCecApplication();

