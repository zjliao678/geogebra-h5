(function () {
  'use strict';

  var NAV_HEIGHT    = 44;
  var FOOTER_HEIGHT = 20;

  var currentApp = 'graphing';
  var ggbApplet  = null;
  var isLoading  = false;
  var loadTimer  = null;

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

  function onAppletLoaded() {
    if (loadTimer) { clearTimeout(loadTimer); loadTimer = null; }
    hideLoading();
    isLoading = false;
  }

  // ── Load a GeoGebra app ──────────────────────────────────────

  function loadApp(appName) {
    if (isLoading) return;
    isLoading = true;

    showLoading();
    clearApplet();

    // Fallback: force-hide loading if appletOnLoad never fires (e.g. slow first load)
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(onAppletLoaded, 30000);

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
      appletOnLoad: onAppletLoaded
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

  // ── Save image ──────────────────────────────────────────────

  function saveImage() {
    if (!ggbApplet || isLoading) return;
    try {
      // getPNGBase64 requires HTTPS or localhost — will fail on file:// protocol
      var base64 = ggbApplet.getPNGBase64(1, false, 96);
      if (!base64) throw new Error('getPNGBase64 returned empty result');

      var dataUrl = 'data:image/png;base64,' + base64;

      document.getElementById('modal-img').src = dataUrl;

      var link      = document.getElementById('download-link');
      link.href     = dataUrl;
      link.download = 'geogebra-' + currentApp + '.png';

      document.getElementById('image-modal').classList.remove('hidden');
    } catch (e) {
      console.error('saveImage error:', e);
      alert('截图失败：' + (e.message || e) + '\n\n请通过 HTTPS 链接访问（如 GitHub Pages），本地 file:// 协议不支持此操作。');
    }
  }

  function closeModal() {
    document.getElementById('image-modal').classList.add('hidden');
    document.getElementById('modal-img').src = '';
  }

  // ── Init ─────────────────────────────────────────────────────

  document.getElementById('tab-bar').addEventListener('click', onTabClick);
  document.getElementById('save-btn').addEventListener('click', saveImage);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  window.addEventListener('resize', onResize);

  loadApp(currentApp);
})();
