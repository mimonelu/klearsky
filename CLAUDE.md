# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
npm run dev                # Start development server at http://localhost:5173/
```

**Build & Type Checking:**
```bash
npm run build             # Full build with type checking
npm run build-only        # Build without type checking  
npm run type-check        # TypeScript type checking only
npm run preview           # Preview production build
```

**Code Quality:**
```bash
npm run lint              # ESLint with auto-fix
```

## Architecture Overview

Klearsky is a Vue 3 + TypeScript client for Bluesky (AT Protocol) with a sophisticated architecture:

### Core State Management
- **Central State**: `src/composables/main-state.ts` - Single reactive state object using Vue's `reactive()`
- **Global Access**: State is provided to all components via Vue's provide/inject pattern
- **Modular Sub-States**: Specialized classes for feeds (`myFeeds`), chats (`myChat`), lists (`myLists`), etc.

### AT Protocol Integration
- **AtpWrapper**: `src/composables/atp-wrapper/index.ts` - Comprehensive API abstraction
- **Organized Methods**: API methods grouped in folders (`create/`, `fetch/`, `update/`, `delete/`, `chat/`)
- **Session Management**: Multi-account support with automatic JWT refresh
- **Error Handling**: Consistent error patterns across all API interactions

### Component Architecture
Components are organized by function, not by feature:
- `components/buttons/` - Interactive buttons (FollowButton, LikeButton, etc.)
- `components/cards/` - Data display cards
- `components/compositions/` - Complex UI compositions (Post, Feed, etc.)
- `components/popups/` - Modal dialogs
- `components/next/` - Next-generation component implementations

### Worker-Based Cross-Tab Sync
- **SharedWorker**: `src/worker/my-worker.ts` enables session sharing across browser tabs
- **Session Persistence**: User sessions survive browser restarts and crashes
- **Real-time Sync**: State changes propagate instantly across all open tabs

### Session & Authentication Flow
Authentication is handled in `src/views/MainView.vue`:
1. **Auto-login**: Attempts to restore previous session on app load
2. **Manual Login**: Handles user credentials with 2FA support
3. **JWT Management**: Automatic token refresh with configurable intervals
4. **Session Sync**: Worker-based session sharing across tabs

## Key Development Patterns

### State Updates
Always update state through the main-state object, not local component state for shared data:
```typescript
import { state } from "@/composables/main-state"
state.currentProfile = newProfile  // ✓ Correct
```

### API Calls
Use AtpWrapper methods rather than direct @atproto/api calls:
```typescript
const response = await state.atp.fetchProfile(handle)
if (response instanceof Error) {
  // Handle error
  return
}
// Use response data
```

### Error Handling
Follow the consistent error pattern throughout the codebase:
```typescript
const response = await state.atp.someMethod()
if (response instanceof Error) {
  state.openErrorPopup(response, "ComponentName/methodName")
  return
}
```

### Popup Management
Popups are managed through state properties ending in `Display` or `Props`:
```typescript
state.loginPopupDisplay = true                    // Show popup
state.profilePopoverProps = { display: true, user } // Show with data
```

## Internationalization

- Translation files: `src/translations/{en,ja,fr}.ts`
- Usage in components: `$t("translationKey")`
- Translation keys should be descriptive and grouped logically

## Build Configuration

- **Vite Config**: `vite.config.ts` with optimized chunk splitting
- **Bundle Analysis**: Separate chunks for `@atproto/api`, Vue, and vendor libraries
- **Tree Shaking**: Aggressive tree shaking enabled for production builds
- **SCSS**: Global variables available in all components via `@import '@/scss/_variables.scss'`

## Session Management Critical Notes

- Session management is complex and critical - avoid major refactoring without thorough testing
- The AtpWrapper handles multi-account sessions with automatic JWT refresh
- Worker-based caching enables cross-tab session synchronization
- Session restoration happens automatically on app initialization

## Testing Authentication Scenarios

When working with authentication features, always test:
1. Auto-login on page refresh
2. Manual login with and without 2FA
3. Session expiration and refresh
4. Multi-account switching
5. Cross-tab session synchronization

## Custom AT Protocol Extensions

Klearsky implements custom records and fields:
- `space.aoisora.bookmark` - Custom bookmark system (deprecated)
- `space.aoisora.preference.feed.extra` - Trending and global feed preferences
- `space.aoisora.post.via` - Client identification
- `space.aoisora.post.lightning` - Lightning Network integration for "Zap" links

## Communication Guidelines

When providing assistance, Claude should:
- Respond in Japanese
- Be concise and focused on key points
- Avoid verbose preambles or apologies
- Structure responses with conclusions first
- Present counterarguments or different perspectives when applicable
- Point out technical debt when necessary
- Pay attention to security and performance implications
- Use double quotes instead of single quotes in TypeScript code