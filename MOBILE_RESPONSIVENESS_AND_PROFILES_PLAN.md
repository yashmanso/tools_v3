# Mobile/Tablet Responsiveness & Profile Updates Plan

## Overview
This document outlines the plan to fix mobile/tablet responsiveness issues and add three new user profiles to the welcome wizard.

---

## Part 1: Mobile & Tablet Responsiveness Fixes

### Issues Identified

1. **Fixed Sidebar Overlap**
   - Desktop sidebar (20rem width) overlaps content on smaller screens
   - Content needs proper padding/margin when sidebar is visible
   - Location: `ExploreSection.tsx` - fixed sidebar at `left-0 top-[6.25rem]`

2. **Header Navigation**
   - Header may overflow on mobile devices
   - Navigation links might be too cramped
   - Location: `Header.tsx` or `HeaderWrapper.tsx`

3. **Grid Layouts**
   - Many components use `md:grid-cols-2 lg:grid-cols-3` which may not work well on tablets
   - Cards and buttons may be too small or too large
   - Need better breakpoint handling for tablet (768px - 1024px)

4. **Fixed Positioning Issues**
   - Fixed elements may overlap content
   - Z-index conflicts on mobile
   - Viewport height calculations (`100vh` vs `100svh`)

5. **Text and Button Sizes**
   - Text may be too small on mobile
   - Buttons may be hard to tap
   - Touch targets should be at least 44x44px

6. **Network Graph**
   - Graph container may overflow on mobile/tablet
   - Controls may be inaccessible
   - Location: `NetworkGraph.tsx`

7. **Visual Tool Selector**
   - Decision tree cards may be too cramped
   - Filter sidebar may overlap content
   - Location: `VisualToolSelector.tsx`

8. **Welcome Popup**
   - May not be properly centered on mobile
   - Options may overflow
   - Location: `WelcomePopup.tsx`

### Implementation Plan

#### 1.1 ExploreSection Component
**File**: `app/components/ExploreSection.tsx`

**Changes**:
- Add responsive padding to main content area when sidebar is visible
- Ensure sidebar doesn't show on mobile (< lg breakpoint)
- Adjust grid layouts for tablet breakpoints
- Fix card sizing for mobile/tablet

**Breakpoints to use**:
- Mobile: `< 640px` (sm)
- Tablet: `640px - 1024px` (sm to lg)
- Desktop: `> 1024px` (lg+)

#### 1.2 Header Component
**File**: `app/components/Header.tsx` or `HeaderWrapper.tsx`

**Changes**:
- Make navigation responsive (hamburger menu on mobile)
- Ensure header doesn't overflow
- Adjust logo and text sizes for mobile

#### 1.3 Network Graph
**File**: `app/components/NetworkGraph.tsx`

**Changes**:
- Make graph container responsive
- Stack sidebar and graph vertically on mobile
- Adjust control positions for mobile
- Ensure touch-friendly controls

#### 1.4 Visual Tool Selector
**File**: `app/components/VisualToolSelector.tsx`

**Changes**:
- Stack decision tree and filters vertically on mobile
- Adjust card grid for tablet (2 columns instead of 4)
- Make filter sidebar full-width on mobile

#### 1.5 Welcome Popup
**File**: `app/components/WelcomePopup.tsx`

**Changes**:
- Ensure proper centering on all screen sizes
- Adjust option button sizes for mobile
- Add proper padding/margins for mobile

#### 1.6 Global Layout
**File**: `app/layout.tsx` or `app/components/SlidingPanels.tsx`

**Changes**:
- Ensure proper viewport handling (`100svh` instead of `100vh`)
- Fix overflow issues
- Add proper mobile-first approach

#### 1.7 Other Components to Review
- `CompareTools.tsx` - Grid layouts
- `ToolFinder.tsx` - Question cards
- `TimelineView.tsx` - Timeline layout
- `WorkflowBuilder.tsx` - Builder interface
- `ToolCompatibilityChecker.tsx` - Comparison tables

### Testing Checklist
- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test on tablets (iPad, Android tablets)
- [ ] Test landscape and portrait orientations
- [ ] Verify touch targets are adequate (44x44px minimum)
- [ ] Check text readability
- [ ] Verify no horizontal scrolling
- [ ] Test all interactive elements

---

## Part 2: Add New User Profiles

### New Profiles to Add

1. **Intrapreneur**
   - Description: "Innovator within an organization"
   - Value: `intrapreneur`

2. **Corporate Manager**
   - Description: "Corporate manager / Executive"
   - Value: `corporate-manager`

3. **Civil Servant**
   - Description: "Public sector / Government"
   - Value: `civil-servant`

### Implementation Plan

#### 2.1 WelcomePopup Component
**File**: `app/components/WelcomePopup.tsx`

**Changes**:
- Add three new options to the `role` question in `WELCOME_QUESTIONS`
- Update the options array at lines 23-29

**New structure**:
```typescript
options: [
  { value: 'entrepreneur', label: 'Entrepreneur / Founder' },
  { value: 'researcher', label: 'Researcher / Academic' },
  { value: 'practitioner', label: 'Practitioner / Consultant' },
  { value: 'student', label: 'Student / Learner' },
  { value: 'educator', label: 'Educator / Teacher' },
  { value: 'intrapreneur', label: 'Intrapreneur' },
  { value: 'corporate-manager', label: 'Corporate Manager / Executive' },
  { value: 'civil-servant', label: 'Civil Servant / Public Sector' },
],
```

#### 2.2 ToolFinder Component
**File**: `app/components/ToolFinder.tsx`

**Changes**:
- Add the new profiles to the `audience` question options
- Update the options array at lines 26-36

**New structure**:
```typescript
options: [
  { value: 'entrepreneurs', label: 'Entrepreneur' },
  { value: 'startups', label: 'Startup founder' },
  { value: 'SMEs', label: 'Small/medium business' },
  { value: 'corporations', label: 'Corporation' },
  { value: 'researchers', label: 'Researcher' },
  { value: 'students', label: 'Student' },
  { value: 'educators', label: 'Educator' },
  { value: 'practitioners', label: 'Practitioner' },
  { value: 'nonprofits', label: 'Non-profit' },
  { value: 'intrapreneurs', label: 'Intrapreneur' },
  { value: 'corporate-managers', label: 'Corporate Manager' },
  { value: 'civil-servants', label: 'Civil Servant' },
],
```

#### 2.3 VisualToolSelector Component
**File**: `app/components/VisualToolSelector.tsx`

**Changes**:
- Add new profiles to the `AUDIENCES` constant
- Update at lines 26-35

**New structure**:
```typescript
const AUDIENCES = [
  { id: 'entrepreneurs', label: 'Entrepreneurs', icon: null },
  { id: 'startups', label: 'Startups', icon: null },
  { id: 'SMEs', label: 'SMEs', icon: null },
  { id: 'corporations', label: 'Corporations', icon: null },
  { id: 'researchers', label: 'Researchers', icon: null },
  { id: 'students', label: 'Students', icon: null },
  { id: 'educators', label: 'Educators', icon: null },
  { id: 'practitioners', label: 'Practitioners', icon: null },
  { id: 'intrapreneurs', label: 'Intrapreneurs', icon: null },
  { id: 'corporate-managers', label: 'Corporate Managers', icon: null },
  { id: 'civil-servants', label: 'Civil Servants', icon: null },
];
```

#### 2.4 Resource Metadata Tags
**Note**: Ensure that resources can be tagged with these new audience types if they're relevant. The tag system should already support this, but verify filtering works correctly.

### Testing Checklist
- [ ] Verify new profiles appear in WelcomePopup
- [ ] Verify new profiles appear in ToolFinder
- [ ] Verify new profiles appear in VisualToolSelector
- [ ] Test filtering with new profiles
- [ ] Ensure profile selection saves correctly
- [ ] Verify tool recommendations work with new profiles

---

## Implementation Order

### Phase 1: Profile Updates (Quick Win)
1. Add new profiles to WelcomePopup
2. Add new profiles to ToolFinder
3. Add new profiles to VisualToolSelector
4. Test profile selection and filtering

### Phase 2: Mobile Responsiveness (Critical)
1. Fix ExploreSection sidebar overlap
2. Fix header navigation
3. Fix Network Graph responsiveness
4. Fix Visual Tool Selector layout
5. Fix Welcome Popup mobile view
6. Review and fix other components

### Phase 3: Tablet Optimization
1. Optimize grid layouts for tablet breakpoints
2. Adjust card sizes for tablet
3. Test all components on tablet sizes

### Phase 4: Testing & Refinement
1. Test on actual devices
2. Fix any remaining issues
3. Optimize performance

---

## Files to Modify

### Profile Updates
- `app/components/WelcomePopup.tsx`
- `app/components/ToolFinder.tsx`
- `app/components/VisualToolSelector.tsx`

### Mobile Responsiveness
- `app/components/ExploreSection.tsx`
- `app/components/Header.tsx` or `HeaderWrapper.tsx`
- `app/components/NetworkGraph.tsx`
- `app/components/VisualToolSelector.tsx`
- `app/components/WelcomePopup.tsx`
- `app/components/CompareTools.tsx`
- `app/components/ToolFinder.tsx`
- `app/components/TimelineView.tsx`
- `app/components/WorkflowBuilder.tsx`
- `app/components/ToolCompatibilityChecker.tsx`
- `app/layout.tsx`
- `app/components/SlidingPanels.tsx`

---

## Notes

- Use Tailwind's responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first approach: design for mobile, then enhance for larger screens
- Test with browser dev tools device emulation
- Consider using `useIsMobile()` hook where appropriate
- Ensure touch targets are at least 44x44px for accessibility
- Use `100svh` instead of `100vh` for better mobile viewport handling
