export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (seconds: number | string): string => {
  const duration = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
  return formatTime(duration);
};