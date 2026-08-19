import { createContext, createElement, useContext, useMemo, useState } from 'react';

export const languages = [
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
];

const translations = {
  id: { live: 'Sesi langsung', inProgress: 'Automation sedang berjalan', active: 'Aktif', processing: 'Memproses kunjungan website', preparing: 'Menyiapkan sesi browser aman', finalizing: 'Menyelesaikan laporan', processed: 'diproses', completed: 'Selesai', remaining: 'Tersisa', failed: 'Gagal', target: 'Target', clientIp: 'IP Klien', stop: 'Hentikan automation', safeStop: 'Anda dapat menghentikan sesi dengan aman kapan saja.', mode: 'mode', batch: 'Batch', loop: 'Loop', visits: 'Kunjungan', loops: 'Loop', trafficMode: 'Mode Traffic', automate: 'Mulai Automation', language: 'Bahasa', quickTests: 'Uji cepat', placeholder: 'Masukkan URL website (contoh: example.com)', visitCount: 'Jumlah kunjungan', activeMode: 'Mode aktif' },
  en: { live: 'Live session', inProgress: 'Automation in progress', active: 'Active', processing: 'Processing website visits', preparing: 'Preparing secure browser session', finalizing: 'Finalizing report', processed: 'processed', completed: 'Completed', remaining: 'Remaining', failed: 'Failed', target: 'Target', clientIp: 'Client IP', stop: 'Stop automation', safeStop: 'You can safely stop the session at any time.', mode: 'mode', batch: 'Batch', loop: 'Loop', visits: 'Visits', loops: 'Loops', trafficMode: 'Traffic Mode', automate: 'Start Automation', language: 'Language', quickTests: 'Quick tests', placeholder: 'Enter website URL (e.g., example.com)', visitCount: 'Visit count', activeMode: 'Active mode' },
  es: { live: 'Sesión en vivo', inProgress: 'Automatización en curso', active: 'Activo', processing: 'Procesando visitas al sitio', preparing: 'Preparando sesión segura', finalizing: 'Finalizando informe', processed: 'procesadas', completed: 'Completadas', remaining: 'Restantes', failed: 'Fallidas', target: 'Objetivo', clientIp: 'IP del cliente', stop: 'Detener automatización', safeStop: 'Puedes detener la sesión de forma segura en cualquier momento.', mode: 'modo', batch: 'Lote', loop: 'Bucle', visits: 'Visitas', loops: 'Bucles', trafficMode: 'Modo de tráfico', automate: 'Iniciar automatización', language: 'Idioma', quickTests: 'Pruebas rápidas', placeholder: 'Introduce la URL (ej.: example.com)', visitCount: 'Número de visitas', activeMode: 'Modo activo' },
  fr: { live: 'Session en direct', inProgress: 'Automatisation en cours', active: 'Actif', processing: 'Traitement des visites', preparing: 'Préparation de la session sécurisée', finalizing: 'Finalisation du rapport', processed: 'traitées', completed: 'Terminées', remaining: 'Restantes', failed: 'Échouées', target: 'Cible', clientIp: 'IP client', stop: "Arrêter l'automatisation", safeStop: 'Vous pouvez arrêter la session en toute sécurité à tout moment.', mode: 'mode', batch: 'Lot', loop: 'Boucle', visits: 'Visites', loops: 'Boucles', trafficMode: 'Mode trafic', automate: "Démarrer l'automatisation", language: 'Langue', quickTests: 'Tests rapides', placeholder: 'Saisissez une URL (ex. : example.com)', visitCount: 'Nombre de visites', activeMode: 'Mode actif' },
  de: { live: 'Live-Sitzung', inProgress: 'Automation läuft', active: 'Aktiv', processing: 'Website-Besuche werden verarbeitet', preparing: 'Sichere Browsersitzung wird vorbereitet', finalizing: 'Bericht wird erstellt', processed: 'verarbeitet', completed: 'Abgeschlossen', remaining: 'Verbleibend', failed: 'Fehlgeschlagen', target: 'Ziel', clientIp: 'Client-IP', stop: 'Automation stoppen', safeStop: 'Sie können die Sitzung jederzeit sicher beenden.', mode: 'Modus', batch: 'Stapel', loop: 'Schleife', visits: 'Besuche', loops: 'Schleifen', trafficMode: 'Traffic-Modus', automate: 'Automation starten', language: 'Sprache', quickTests: 'Schnelltests', placeholder: 'Website-URL eingeben (z. B. example.com)', visitCount: 'Anzahl Besuche', activeMode: 'Aktiver Modus' }
};

const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('traffic-language') || 'id');
  const changeLanguage = code => { setLanguage(code); localStorage.setItem('traffic-language', code); };
  const value = useMemo(() => ({ language, setLanguage: changeLanguage, languages, t: key => translations[language]?.[key] || translations.en[key] || key }), [language]);
  return createElement(LanguageContext.Provider, { value }, children);
}
export const useLanguage = () => useContext(LanguageContext);
