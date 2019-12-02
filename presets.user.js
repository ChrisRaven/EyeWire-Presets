// ==UserScript==
// @name         Presets
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Presets for EyeWire
// @author       Krzysztof Kruk
// @match        https://*.eyewire.org/*
// @exclude      https://*.eyewire.org/1.0/*
// @downloadURL  https://raw.githubusercontent.com/ChrisRaven/EyeWire-Presets/master/utilities.user.js
// ==/UserScript==

/*jshint esversion: 6 */
/*globals $, account, tomni */ 

let LOCAL = false;
if (LOCAL) {
  console.log('%c--== TURN OFF "LOCAL" BEFORE RELEASING!!! ==--', "color: red; font-style: italic; font-weight: bold;");
}

(function() {
  'use strict';
  'esversion: 6';

  let K = {
    gid: function (id) {
      return document.getElementById(id);
    },
    
    qS: function (sel) {
      return document.querySelector(sel);
    },
    
    qSa: function (sel) {
      return document.querySelectorAll(sel);
    },


    addCSSFile: function (path) {
      $("head").append('<link href="' + path + '" rel="stylesheet" type="text/css">');
    },
  };


  function Settings() {
    let target;
    
    this.setTarget = function (selector) {
      target = selector;
    };
    
    this.getTarget = function () {
      return target;
    };
    
    this.addCategory = function (id = 'ews-presets-settings-group', name = 'Presets', mainTarget = 'settingsMenu') {
      if (!K.gid(id)) {
        $('#' + mainTarget).append(`
          <div id="${id}" class="settings-group ews-settings-group invisible">
            <h1>${name}</h1>
          </div>
        `);
      }
      
      this.setTarget($('#' + id));
    };

    this.addOption = function (options) {
      let settings = {
        name: '',
        id: '',
        defaultState: false,
        indented: false
      };

      $.extend(settings, options);
      let storedState = K.ls.get(settings.id);
      let state;

      if (storedState === null) {
        K.ls.set(settings.id, settings.defaultState);
        state = settings.defaultState;
      }
      else {
        state = storedState.toLowerCase() === 'true';
      }

      target.append(`
        <div class="setting" id="${settings.id}-wrapper">
          <span>${settings.name}</span>
          <div class="checkbox ${state ? 'on' : 'off'}">
            <div class="checkbox-handle"></div>
            <input type="checkbox" id="${settings.id}" style="display: none;" ${state ? ' checked' : ''}>
          </div>
        </div>
      `);
      
      if (settings.indented) {
        K.gid(settings.id).parentNode.parentNode.style.marginLeft = '30px';
      }
      
      $(`#${settings.id}-wrapper`).click(function (evt) {
        evt.stopPropagation();

        let $elem = $(this).find('input');
        let elem = $elem[0];
        let newState = !elem.checked;

        K.ls.set(settings.id, newState);
        elem.checked = newState;

        $elem.add($elem.closest('.checkbox')).removeClass(newState ? 'off' : 'on').addClass(newState ? 'on' : 'off');
        $(document).trigger('ews-setting-changed', {setting: settings.id, state: newState});
      });
      
      $(document).trigger('ews-setting-changed', {setting: settings.id, state: state});
    };
    
    this.getValue = function (optionId) {
      let val = K.ls.get(optionId);
      
      if (val === null) {
        return undefined;
      }
      if (val.toLowerCase() === 'true') {
        return true;
      }
      if (val.toLowerCase() === 'false') {
        return false;
      }

      return val;
    };
  }

  let builtInPreferences = [
    'em3d',
		'animTrans',
		'color',
		'opacity',
		'planeopacity',
		'bw',
		'hardware_performance',
		'mute',
		'cell',
		'plasticize',
		'heatmap',
		'heatmap_legends',

		'music_volume',
		'sfx_volume',
		'chat_volume',
		'brush_size',
		'experimentalFeatures',
		'playerActivityIcons',
		'playerAnonActivityIcons',
		'atOverviewJump',
		'threeDSelectMode',
		'preloadCubes',
		'activity_tracker_cube_count',
		'outlineGlowIntensity',

		// zfish only
		'downsampleAmount',
		'mst_global_threshold'
  ];

  let addonsPreferences = [
    'accu-quantize-colors',
    'accu-show-completes',
    'accuracy-show-as-row',
    'auto-complete',
    'auto-refresh-showmeme',
    'compact-inspector-panel',
    'compact-scouts-log',
    'cubes-compacted',
    'custom-highlight-color-1',
    'custom-highlight-color-2',
    'custom-highlight-color-3',
    'custom-highlight-index',
    'dataset-borders-show-during-play',
    'dataset-borders-show-origin',
    'dont-rotate-ov-while-in-cube',
    'extend-the-panel-when-leaderboard-is-closed',
    'go-in-and-out-of-cube-using-g',
    'hide-about',
    'hide-blog',
    'hide-faq',
    'hide-forum',
    'hide-my-reaps-in-forts',
    'hide-stats',
    'hide-wiki',
    'jump-to-ov-after-completing',
    'log-and-reap',
    'move-freeze-to-the-left-of-highlight',
    'settings-color-potential',
    'settings-color-sced-cells',
    'settings-convert-x-highlights-to-sced-highlights',
    'settings-show-higlight-unavailable-for-sc-cubes-button', // there's a typo in the other script to
    'settings-unhighlight-all',
    'settings-x-highlight',
    'show-admin-frozen-cubes',
    'show-childrens-ids',
    'show-dataset-borders-button',
    'show-dataset-borders-state',
    'show-lowwtsc-in-main-tab',
    'show-remove-duplicate-segs-button',
    'show-restore-seed-button',
    'show-sl-shortcuts',
    'submit-using-spacebar',
    'switch-sl-buttons',
    'turn-off-zoom-by-spacebar',
    'unhighlight-all-colors-option'
  ];

  let preferences = {
    builtIn: {},
    addons: {},
    ewdlc: {}
  };
  let addonsPrefix = '';

  function getBuiltInPreferences() {
    builtInPreferences.forEach(el => preferences.builtIn[el] = tomni.prefs.get(el));
  }

  function setBuiltInPreferences(preferences) {
    Object.entries(preferences).forEach(([key, value]) => tomni.prefs.set(key, value));
  }

  function getAddonsPreferences() {
    addonsPreferences.forEach(el => {
      let val = localStorage.getItem(addonsPrefix + el);console.log(el, val)
      if (val !== null) {
        preferences.addons[el] = val;
      }
    });
  }

  function setAddonsPreferences(preferences) {
    Object.entries(preferences).forEach(([key, value]) => localStorage.setItem(addonsPrefix + key, value));
  }

  function getEwdlcPreferences() {
    preferences.ewdlc = localStorage.getItem('ewdlc-prefs');
  }

  function setEwdlcPreferences(preferences) {
    localStorage.setItem('ewdlc-prefs', preferences);
  }


  function saveSettings() {
    getBuiltInPreferences();
    getAddonsPreferences();
    getEwdlcPreferences();
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(preferences)));
    element.setAttribute('download', 'eyewire_settings.txt');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }


  function restoreSettings(evt) {
    let file = evt.target.files[0];
    if (!file) {
      return;
    }

    let reader = new FileReader();
    reader.addEventListener('load', function (evt) {
      let prefs = JSON.parse(evt.target.result);
      setBuiltInPreferences(prefs.builtIn);
      setAddonsPreferences(prefs.addons);
      setEwdlcPreferences(prefs.ewdlc);
    });
    reader.readAsText(file);
  }



  
  let settings;

  function main() {
    
    if (LOCAL) {
      K.addCSSFile('http://127.0.0.1:8887/styles.css');
    }
    else {
      K.addCSSFile('https://chrisraven.github.io/EyeWire-Presets/styles.css?v=8');
    }

      
    settings =  new Settings();
    settings.addCategory();

    addonsPrefix = account.account.uid + '-ews-';

    settings.getTarget().append('<div class="setting"><div class="minimalButton" id="presets-save-settings">Save Settings to File</div></div>');
    settings.getTarget().append('<div class="setting"><label class="minimalButton" id="presets-restore-settings-wrapper">Restore Settings from File<input type="file" id="presets-restore-settings" accept=".txt"></label></div>');

    K.gid('presets-save-settings').addEventListener('click', saveSettings);
    K.gid('presets-restore-settings').addEventListener('change', restoreSettings.bind(this));
  }


    
  let intv = setInterval(function () {
    if (typeof account === 'undefined' || !account.account.uid) {
      return;
    }
    clearInterval(intv);
    main();
  }, 100);


})();
