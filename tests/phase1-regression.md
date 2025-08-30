# Phase 1 Regression Test Suite

## Core Functionality Tests

### 1. Application Startup & Theme

- [ ] App loads without errors
- [ ] Default theme is light
- [ ] Theme toggle works (light ↔ dark)
- [ ] Theme persists on page reload
- [ ] Navigation is visible and functional

### 2. Group Management (CRUD)

- [ ] Dashboard shows empty state initially
- [ ] "Create New Group" button is visible
- [ ] Can create a new group with name and description
- [ ] Group appears in dashboard after creation
- [ ] Can edit group name and settings
- [ ] Can delete group (with confirmation)
- [ ] Group deletion removes all associated cards

### 3. Card Management (CRUD)

- [ ] Can navigate to group detail page
- [ ] Group detail shows empty card state initially
- [ ] "Add Card" button is visible
- [ ] Can create new card with front/back text
- [ ] Can add optional hint to card
- [ ] Card appears in group detail after creation
- [ ] Can edit existing card
- [ ] Can delete card (with confirmation)
- [ ] Card count updates correctly in group

### 4. Study Session Flow

- [ ] "Start Study Session" button is visible in group detail
- [ ] Can start study session for group with cards
- [ ] Study session shows first card
- [ ] Can flip card to see back
- [ ] Can rate card: "Don't Know", "Doubt", "Know"
- [ ] Progress indicator shows correct progress
- [ ] Can navigate between cards
- [ ] Session completes when all cards rated
- [ ] Can return to group detail after session

### 5. Data Persistence

- [ ] Groups persist after page reload
- [ ] Cards persist after page reload
- [ ] Study session progress persists
- [ ] Theme preference persists
- [ ] Last ratings are saved and displayed

### 6. Mobile Responsiveness

- [ ] App is usable on mobile viewport (375px)
- [ ] Navigation adapts to mobile (hamburger/compact)
- [ ] Cards are touch-friendly (min 44px targets)
- [ ] Forms are mobile-optimized
- [ ] Study session works on mobile

### 7. Error Handling

- [ ] Graceful handling of empty states
- [ ] Form validation works correctly
- [ ] Error messages are user-friendly
- [ ] App doesn't crash on invalid operations

### 8. Performance

- [ ] App loads in under 2 seconds
- [ ] Navigation is smooth and responsive
- [ ] No memory leaks during normal usage
- [ ] IndexedDB operations are fast

## Test Data Setup

- Create 2-3 test groups
- Add 5-10 cards per group
- Include cards with and without hints
- Test with different text lengths
- Test special characters and Unicode

## Browser Compatibility

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers
