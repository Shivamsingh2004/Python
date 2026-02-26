# Blogify – Full Stack MERN Blogging Platform

A production-ready, full-stack blogging platform built with the MERN stack (MongoDB, Express, React, Node.js). Inspired by Medium and Dev.to. Built as a Final Year B.Tech project.

![Blogify Banner](https://via.placeholder.com/1200x400?text=Blogify+%E2%80%93+Share+Your+Ideas)

## ✨ Features

- **Authentication** – Email/password + Google OAuth via Firebase
- **Blog Editor** – Rich text editor powered by React Quill
- **Dark Mode** – Full dark/light theme toggle
- **Realtime Comments** – Powered by Socket.io
- **Image Upload** – Cover images via Cloudinary
- **Follow System** – Follow/unfollow authors
- **Like & Bookmark** – Save and react to blogs
- **Draft/Publish** – Save drafts before publishing
- **Trending Blogs** – Sorted by views and likes
- **Tag Filtering** – Filter blogs by category/tag
- **Search** – Full-text search on titles and tags
- **Admin Panel** – Manage users and content
- **Rate Limiting** – Protect API endpoints
- **Pagination** – Efficient data loading

---

## 🗂️ Folder Structure

```
blogify/
├── client/                   # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── BlogCard.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/          # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── WriteBlog.jsx
│   │   │   ├── BlogDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── Search.jsx
│   │   ├── utils/
│   │   │   ├── axios.js      # Axios instance with interceptors
│   │   │   └── firebase.js   # Firebase client config
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── server/                   # Node.js + Express backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js          # MongoDB connection
    │   │   ├── firebase.js    # Firebase Admin SDK
    │   │   └── cloudinary.js  # Cloudinary + Multer setup
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── blogController.js
    │   │   ├── commentController.js
    │   │   ├── userController.js
    │   │   └── adminController.js
    │   ├── middleware/
    │   │   ├── auth.js        # JWT verification
    │   │   ├── admin.js       # Admin role check
    │   │   └── errorHandler.js
    │   ├── models/
    │   │   ├── User.js
    │   │   ├── Blog.js
    │   │   └── Comment.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── users.js
    │   │   ├── blogs.js
    │   │   ├── comments.js
    │   │   └── admin.js
    │   └── index.js           # Express app + Socket.io
    ├── .env.example
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Firebase project (for Google Auth)
- Cloudinary account (for image uploads)

### 1. Clone the Repository

```bash
git clone https://github.com/Shivamsingh2004/Python.git
cd Python
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values (see Environment Variables below)
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

The frontend runs on `http://localhost:5173`  
The backend runs on `http://localhost:5000`

---

## 🔐 Environment Variables

### `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT expiry (e.g., `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin client email |
| `CLIENT_URL` | Frontend URL (e.g., `http://localhost:5173`) |

### `client/.env`

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login with email/password | Public |
| POST | `/api/auth/firebase` | Login with Firebase token | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/:id` | Get user profile | Public |
| PUT | `/api/users/profile` | Update profile | Private |
| PUT | `/api/users/:id/follow` | Follow/unfollow user | Private |
| PUT | `/api/users/bookmark/:blogId` | Bookmark/unbookmark blog | Private |
| GET | `/api/users/bookmarks` | Get user bookmarks | Private |

### Blogs
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/blogs` | Get all published blogs | Public |
| POST | `/api/blogs` | Create new blog | Private |
| GET | `/api/blogs/trending` | Get trending blogs | Public |
| GET | `/api/blogs/search?q=query` | Search blogs | Public |
| GET | `/api/blogs/user/:userId` | Get user's blogs | Public |
| GET | `/api/blogs/:slug` | Get blog by slug | Public |
| PUT | `/api/blogs/:id` | Update blog | Private |
| DELETE | `/api/blogs/:id` | Delete blog | Private |
| PUT | `/api/blogs/:id/like` | Like/unlike blog | Private |

### Comments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/comments/:blogId` | Get blog comments | Public |
| POST | `/api/comments/:blogId` | Add comment | Private |
| POST | `/api/comments/:commentId/reply` | Reply to comment | Private |
| DELETE | `/api/comments/:commentId` | Delete comment | Private |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Get platform stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| PUT | `/api/admin/users/:id/block` | Block/unblock user | Admin |
| GET | `/api/admin/blogs` | Get all blogs | Admin |
| DELETE | `/api/admin/blogs/:id` | Delete any blog | Admin |

---

## 🚢 Deployment

### Frontend – Vercel

```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel
# Or connect your GitHub repo to Vercel and set root directory to 'client'
```

Set environment variables in Vercel dashboard.

### Backend – Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repository
3. Set **Root Directory** to `server`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add all environment variables from `server/.env.example`

### Database – MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Get your connection string
4. Add it as `MONGO_URI` in your environment variables
5. Whitelist IP `0.0.0.0/0` for production or your server's IP

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Editor | React Quill |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, Firebase (Google + Email) |
| File Upload | Cloudinary, Multer |
| Realtime | Socket.io |
| Security | bcryptjs, express-rate-limit |

---

## 📝 License

MIT License – feel free to use this project for your portfolio or final year project.