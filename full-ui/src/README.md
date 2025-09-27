# AI Student Platform

A comprehensive student platform built with React, TypeScript, and Tailwind CSS. The platform supports different user roles (Student, Faculty, Admin) with role-specific functionality.

## Features

### Student Features
- Dashboard with current class status
- Upcoming assignments with priority indicators
- Timetable view with day/week/month toggles
- Resources section with searchable content
- Project management
- AI chat interface
- Profile management

### Faculty Features
- Faculty dashboard with class overview
- Class management
- Assignment creation and management
- Resource upload to specific classes
- Project monitoring
- Student progress tracking
- Faculty-specific timetable

### Admin Features
- System administration (coming soon)

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS v4
- Vite
- Lucide React (icons)
- Context API for state management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## User Roles Demo

The application includes quick login options for demo purposes:

- **Student**: View classes, assignments, and resources
- **Faculty**: Manage classes, create assignments, upload resources
- **Admin**: System administration (coming soon)

## Project Structure

- `/components` - React components
- `/contexts` - Context providers for state management
- `/styles` - Global styles and Tailwind configuration
- `/components/ui` - Reusable UI components (shadcn/ui)

## Build

```bash
npm run build
```

## Features in Detail

### Authentication & Role Management
- Role-based authentication
- User context management
- Different interfaces for each role

### Faculty Management
- Create and manage assignments
- Upload resources to specific classes
- Monitor student projects
- View class statistics

### Student Experience
- View personal schedule
- Access course resources
- Track assignment progress
- Participate in projects

### Responsive Design
- Mobile-first approach
- Dark theme throughout
- Beautiful gradients and glassmorphism effects
- Professional styling with Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request