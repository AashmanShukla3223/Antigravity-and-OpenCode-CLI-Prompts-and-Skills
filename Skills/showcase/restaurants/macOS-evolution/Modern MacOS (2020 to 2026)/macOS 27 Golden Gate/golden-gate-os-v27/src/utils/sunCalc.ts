// Approximate Sun position algorithm (NOAA algorithm) for astronomical sunrise/sunset
export function getSunTimes(date: Date = new Date(), lat: number = 37.7749, lng: number = -122.4194) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  // Solar declination approx
  const declination = 23.45 * Math.sin(((284 + dayOfYear) * 360 / 365) * (Math.PI / 180));
  
  // Hour angle
  const radLat = lat * (Math.PI / 180);
  const radDecl = declination * (Math.PI / 180);
  
  const cosHourAngle = -Math.tan(radLat) * Math.tan(radDecl);
  
  // Clamp for polar days/nights
  const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
  const hourAngleDeg = Math.acos(clampedCos) * (180 / Math.PI);
  
  // Solar noon approx (12:00 + longitude offset in hours)
  const solarNoonMinutes = 720 - (lng * 4);
  const halfDayMinutes = (hourAngleDeg / 15) * 60;

  const sunriseMinutes = solarNoonMinutes - halfDayMinutes;
  const sunsetMinutes = solarNoonMinutes + halfDayMinutes;

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const isNight = currentMinutes < sunriseMinutes || currentMinutes >= sunsetMinutes;

  return {
    sunriseMinutes,
    sunsetMinutes,
    isNight,
    sunriseTime: `${Math.floor(sunriseMinutes / 60)}:${Math.floor(sunriseMinutes % 60).toString().padStart(2, '0')}`,
    sunsetTime: `${Math.floor(sunsetMinutes / 60)}:${Math.floor(sunsetMinutes % 60).toString().padStart(2, '0')}`,
  };
}
