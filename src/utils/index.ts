// Utility functions for PocketCare

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} at ${formatTime(date)}`;
};

export const getWeekBounds = (date: Date = new Date()): { start: Date; end: Date } => {
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  
  const start = new Date(current);
  start.setDate(current.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

export const isPast = (date: Date): boolean => {
  return new Date(date) < new Date();
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(new Date(date).getTime() + minutes * 60000);
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMins) < 1) return 'now';
  if (diffMins > 0 && diffMins < 60) return `in ${diffMins} min`;
  if (diffMins < 0 && diffMins > -60) return `${Math.abs(diffMins)} min ago`;
  if (diffHours > 0 && diffHours < 24) return `in ${diffHours} hr`;
  if (diffHours < 0 && diffHours > -24) return `${Math.abs(diffHours)} hr ago`;
  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = (title: string, body: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/pill-icon.png',
      badge: '/pill-icon.png',
    });
  }
};

export const classNames = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};