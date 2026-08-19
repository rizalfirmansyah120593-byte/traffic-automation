import { useEffect, useRef } from 'react';

const ADSTERRA_HOST = 'https://alwaysmulticulturallanding.com';

function AdSlot({ type = 'native', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    let script;

    if (type === 'native') {
      container.innerHTML = '';
      const target = document.createElement('div');
      target.id = 'container-9b797f7e92ed32c46400cf6c2f85ff3e';
      container.appendChild(target);
      script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = `${ADSTERRA_HOST}/9b797f7e92ed32c46400cf6c2f85ff3e/invoke.js`;
      container.appendChild(script);
    } else {
      const sizes = {
        mobile: { key: '2a79003b866dd3632f40252fa5f3cd0a', width: 320, height: 50 },
        desktop: { key: 'c195f1d2570360660a7fe3950bba3851', width: 728, height: 90 },
        square: { key: '5c287de8d65bfa164e731aa1eb43ca1f', width: 300, height: 250 }
      };
      const ad = sizes[type] || sizes.desktop;
      window.atOptions = { key: ad.key, format: 'iframe', height: ad.height, width: ad.width, params: {} };
      script = document.createElement('script');
      script.src = `${ADSTERRA_HOST}/${ad.key}/invoke.js`;
      script.async = true;
      container.appendChild(script);
    }
    return () => { if (script) script.remove(); if (container) container.innerHTML = ''; };
  }, [type]);

  return <aside ref={containerRef} aria-label="Advertisement" className={`ad-slot ${className}`} />;
}

export default AdSlot;
