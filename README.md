# BlogVerse — Full Stack Blogging Platform

A professional, production-style blogging platform built with the MERN stack, similar to Medium / Dev.to.

**Final Year B.Tech Project** — built with React, Node.js, Express, MongoDB, Firebase Auth, Cloudinary, Socket.io, and Tailwind CSS.

---

## 🚀 Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Frontend       | React (Vite), Tailwind CSS, React Router, Axios |
| Backend        | Node.js, Express.js                             |
| Database       | MongoDB Atlas (Mongoose)                        |
| Authentication | JWT + Firebase Auth (Google & Email Login)       |
| File Upload    | Cloudinary                                      |
| Realtime       | Socket.io (live comments)                       |

---

## 📁 Project Structure

```
├── server/                  # Backend (Express API)
│   ├── src/
│   │   ├── index.js         # Express server entry point
│   │   ├── config/          # DB, Cloudinary, Firebase config
│   │   ├── models/          # Mongoose models (User, Blog, Comment)
│   │   ├── middleware/       # Auth, Admin, Error handler, Rate limiter
│   │   ├── controllers/     # Business logic for all routes
│   │   ├── routes/          # Express route definitions
│   │   └── utils/           # Socket.io setup
│   ├── tests/               # Jest + Supertest tests
│   ├── .env.example         # Environment variables template
│   └── package.json
│
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.jsx         # App entry point
│   │   ├── App.jsx          # Routes & layout
│   │   ├── api/             # Axios instance with interceptors
│   │   ├── config/          # Firebase client config
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── components/      # Navbar, Footer, BlogCard, ProtectedRoute, Loading
│   │   └── pages/           # Landing, Login, Signup, Dashboard, WriteBlog,
│   │                        #   BlogDetail, Profile, AdminPanel
│   └── package.json
│
└── README.md
```

---

## ✨ Features

### User Features
- **Email & Google Login** using Firebase Authentication
- **Follow/Unfollow** authors
- **Like** and **Bookmark** blogs
- **Draft save** and edit published posts
- **Rich text editor** (React Quill) with image, code block, and formatting support

### Homepage
- 🔥 Trending blogs section (sorted by views & likes)
- 📝 Latest posts with pagination
- 🏷️ Tag-based category filtering

### Search
- Search blogs by title and tags

### Profile
- Followers / following count
- Published posts list
- Editable bio and profile image

### Admin Panel
- View platform statistics (users, blogs, comments)
- Block/unblock users
- Delete spam blogs

### Realtime
- Live comment updates via Socket.io

### Security
- Password hashing with bcrypt (12 salt rounds)
- JWT token authentication
- Rate limiting (100 requests / 15 min)
- Protected routes (auth + admin middleware)
- Helmet security headers

### UI/UX
- 🌙 Dark mode toggle
- 📱 Fully responsive design
- Modern, clean Tailwind CSS styling

---

## 🛠️ Installation

### Prerequisites

- **Node.js** v18+
- **npm** v9+
- **MongoDB Atlas** account (free tier works)
- **Firebase** project (for Google Auth)
- **Cloudinary** account (optional, for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/Shivamsingh2004/Python.git
cd Python
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/blogplatform
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev    # Development (with nodemon)
npm start      # Production
npm test       # Run tests
```

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client/` directory (optional, for Firebase Google Login):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the frontend:

```bash
npm run dev    # Development (http://localhost:5173)
npm run build  # Production build
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| POST   | `/api/auth/register` | Register with email        |
| POST   | `/api/auth/login`    | Login with email/password  |
| POST   | `/api/auth/firebase` | Login/register via Google  |
| GET    | `/api/auth/me`       | Get current user (auth)    |

### Users
| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | `/api/users/:id`             | Get user profile   |
| PUT    | `/api/users/profile`         | Update profile     |
| PUT    | `/api/users/follow/:id`      | Follow/unfollow    |
| PUT    | `/api/users/bookmark/:blogId`| Bookmark blog      |
| GET    | `/api/users/bookmarks`       | Get bookmarks      |

### Blogs
| Method | Endpoint                | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/blogs`            | List all blogs       |
| GET    | `/api/blogs/trending`   | Trending blogs       |
| GET    | `/api/blogs/search?q=`  | Search blogs         |
| GET    | `/api/blogs/user/:userId` | User's blogs       |
| GET    | `/api/blogs/:id`        | Get single blog      |
| POST   | `/api/blogs`            | Create blog (auth)   |
| PUT    | `/api/blogs/:id`        | Update blog (auth)   |
| DELETE | `/api/blogs/:id`        | Delete blog (auth)   |
| PUT    | `/api/blogs/:id/like`   | Like/unlike (auth)   |
| POST   | `/api/blogs/upload`     | Upload image (auth)  |

### Comments
| Method | Endpoint                       | Description         |
| ------ | ------------------------------ | ------------------- |
| GET    | `/api/comments/:blogId`        | Get blog comments   |
| POST   | `/api/comments/:blogId`        | Add comment (auth)  |
| POST   | `/api/comments/reply/:commentId` | Reply (auth)      |
| DELETE | `/api/comments/:commentId`     | Delete comment      |

### Admin
| Method | Endpoint                      | Description       |
| ------ | ----------------------------- | ----------------- |
| GET    | `/api/admin/users`            | List all users    |
| PUT    | `/api/admin/users/:id/block`  | Block/unblock     |
| DELETE | `/api/admin/blogs/:id`        | Delete blog       |
| GET    | `/api/admin/stats`            | Platform stats    |

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Set root directory to `client`
4. Add environment variables (VITE_FIREBASE_*)
5. Deploy

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables from `.env`

### Database → MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and get the connection string
3. Whitelist IP addresses (or allow all: `0.0.0.0/0`)
4. Use the connection string in your `MONGODB_URI` env variable

---

## 🧪 Testing

```bash
cd server
npm test
```

The backend includes Jest + Supertest tests covering:
- Auth route validation (register, login)
- Health check endpoint
- JWT protection on protected routes

---

## 📄 License

This project is built for educational purposes as a Final Year B.Tech project.