# PocketCare 💊

A healthcare reminder web application designed for accessibility and ease of use. PocketCare helps users manage medication schedules and medical appointments with a simple, clean interface.

## Usage

### First Time Setup

1. Visit the home page
2. Click "Load Demo Data" to see sample medications and appointments
3. Or start fresh by adding your own data

### Adding Medications

1. Navigate to **Reminders** page
2. Click **+ Add Medication**
3. Fill in medication details (name, dosage, frequency, times)
4. Reminders will automatically be generated

### Managing Appointments

1. Navigate to **Appointments** page
2. Click **+ Add Appointment**
3. Fill in appointment details
4. Add custom checklist items (insurance card, ID, etc.)
5. Check off items as you prepare

### Viewing Weekly Summary

1. Navigate to **Weekly Summary** page
2. See your medication adherence rate
3. Track appointment attendance
4. View insights and feedback

## Tech Stack

- **React 19** with TypeScript
- **React Router 7** for navigation
- **TailwindCSS v4** for styling
- **IndexedDB** for local data persistence
- **Vite 7** for build tooling

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd pocketcare
```

2. Install dependencies

```bash
npm install
```

3. Start development server

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Project Structure

```bash
src/
├── components/          # React components
│   ├── Appointments.tsx    # Appointment management
│   ├── Home.tsx           # Home page dashboard
│   ├── Navigation.tsx     # Navigation bar
│   ├── Reminders.tsx      # Medication reminders
│   └── WeeklySummary.tsx  # Statistics dashboard
├── hooks/
│   └── useIndexDB.ts   # IndexedDB data management
├── types/
│   └── index.ts        # TypeScript type definitions
├── utils/
│   └── index.ts        # Utility functions
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## Data Storage

All data is stored locally in your browser using IndexedDB:

- **No account required** - Start using immediately
- **Privacy first** - Your health data never leaves your device
- **Persistent** - Data remains even after closing the browser
- **Database name**: `PocketCareDB`

### Data Stores

- `reminders` - Medication and appointment reminders
- `appointments` - Medical appointments with checklists
- `medications` - Medication schedules

## Accessibility Statement

PocketCare is designed with accessibility as a core requirement:

- WCAG 2.1 Level AA compliant
- Screen reader friendly
- Keyboard navigation throughout
- High contrast mode compatible
- Large touch targets for motor accessibility
- Clear, simple language

## Privacy

Your privacy is important:

- No data collection
- No analytics tracking
- No user accounts
- No server communication
- All data stored locally on your device
