import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useIndexedDB } from './hooks/useIndexDB';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Reminders from './components/Reminders';
import Appointments from './components/Appointments';
import WeeklySummary from './components/WeeklySummary';

function App() {
  const {
    isLoading,
    error,
    reminders,
    appointments,
    medications,
    addMedication,
    deleteMedication,
    deleteReminder,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getWeeklyStats,
    seedDemoData,
  } = useIndexedDB();

  const weeklyStats = getWeeklyStats();

  // Wrapper functions to match component prop types
  const handleAddMedication = async (medication: Parameters<typeof addMedication>[0]) => {
    await addMedication(medication);
  };

  const handleAddAppointment = async (appointment: Parameters<typeof addAppointment>[0]) => {
    await addAppointment(appointment);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md text-center">
          <span className="text-6xl block mb-4">⚠️</span>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Error Loading Data</h1>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 pt-24 pb-32 md:pb-12">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  reminders={reminders}
                  appointments={appointments}
                  onSeedData={seedDemoData}
                  isLoading={isLoading}
                />
              }
            />
            <Route
              path="/reminders"
              element={
                <Reminders
                  reminders={reminders}
                  medications={medications}
                  onAddMedication={handleAddMedication}
                  onDeleteMedication={deleteMedication}
                  onDeleteReminder={deleteReminder}
                />
              }
            />
            <Route
              path="/appointments"
              element={
                <Appointments
                  appointments={appointments}
                  onAddAppointment={handleAddAppointment}
                  onUpdateAppointment={updateAppointment}
                  onDeleteAppointment={deleteAppointment}
                />
              }
            />
            <Route
              path="/summary"
              element={<WeeklySummary stats={weeklyStats} />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
