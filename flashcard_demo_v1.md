# Flashcard Demo v1 - Foundation Document

## 1. Project Overview & Vision

**Goal**: Build a simple, focused flashcard application with emphasis on mobile-first design and smooth user experience. The app prioritizes German language learning but remains language-agnostic in implementation.

**Core Philosophy**:

- Simplicity over complexity
- Offline-first with sync capabilities
- Mobile-optimized touch interactions
- Flexible data structure for future extensibility

**Target Users**: Language learners who want a clean, fast flashcard experience without the complexity of advanced spaced repetition systems.

## 2. Core Features & User Stories

### Phase 1: MVP Features

**Group Management**

- As a user, I can create groups with configurable study session size
- As a user, I can edit group names and settings
- As a user, I can delete groups
- As a user, I can view all my groups in a clean list

**Card Management**

- As a user, I can add cards to a group (front/back text content)
- As a user, I can edit existing cards
- As a user, I can delete cards
- As a user, I can view all cards in a group

**Study Sessions**

- As a user, I can start a study session for a specific group
- As a user, I can swipe left/right to navigate between cards
- As a user, I can rate cards using three buttons: "Don't Know", "Doubt", "Know"
- As a user, I can see session progress (X of Y cards completed)
- As a user, I can resume interrupted sessions when I return to the app

**Progress Tracking**

- As a user, I can see per-session statistics (how many cards in each rating category)
- As a user, I can view historical data combining all sessions
- As a user, I can see basic analytics per group

### Phase 2: Enhanced Features

**Advanced Grouping & Filtering**

- As a user, I can filter cards by properties (difficulty, date added, last rating, etc.)
- As a user, I can create new groups from filtered results
- As a user, I can move cards between groups
- As a user, I can create temporary study sessions from filtered cards

**Data Management**

- As a user, I can export my data as JSON
- As a user, I can import JSON data
- As a user, I can manually sync my data to cloud storage
- As a user, I can resolve sync conflicts when they occur

### Phase 3: Future Enhancements

**Collections & Organization**

- As a user, I can organize groups into collections (topics)
- As a user, I can manage collections as higher-level containers

**Advanced Features**

- Plugin architecture for future scheduling algorithms
- Rich text support for cards
- Collaboration and sharing capabilities
- Background sync with conflict resolution

## 3. Technical Architecture & Stack

**Frontend Framework**: React 18 + TypeScript

- Component-based architecture with hooks
- Excellent ecosystem and community support
- Mature tooling and debugging capabilities
- Strong TypeScript integration

**Build Tool**: Vite

- Fast development server and HMR
- Optimized production builds
- Native TypeScript support
- Superior to Create React App performance

**State Management**: Zustand

- Lightweight alternative to Redux
- TypeScript-first design
- No boilerplate overhead
- Perfect for medium-complexity state

**Routing**: React Router v6

- Declarative routing
- Code splitting support
- Nested route capabilities
- Data loading integration

**Styling**: Tailwind CSS

- Rapid development
- Mobile-first responsive design
- Dark/light theme support via CSS variables
- Excellent React integration

**Database**: IndexedDB (Browser Storage)

- Offline-first approach
- No server dependencies for MVP
- Easy migration path to server storage
- Wrapped with Dexie.js for better DX

**Cloud Sync**: Supabase (Phase 2)

- PostgreSQL backend
- Real-time subscriptions
- Authentication ready
- React SDK available

**Additional Libraries**:

- @use-gesture/react for swipe gestures
- date-fns for date handling
- zod for runtime type validation
- react-query/tanstack-query for data fetching
- framer-motion for animations

## 4. Data Models & Database Schema

### Core Entities

```typescript
interface Group {
  id: string; // UUID
  name: string;
  description?: string;
  studyCardCount: number; // X cards per session
  createdAt: Date;
  updatedAt: Date;
  cardCount: number; // computed field
}

interface Card {
  id: string; // UUID
  groupId: string; // foreign key
  front: string;
  back: string;
  properties: Record<string, any>; // flexible properties for filtering
  lastRating?: "dont_know" | "doubt" | "know";
  createdAt: Date;
  updatedAt: Date;
  lastReviewedAt?: Date;
}

interface StudySession {
  id: string;
  groupId: string;
  startedAt: Date;
  completedAt?: Date;
  totalCards: number;
  currentCardIndex: number;
  isCompleted: boolean;
}

interface CardRating {
  id: string;
  sessionId: string;
  cardId: string;
  rating: "dont_know" | "doubt" | "know";
  timestamp: Date;
}

interface SyncMetadata {
  lastSyncAt?: Date;
  localVersion: number;
  cloudVersion?: number;
  conflicts: string[]; // array of conflicted entity IDs
}
```

### IndexedDB Stores

```javascript
// IndexedDB object stores
const stores = {
  groups: {keyPath: "id"},
  cards: {keyPath: "id", indexes: ["groupId", "lastRating", "createdAt"]},
  studySessions: {keyPath: "id", indexes: ["groupId", "startedAt"]},
  cardRatings: {keyPath: "id", indexes: ["sessionId", "cardId", "timestamp"]},
  syncMetadata: {keyPath: "key"},
};
```

## 5. User Interface & Flow

### Main Navigation Structure

```
/dashboard
├── /groups (list all groups)
├── /group/[id] (group detail, manage cards)
├── /study/[groupId] (study session)
├── /stats (progress tracking)
├── /settings (app configuration)
└── /sync (manual sync interface)
```

### Key UI Components

**Group List Page**

- Grid/list view of groups
- Create new group FAB button
- Quick stats per group (card count, last studied)
- Search/filter groups

**Group Detail Page**

- Card list for the group
- Add new card button
- Edit group settings
- Start study session button
- Filter/sort cards

**Study Session Page**

- Card display (front/back flip)
- Swipe navigation (left: previous, right: next)
- Three rating buttons at bottom
- Progress indicator
- Session stats

**Mobile-First Design Principles**

- Touch targets minimum 44px
- Swipe gestures for primary navigation
- Minimal chrome, content-focused
- Dark/light theme toggle
- Responsive breakpoints: 320px, 768px, 1024px

### Swipe Interaction Details

```
Swipe Right: Next card (if available)
Swipe Left: Previous card (if available)
Tap Card: Flip front/back
Swipe Up: Show card options menu (edit, delete)
Buttons: Don't Know (red), Doubt (yellow), Know (green)
```

## 6. Development Phases

### Phase 1: Core MVP (2-3 weeks)

**Week 1: Foundation**

- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Dexie.js setup and database schema
- [ ] Zustand store configuration
- [ ] React Router setup with route structure
- [ ] Base repository pattern implementation
- [ ] Group CRUD operations with repositories
- [ ] Card CRUD operations with repositories

**Week 2: Study Experience**

- [ ] StudySession component with React hooks
- [ ] @use-gesture/react swipe implementation
- [ ] Card rating system with Zustand actions
- [ ] Session persistence with repositories
- [ ] Progress tracking components
- [ ] Error boundaries for study flow

**Week 3: Polish & Testing**

- [ ] UI/UX refinements with Framer Motion animations
- [ ] Dark/light theme with CSS variables and context
- [ ] Mobile responsiveness testing and optimization
- [ ] Comprehensive error boundary implementation
- [ ] Zod schema validation throughout app
- [ ] React Testing Library component tests
- [ ] Vitest unit tests for repositories and services

### Phase 2: Enhanced Features (2-3 weeks)

**Week 4: Advanced Grouping**

- [ ] Property-based filtering system
- [ ] Dynamic group creation from filters
- [ ] Card movement between groups
- [ ] Advanced statistics

**Week 5: Data Management**

- [ ] JSON export/import with file system APIs
- [ ] Supabase React SDK integration
- [ ] React Query for server state management
- [ ] Manual sync functionality with optimistic updates
- [ ] Conflict resolution UI components

**Week 6: Refinements**

- [ ] Performance optimizations
- [ ] Advanced analytics
- [ ] User experience improvements
- [ ] Bug fixes and testing

### Phase 3: Future Enhancements (Timeline TBD)

- Collections/topics organization
- Plugin architecture
- Rich text support
- Collaboration features
- Background sync
- Advanced spaced repetition algorithms

## 7. Implementation Details

### Component Architecture & Data Flow

```
React Components → Zustand Store → Repository Layer → Dexie/IndexedDB
       ↓                ↓              ↓
   UI State      Global State    Persistence Layer
       ↓                ↓              ↓
Error Boundaries → React Query → Cloud Sync (Supabase)
```

### Component Hierarchy

```typescript
App
├── ErrorBoundary
├── ThemeProvider
├── Router
│   ├── DashboardLayout
│   │   ├── Navigation
│   │   ├── GroupList
│   │   └── QuickStats
│   ├── GroupDetailLayout
│   │   ├── CardList (virtualized)
│   │   ├── CardForm
│   │   └── GroupSettings
│   └── StudySessionLayout
│       ├── StudyCard
│       ├── SwipeHandler
│       ├── RatingButtons
│       └── ProgressIndicator
```

### State Management Strategy

**Zustand Store Structure**:

```typescript
interface AppState {
  // UI State
  theme: "light" | "dark";
  currentRoute: string;

  // Data State
  groups: Group[];
  cards: Record<string, Card[]>; // grouped by groupId
  currentSession: StudySession | null;

  // Actions
  createGroup: (group: Omit<Group, "id">) => Promise<void>;
  updateCard: (cardId: string, updates: Partial<Card>) => Promise<void>;
  startStudySession: (groupId: string) => Promise<void>;
}
```

### Repository Pattern

```typescript
interface Repository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

class CardRepository implements Repository<Card> {
  constructor(private db: Database) {}

  async findByGroupId(groupId: string): Promise<Card[]> {
    return this.db.cards.where("groupId").equals(groupId).toArray();
  }

  // ... other methods
}
```

### Key Technical Decisions

**State Management**: Zustand for global state, React hooks for local state
**Data Validation**: Zod schemas for runtime type checking and API boundaries
**Error Handling**: React Error Boundaries with fallback UI components
**Performance**: React.memo, useMemo, and react-window for virtual scrolling
**Testing**: Vitest for unit tests, React Testing Library for components, Playwright for E2E

### File Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Card, etc.)
│   ├── layout/         # Layout components (Navigation, Sidebar)
│   ├── forms/          # Form components (CardForm, GroupForm)
│   └── study/          # Study session specific components
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.ts
│   ├── useSwipeGesture.ts
│   └── useStudySession.ts
├── store/              # Zustand store slices
│   ├── appStore.ts     # Main store
│   ├── groupSlice.ts   # Group management
│   └── studySlice.ts   # Study session state
├── repositories/       # Data access layer
│   ├── base.ts         # Base repository interface
│   ├── groupRepository.ts
│   ├── cardRepository.ts
│   └── sessionRepository.ts
├── services/           # Business logic services
│   ├── database.ts     # Dexie database setup
│   ├── syncService.ts  # Cloud sync logic
│   └── studyService.ts # Study session logic
├── types/              # TypeScript type definitions
│   ├── entities.ts     # Core data models
│   ├── api.ts          # API response types
│   └── store.ts        # Store type definitions
├── utils/              # Utility functions
│   ├── validation.ts   # Zod schemas
│   ├── dateHelpers.ts  # Date manipulation
│   └── constants.ts    # App constants
├── pages/              # Route components
│   ├── Dashboard.tsx
│   ├── GroupDetail.tsx
│   ├── StudySession.tsx
│   └── Settings.tsx
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── vite-env.d.ts       # Vite type definitions
```

### Performance Considerations

- React.memo for component memoization
- useMemo and useCallback for expensive computations
- react-window for virtual scrolling of large card lists
- Code splitting with React.lazy and Suspense
- Lazy loading of card content and images
- Efficient Dexie queries with proper indexing
- Debounced search and filtering with custom hooks
- Bundle analysis and optimization with Vite
- Progressive Web App (PWA) capabilities

### Testing Strategy

**Unit Testing (Vitest)**

```typescript
// Repository tests
describe("CardRepository", () => {
  it("should create card with generated ID", async () => {
    const repo = new CardRepository(mockDb);
    const card = await repo.create({front: "Hello", back: "Hola", groupId: "123"});
    expect(card.id).toBeDefined();
    expect(card.front).toBe("Hello");
  });
});

// Service tests
describe("StudyService", () => {
  it("should start session with correct card count", async () => {
    const service = new StudyService(mockRepo);
    const session = await service.startSession("group-1");
    expect(session.totalCards).toBe(10);
  });
});
```

**Component Testing (React Testing Library)**

```typescript
// Component integration tests
describe("StudySession", () => {
  it("should navigate to next card on swipe", async () => {
    render(<StudySession groupId="123" />);

    const card = screen.getByTestId("study-card");
    fireEvent.touchStart(card, {touches: [{clientX: 0}]});
    fireEvent.touchEnd(card, {touches: [{clientX: -100}]});

    await waitFor(() => {
      expect(screen.getByText("Card 2")).toBeInTheDocument();
    });
  });
});
```

**E2E Testing (Playwright)**

```typescript
// Full user journey tests
test("complete study session flow", async ({page}) => {
  await page.goto("/dashboard");
  await page.click('[data-testid="group-item"]');
  await page.click('[data-testid="start-study"]');

  // Test swipe gestures
  await page.locator('[data-testid="study-card"]').swipe("left");
  await page.click('[data-testid="rating-know"]');

  await expect(page.locator('[data-testid="progress"]')).toContainText("2 of 10");
});
```

**Testing Infrastructure**

- Mock IndexedDB with fake-indexeddb for unit tests
- MSW (Mock Service Worker) for API mocking
- Custom render utilities with providers
- Test data factories for consistent test setup
- CI/CD integration with GitHub Actions

## 8. Deployment & Sync Strategy

### Deployment Options

**Option 1: Static Site (Recommended for MVP)**

- Deploy to Vercel/Netlify
- Client-side only application
- No server costs
- Simple CI/CD pipeline

**Option 2: Full-Stack (Phase 2)**

- Next.js or Vite SSR for server-side rendering
- Supabase backend integration
- Enhanced SEO and initial load performance

### Sync Strategy

**Manual Sync Process**:

1. User triggers sync from UI
2. Compare local vs cloud timestamps
3. Upload newer local changes
4. Download newer cloud changes
5. Handle conflicts with user input
6. Update sync metadata

**Conflict Resolution**:

- Offline data wins by default
- Show diff UI for conflicts
- User can choose: Keep Local, Use Cloud, or Merge
- Track conflict resolution for future improvements

### Data Privacy & Security

- Local-first approach minimizes privacy concerns
- Cloud sync is optional and user-controlled
- No sensitive data collection
- Clear data retention policies
- Export functionality ensures user data ownership

## 9. Success Metrics & Future Roadmap

### Success Metrics

**Engagement Metrics**:

- Daily/weekly active users
- Average session duration
- Cards studied per session
- Group creation rate

**Performance Metrics**:

- App load time < 2 seconds
- Offline functionality 100% reliable
- Sync success rate > 95%

**User Satisfaction**:

- Touch responsiveness
- Intuitive navigation
- Minimal learning curve

### Future Roadmap

**Q2 2024: MVP Launch**

- Core flashcard functionality
- Group management
- Basic statistics

**Q3 2024: Enhanced Features**

- Cloud sync
- Advanced filtering
- Data import/export
- Performance optimizations

**Q4 2024: Platform Expansion**

- Progressive Web App features
- Mobile app wrapper (Capacitor)
- Collaboration features

**2025: Advanced Features**

- Spaced repetition algorithms
- Rich media support
- Community features
- Plugin ecosystem

---

## Development Notes

This document serves as the single source of truth for the project. All implementation decisions should reference back to these requirements. The phased approach allows for iterative development and user feedback incorporation.

**Next Steps**:

1. Set up development environment
2. Initialize SvelteKit project with TypeScript
3. Implement basic data layer with IndexedDB
4. Build core group and card management features

**Contact & Updates**: This document should be updated as requirements evolve and implementation details are refined.
