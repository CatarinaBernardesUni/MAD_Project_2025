# TimeToTeach - Online Classes Management App

A comprehensive mobile application built with React Native and Expo for managing online classes, attendance tracking, and user profiles. TimeToTeach provides role-based interfaces for administrators, teachers, and students to streamline educational workflows.

## Features

### Administrator Features
- Create and manage classes, subjects, and class types
- Register and manage teachers and students
- Enroll students in classes
- Monitor attendance and system activity through a dashboard
- View analytics and statistics

### Teacher Features
- View and manage assigned classes
- Mark student attendance
- Access class rosters and student information
- Manage personal profile and subjects

### Student Features
- View class schedules and enrolled classes
- Track attendance records
- Enroll in available classes
- Manage personal profile

## Technology Stack

- **Framework**: React Native with Expo (v53)
- **Navigation**: React Navigation (v7) with Stack and Drawer navigators
- **Backend**: Firebase
  - Firebase Authentication (user management)
  - Firebase Realtime Database (data synchronization)
  - Firebase Storage (profile images)
- **UI Components**: 
  - React Native Vector Icons
  - React Native Calendars
  - React Native Chart Kit
  - Victory Native (charts and visualizations)
- **State Management**: React Hooks
- **Image Handling**: Expo Image Picker

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for macOS) or Android Studio (for Android development)
- A Firebase project with Authentication and Realtime Database enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MAD_Project_2025
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Copy `firebase_example.js` to `firebase.js`
   - Update the `firebaseConfig` object with your Firebase project credentials:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       databaseURL: "YOUR_DATABASE_URL",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```
   - **Important**: To enable profile image uploads, upgrade your Firebase plan to the **Blaze Plan**

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

- **iOS**: Press `i` in the terminal or run `npm run ios`
- **Android**: Press `a` in the terminal or run `npm run android`
- **Web**: Press `w` in the terminal or run `npm run web`
- **Expo Go**: Scan the QR code with the Expo Go app on your mobile device

## Default Credentials

For testing purposes, you may need to create initial admin credentials directly in Firebase:
1. Register a user through the app
2. In Firebase Console, navigate to Authentication
3. Find the user and copy their UID
4. In Realtime Database, add the user to the `users` node with `roles: "admin"`

## Project Structure

```
MAD_Project_2025/
├── App.js                      # Main application entry point
├── navigation/                 # Navigation configuration
│   ├── AdminNavigator.js       # Admin user navigation
│   ├── StudentNavigator.js     # Student user navigation
│   ├── TeacherNavigator.js     # Teacher user navigation
│   └── AuthStack.js            # Authentication flow
├── screens/                    # Screen components
│   ├── admin/                  # Administrator screens
│   ├── student/                # Student screens
│   └── teacher/                # Teacher screens
├── components/                 # Reusable UI components
├── hooks/                      # Custom React hooks
├── utils/                      # Utility functions
└── firebase.js                 # Firebase configuration
```

## Firebase Security Rules

Ensure your Firebase Realtime Database has appropriate security rules configured. Example:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## User Roles & Authentication

The application supports three user roles:
- **Administrator**: Full access to all management features
- **Teacher**: Access to class management and attendance marking
- **Student**: Access to view schedules and track attendance

Users are assigned roles during registration. Ensure the Firebase database structure includes a `users` node with role information.

## Building for Production

To create a production build:

**Android APK/AAB:**
```bash
eas build --platform android
```

**iOS IPA:**
```bash
eas build --platform ios
```

Note: You'll need to configure EAS Build and have an Expo account. See [EAS Build documentation](https://docs.expo.dev/build/introduction/) for detailed setup instructions.

## Notes

- This application was developed as the final project for Mobile App Development course
- Profile image upload functionality requires Firebase Blaze Plan (pay-as-you-go)
- Ensure all Firebase services are properly configured before running the app
- The app uses real-time synchronization for instant data updates across all users

## Database Structure

The Firestore Database should follow this basic structure:

```
{
  "users": {
    "userId": {
      "age": "number",
      "name": "string",
      "email": "string",
      "roles": "admin|teacher|student",
      "profileImage": "string"
    }
  },
  "classes": {
    "classId": {
      "additionalNotes": "string",
      "classType": "string",
      "description": "string",
      "end": "timestamp", 
      "peopleLimit": "number",
      "professor": "reference",
      "start": "timestamp",
      "subject": "reference"
    }
  },
  "enrolment": {
    "recordId": {
      "class": "reference",
      "student": "reference",
      "enrolledAt": "timestamp",
      "attendance": "boolean"
    }
  },
  "classType": {
    "classTypeId": {
        "name": "string"
    }
  },
  "subjects": {
    "subjectsId": {
        "name": "string"
    }
  },
}
```

## Acknowledgments

Developed as part of the Mobile App Development course final project.
