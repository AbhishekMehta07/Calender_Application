# Calendar Application

A full-stack calendar application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register/login)
- Create and manage calendar events
- View events by date
- Responsive design with Material-UI
- Secure password handling
- JWT-based authentication

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Vite
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT for authentication
- bcrypt for password hashing

## Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB Atlas account

### Environment Variables

Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd calendar-app
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

### Running the Application

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client:
```bash
cd client
npm run dev
```

The client will be running at http://localhost:5173
The server will be running at http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user

### Events
- GET `/api/events` - Get all events for the logged-in user
- POST `/api/events` - Create a new event

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 
