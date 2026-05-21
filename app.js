(function () {
  'use strict';

  var NAV_HEIGHT    = 44;
  var FOOTER_HEIGHT = 20;

  var currentApp = 'graphing';
  var ggbApplet  = null;
  var isLoading  = false;

  // Apps that show the algebra input bar
  var ALGEBRA_INPUT_APPS = { graphing: true, classic: true };

  // ── Helpers ─────────────────────────────────────────────────

  function appletSize() {
    return {
      width:  window.innerWidth,
      height: window.innerHeight - NAV_HEIGHT - FOOTER_HEIGHT
    };
  }

  function showLoading() {
    document.getElementById('loading-overlay').classList.remove('hidden');
  }

  function hideLoading() {
    document.getElementById('loading-overlay').classList.add('hidden');
  }

  function clearApplet() {
    if (ggbApplet) {
      try { ggbApplet.remove(); } catch (e) {}
      ggbApplet = null;
    }
    // Reset container so GeoGebra can inject a fresh instance
    document.getElementById('ggb-element').innerHTML = '';
  }

  // ── Load a GeoGebra app ──────────────────────────────────────

  function loadApp(appName) {
    if (isLoading) return;
    isLoading = true;

    showLoading();
    clearApplet();

    var size = appletSize();

    var params = {
      appName:           appName,
      width:             size.width,
      height:            size.height,
      showMenuBar:       false,
      showToolBar:       true,
      showAlgebraInput:  !!ALGEBRA_INPUT_APPS[appName],
      showResetIcon:     false,
      enableShiftDragZoom: true,
      enableRightClick:  false,
      useBrowserForJS:   false,
      appletOnLoad: function () {
        hideLoading();
        isLoading = false;
      }
    };

    ggbApplet = new GGBApplet(params, true);
    ggbApplet.inject('ggb-element');
  }

  // ── Tab click ────────────────────────────────────────────────

  function onTabClick(e) {
    var btn = e.target.closest('.tab');
    if (!btn || btn.dataset.app === currentApp) return;

    document.querySelectorAll('.tab').forEach(function (t) {
      t.classList.remove('active');
    });
    btn.classList.add('active');

    currentApp = btn.dataset.app;
    loadApp(currentApp);
  }

  // ── Resize (orientation change) ──────────────────────────────

  function onResize() {
    if (!ggbApplet || isLoading) return;
    var size = appletSize();
    try {
      ggbApplet.setSize(size.width, size.height);
    } catch (e) {}
  }

  // ── Init ─────────────────────────────────────────────────────

  document.getElementById('tab-bar').addEventListener('click', onTabClick);
  window.addEventListener('resize', onResize);

  loadApp(currentApp);
})();
