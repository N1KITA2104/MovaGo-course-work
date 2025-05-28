# 🌍 MovaGo – Language Learning App

## 📝 Project Overview

**MovaGo** is a modern web application designed for learning English through interactive lessons and personalized content.  
The project includes:
- **Angular** for the frontend (SPA),
- **Express.js + TypeScript** for the backend (API).

It supports:
- dynamic content updates without codebase changes,
- tracking user progress and data management,
- high-level security with JWT, bcrypt, and CORS,
- a user-friendly and intuitive interface.

---

## ⚙️ Technologies Used
- **Frontend:** Angular 15+, SCSS, RxJS, Angular Material
- **Backend:** Express.js + TypeScript, MongoDB (Atlas), Mongoose
- **Other Services:** Railway (backend hosting), Netlify (frontend hosting), Postman (API testing), Git

---

## 📂 Project Structure
**/movago-fe**
Angular SPA with modules, components, services, interceptors
**/movago-be**
Express.js API with controllers, middleware, models, routes
**/movago-mobile**
React Native mobile web-app

## 🚀 Setup and Installation Guide

### 📥 Clone the Repository
```bash
git clone https://github.com/your-username/movago.git
cd movago
```

### 🖥️ Frontend Setup (Angular)
1️⃣ Navigate to the frontend directory:
```bash
cd frontend
```
2️⃣ Install dependencies:
```bash
npm install
```
3️⃣ Run the Angular app:
```bash
ng serve
```
The app will be available at: http://localhost:4200/

#### 🛠️ Backend Setup (Express.js + TypeScript)
1️⃣ Navigate to the backend directory:
```bash
cd backend
```
2️⃣ Create a **.env** file in **/src/** with the following configuration:
```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
3️⃣ Install dependencies:
```bash
npm install
```
4️⃣ Run the backend server:
```bash
npm run dev
```
API will be available at: **http://localhost:5000/api**

###🔒 MongoDB Atlas Setup
1️⃣ Create an account at MongoDB Atlas.
2️⃣ Set up a cluster and create a database **movago**.
3️⃣ Generate a connection string and add it to the **.env** file in the backend:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/movago
```
### 🔗 Additional Tools
- Netlify: For frontend hosting with automatic deploy.
- Railway: For backend deployment with CI/CD.
- Postman: For API testing.

### 📌 Recommendations
✅ Use Node.js 18+ for best compatibility.
✅ Install Angular CLI globally:
```bash
npm install -g @angular/cli
```
✅ Check your **.env** settings before starting the backend.

## 👥 Authors
###Nikita Apatiev
###Teodor Migalchan
