# 🏥 Smart Maternal & Child Healthcare with Nutrition Management System

A comprehensive digital platform for MOH Clinics in Sri Lanka — managing maternal health, child care from birth to age five, Thriposha nutrition distribution, immunization tracking, and risk detection.

## 👨‍💻 Developer
**R. T. I. Nandasiri** | Index: 21APP5716  
Sabaragamuwa University of Sri Lanka — BSc (Hons) in Information Technology

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind + i18next |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (JSON Web Token) |
| PDF Generation | jsPDF |
| QR Code | qrcode npm library |
| Fonts | Inter + Noto Sans Sinhala + Noto Sans Tamil |

## 👥 User Roles
| Role | Access |
|------|--------|
| MOH Officer | Full system access, reports, broadcast messages |
| Midwife | Area-based mother access only |
| Mother | Personal health record, PDF health card download |

## ✨ Key Features
- 🔐 JWT Authentication with role-based access control
- 📋 Mother registration with 8-section comprehensive form
- ⚠️ Automated risk detection based on WHO clinical guidelines
- 📊 WHO growth charts for children (0–5 years)
- 📄 PDF health card generation with QR code
- 📱 QR code scanning — opens patient record on any smartphone
- 💬 3-way secure messaging portal with role-based privacy
- 🌐 Trilingual support — English, Sinhala & Tamil
- 📈 Reports and analytics with interactive charts
- 💉 National immunization schedule tracking
- 🍎 Thriposha nutrition distribution tracking
- 🏥 Area-based midwife data isolation

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- npm

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/theruninandasiri/smart-mch-system.git
cd smart-mch-system
```

**2. Backend setup**
```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

```bash
npm run dev
```

**3. Frontend setup**
```bash
cd frontend
npm install
npm run dev
```

**4. Open browser**
http://localhost:5173


## 🔑 Risk Detection Logic
Risk assessment uses WHO clinical thresholds:

| Indicator | Low | Medium | High |
|-----------|-----|--------|------|
| Systolic BP | <130 | 130–139 | ≥140 |
| Hemoglobin | ≥11 g/dL | 8–10.9 | <7 |
| EPDS Score | <10 | 10–12 | ≥13 |

## 📁 Project Structure
smart-mch-system/
├── frontend/ # React + Vite app
│ ├── src/
│ │ ├── pages/ # All page components
│ │ ├── components/# Reusable components
│ │ ├── context/ # Auth context
│ │ ├── i18n/ # Translation files (EN/SI/TA)
│ │ └── utils/ # API utilities
├── backend/ # Node.js + Express API
│ ├── models/ # MongoDB schemas
│ ├── controllers/ # Business logic
│ ├── routes/ # API endpoints
│ └── middleware/ # Auth middleware


## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register user |
| GET | `/api/mothers` | Get mothers (filtered by area for midwives) |
| POST | `/api/mothers` | Register mother |
| GET | `/api/mothers/barcode/:id` | Get mother by QR/barcode ID |
| GET | `/api/risk/:motherId` | Get risk assessments |
| POST | `/api/risk` | Add risk assessment |
| GET | `/api/children/mother/:id` | Get children by mother |
| POST | `/api/messages` | Send message |
| POST | `/api/messages/broadcast` | Broadcast to all mothers |
| GET | `/api/dashboard/stats` | Dashboard statistics |

## 📄 License
This project is developed for academic purposes at Sabaragamuwa University of Sri Lanka.

© 2026 Ministry of Health — All Rights Reserved  
Concept, Design & Development by R. T. I. Nandasiri


## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | Register user |
| GET | `/api/mothers` | Get mothers (filtered by area for midwives) |
| POST | `/api/mothers` | Register mother |
| GET | `/api/mothers/barcode/:id` | Get mother by QR/barcode ID |
| GET | `/api/risk/:motherId` | Get risk assessments |
| POST | `/api/risk` | Add risk assessment |
| GET | `/api/children/mother/:id` | Get children by mother |
| POST | `/api/messages` | Send message |
| POST | `/api/messages/broadcast` | Broadcast to all mothers |
| GET | `/api/dashboard/stats` | Dashboard statistics |

## 📄 License
This project is developed for academic purposes at Sabaragamuwa University of Sri Lanka.

© 2026 — All Rights Reserved  
Concept, Design & Development by R. T. I. Nandasiri