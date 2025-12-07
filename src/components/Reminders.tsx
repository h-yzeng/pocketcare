import { useState } from 'react';
import type { Reminder, Medication } from '../types';
import { formatTime, formatDate, getRelativeTime, classNames } from '../utils';

interface RemindersProps {
  reminders: Reminder[];
  medications: Medication[];
  onAddMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteMedication: (id: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
}

const Reminders = ({ 
  reminders, 
  medications, 
  onAddMedication, 
  onDeleteMedication,
  onDeleteReminder 
}: RemindersProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    times: ['08:00'],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage) return;

    setIsSubmitting(true);
    try {
      await onAddMedication({
        name: formData.name,
        dosage: formData.dosage,
        frequency: formData.frequency,
        times: formData.times.filter(Boolean),
        notes: formData.notes || undefined,
      });
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        times: ['08:00'],
        notes: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add medication:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addTimeSlot = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTimeSlot = (index: number) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData({ ...formData, times: newTimes });
    }
  };

  // Sort reminders by time
  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
  );

  const pendingReminders = sortedReminders.filter((r) => r.status === 'pending');
  const completedReminders = sortedReminders.filter((r) => r.status !== 'pending');

  const getStatusBadge = (status: Reminder['status']) => {
    switch (status) {
      case 'taken':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Taken</span>;
      case 'snoozed':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">⏰ Snoozed</span>;
      case 'skipped':
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">⏭️ Skipped</span>;
      case 'missed':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Missed</span>;
      default:
        return <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">⏳ Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>⏰</span> Reminders
          </h1>
          <p className="text-gray-600 mt-1">Manage your medications and reminders</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={classNames(
            "px-6 py-3 rounded-xl font-bold text-lg transition-all",
            showAddForm
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-linear-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
          )}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Medication'}
        </button>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slideDown">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>💊</span> New Medication
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="med-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Medication Name *
                </label>
                <input
                  id="med-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  placeholder="e.g., Lisinopril"
                  required
                />
              </div>
              <div>
                <label htmlFor="dosage" className="block text-sm font-semibold text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  id="dosage"
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                  placeholder="e.g., 10mg"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="frequency" className="block text-sm font-semibold text-gray-700 mb-2">
                Frequency
              </label>
              <select
                id="frequency"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-white"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
                <option>Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reminder Times
              </label>
              <div className="space-y-3">
                {formData.times.map((time, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => handleTimeChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                      title="Select time"
                    />
                    {formData.times.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Remove time"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeSlot}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors font-medium"
                >
                  + Add another time
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all resize-none"
                rows={2}
                placeholder="e.g., Take with food"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(
                "w-full py-4 rounded-xl font-bold text-xl transition-all",
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-linear-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-xl"
              )}
            >
              {isSubmitting ? 'Adding...' : '✓ Add Medication'}
            </button>
          </form>
        </div>
      )}

      {/* Medications List */}
      {medications.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💊</span> Your Medications
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{med.name}</h3>
                    <p className="text-teal-600 font-medium">{med.dosage}</p>
                  </div>
                  <button
                    onClick={() => onDeleteMedication(med.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete ${med.name}`}
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-gray-500 mt-2">{med.frequency}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {med.times.map((time, i) => (
                    <span key={i} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm font-medium">
                      ⏰ {time}
                    </span>
                  ))}
                </div>
                {med.notes && (
                  <p className="mt-3 text-sm text-gray-500 italic">📝 {med.notes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Reminders */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⏳</span> Pending Reminders ({pendingReminders.length})
        </h2>
        {pendingReminders.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-3">✅</span>
            <p className="text-gray-500 text-lg">No pending reminders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={classNames(
                  "bg-white rounded-2xl shadow-md border-l-4 p-5 flex items-center gap-4",
                  reminder.type === 'medication' ? "border-l-teal-500" : "border-l-amber-500"
                )}
              >
                <span className="text-4xl">
                  {reminder.type === 'medication' ? '💊' : '📅'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900">{reminder.title}</h3>
                  {reminder.description && (
                    <p className="text-gray-500 text-sm">{reminder.description}</p>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    {formatDate(reminder.scheduledTime)} at {formatTime(reminder.scheduledTime)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">{getRelativeTime(reminder.scheduledTime)}</p>
                  {getStatusBadge(reminder.status)}
                </div>
                <button
                  onClick={() => onDeleteReminder(reminder.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete reminder"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> History ({completedReminders.length})
          </h2>
          <div className="space-y-3">
            {completedReminders.slice(0, 10).map((reminder) => (
              <div
                key={reminder.id}
                className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 opacity-75"
              >
                <span className="text-3xl">
                  {reminder.type === 'medication' ? '💊' : '📅'}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-700">{reminder.title}</h3>
                  <p className="text-sm text-gray-400">
                    {formatDate(reminder.scheduledTime)}
                  </p>
                </div>
                {getStatusBadge(reminder.status)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Reminders;