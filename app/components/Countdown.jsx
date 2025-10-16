'use client';

import { useState, useEffect, useCallback } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isClient, setIsClient] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    // Zielzeit: 26. Oktober 2025, 23:59 Uhr (Zeitzone: Europe/Zurich)
    const targetDate = new Date('2025-10-26T23:59:00+02:00');
    const now = new Date().getTime();
    const target = targetDate.getTime();
    const difference = target - now;

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    } else {
      // Event ist vorbei oder läuft gerade
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, []);

  useEffect(() => {
    // Client-side rendering sicherstellen
    setIsClient(true);
    
    // Sofort berechnen
    calculateTimeLeft();
    
    // Timer alle Sekunde aktualisieren
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  // Server-side rendering: Zeige Loading-State
  if (!isClient) {
    return (
      <div className="countdown-container">
        <div className="countdown-header">
          <div className="countdown-title">COUNTDOWN</div>
          <div className="countdown-subtitle">bis zum Event</div>
        </div>
        
        <div className="countdown-grid">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="countdown-unit">
              <div className="countdown-number">--</div>
              <div className="countdown-label">
                {index === 0 ? 'TAGE' : index === 1 ? 'STUNDEN' : index === 2 ? 'MINUTEN' : 'SEKUNDEN'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="countdown-footer">
          <div className="countdown-date">26. Oktober 2025 • 23:59 Uhr</div>
        </div>
      </div>
    );
  }

  const timeUnits = [
    { label: 'TAGE', value: timeLeft.days },
    { label: 'STUNDEN', value: timeLeft.hours },
    { label: 'MINUTEN', value: timeLeft.minutes },
    { label: 'SEKUNDEN', value: timeLeft.seconds }
  ];

  return (
    <div className="countdown-container">
      <div className="countdown-header">
        <div className="countdown-title">COUNTDOWN</div>
        <div className="countdown-subtitle">bis zum Event</div>
      </div>
      
      <div className="countdown-grid">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="countdown-unit">
            <div className="countdown-number">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="countdown-label">{unit.label}</div>
          </div>
        ))}
      </div>
      
      <div className="countdown-footer">
        <div className="countdown-date">26. Oktober 2025 • 23:59 Uhr</div>
      </div>
    </div>
  );
}
