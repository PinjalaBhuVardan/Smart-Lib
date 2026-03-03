# 📚 Smart Library & Hostel Study Room Booking System

A full-stack MERN application for managing study room bookings in a library or hostel, featuring QR code check-in, automatic booking expiry, discipline management, email notifications, and analytics.

---

## 🚀 Features

| Feature | Description |
|--------|-------------|
| 🔐 Student Auth | Register/Login with Roll Number + Email Verification |
| 📅 Room Booking | Book from 7 fixed daily time slots |
| 📷 QR Code | Unique QR per student (generated once, reused always) |
| ⏰ Auto-Cancel | Booking auto-cancelled if student arrives > 10 min late |
| 🚫 Red List | Restrict misbehaving students from booking |
| 📧 Email Alerts | Booking confirmed, cancelled, check-in success, red list notice |
| 🏛️ Room Management | Admin can add/edit/delete rooms with amenities |
| 📝 Complaints | Students report room issues; admin resolves them |
| 📊 Analytics | Charts for daily bookings, popular slots, rooms, cancellations |
| 🛡️ Admin Panel | Full dashboard with QR scanner, bookings, users management |

---

## 📁 Project Structure

```
smart-library/
├── backend/          Node.js + Express + MongoDB
│   ├── models/       User, Booking, Room, Complaint
│   ├── routes/       auth, bookings, admin, rooms, complaints
│   ├── middleware/   JWT auth
│   └── utils/        Email templates, QR generator
└── frontend/         React.js
    └── src/
        ├── pages/    Login, Register, Dashboard, BookRoom, MyBookings, Complaints
        └── pages/admin/  AdminDashboard, QRScanner, ManageRooms, RedList, Analytics
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Gmail account with App Password

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-library
JWT_SECRET=your_super_secret_key_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
FRONTEND_URL=http://localhost:3000
```

> **Getting Gmail App Password:**
> 1. Go to Google Account → Security
> 2. Enable 2-Factor Authentication
> 3. Search "App Passwords" → Generate one for "Mail"
> 4. Use that 16-character password in EMAIL_PASS

Start backend:
```bash
npm run dev     # development (with nodemon)
npm start       # production
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend runs at `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

---

## 👥 Default Admin Account

On first server start, a default admin is created automatically:
- **Roll Number:** `ADMIN001`
- **Password:** `Admin@123`

> **Important:** Change the admin password after first login!

---

## 📋 Time Slots

| Slot | Time |
|------|------|
| 1 | 9:00 AM – 10:00 AM |
| 2 | 10:00 AM – 11:00 AM |
| 3 | 11:00 AM – 12:00 PM |
| 4 | 1:00 PM – 2:00 PM |
| 5 | 2:00 PM – 3:00 PM |
| 6 | 3:00 PM – 4:00 PM |
| 7 | 4:00 PM – 5:00 PM |

---

## 🔄 QR Code Check-In Flow

1. Student books a room → receives confirmation email
2. Student arrives at library **10 min before** slot starts
3. Admin opens QR Scanner page on admin panel
4. Admin scans student's QR code (camera or manual entry)
5. System checks time window (±10 minutes of slot start):
   - ✅ Within window → **Checked In** + email sent
   - ⛔ Past +10 min → **Auto-cancelled** + email sent + slot freed
   - ⏰ Before -10 min → **Error: Too early**

---

## 🔴 Red List System

Admin can add students to the Restricted Access List for:
- Damaging property
- Misbehavior
- Repeated no-shows

Restricted students **cannot book rooms**. They are notified by email and see a message on login.

Admin can set an expiry date or leave it indefinite. Access is automatically restored after expiry.

---

## ⏱️ Auto-Cancel Cron Job

A background job runs every minute to automatically cancel bookings where:
- Slot start time + 10 minutes has passed
- Student has NOT checked in

Cancelled students receive an email notification and the slot becomes available for others.

---

## 🛠️ API Endpoints

### Auth
- `POST /api/auth/register` — Register student
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/verify-email/:token` — Verify email
- `GET /api/auth/me` — Get current user

### Bookings
- `GET /api/bookings/available-slots?roomId=&date=` — Available slots
- `POST /api/bookings` — Create booking
- `GET /api/bookings/my-bookings` — Student's bookings
- `PUT /api/bookings/cancel/:id` — Cancel booking

### Admin
- `POST /api/admin/scan-qr` — Process QR scan check-in
- `GET /api/admin/bookings` — All bookings
- `PUT /api/admin/bookings/:id/cancel` — Cancel booking
- `GET /api/admin/users` — All students
- `PUT /api/admin/users/:rollNo/redlist` — Restrict student
- `PUT /api/admin/users/:rollNo/unredlist` — Restore access
- `GET /api/admin/analytics` — Analytics data

### Rooms
- `GET /api/rooms` — Active rooms
- `POST /api/rooms` — Add room (admin)
- `PUT /api/rooms/:id` — Update room (admin)
- `DELETE /api/rooms/:id` — Delete room (admin)

### Complaints
- `POST /api/complaints` — Submit complaint
- `GET /api/complaints/my-complaints` — Student's complaints
- `GET /api/complaints/all` — All complaints (admin)
- `PUT /api/complaints/:id` — Update status (admin)

---

## 🏗️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer, node-cron, qrcode, bcryptjs

**Frontend:** React.js, React Router, Axios, Recharts, react-hot-toast, react-icons, html5-qrcode

---

## 📧 Email Notifications

| Event | Recipient | Email |
|-------|-----------|-------|
| Registration | Student | Email verification link |
| Booking confirmed | Student | Booking details + instructions |
| Check-in successful | Student | Room + time confirmation |
| Booking cancelled | Student | Reason for cancellation |
| Added to Red List | Student | Reason + contact admin |

---

## 🚀 Deployment

### Backend (Railway / Render / VPS)
1. Set environment variables in dashboard
2. Connect MongoDB Atlas
3. Deploy with `npm start`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL=https://your-backend-url.com/api`
2. Build: `npm run build`
3. Deploy the `build` folder

---

*Built with ❤️ for Smart Campus Management*
