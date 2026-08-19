const SMARTLINK_URL = 'https://alwaysmulticulturallanding.com/cc00isuy?key=d902a01ad3c6380284dbadb5ef482bdb';

// Initializes the supplied Smartlink once per page session.
// It waits 10 seconds and requires an explicit user interaction.
export function initSmartlink() {
  let ready = false;
  let opened = false;
  const timer = window.setTimeout(() => { ready = true; }, 10_000);

  const openLinkOnce = () => {
    if (!ready || opened) return;
    opened = true;
    window.open(SMARTLINK_URL, '_blank', 'noopener,noreferrer');
  };

  document.addEventListener('click', openLinkOnce, { passive: true });
  document.addEventListener('touchstart', openLinkOnce, { passive: true });

  return () => {
    window.clearTimeout(timer);
    document.removeEventListener('click', openLinkOnce);
    document.removeEventListener('touchstart', openLinkOnce);
  };
}
