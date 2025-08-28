# NextStep - Predictable Task & Rewards App

A mobile-first React application designed for managing daily routines with clear visual schedules, task completion tracking, and an optional reward system. Built with accessibility and autism-friendly UX in mind.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for touch interactions and small screens
- **📝 Task Management** - Create, edit, and track daily routine tasks
- **🎯 Visual Progress** - Clear progress bar showing completion percentage
- **⭐ Reward System** - Star-based rewards with customizable goals (Child Mode)
- **👤 Dual Modes** - Child mode with rewards vs. Adult mode (minimal interface)
- **🎨 Accessibility** - WCAG AA compliant with keyboard navigation
- **🌙 Low-Stim Theme** - Reduced motion and muted colors option
- **⏰ Smart Reminders** - Configurable "priming" notifications before due times
- **💾 Flexible Storage** - Local storage or API backend support
- **📤 Data Export/Import** - Backup and restore functionality

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser

### Installation

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd nextstep-app
npm install
```

2. **Start the development server:**

```bash
npm run dev
```

3. **Open your browser:**

Visit `http://localhost:5173` to see the app running.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration (optional)
VITE_API_BASE_URL=http://localhost:8080/api

# Default storage mode ('local' or 'api')
VITE_STORAGE_MODE=local
```

### Storage Modes

**Local Storage Mode (default):**
- Data saved in browser localStorage
- No backend required
- Perfect for personal use
- Includes export/import functionality

**API Mode:**
- Data synced with remote server
- Requires backend implementation
- Mock Service Worker (MSW) provides API simulation in development

Switch between modes in Settings → Data Storage.

## 🎯 Usage

### Basic Workflow

1. **Add Tasks:** Click "Add Task" to create routine items
2. **Set Schedule:** Add emoji, title, due time, and reminder offsets
3. **Complete Tasks:** Tap "Mark Done" or use keyboard navigation
4. **Earn Rewards:** Complete tasks to earn stars (Child Mode)
5. **Track Progress:** Monitor daily completion percentage

### Keyboard Shortcuts

- `↑/↓` or `j/k` - Navigate tasks
- `Enter/Space` - Toggle selected task
- `Escape` - Clear selection  
- `s` or `,` - Open settings
- `r` - Open rewards (Child Mode)
- `n` - Add new task
- `?` - Show keyboard help

### Child vs Adult Mode

**Child Mode:**
- ⭐ Star rewards for completed tasks
- 🎉 Celebration modals at milestones
- 🎁 Customizable reward redemption
- Visual progress celebrations

**Adult Mode:**
- Clean, minimal interface
- No stars or celebrations
- Focus on productivity
- All core functionality preserved

## 🏗️ Architecture

### Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui + Lucide React icons
- **Animation:** Framer Motion (respects `prefers-reduced-motion`)
- **State Management:** 
  - TanStack Query (server state)
  - Zustand (UI state)
- **Testing:** Vitest + React Testing Library + MSW

### Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── TaskCard.tsx     # Individual task display
│   ├── ProgressBar.tsx  # Completion tracking
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useTasks.ts      # Task CRUD operations
│   ├── useRewards.ts    # Star/reward management
│   └── useSettings.ts   # App configuration
├── adapters/            # Data layer abstractions
│   ├── local/           # localStorage implementation
│   └── api/             # HTTP API implementation
├── mocks/               # MSW handlers for development
├── types/               # TypeScript type definitions
└── lib/                 # Utilities and configuration
```

### Data Flow

1. **UI Components** → Use custom hooks
2. **Custom Hooks** → Abstract storage via adapters
3. **Adapters** → Handle local/API storage transparently
4. **TanStack Query** → Caches and synchronizes data

## 🧪 Development

### Mock API

The app includes Mock Service Worker for API simulation:

- **Base URL:** `/api/v1/`
- **Endpoints:** `/tasks`, `/rewards`, `/settings`, `/stars`
- **Features:** Full CRUD operations, error simulation

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🔧 Backend Integration

### API Contract

When ready for a real backend, implement these endpoints:

```
GET /api/health                 # Health check
GET /api/v1/tasks              # List tasks
POST /api/v1/tasks             # Create task
PATCH /api/v1/tasks/:id        # Update task
DELETE /api/v1/tasks/:id       # Delete task

GET /api/v1/rewards            # List reward rules
POST /api/v1/rewards           # Create reward rule
PATCH /api/v1/rewards/:id      # Update reward rule
DELETE /api/v1/rewards/:id     # Delete reward rule

GET /api/v1/stars              # Get star count
PATCH /api/v1/stars            # Update stars (delta)

GET /api/v1/settings           # Get user settings
PATCH /api/v1/settings         # Update settings
```

### Data Models

```typescript
type Task = {
  id: string;
  userId?: string;
  title: string;
  emoji: string;
  done: boolean;
  dueTime?: string;        // "HH:MM" format
  prime?: PrimeOffset[];   // [10, 5, 1] minutes before
  updatedAt?: string;      // ISO date
  version?: number;        // Optimistic concurrency
};

type RewardRule = {
  id: string;
  userId?: string;
  name: string;           // "Choose a snack"
  cost: number;           // Stars required
};

type Settings = {
  mode: "child" | "adult";
  theme: "light" | "lowstim";
  storageMode: "api" | "local";
};
```

## 🎨 Accessibility Features

- **WCAG AA Compliant** - Color contrast, text sizing
- **Keyboard Navigation** - Full app navigation without mouse
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Reduced Motion** - Respects `prefers-reduced-motion`
- **Focus Management** - Visible focus indicators
- **Low-Stim Theme** - Muted colors for sensory sensitivity

## 📱 Mobile Optimization

- **Touch-Friendly** - Large tap targets (44px minimum)
- **Responsive Design** - Adapts to all screen sizes
- **PWA Ready** - Can be installed as standalone app
- **Offline Support** - Works without internet (local mode)

# 🎨 NextStep Design System Palette

## Primary Colors (Brand)
- **Primary (Main):** `#4D7385` ![#4D7385](https://via.placeholder.com/20/4D7385/FFFFFF?text=+)
- **Primary Light:** `#5A869C` ![#5A869C](https://via.placeholder.com/20/5A869C/FFFFFF?text=+)
- **Primary Dark:** `#3F565F` ![#3F565F](https://via.placeholder.com/20/3F565F/FFFFFF?text=+)
- **On Primary (Text/Icons):** `#FFFFFF` ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/000000?text=+)

---

## Secondary / Accent Colors
- **Accent (Main):** `#AECDCB` ![#AECDCB](https://via.placeholder.com/20/AECDCB/000000?text=+)
- **Accent Light:** `#CFE5E3` ![#CFE5E3](https://via.placeholder.com/20/CFE5E3/000000?text=+)
- **Accent Dark:** `#7DA5A2` ![#7DA5A2](https://via.placeholder.com/20/7DA5A2/000000?text=+)
- **On Accent:** `#061606` ![#061606](https://via.placeholder.com/20/061606/FFFFFF?text=+)

---

## Neutral Colors
- **Background:** `#FFFFFF` ![#FFFFFF](https://via.placeholder.com/20/FFFFFF/000000?text=+)
- **Surface:** `#F6F8F9` ![#F6F8F9](https://via.placeholder.com/20/F6F8F9/000000?text=+)
- **Border / Divider:** `#D9E1E4` ![#D9E1E4](https://via.placeholder.com/20/D9E1E4/000000?text=+)
- **Text Primary:** `#061606` ![#061606](https://via.placeholder.com/20/061606/FFFFFF?text=+)
- **Text Secondary:** `#3F565F` ![#3F565F](https://via.placeholder.com/20/3F565F/FFFFFF?text=+)
- **Disabled / Inactive:** `#9BA8AD` ![#9BA8AD](https://via.placeholder.com/20/9BA8AD/000000?text=+)

---

## Feedback Colors
- **Success:** `#7DA5A2` ![#7DA5A2](https://via.placeholder.com/20/7DA5A2/000000?text=+)
- **Warning:** `#E6B655` ![#E6B655](https://via.placeholder.com/20/E6B655/000000?text=+)
- **Error:** `#C15A5A` ![#C15A5A](https://via.placeholder.com/20/C15A5A/000000?text=+)

---

## Usage Examples
- **App header/nav bar** → Primary Dark (`#3F565F`) with white text.  
- **Primary buttons** → Primary Main (`#4D7385`) with white text.  
- **Secondary buttons** → Accent Main (`#AECDCB`) with near-black text.  
- **Background** → White or Surface (`#F6F8F9`).  
- **Progress/reward stars** → Accent Teal (`#AECDCB`) or Amber (`#E6B655`).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

## 📄 License

[Add your license here]

## 🆘 Support

For issues, feature requests, or questions:
- Open a GitHub issue
- Check existing documentation
- Review keyboard shortcuts (`?` key)

---

**Built with ❤️ for predictable, accessible daily routines.**