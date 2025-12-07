import { useEffect, useState } from 'react';
import type { Reminder, ReminderAction } from '../types';
import { formatTime, addMinutes, classNames } from '../utils';

interface NotificationModalProps {
  reminder: Reminder;
  onAction: (action: ReminderAction, reminder: Reminder) => void;
  onClose: () => void;
}

const NotificationModal = ({ reminder, onAction, onClose }: NotificationModalProps) => {
  const [selectedAction, setSelectedAction] = useState<ReminderAction | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAction = (action: ReminderAction) => {
    setSelectedAction(action);
    onAction(action, reminder);
    setIsConfirmed(true);

    // Auto-close after confirmation
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const getConfirmationMessage = () => {
    switch (selectedAction) {
      case 'take':
        return reminder.type === 'medication' 
          ? '✅ Medication marked as taken!' 
          : '✅ Appointment confirmed!';
      case 'snooze':
        return `⏰ Snoozed! I'll remind you again at ${formatTime(addMinutes(new Date(), 15))}`;
      case 'skip':
        return '⏭️ Reminder skipped for now.';
      default:
        return '';
    }
  };

  const isAppointment = reminder.type === 'appointment';

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={classNames(
          "w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300",
          isConfirmed ? 'scale-95 opacity-90' : 'scale-100'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-title"
      >
        {/* Header */}
        <div className={classNames(
          "px-6 py-5 text-center",
          isAppointment ? "bg-linear-to-r from-amber-500 to-orange-500" : "bg-linear-to-r from-teal-500 to-cyan-500"
        )}>
          <div className="text-5xl mb-2">
            {isAppointment ? '📅' : '💊'}
          </div>
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium">
            {isAppointment ? 'Appointment Reminder' : 'Medication Reminder'}
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {isConfirmed ? (
            <div className="text-center py-8 animate-slideUp">
              <div className="text-6xl mb-4">
                {selectedAction === 'take' ? '✅' : selectedAction === 'snooze' ? '⏰' : '⏭️'}
              </div>
              <p className="text-xl font-semibold text-gray-800">
                {getConfirmationMessage()}
              </p>
            </div>
          ) : (
            <>
              <h2 
                id="notification-title"
                className="text-2xl font-bold text-gray-900 text-center mb-2"
              >
                {reminder.title}
              </h2>
              
              {reminder.description && (
                <p className="text-lg text-gray-600 text-center mb-2">
                  {reminder.description}
                </p>
              )}
              
              <p className="text-center text-gray-500 mb-6">
                Scheduled for {formatTime(reminder.scheduledTime)}
              </p>

              {reminder.snoozeCount > 0 && (
                <p className="text-center text-amber-600 text-sm mb-4 font-medium">
                  ⚠️ Already snoozed {reminder.snoozeCount} time{reminder.snoozeCount > 1 ? 's' : ''}
                </p>
              )}

              {/* Action Buttons - Large Touch Targets */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAction('take')}
                  className={classNames(
                    "w-full py-5 px-6 rounded-2xl text-xl font-bold transition-all duration-200",
                    "bg-linear-to-r from-green-500 to-emerald-500 text-white",
                    "hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:scale-[1.02]",
                    "focus:outline-none focus:ring-4 focus:ring-green-300",
                    "active:scale-95"
                  )}
                  aria-label={isAppointment ? "Confirm appointment" : "Mark medication as taken"}
                >
                  ✓ {isAppointment ? 'Confirm' : 'Take'}
                </button>

                <button
                  onClick={() => handleAction('snooze')}
                  className={classNames(
                    "w-full py-5 px-6 rounded-2xl text-xl font-bold transition-all duration-200",
                    "bg-linear-to-r from-amber-400 to-orange-400 text-white",
                    "hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:scale-[1.02]",
                    "focus:outline-none focus:ring-4 focus:ring-amber-300",
                    "active:scale-95"
                  )}
                  aria-label="Snooze reminder for 15 minutes"
                >
                  ⏰ Snooze (15 min)
                </button>

                <button
                  onClick={() => handleAction('skip')}
                  className={classNames(
                    "w-full py-5 px-6 rounded-2xl text-xl font-bold transition-all duration-200",
                    "bg-gray-200 text-gray-700",
                    "hover:bg-gray-300 hover:shadow-lg hover:scale-[1.02]",
                    "focus:outline-none focus:ring-4 focus:ring-gray-300",
                    "active:scale-95"
                  )}
                  aria-label="Skip this reminder"
                >
                  ⏭️ Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;