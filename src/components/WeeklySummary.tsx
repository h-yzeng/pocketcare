import type { WeeklyStats } from '../types';
import { formatDate } from '../utils';

interface WeeklySummaryProps {
  stats: WeeklyStats;
}

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  color
}: {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) => (
  <div className={`bg-white rounded-2xl shadow-md border-2 ${color} p-6 hover:shadow-lg transition-shadow`}>
    <div className="flex items-start gap-4">
      <span className="text-5xl">{icon}</span>
      <div className="flex-1">
        <h3 className="text-gray-600 font-medium text-sm uppercase tracking-wide">{title}</h3>
        <p className="text-4xl font-bold text-gray-900 mt-2">{value}</p>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  max,
  color,
  icon
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-700 flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        <span className="text-gray-500">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
          data-testid="progress-fill"
        >
          {percentage > 15 && (
            <span className="text-white text-xs font-bold">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

const WeeklySummary = ({ stats }: WeeklySummaryProps) => {
  const totalMedications = stats.medicationsTaken + stats.medicationsMissed;
  const medicationRate = totalMedications > 0
    ? Math.round((stats.medicationsTaken / totalMedications) * 100)
    : 0;

  const totalAppointments = stats.appointmentsAttended + stats.appointmentsMissed;
  const appointmentRate = totalAppointments > 0
    ? Math.round((stats.appointmentsAttended / totalAppointments) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span>📊</span> Weekly Summary
        </h1>
        <p className="text-gray-600 mt-1">
          {formatDate(stats.weekStartDate)} - {formatDate(stats.weekEndDate)}
        </p>
      </div>

      {/* Overview Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📈</span> This Week's Overview
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            icon="💊"
            title="Medications Taken"
            value={stats.medicationsTaken}
            subtitle={totalMedications > 0 ? `${medicationRate}% adherence` : undefined}
            color="border-teal-200"
          />
          <StatCard
            icon="✅"
            title="Appointments Attended"
            value={stats.appointmentsAttended}
            subtitle={totalAppointments > 0 ? `${appointmentRate}% attendance` : undefined}
            color="border-green-200"
          />
          <StatCard
            icon="⏰"
            title="Reminders Snoozed"
            value={stats.medicationsSnoozed}
            subtitle="Times postponed"
            color="border-amber-200"
          />
          <StatCard
            icon="📋"
            title="Total Reminders"
            value={stats.totalReminders}
            subtitle="This week"
            color="border-purple-200"
          />
        </div>
      </section>

      {/* Medication Performance */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💊</span> Medication Adherence
        </h2>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {totalMedications === 0 ? (
            <div className="text-center py-8">
              <span className="text-5xl block mb-3">📭</span>
              <p className="text-gray-500 text-lg">No medication data this week</p>
            </div>
          ) : (
            <div className="space-y-6">
              <ProgressBar
                label="Medications Taken"
                value={stats.medicationsTaken}
                max={totalMedications}
                color="bg-gradient-to-r from-teal-500 to-cyan-500"
                icon="✓"
              />
              <ProgressBar
                label="Medications Missed/Skipped"
                value={stats.medicationsMissed}
                max={totalMedications}
                color="bg-gradient-to-r from-red-400 to-red-500"
                icon="✕"
              />

              {/* Performance Indicator */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                {medicationRate >= 80 ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 text-center">
                    <span className="text-5xl block mb-2">🌟</span>
                    <p className="text-green-800 font-bold text-lg">Excellent Adherence!</p>
                    <p className="text-green-600 mt-1">You're doing great with your medications</p>
                  </div>
                ) : medicationRate >= 50 ? (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 text-center">
                    <span className="text-5xl block mb-2">⚠️</span>
                    <p className="text-amber-800 font-bold text-lg">Good Progress</p>
                    <p className="text-amber-600 mt-1">Try to improve your medication schedule</p>
                  </div>
                ) : (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 text-center">
                    <span className="text-5xl block mb-2">🎯</span>
                    <p className="text-red-800 font-bold text-lg">Needs Improvement</p>
                    <p className="text-red-600 mt-1">Consider setting more reminders</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Appointment Performance */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📅</span> Appointment Tracking
        </h2>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          {totalAppointments === 0 ? (
            <div className="text-center py-8">
              <span className="text-5xl block mb-3">📭</span>
              <p className="text-gray-500 text-lg">No appointments this week</p>
            </div>
          ) : (
            <div className="space-y-6">
              <ProgressBar
                label="Appointments Attended"
                value={stats.appointmentsAttended}
                max={totalAppointments}
                color="bg-gradient-to-r from-green-500 to-emerald-500"
                icon="✓"
              />
              <ProgressBar
                label="Appointments Missed"
                value={stats.appointmentsMissed}
                max={totalAppointments}
                color="bg-gradient-to-r from-red-400 to-red-500"
                icon="✕"
              />

              {/* Appointment Stats */}
              <div className="mt-6 pt-6 border-t-2 border-gray-100 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-700">{stats.appointmentsAttended}</p>
                  <p className="text-sm text-green-600 mt-1">Attended</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-xl">
                  <p className="text-3xl font-bold text-red-700">{stats.appointmentsMissed}</p>
                  <p className="text-sm text-red-600 mt-1">Missed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💡</span> Insights
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {/* Snooze Insight */}
          <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-4xl">⏰</span>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Snooze Activity</h3>
                <p className="text-gray-700">
                  You snoozed reminders <span className="font-bold text-amber-700">{stats.medicationsSnoozed}</span> time{stats.medicationsSnoozed !== 1 ? 's' : ''} this week.
                </p>
                {stats.medicationsSnoozed > 5 && (
                  <p className="text-amber-700 text-sm mt-2 font-medium">
                    💡 Try adjusting your reminder times for better adherence
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Overall Health */}
          <div className="bg-linear-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="text-4xl">❤️</span>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">Overall Health</h3>
                <p className="text-gray-700">
                  You managed <span className="font-bold text-purple-700">{stats.totalReminders}</span> reminder{stats.totalReminders !== 1 ? 's' : ''} this week.
                </p>
                {stats.totalReminders > 0 && (
                  <p className="text-purple-700 text-sm mt-2 font-medium">
                    🎉 Keep up the great work managing your health!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Footer */}
      <div className="bg-linear-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-2xl p-6 text-center">
        <p className="text-gray-700 text-lg">
          {totalMedications > 0 && medicationRate >= 80 ? (
            <>
              <span className="text-2xl mr-2">🎊</span>
              <span className="font-bold text-teal-700">Outstanding work!</span> You're taking excellent care of your health.
            </>
          ) : stats.totalReminders > 0 ? (
            <>
              <span className="text-2xl mr-2">💪</span>
              <span className="font-bold text-teal-700">Keep going!</span> Every step counts toward better health.
            </>
          ) : (
            <>
              <span className="text-2xl mr-2">🌱</span>
              <span className="font-bold text-teal-700">Ready to start?</span> Add your medications and appointments to begin tracking.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default WeeklySummary;
