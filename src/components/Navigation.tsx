import { NavLink } from 'react-router-dom';
import { classNames } from '../utils';

const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/reminders', label: 'Reminders', icon: '⏰' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/summary', label: 'Weekly Summary', icon: '📊' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-teal-600 to-teal-700 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <NavLink 
            to="/" 
            className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
          >
            <span className="text-2xl md:text-3xl">💊</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              PocketCare
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  classNames(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white text-teal-700 shadow-md'
                      : 'text-white/90 hover:bg-white/20 hover:text-white'
                  )
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Fixed Bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-teal-100 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                classNames(
                  'flex flex-col items-center justify-center w-full h-full px-2 transition-all duration-200',
                  isActive
                    ? 'text-teal-600 bg-teal-50'
                    : 'text-gray-500 hover:text-teal-600 hover:bg-gray-50'
                )
              }
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;