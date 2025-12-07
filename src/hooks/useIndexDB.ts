import { useState, useEffect, useCallback } from 'react';
import type { Reminder, Appointment, Medication, WeeklyStats } from '../types';
import { generateId, getWeekBounds } from '../utils';

const DB_NAME = 'PocketCareDB';
const DB_VERSION = 1;

interface DBSchema {
  reminders: Reminder[];
  appointments: Appointment[];
  medications: Medication[];
}

type StoreName = keyof DBSchema;

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('reminders')) {
        const reminderStore = db.createObjectStore('reminders', { keyPath: 'id' });
        reminderStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
        reminderStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('appointments')) {
        const appointmentStore = db.createObjectStore('appointments', { keyPath: 'id' });
        appointmentStore.createIndex('dateTime', 'dateTime', { unique: false });
        appointmentStore.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('medications')) {
        db.createObjectStore('medications', { keyPath: 'id' });
      }
    };
  });
};

export const useIndexedDB = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);

  const getAll = useCallback(async <T>(storeName: StoreName): Promise<T[]> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  }, []);

  const add = useCallback(async <T extends { id: string }>(storeName: StoreName, item: T): Promise<T> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }, []);

  const update = useCallback(async <T extends { id: string }>(storeName: StoreName, item: T): Promise<T> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(item);
    });
  }, []);

  const remove = useCallback(async (storeName: StoreName, id: string): Promise<void> => {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [loadedReminders, loadedAppointments, loadedMedications] = await Promise.all([
          getAll<Reminder>('reminders'),
          getAll<Appointment>('appointments'),
          getAll<Medication>('medications'),
        ]);
        setReminders(loadedReminders);
        setAppointments(loadedAppointments);
        setMedications(loadedMedications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getAll]);

  // Reminder operations
  const addReminder = async (reminder: Omit<Reminder, 'id' | 'createdAt' | 'snoozeCount' | 'status'>): Promise<Reminder> => {
    const newReminder: Reminder = {
      ...reminder,
      id: generateId(),
      status: 'pending',
      snoozeCount: 0,
      createdAt: new Date(),
    };
    await add('reminders', newReminder);
    setReminders((prev) => [...prev, newReminder]);
    return newReminder;
  };

  const updateReminder = async (reminder: Reminder): Promise<void> => {
    await update('reminders', reminder);
    setReminders((prev) => prev.map((r) => (r.id === reminder.id ? reminder : r)));
  };

  const deleteReminder = async (id: string): Promise<void> => {
    await remove('reminders', id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Appointment operations
  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment> => {
    const newAppointment: Appointment = {
      ...appointment,
      id: generateId(),
      status: 'upcoming',
      createdAt: new Date(),
    };
    await add('appointments', newAppointment);
    setAppointments((prev) => [...prev, newAppointment]);

    // Create a reminder for the appointment
    await addReminder({
      type: 'appointment',
      title: `Appointment: ${appointment.title}`,
      description: `${appointment.location}${appointment.doctor ? ` with ${appointment.doctor}` : ''}`,
      scheduledTime: new Date(new Date(appointment.dateTime).getTime() - 60 * 60 * 1000), // 1 hour before
      relatedId: newAppointment.id,
    });

    return newAppointment;
  };

  const updateAppointment = async (appointment: Appointment): Promise<void> => {
    await update('appointments', appointment);
    setAppointments((prev) => prev.map((a) => (a.id === appointment.id ? appointment : a)));
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    await remove('appointments', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    // Also remove related reminders
    const relatedReminders = reminders.filter((r) => r.relatedId === id);
    for (const reminder of relatedReminders) {
      await deleteReminder(reminder.id);
    }
  };

  // Medication operations
  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt'>): Promise<Medication> => {
    const newMedication: Medication = {
      ...medication,
      id: generateId(),
      createdAt: new Date(),
    };
    await add('medications', newMedication);
    setMedications((prev) => [...prev, newMedication]);

    // Create reminders for each time
    for (const time of medication.times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      await addReminder({
        type: 'medication',
        title: `Take ${medication.name}`,
        description: `${medication.dosage} - ${medication.frequency}`,
        scheduledTime,
        relatedId: newMedication.id,
      });
    }

    return newMedication;
  };

  const updateMedication = async (medication: Medication): Promise<void> => {
    await update('medications', medication);
    setMedications((prev) => prev.map((m) => (m.id === medication.id ? medication : m)));
  };

  const deleteMedication = async (id: string): Promise<void> => {
    await remove('medications', id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
    // Also remove related reminders
    const relatedReminders = reminders.filter((r) => r.relatedId === id);
    for (const reminder of relatedReminders) {
      await deleteReminder(reminder.id);
    }
  };

  // Get weekly stats
  const getWeeklyStats = useCallback((): WeeklyStats => {
    const { start, end } = getWeekBounds();
    
    const weekReminders = reminders.filter((r) => {
      const scheduled = new Date(r.scheduledTime);
      return scheduled >= start && scheduled <= end;
    });

    const medicationReminders = weekReminders.filter((r) => r.type === 'medication');
    const appointmentReminders = weekReminders.filter((r) => r.type === 'appointment');

    return {
      weekStartDate: start,
      weekEndDate: end,
      medicationsTaken: medicationReminders.filter((r) => r.status === 'taken').length,
      medicationsMissed: medicationReminders.filter((r) => r.status === 'missed' || r.status === 'skipped').length,
      medicationsSnoozed: medicationReminders.filter((r) => r.status === 'snoozed' || r.snoozeCount > 0).length,
      appointmentsAttended: appointmentReminders.filter((r) => r.status === 'taken').length,
      appointmentsMissed: appointmentReminders.filter((r) => r.status === 'missed' || r.status === 'skipped').length,
      totalReminders: weekReminders.length,
    };
  }, [reminders]);

  // Seed demo data
  const seedDemoData = async () => {
    const now = new Date();
    
    // Demo medications
    const demoMeds: Omit<Medication, 'id' | 'createdAt'>[] = [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        times: ['08:00'],
        notes: 'Take with water in the morning',
      },
      {
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times: ['08:00', '20:00'],
        notes: 'Take with meals',
      },
    ];

    for (const med of demoMeds) {
      await addMedication(med);
    }

    // Demo appointment
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 3);
    futureDate.setHours(10, 30, 0, 0);

    await addAppointment({
      title: 'Annual Physical',
      doctor: 'Dr. Sarah Johnson',
      location: 'City Medical Center, Room 204',
      dateTime: futureDate,
      notes: 'Fasting required - no food after midnight',
      checklist: [
        { id: generateId(), text: 'Insurance card', completed: false },
        { id: generateId(), text: 'Photo ID', completed: false },
        { id: generateId(), text: 'List of current medications', completed: false },
        { id: generateId(), text: 'Previous test results', completed: false },
      ],
    });

    // Add some past reminders for weekly stats
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(8, 0, 0, 0);

    await add<Reminder>('reminders', {
      id: generateId(),
      type: 'medication',
      title: 'Take Lisinopril',
      description: '10mg - Once daily',
      scheduledTime: yesterday,
      status: 'taken',
      snoozeCount: 0,
      createdAt: yesterday,
    });

    yesterday.setHours(20, 0, 0, 0);
    await add<Reminder>('reminders', {
      id: generateId(),
      type: 'medication',
      title: 'Take Metformin',
      description: '500mg - Twice daily',
      scheduledTime: yesterday,
      status: 'snoozed',
      snoozeCount: 1,
      createdAt: yesterday,
    });

    // Reload data
    const [loadedReminders, loadedAppointments, loadedMedications] = await Promise.all([
      getAll<Reminder>('reminders'),
      getAll<Appointment>('appointments'),
      getAll<Medication>('medications'),
    ]);
    setReminders(loadedReminders);
    setAppointments(loadedAppointments);
    setMedications(loadedMedications);
  };

  return {
    isLoading,
    error,
    reminders,
    appointments,
    medications,
    addReminder,
    updateReminder,
    deleteReminder,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    addMedication,
    updateMedication,
    deleteMedication,
    getWeeklyStats,
    seedDemoData,
  };
};