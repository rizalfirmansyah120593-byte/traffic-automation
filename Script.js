(function () {
  let ready = false;
  let opened = false;

  // Aktif setelah 10 detik
  setTimeout(function () {
    ready = true;
  }, 10000);

  function openLinkOnce() {
    if (!ready || opened) return;

    opened = true;
    window.open('https://alwaysmulticulturallanding.com/cc00isuy?key=d902a01ad3c6380284dbadb5ef482bdb', '_blank', 'noopener');
  }

  // Desktop
  document.addEventListener('click', openLinkOnce);

  // Mobile
  document.addEventListener('touchstart', openLinkOnce, { passive: true });
})();
