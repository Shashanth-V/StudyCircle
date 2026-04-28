# StudyCircle Bug Fixes & Completion TODO

## Phase 1: Fix Critical Client Crashes
- [ ] 1.1 Fix App.jsx HTML comments → JSX comments, remove nested BrowserRouter, fix socket useEffect
- [ ] 1.2 Fix main.jsx — remove BrowserRouter wrapper
- [ ] 1.3 Fix shared/schemas.js import paths in all client pages and server routes
- [ ] 1.4 Fix matchStore.js — use authStore userId instead of non-existent get().userId
- [ ] 1.5 Fix chatStore.js — use authStore userId instead of non-existent state.userId
- [ ] 1.6 Fix ChatRoom.jsx — add catch to chatApi.getChats()

## Phase 2: Fix Critical Server Crashes
- [ ] 2.1 Fix user.controller.js — add missing bcrypt import
- [ ] 2.2 Fix chat.controller.js — fix deleteMessage query logic
- [ ] 2.3 Fix chat.controller.js — fix getChats unreadCount response shape

## Phase 3: Fix API Response Shape Mismatches
- [ ] 3.1 Fix match.controller.js getMatches — return array directly
- [ ] 3.2 Fix user.controller.js getMatchSuggestions — flatten to user objects with matchScore
- [ ] 3.3 Fix chat.controller.js getChats — return enriched array directly
- [ ] 3.4 Fix chat.controller.js sendMessage — return message object directly
- [ ] 3.5 Fix session.controller.js getSessions — return sessions array directly
- [ ] 3.6 Fix notification.controller.js getNotifications — return notifications array directly
- [ ] 3.7 Fix user.controller.js searchUsers — return users array directly
- [ ] 3.8 Fix leaderboard.controller.js getWeekly — return leaderboard array directly

## Phase 4: Polish & Edge Cases
- [ ] 4.1 Fix Explore.jsx to handle both response shapes
- [ ] 4.2 Fix Dashboard.jsx reactive match count
- [ ] 4.3 Verify rateLimit.js, cloudinary.js exist and are valid

## Verification
- [ ] Client builds successfully (npm run dev)
- [ ] Server starts successfully (npm run dev)
- [ ] No console errors on page load

