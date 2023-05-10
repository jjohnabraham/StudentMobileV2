var CecSplash = function () {

    var themeId = 0; 
    var tobrand = '';
     
    if (window.cecPreferences && window.cecPreferences['com.careered.theme_id']) { 
        themeId = window.cecPreferences['com.careered.theme_id'];
    }
     
    if (themeId == 9) {   
        tobrand = ' to CTU';
    } else if (themeId == 18) {
        tobrand = ' to AIU';
    } 
     
    var cecLoadingHtml = '\
<div id="cec-loading" class ="cec-loading-'+themeId+'" style="display:none;">\
    <div id="cec-loading-container">\
        <div id="cec-loading-content">\
            <div id="cec-loading-logo"></div>\
            <div id="cec-loading-header">Welcome'+tobrand+'!</div>\
            <div id="cec-loading-messages">\
                <div id="cec-loading-message-1">\
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10240 10240" class="cec-loading-icon">\
	                  <path id="curve1" fill="#252525" d="M2720 5440c619,0 1120,501 1120,1120 0,619 -501,1120 -1120,1120 -619,0 -1120,-501 -1120,-1120 0,-135 24,-264 70,-390 84,138 236,230 410,230 265,0 480,-215 480,-480 0,-174 -92,-326 -230,-410 126,-46 256,-70 390,-70zm4800 0c619,0 1120,501 1120,1120 0,619 -501,1120 -1120,1120 -619,0 -1120,-501 -1120,-1120 0,-135 24,-264 70,-390 84,138 236,230 410,230 265,0 480,-215 480,-480 0,-174 -92,-326 -230,-410 127,-47 254,-70 390,-70z"/>\
	                  <path id="curve0" fill="#252525" d="M3360 1920c424,0 793,236 983,583 215,-165 485,-263 777,-263 292,0 562,98 777,263 190,-347 559,-583 983,-583 420,0 806,221 978,574 510,1050 1060,2119 1543,3177 127,270 199,571 199,889 0,1149 -931,2080 -2080,2080 -1114,0 -2023,-875 -2077,-1976 -101,36 -210,56 -323,56 -113,0 -222,-20 -323,-56 -54,1101 -963,1976 -2077,1976 -1149,0 -2080,-931 -2080,-2080 0,-318 72,-619 199,-889 483,-1059 1033,-2127 1543,-3177 172,-353 558,-574 978,-574zm-640 3200c-795,0 -1440,645 -1440,1440 0,795 645,1440 1440,1440 795,0 1440,-645 1440,-1440 0,-795 -645,-1440 -1440,-1440zm4800 0c-795,0 -1440,645 -1440,1440 0,795 645,1440 1440,1440 795,0 1440,-645 1440,-1440 0,-795 -645,-1440 -1440,-1440z"/>\
                  </svg>\
                <span></span>Stop searching for inspiration. Become it.</div>\
                <div id="cec-loading-message-2">\
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10240 10240" class="cec-loading-icon">\
	                  <path id="curve2" fill="#252525" d="M5120 960c2298,0 4160,1862 4160,4160 0,2298 -1862,4160 -4160,4160 -2298,0 -4160,-1862 -4160,-4160 0,-2298 1862,-4160 4160,-4160zm0 960c-1767,0 -3200,1433 -3200,3200 0,1767 1433,3200 3200,3200 1767,0 3200,-1433 3200,-3200 0,-1767 -1433,-3200 -3200,-3200z"/>\
	                  <path id="curve1" fill="#252525" d="M5120 2560c1414,0 2560,1146 2560,2560 0,1414 -1146,2560 -2560,2560 -1414,0 -2560,-1146 -2560,-2560 0,-1414 1146,-2560 2560,-2560zm0 960c-884,0 -1600,716 -1600,1600 0,884 716,1600 1600,1600 884,0 1600,-716 1600,-1600 0,-884 -716,-1600 -1600,-1600z"/>\
	                  <path id="curve0" fill="#252525" d="M5120 4160c530,0 960,430 960,960 0,530 -430,960 -960,960 -530,0 -960,-430 -960,-960 0,-530 430,-960 960,-960z"/>\
                  </svg>\
                <span></span>Today\'s goal is progress, not perfection.</div>\
                <div id="cec-loading-message-3">\
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10240 10240" class="cec-loading-icon">\
	                  <path id="curve1" fill="#252525" d="M2389 1273l3620 3621c125,124 125,328 0,452l-3620 3621c-125,124 -328,124 -453,0l-905 -905c-125,-125 -125,-328 0,-453l2489 -2489 -2489 -2489c-125,-125 -125,-328 0,-453l905 -905c125,-124 328,-124 453,0z"/>\
	                  <path id="curve0" fill="#252525" d="M5909 1273l3620 3621c125,124 125,328 0,452l-3620 3621c-125,124 -328,124 -453,0l-905 -905c-125,-125 -125,-328 0,-453l2489 -2489 -2489 -2489c-125,-125 -125,-328 0,-453l905 -905c125,-124 328,-124 453,0z"/>\
                  </svg>\
                <span></span>Stay motivated and move forward.</div>\
                <div id="cec-loading-message-4">\
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10240 10240" class="cec-loading-icon">\
	                  <path id="curve3" fill="#252525" d="M7360 9600c177,0 320,-143 320,-320l0 -8320c0,-177 -143,-320 -320,-320l-4480 0c-177,0 -320,143 -320,320l0 8320c0,177 143,320 320,320l4480 0zm-2240 0c-884,0 -1600,-716 -1600,-1600 0,-633 368,-1181 902,-1440 -534,-259 -902,-807 -902,-1440 0,-633 368,-1181 902,-1440 -534,-259 -902,-807 -902,-1440 0,-884 716,-1600 1600,-1600 884,0 1600,716 1600,1600 0,633 -368,1181 -902,1440 534,259 902,807 902,1440 0,633 -368,1181 -902,1440 534,259 902,807 902,1440 0,884 -716,1600 -1600,1600z"/>\
	                  <path id="curve2" fill="#252525" d="M5120 960c707,0 1280,573 1280,1280 0,707 -573,1280 -1280,1280 -707,0 -1280,-573 -1280,-1280 0,-707 573,-1280 1280,-1280z"/>\
	                  <path id="curve1" fill="#252525" d="M5120 3840c707,0 1280,573 1280,1280 0,707 -573,1280 -1280,1280 -707,0 -1280,-573 -1280,-1280 0,-707 573,-1280 1280,-1280z"/>\
	                  <path id="curve0" fill="#008000" d="M5120 6720c707,0 1280,573 1280,1280 0,707 -573,1280 -1280,1280 -707,0 -1280,-573 -1280,-1280 0,-707 573,-1280 1280,-1280z"/>\
                  </svg>\
                <span></span>There\'s nothing stopping you today!</div>\
            </div>\
        </div>\
    </div>\
</div>'; 

    var messageIdx = 0;
    var transitionTime = 0.3;
    var webkitTransition = 'transform '+transitionTime+'s ease-out, opacity '+transitionTime+'s ease-out';    			
    var transitionPause = 1.0;
    var stopPlaying = true;
    var stopPlayingCallback = false;
    var timeout;

    var play = function () {
        if (stopPlaying) {
            stopPlaying = false;

            if (navigator && navigator.splashscreen && navigator.splashscreen.hide) {
                navigator.splashscreen.hide();
            }

            var e = document.getElementById('loading');

            if (e) {
                e.style.display = "block";
                e.innerHTML = cecLoadingHtml;

                e = document.getElementById('cec-loading-content');

                if (e) {
                    //e.style.transform = 'translate3d(0px, 100vh, 0px)';
                    
                    e.style.opacity = '0';
                    e.style.removeProperty("transition", '');
                    e.style.removeProperty("-webkit-transition", '');

                    setTimeout(function() {
                       // e.style.transform = 'translate3d(0px, 0px, 0px)';
                        e.style.opacity = '1';

                        e.style.transition = webkitTransition;
                        e.style.setProperty("-webkit-transition", webkitTransition);
                    }, 0);

                    if (!timeout) {
                        timeout = setTimeout(showNextMessage.bind(this), transitionTime * 1000);
                    }
                }
            }
        }
    }

    var stop = function (callback) {
        if (!stopPlaying) {
            stopPlaying = true;
            stopPlayingCallback = callback;
        }
    }

    var showNextMessage = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = 0;
        }

        var idx = messageIdx + 1;

        if (idx < 1 || idx > 4) {
            idx = 1;
        }

        var m0 = messageIdx > 0 ? document.getElementById('cec-loading-message-'+messageIdx) : undefined;
        var m1 = document.getElementById('cec-loading-message-'+idx);

        if (m0) {
            m0.style.transform = 'scale(0)';
            m0.style.opacity = '0';

            m0.style.transition = webkitTransition;
            m0.style.setProperty("-webkit-transition", webkitTransition);
        }

        if (stopPlaying) {
            setTimeout(function() {
                var l = document.getElementById('loading');

                if (l) {
                    //l.style.transform = 'translate3d(0px, -100vh, 0px)';
                    l.style.opacity = '0';

                    l.style.transition = webkitTransition+', top '+transitionTime+'s ease-out';
                    l.style.setProperty("-webkit-transition", webkitTransition);
                }

                setTimeout(function() {
                    var l = document.getElementById('loading');
                    l.style.display = 'none';
                }, transitionTime * 1000);

            }, transitionTime * 1000);

            if (stopPlayingCallback) {
                setTimeout(function() {
                    stopPlayingCallback();
                }, transitionTime * 500);
            }
        } else {
            if (m1) {
                m1.style.visibility = 'visible';
                m1.style.transform = 'scale(1)';
                m1.style.opacity = '1';

                m1.style.transition = webkitTransition;
                m1.style.setProperty("-webkit-transition", webkitTransition);
            }

            timeout = setTimeout(showNextMessage.bind(this), (transitionTime + transitionPause) * 1000);
        }

        messageIdx = idx;
    }

    return {
        play: play,
        stop: stop
    };
}

if (!window.cecSplash) {
  window.cecSplash = CecSplash();
  window.cecSplash.play();
}
//setTimeout(() => {
//  window.cecSplash.play();
//}, 500);
