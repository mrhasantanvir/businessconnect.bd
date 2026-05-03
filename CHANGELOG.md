# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to Semantic Versioning.

**Developer Log Standard:**  
To maintain transparency and prevent redundant work, every entry must specify the developer source using the following tags:
- `[AI]` - Developed by Artificial Intelligence (Antigravity/Gemini)
- `[Human]` - Developed by Manual Developer (e.g., S M Mehedi Hasan)

---

## [Unreleased]

### Added
- `[AI]` **Version Control UI**: Created a centralized version configuration (`version.ts`) and integrated dynamic version badges for global and feature-level tracking in the frontend sidebar (`Shell.tsx`).
- `[AI]` **Activation Celebration Feature**: Implemented a global, premium glassmorphism modal with fireworks (`canvas-confetti`) to welcome Merchants, Merchant Staff, and Super Admin Staff on their first login after activation.
- `[AI]` **Database State Tracking**: Added `hasSeenCelebration` Boolean to the `User` model to guarantee the welcome fireworks are shown exactly once per lifetime across any device.

### Changed
- `[AI]` **Dashboard Layout Security**: Globally restricted sidebar navigation (`Shell.tsx`) to be grayed-out and unclickable for pending merchants and staff.
- `[AI]` **Route Protection**: Implemented a global redirect forcing inactive users back to the dashboard if they attempt to access restricted URLs.

### Fixed
- `[AI]` **Profile UI**: Displayed the unique system code (`readableId`) in the user profile dropdown for easier identification in support tickets.
- `[AI]` **Dashboard Blur**: Fixed the dashboard blur logic to properly cover all restricted components when a store is pending verification.

