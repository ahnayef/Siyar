# 🧠 Siyar - Smart Timeline Manager

Siyar is a modern web application built to revolutionize how students, professionals, and creatives manage their time and deadlines. It provides a visually striking, neo-brutalist timeline interface that transforms traditional task management into an engaging, countdown-driven experience.

## ✨ Core Features

### 📅 Dynamic Timeline Visualization
- **Interactive Timeline Display**: Events are presented in a chronological timeline format with clear visual hierarchy
- **Real-Time Countdown Timers**: Live countdown displays for each event, creating urgency and awareness
- **Gap Indicators**: Visual time gaps between consecutive events help with planning and spacing
- **Event Status Tracking**: Smart categorization (urgent, warning, neutral, complete, overdue) with color-coded indicators

### 🎯 Event Management
- **Intuitive Event Creation**: Easy-to-use modal interface for adding new timeline events
- **Rich Event Details**: Title, description, due date, and contextual information
- **Event Editing & Deletion**: Full CRUD operations with confirmation dialogs
- **Event Categorization**: Smart icon assignment based on event type (exams, assignments, meetings, etc.)

### 🤖 AI-Powered Intelligence
- **Smart Scheduling Suggestions**: AI-driven recommendations for optimal event timing
- **Event Detail Enhancement**: AI-powered suggestions to improve event titles and descriptions
- **Timeline Optimization**: Intelligent analysis of past timeline data for better planning

### 👥 User & Timeline Management
- **User Authentication**: Secure login and signup system with Firebase integration
- **Personal Profiles**: Customizable user profiles with username management
- **Timeline Sharing**: Public/private timeline visibility controls
- **Timeline Organization**: Dashboard view for managing multiple timelines
- **Trash Management**: Soft delete functionality with restoration capabilities

### 🎨 Neo-Brutalist Design
- **Bold Visual Language**: Sharp edges, hard lines, and generous whitespace
- **Primary Color Scheme**: Saturated blue (#2962FF) for reliability and focus
- **Accent Colors**: Light green (#64FFDA) for important highlights
- **Typography**: Clean Inter font family for optimal readability
- **Responsive Design**: Optimized for desktop and mobile experiences

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 18, TypeScript |
| **UI Framework** | Tailwind CSS, Radix UI Components |
| **Backend** | Next.js API Routes, Firebase Functions |
| **Database** | Firebase Firestore |
| **Authentication** | Firebase Auth |
| **AI Integration** | Google AI Genkit |
| **Analytics** | PostHog |
| **Deployment** | Firebase App Hosting |

### Key Dependencies
- **UI Components**: Radix UI primitives for accessible, composable components
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Date Management**: date-fns for robust date operations
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## ⚙️ Installation

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Firebase project with Firestore and Authentication enabled

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ahnayef/Siyar.git
cd Siyar

# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env.local

# Configure Firebase credentials in .env.local
# NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... (other Firebase config)

# Run development server
pnpm dev
```

### 🤖 AI Development Setup

```bash
# Start Genkit development server
pnpm genkit:dev

# Watch mode for AI flows
pnpm genkit:watch
```

## 👥 How to Use

### Getting Started
1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Create Timeline**: Start with your first timeline from the dashboard
3. **Add Events**: Populate your timeline with important deadlines and milestones
4. **Track Progress**: Watch real-time countdowns and manage event status

### Timeline Management
- **Dashboard View**: Central hub for all your timelines
- **Timeline Creation**: Use the "Create Timeline" modal to start new projects
- **Visibility Control**: Toggle between public and private timeline visibility
- **Sharing**: Share public timelines with others via unique URLs

### Event Organization
- **Smart Categorization**: Events automatically get relevant icons based on content
- **Status Tracking**: Monitor event urgency with color-coded status indicators
- **AI Enhancement**: Use AI suggestions to improve event descriptions and scheduling

### Advanced Features
- **Trash Management**: Recover accidentally deleted timelines
- **Profile Customization**: Manage your public profile and username
- **Analytics Integration**: Track usage patterns with PostHog analytics

## 🎯 Motivation

**"Why Siyar?"**

- **Visual Clarity**: Transform overwhelming to-do lists into clear, visual timelines
- **Deadline Awareness**: Real-time countdowns create natural urgency and focus
- **Academic Focus**: Purpose-built for students and academic professionals
- **AI Enhancement**: Leverage artificial intelligence for better planning and organization
- **Neo-Brutalist Aesthetics**: Bold, uncompromising design that demands attention
- **Distraction-Free**: Clean, focused interface without social media noise

## 🔮 Future Roadmap

- **Collaborative Timelines**: Team-based timeline sharing and editing
- **Calendar Integration**: Sync with Google Calendar, Outlook, and other services
- **Mobile App**: Native iOS and Android applications
- **Advanced AI Features**: Predictive scheduling and workload optimization
- **Integration APIs**: Connect with popular productivity tools
- **Offline Support**: Progressive Web App capabilities

## 📱 Live Demo

Experience Siyar in action: [https://siyar-timeline.web.app](https://siyar-timeline.web.app)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the next generation of organized minds**