# ExpenseTracker

A cross-platform personal finance app built with **React Native** and **TypeScript**. Track expenses and income, set budgets, review spending analytics, and use the app in **English or Urdu** (with full RTL support) in light or dark mode.

<!--
Add screenshots here once captured, e.g.:

<p align="center">
  <img src="docs/screenshots/home.png" width="200" />
  <img src="docs/screenshots/analytics.png" width="200" />
  <img src="docs/screenshots/add-expense.png" width="200" />
</p>
-->

## Features

- **Authentication**: sign up, login, OTP verification, forgot and reset password, with a live password-strength checker.
- **Expenses and income**: add, edit and delete entries with categories and dates. Receipt or photo attachment through camera and gallery.
- **Transactions**: full history, detail view and search.
- **Budgets and categories**: manage spending categories and budgets.
- **Analytics**: visual overview of spending.
- **Profile**: edit profile and avatar.
- **Theming**: light and dark mode with a persisted preference.
- **Localization**: English and Urdu via i18next, with automatic RTL layout switching.
- **Onboarding and splash flow** for first launch.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | React Native 0.83, React 19 |
| Language | TypeScript |
| Navigation | React Navigation 7 (native stack, bottom tabs, drawer) |
| State management | Redux Toolkit, React Redux |
| Networking | Axios with request/response interceptors |
| Secure storage | `react-native-keychain` (auth session) |
| Local storage | `react-native-mmkv` (preferences, theme, language) |
| Localization | i18next, react-i18next (EN / UR, RTL) |
| Animations and gestures | Reanimated, Gesture Handler |
| Device APIs | Image Picker, Permissions, NetInfo, Device Info |
| Tooling | ESLint, Prettier, Jest |

## Architecture Highlights

- **Feature-based folder structure**: screens, components, config and services are cleanly separated.
- **Centralized API layer** (`src/services/api`): a single Axios instance handles auth headers, error handling and automatic token refresh on `401` responses.
- **Secure session handling**: the auth session is stored in the OS keychain/keystore, not in plain storage.
- **Typed navigation**: screen names are defined as constants and reused across all navigators.
- **Reusable UI components**: shared input fields, buttons, headers, loaders and a custom tab bar.
- **Form validation models**: validation messages are kept separate from screen logic and are localized.
- **Theme and language as global state** via Redux slices, persisted with MMKV.

## Project Structure

```
src/
├── auth/            # Login, sign up, OTP, forgot/reset password
├── screens/         # Tab, stack and drawer screens
├── components/      # Reusable UI components
├── config/
│   ├── navigation/  # Stack, tab and drawer navigators
│   ├── redux/       # Store, slices, typed hooks
│   └── localization/# i18n setup, en.json, ur.json
├── models/          # Validation models
├── services/
│   ├── api/         # Axios provider and API helper
│   ├── helper/      # Shared helpers
│   ├── storage/     # MMKV wrapper
│   └── utils/       # Theme, colors, RTL, language, error handling
└── types/
```

## Getting Started

### Prerequisites

- Node.js 20 or later
- React Native development environment ([setup guide](https://reactnative.dev/docs/set-up-your-environment))
- Xcode and CocoaPods (iOS), Android Studio and JDK (Android)

### Installation

```sh
git clone https://github.com/FaizanNavaid/ExpenseTracker.git
cd ExpenseTracker
npm install
```

### Environment variables

Copy the example file and set your backend URL:

```sh
cp .env.example .env
```

```
BASE_API_URL=https://your-api-host.example.com
```

> The app expects a compatible REST backend. The backend is not part of this repository.

### Run the app

```sh
# Start Metro
npm start

# Android
npm run android

# iOS (first time and after native dependency changes)
bundle install
cd ios && bundle exec pod install && cd ..
npm run ios
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Metro bundler |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run lint` | Lint the codebase |
| `npm test` | Run Jest tests |

## Roadmap

- Unit and integration test coverage for core flows
- Offline support and sync
- Export reports (CSV / PDF)
- Recurring transactions

## Author

**Faizan Navaid**
GitHub: [@FaizanNavaid](https://github.com/FaizanNavaid)
