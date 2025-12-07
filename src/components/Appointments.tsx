import { useState } from 'react';
import type { Appointment } from '../types';
import { formatDate, formatTime, isPast, classNames, generateId } from '../utils';

interface AppointmentsProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  onUpdateAppointment: (appointment: Appointment) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
}

const Appointments = ({
  appointments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    doctor: '',
    location: '',
    date: '',
    time: '',
    notes: '',
    checklistItems: ['Insurance card', 'Photo ID'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.location || !formData.date || !formData.time) return;

    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      await onAddAppointment({
        title: formData.title,
        doctor: formData.doctor || undefined,
        location: formData.location,
        dateTime,
        notes: formData.notes || undefined,
        checklist: formData.checklistItems.filter(Boolean).map(text => ({
          id: generateId(),
          text,
          completed: false,
        })),
      });

      setFormData({
        title: '',
        doctor: '',
        location: '',
        date: '',
        time: '',
        notes: '',
        checklistItems: ['Insurance card', 'Photo ID'],
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChecklistItemChange = (index: number, value: string) => {
    const newItems = [...formData.checklistItems];
    newItems[index] = value;
    setFormData({ ...formData, checklistItems: newItems });
  };

  const addChecklistItem = () => {
    setFormData({ ...formData, checklistItems: [...formData.checklistItems, ''] });
  };

  const removeChecklistItem = (index: number) => {
    const newItems = formData.checklistItems.filter((_, i) => i !== index);
    setFormData({ ...formData, checklistItems: newItems });
  };

  const toggleChecklistItem = async (appointment: Appointment, itemId: string) => {
    const updatedChecklist = appointment.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    await onUpdateAppointment({
      ...appointment,
      checklist: updatedChecklist,
    });
  };

  const markAppointmentComplete = async (appointment: Appointment) => {
    await onUpdateAppointment({
      ...appointment,
      status: 'completed',
    });
  };

  const markAppointmentMissed = async (appointment: Appointment) => {
    await onUpdateAppointment({
      ...appointment,
      status: 'missed',
    });
  };

  // Categorize appointments
  const now = new Date();
  const upcomingAppointments = appointments
    .filter(a => new Date(a.dateTime) >= now && a.status === 'upcoming')
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const pastAppointments = appointments
    .filter(a => new Date(a.dateTime) < now || a.status !== 'upcoming')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const getStatusBadge = (appointment: Appointment) => {
    if (appointment.status === 'completed') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✓ Attended</span>;
    }
    if (appointment.status === 'missed') {
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">✕ Missed</span>;
    }
    if (isPast(new Date(appointment.dateTime))) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">⏱️ Past</span>;
    }
    return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">📅 Upcoming</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>📅</span> Appointments
          </h1>
          <p className="text-gray-600 mt-1">Manage your medical appointments and checklists</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={classNames(
            "px-6 py-3 rounded-xl font-bold text-lg transition-all",
            showAddForm
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
          )}
        >
          {showAddForm ? '✕ Cancel' : '+ Add Appointment'}
        </button>
      </div>

      {/* Add Appointment Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-slideDown">
          <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span>🏥</span> New Appointment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="appt-title" className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Type *
                </label>
                <input
                  id="appt-title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="e.g., Annual Physical"
                  required
                />
              </div>
              <div>
                <label htmlFor="doctor" className="block text-sm font-semibold text-gray-700 mb-2">
                  Doctor Name
                </label>
                <input
                  id="doctor"
                  type="text"
                  value={formData.doctor}
                  onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  placeholder="e.g., Dr. Smith"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                placeholder="e.g., City Medical Center, Room 204"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all resize-none"
                rows={2}
                placeholder="e.g., Fasting required"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Checklist Items
              </label>
              <div className="space-y-3">
                {formData.checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleChecklistItemChange(index, e.target.value)}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      placeholder="e.g., Insurance card"
                    />
                    <button
                      type="button"
                      onClick={() => removeChecklistItem(index)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-amber-400 hover:text-amber-600 transition-colors font-medium"
                >
                  + Add checklist item
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={classNames(
                "w-full py-4 rounded-xl font-bold text-xl transition-all",
                isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-linear-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
              )}
            >
              {isSubmitting ? 'Adding...' : '✓ Add Appointment'}
            </button>
          </form>
        </div>
      )}

      {/* Upcoming Appointments */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span> Upcoming Appointments ({upcomingAppointments.length})
        </h2>
        {upcomingAppointments.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <span className="text-5xl block mb-3">📭</span>
            <p className="text-gray-500 text-lg">No upcoming appointments</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 text-amber-600 hover:text-amber-700 font-semibold text-lg"
            >
              + Add your first appointment
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-2xl shadow-md border-2 border-amber-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <span className="text-5xl">🏥</span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{appointment.title}</h3>
                      {appointment.doctor && (
                        <p className="text-gray-600 font-medium mt-1">👨‍⚕️ {appointment.doctor}</p>
                      )}
                      <p className="text-amber-600 font-semibold mt-2">
                        📅 {formatDate(appointment.dateTime)}
                      </p>
                      <p className="text-amber-600 font-semibold">
                        🕐 {formatTime(appointment.dateTime)}
                      </p>
                      <p className="text-gray-500 mt-2">
                        📍 {appointment.location}
                      </p>
                      {appointment.notes && (
                        <p className="mt-3 text-sm text-gray-600 italic bg-gray-50 rounded-lg p-3">
                          📝 {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getStatusBadge(appointment)}
                    <button
                      onClick={() => onDeleteAppointment(appointment.id)}
                      className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
                      aria-label={`Delete ${appointment.title}`}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Checklist */}
                {appointment.checklist.length > 0 && (
                  <div className="mt-5 pt-5 border-t-2 border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>✓</span> Checklist
                      <span className="text-sm font-normal text-gray-500">
                        ({appointment.checklist.filter(c => c.completed).length}/{appointment.checklist.length} complete)
                      </span>
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {appointment.checklist.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleChecklistItem(appointment, item.id)}
                          className={classNames(
                            "flex items-center gap-3 p-4 rounded-xl text-left transition-all border-2",
                            item.completed
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : "bg-white border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                          )}
                        >
                          <span className="text-2xl shrink-0">
                            {item.completed ? '✅' : '⬜'}
                          </span>
                          <span className={classNames(
                            "font-medium flex-1",
                            item.completed ? "text-green-700 line-through" : "text-gray-700"
                          )}>
                            {item.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mark as Complete/Missed */}
                {appointment.status === 'upcoming' && (
                  <div className="mt-5 pt-5 border-t-2 border-gray-100 flex gap-3">
                    <button
                      onClick={() => markAppointmentComplete(appointment)}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                    >
                      ✓ Mark as Attended
                    </button>
                    <button
                      onClick={() => markAppointmentMissed(appointment)}
                      className="flex-1 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-xl transition-colors"
                    >
                      ✕ Mark as Missed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Past Appointments ({pastAppointments.length})
          </h2>
          <div className="space-y-3">
            {pastAppointments.slice(0, 10).map((appointment) => (
              <div
                key={appointment.id}
                className="bg-gray-50 rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 opacity-75"
              >
                <span className="text-4xl">🏥</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-700">{appointment.title}</h3>
                  {appointment.doctor && (
                    <p className="text-gray-500 text-sm">{appointment.doctor}</p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    {formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}
                  </p>
                  <p className="text-gray-400 text-sm">📍 {appointment.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(appointment)}
                  <button
                    onClick={() => onDeleteAppointment(appointment.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label={`Delete ${appointment.title}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Appointments;
