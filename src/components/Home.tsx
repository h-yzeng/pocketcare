import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Reminder, Appointment } from '../types';
import { formatTime, formatDate, isToday, getRelativeTime, classNames, requestNotificationPermission } from '../utils';

interface HomeProps {
  reminders: Reminder[];
  appointments: Appointment[];
  onSeedData: () => void;
  isLoading: boolean;
}

const Home = ({ reminders, appointments, onSeedData, isLoading }: HomeProps) => {
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'default'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const showWelcome = !isLoading && reminders.length === 0 && appointments.length === 0;

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  // Get today's reminders
  const todaysReminders = reminders
    .filter((r) => isToday(r.scheduledTime) && r.status === 'pending')
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());

  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = appointments
    .filter((a) => {
      const date = new Date(a.dateTime);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return date >= now && date <= weekFromNow && a.status === 'upcoming';
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">💊</div>
          <p className="text-xl text-gray-600">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Notification Permission Banner */}
      {notificationStatus !== 'granted' && (
        <div className="bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <span className="text-4xl">🔔</span>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-bold text-lg text-amber-900">Enable Notifications</h3>
              <p className="text-amber-700">
                Get alerted when it's time to take your medication or prepare for appointments.
              </p>
            </div>
            <button
              onClick={handleEnableNotifications}
              className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors"
            >
              Enable Now
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section for New Users */}
      {showWelcome && (
        <div className="bg-linear-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-8 text-center">
          <div className="text-7xl mb-4">👋</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to PocketCare!</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
            Your personal medication and appointment reminder app. Let's get you started with some sample data.
          </p>
          <button
            onClick={onSeedData}
            className="px-8 py-4 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            🚀 Load Demo Data
          </button>
        </div>
      )}

      {/* Today's Overview */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-bold text-gray-900">Today's Overview</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Today's Reminders Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-teal-500 to-teal-600 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⏰</span> Reminders Today
              </h3>
            </div>
            <div className="p-5">
              {todaysReminders.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-3">✅</span>
                  <p className="text-gray-500 text-lg">No pending reminders today!</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {todaysReminders.slice(0, 5).map((reminder) => (
                    <li
                      key={reminder.id}
                      className={classNames(
                        "flex items-center gap-4 p-4 rounded-xl transition-colors",
                        reminder.type === 'medication' 
                          ? "bg-teal-50 hover:bg-teal-100" 
                          : "bg-amber-50 hover:bg-amber-100"
                      )}
                    >
                      <span className="text-3xl">
                        {reminder.type === 'medication' ? '💊' : '📅'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{reminder.title}</p>
                        <p className="text-sm text-gray-500">{formatTime(reminder.scheduledTime)}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">
                        {getRelativeTime(reminder.scheduledTime)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {todaysReminders.length > 5 && (
                <Link
                  to="/reminders"
                  className="block mt-4 text-center text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View all {todaysReminders.length} reminders →
                </Link>
              )}
            </div>
          </div>

          {/* Upcoming Appointments Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-linear-to-r from-amber-500 to-orange-500 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📅</span> Upcoming Appointments
              </h3>
            </div>
            <div className="p-5">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-5xl block mb-3">📭</span>
                  <p className="text-gray-500 text-lg">No upcoming appointments</p>
                  <Link
                    to="/appointments"
                    className="inline-block mt-4 text-amber-600 hover:text-amber-700 font-semibold"
                  >
                    + Add an appointment
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {upcomingAppointments.slice(0, 3).map((appointment) => (
                    <li
                      key={appointment.id}
                      className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">🏥</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{appointment.title}</p>
                          {appointment.doctor && (
                            <p className="text-sm text-gray-600">{appointment.doctor}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}
                          </p>
                          <p className="text-sm text-gray-500">📍 {appointment.location}</p>
                        </div>
                      </div>
                      {appointment.checklist.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-amber-200">
                          <p className="text-sm font-medium text-amber-700">
                            📝 {appointment.checklist.filter((c) => c.completed).length}/{appointment.checklist.length} checklist items ready
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {upcomingAppointments.length > 3 && (
                <Link
                  to="/appointments"
                  className="block mt-4 text-center text-amber-600 hover:text-amber-700 font-semibold"
                >
                  View all appointments →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">⚡</span>
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/reminders"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-teal-200 transition-all group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">➕</span>
            <span className="font-semibold text-gray-700 text-center">Add Medication</span>
          </Link>

          <Link
            to="/appointments"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-amber-200 transition-all group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">📅</span>
            <span className="font-semibold text-gray-700 text-center">Add Appointment</span>
          </Link>

          <Link
            to="/summary"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">📊</span>
            <span className="font-semibold text-gray-700 text-center">Weekly Summary</span>
          </Link>

          <Link
            to="/reminders"
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg hover:border-cyan-200 transition-all group"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">💊</span>
            <span className="font-semibold text-gray-700 text-center">All Reminders</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;