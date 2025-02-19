import React, { createContext, useContext, useState, useEffect } from 'react';
import { formatInTimeZone } from 'date-fns-tz';

const TimeZoneContext = createContext();

export function TimeZoneProvider({ children }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const targetTimeZone = 'America/Mexico_City';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return formatInTimeZone(date, targetTimeZone, 'yyyy-MM-dd HH:mm:ss');
  };

  return (
    <TimeZoneContext.Provider value={{ currentTime, targetTimeZone, formatDate }}>
      {children}
    </TimeZoneContext.Provider>
  );
}

export const useTimeZone = () => useContext(TimeZoneContext); 