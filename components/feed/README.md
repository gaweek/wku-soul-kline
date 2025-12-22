# Feed Components - X.com Style Information Flow

A complete set of X.com-style feed components for the LifeKLine homepage.

## Components Overview

### 1. FeedTabs
Tab navigation component with underline highlight.

**Props:**
- `activeTab: TabType` - Current active tab ('for-you' | 'mine')
- `onTabChange: (tab: TabType) => void` - Tab change callback

**Usage:**
```tsx
<FeedTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

---

### 2. Composer
Collapsible form for generating K-line analysis.

**Props:**
- `onSubmit: (data: UserInput) => void` - Form submission handler
- `isLoading: boolean` - Loading state during generation
- `isExpanded?: boolean` - Controlled expand state (optional)
- `onToggle?: (expanded: boolean) => void` - Expand/collapse callback (optional)

**Features:**
- Collapsed: Shows placeholder "开始测算您的人生K线..."
- Expanded: Simplified form (name, gender, birth date/time)
- Wraps BaziForm core logic with simplified UI
- Auto-calculates bazi using lunar-javascript

**Usage:**
```tsx
<Composer
  onSubmit={handleSubmit}
  isLoading={isGenerating}
  isExpanded={isExpanded}
  onToggle={setIsExpanded}
/>
```

---

### 3. FeedList
Container for rendering different types of feed items.

**Props:**
- `items: FeedItem[]` - Array of feed items
- `onItemClick?: (item: FeedItem) => void` - Item click handler

**Supported Item Types:**
- `report` - K-line analysis reports
- `case` - Case studies
- `knowledge` - Knowledge articles
- `announcement` - System announcements

**Usage:**
```tsx
<FeedList
  items={feedItems}
  onItemClick={handleItemClick}
/>
```

---

### 4. ReportCard
Card for displaying K-line analysis reports.

**Props:**
- `report: Report` - Report data
- `onView: () => void` - View details handler
- `onShare: () => void` - Share handler
- `isLocked?: boolean` - Show locked overlay for guests

**Features:**
- Displays: title, timestamp, summary, score, peak year
- Action buttons: View Details, Share, Export
- Guest lock overlay with login prompt

**Report Interface:**
```typescript
interface Report {
  id: string;
  title: string;
  timestamp: string;
  summary?: string;
  score?: number;
  peakYear?: number;
  name?: string;
  gender?: string;
  isLocked?: boolean;
}
```

---

### 5. CaseCard
Card for case studies in the feed.

**Props:**
- `case: Case` - Case data
- `onClick: () => void` - Click handler

**Features:**
- Displays: title, persona, curve type tags, thumbnail
- Gradient placeholder if no thumbnail
- Hover shadow effect

**Case Interface:**
```typescript
interface Case {
  id: string;
  title: string;
  persona: string;
  curveType: string;
  thumbnail?: string;
  description?: string;
}
```

---

### 6. KnowledgeCard
Card for knowledge articles in the feed.

**Props:**
- `article: Article` - Article data
- `onClick: () => void` - Click handler

**Features:**
- Displays: title, category, summary, views, tags
- Icon placeholder if no thumbnail
- Category badge

**Article Interface:**
```typescript
interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  views?: number;
  thumbnail?: string;
  tags?: string[];
}
```

---

## Styling Guidelines

All cards follow X.com-style design:
- **Card container**: `bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md`
- **Padding**: `p-4`
- **Title**: `text-lg font-bold text-gray-900`
- **Summary**: `text-sm text-gray-600 line-clamp-2`
- **Meta info**: `text-xs text-gray-500`
- **Action buttons**: Icon buttons with hover effects

## Icons
All components use `lucide-react` icons:
- Sparkles, Eye, Share2, Download, Lock
- TrendingUp, User, BookOpen, Tag

## TypeScript
All components are fully typed with exported interfaces for easy integration.

## Example Usage

See `FeedExample.tsx` for a complete integration example showing:
- Tab navigation
- Composer integration
- Feed list with mixed content types
- Event handling
- Guest/logged-in states

## File Structure
```
components/feed/
├── FeedTabs.tsx          # Tab navigation
├── Composer.tsx          # K-line generation form
├── FeedList.tsx          # Feed container
├── ReportCard.tsx        # Report card
├── CaseCard.tsx          # Case card
├── KnowledgeCard.tsx     # Knowledge card
├── index.tsx             # Exports
├── FeedExample.tsx       # Usage example
└── README.md             # This file
```
