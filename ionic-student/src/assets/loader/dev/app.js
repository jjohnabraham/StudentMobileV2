var devLaunchCecApplication = function () {

  var serversUrls = {
    //'ASLR': { title: 'Alex LiveReload', url: 'http://csc04e396w16.dev.careered.com:8100/assets/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://csc04e396w16.dev.careered.com:8100/livereload.js?snipver=1' },
    'UALR': { title: 'Uzma LiveReload', url: 'http://cscdev04e390w16.dev.careered.com:8101/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://cscdev04e390w16.dev.careered.com:8100/livereload.js?snipver=1' },
   // 'RDLR': { title: 'Rohit LiveReload', url: 'http://EVM-RDSDEV76.dev.careered.com:8100/assets/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://EVM-RDSDEV76.dev.careered.com:8100/livereload.js?snipver=1' },
    'DFLR': { title: 'David LiveReload', url: 'http://CSC3103DPETW10.cec.root.careered.com:8101/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://CSCDEV04E016.cec.root.careered.com:8101/livereload.js?snipver=1' },
    'MFLR': { title: 'Mounika LiveReload', url: 'http://CSC-DEVDUDMOU.dev.careered.com:8100/assets/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://CSC-DEVDUDMOU.dev.careered.com:8100/livereload.js?snipver=1' },
    'GSLR': { title: 'George LiveReload', url: 'http://EVM-RDSDEV74.dev.careered.com:8100/assets/', api: 'https://int-mobileapi.careered.com/Ionic/Beta/', livereload: 'http://EVM-RDSDEV74.dev.careered.com:8100/livereload.js?snipver=1' }
  };

  function getParameterByName(name) {
    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  var loadFromServer = function (s) {
    if (s) {
      console.log(s);
      if (s.isDev) {
        var themeId;

        if (window['cecPreferences'] && window['cecPreferences']['com.careered.theme_id']) {
          themeId = window['cecPreferences']['com.careered.theme_id'];
        }
        window.location = s.url + 'index.html';
        return;
      }
      else if (window.hasOwnProperty('$script')) {
        var deepLink = getParameterByName('url');
        if (deepLink !== undefined) {
          window.deepLink = getParameterByName('url');
        }

        var uaMessageId = getParameterByName('uamsgid');
        if (uaMessageId !== undefined) {
          window.urbanairshipMessageId = getParameterByName('uamsgid');
        }

        if (window['cecPreferences']) {
          window['cecPreferences']['com.careered.url'] = s.url;
          window['cecPreferences']['com.careered.api'] = s.api;
        }

        $script([s.url + 'app.js'], function (isError) { if (isError) alert('There was a problem loading the app  (E4)'); });

        if (s.livereload) {

          if (window['cecPreferences']) {
            window['cecPreferences']['com.careered.livereload'] = s.livereload;
          }

          window.IonicDevServerConfig = { "sendConsoleLogs": false, "wsPort": 53703, "appScriptsVersion": "1.3.0", "systemInfo": ["Ionic Framework: 3.0.1", "Ionic Native: 3.5.0", "Ionic App Scripts: 1.3.0", "Angular Core: 4.0.1", "Angular Compiler CLI: 4.0.1", "Node: 6.10.2", "OS Platform: Windows 7"] };

          $script({
            scripts: [s.url + '../__ion-dev-server/ion-dev.js?v=1.3.0', s.livereload],
            styles: [s.url + '../__ion-dev-server/ion-dev.css?v=1.3.0'],
            configs: { sync: 1 }
          });
        }

        return;
      }
    }

    alert('There was a problem initializing the app  (E3)');
  };

  var env = getParameterByName('env');

  if (env && serversUrls[env]) {
    loadFromServer(serversUrls[env]);
    return;
  }

  var e = document.getElementsByTagName('ion-app');

  if (e && e.length) {
    e = e[0];

    var divW = document.createElement("div");
    divW.style.width = '100%';
    divW.style.height = '100%';
    divW.style.position = 'absolute';
    divW.style.top = '0';
    divW.style.left = '0';
    divW.style.backgroundColor = '#d0d0d0';
    divW.style.fontFamily = 'Arial';

    var h = document.createElement("h1");
    h.appendChild(document.createTextNode('Select a Server'));
    h.style.paddingLeft = '10px';
    h.style.paddingRight = '10px';
    divW.appendChild(h);

    e.appendChild(divW);

    for (let key in serversUrls) {
      let s = serversUrls[key];

      let div = document.createElement("div");

      div.style.backgroundColor = '#FFFFFF';
      div.style.padding = '12px';
      div.style.margin = '6px';
      div.style.borderWidth = '1px';
      div.style.borderColor = '#000000';
      div.style.borderStyle = 'solid';
      div.style.cursor = 'pointer';

      div.appendChild(document.createTextNode(s.title));

      div.onclick = function () {
        if (window.cecSplash) {
          window.cecSplash.play();
        }
        else if (navigator && navigator.splashscreen && navigator.splashscreen.show) {
          //navigator.splashscreen.show();
        }

        if (window.deepLink !== undefined) {
          window.location = window.location.href + '?env=' + key + '&url=' + window.deepLink;

        }
        else if (window.urbanairshipMessageId !== undefined) {
          window.location = window.location.href + '?env=' + key + '&uamsgid=' + window.urbanairshipMessageId;
        }
        else {
          window.location = s.url + '?env=' + key;
        }

      };

      divW.appendChild(div);
    }

    if (window.cecSplash) {
      window.cecSplash.stop();
    }

    if (navigator && navigator.splashscreen && navigator.splashscreen.hide) {
      navigator.splashscreen.hide();
    } else {
      let attempts = 0;
      let interval = setInterval(() => {
        attempts++;

        if (attempts > 20) {
          clearInterval(interval);
        }

        if (navigator && navigator.splashscreen && navigator.splashscreen.hide) {
          navigator.splashscreen.hide();
          clearInterval(interval);
        }
      }, 100);

      document.addEventListener('deviceready', () => {
        if (navigator && navigator.splashscreen && navigator.splashscreen.hide) navigator.splashscreen.hide();
      }, false);
    }
  }
};

devLaunchCecApplication();
