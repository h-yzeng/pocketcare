// PocketCare Type Definitions

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  type: 'medication' | 'appointment';
  title: string;
  description?: string;
  scheduledTime: Date;
  status: 'pending' | 'taken' | 'snoozed' | 'skipped' | 'missed';
  snoozedUntil?: Date;
  snoozeCount: number;
  relatedId?: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  title: string;
  doctor?: string;
  location: string;
  dateTime: Date;
  notes?: string;
  checklist: ChecklistItem[];
  status: 'upcoming' | 'completed' | 'missed';
  createdAt: Date;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface WeeklyStats {
  weekStartDate: Date;
  weekEndDate: Date;
  medicationsTaken: number;
  medicationsMissed: number;
  medicationsSnoozed: number;
  appointmentsAttended: number;
  appointmentsMissed: number;
  totalReminders: number;
}

export interface NotificationState {
  isVisible: boolean;
  reminder: Reminder | null;
}

export type ReminderAction = 'take' | 'snooze' | 'skip';

export interface AppState {
  reminders: Reminder[];
  appointments: Appointment[];
  medications: Medication[];
  weeklyStats: WeeklyStats;
}