# Real-time Support Chat Application

A real-time chat application built with Node.js, Express, Socket.IO, and React, allowing users to create support tickets and admins to respond to them in real-time.

## Features

- Real-time messaging using Socket.IO
- Separate interfaces for users and admins
- Support ticket creation and management
- Live chat between users and admins
- Modern, responsive UI design
- Connection status indicators
- Message history persistence

## Tech Stack

- **Backend:**

  - Node.js
  - Socket.IO
  - CORS

- **Frontend:**
  - React
  - Vite
  - Socket.IO Client
  - React Router

## Project Structure

```
├── client/
│   └── socket-practice/     # Frontend React application
│       ├── src/
│       │   ├── components/  # React components
│       │   └── App.jsx      # Main application component
├── server.js               # Backend server
└── package.json           # Backend dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies and start the application:

```bash
# Using npm
npm run setup

# Using yarn
yarn setup
```

This will:

- Install backend dependencies
- Install frontend dependencies
- Start both servers

## Manual Installation

If you prefer to install dependencies manually:

1. Install backend dependencies:

```bash
npm install
```

2. Install frontend dependencies:

```bash
cd client/socket-practice
npm install
```

## Running the Application

### Using the Setup Script

```bash
npm run dev
```

This will start both the backend and frontend servers.

### Manual Start

1. Start the backend server:

```bash
npm start
```

2. In a new terminal, start the frontend development server:

```bash
cd client/socket-practice
npm run dev
```

## Accessing the Application

- User Interface: http://localhost:5173
- Admin Interface: http://localhost:5173/admin

## Usage

1. Open the user interface in your browser
2. Type your message and create a support ticket
3. Open the admin interface in another browser window
4. Select the ticket from the list to start chatting
5. Messages will appear in real-time for both users and admins

## Development

- Backend server runs on port 3000
- Frontend development server runs on port 5173
- Socket.IO handles real-time communication
- CORS is configured to allow communication between frontend and backend

## License

Poonia Don :) , Haha
