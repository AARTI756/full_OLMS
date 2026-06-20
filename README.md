# 🚀 Offer Letter Management System (OLMS)

## 📌 Overview

The Offer Letter Management System (OLMS) is a web-based HR workflow platform designed to streamline candidate management and offer letter creation. The system provides role-based access, candidate tracking, offer management, template-based offer generation, and secure authentication features.

---
## 🎓 Internship Project

This project was developed during an AI/ML Internship focused on HR workflow automation and enterprise application development. The system streamlines candidate onboarding, offer letter generation, authentication, and approval workflows.

## ✨ Features

### 🔐 Authentication & Security

* User Registration
* User Login
* JWT Authentication
* Password Strength Validation
* Confirm Password Validation
* Forgot Password Functionality
* Password Reset via Email
* Secure Password Reset Tokens
* Token Expiry Validation

---

### 👥 Candidate Management

* Create Candidates
* Manage Candidate Information
* Department Assignment
* Experience & CTC Tracking
* Recruiter Assignment
* Candidate Status Tracking

---

### 📄 Offer Management

* Create Offer Letters
* Edit Offer Details
* Offer Status Management
* Department-Based Offer Creation
* Designation Assignment
* Offer Validity Management
* Approval Comments

---

### 📝 Templates & Offer Customization

* Template Selection
* Quick Template Picker
* Template Categories
* Custom Offer Content

---

### 🎨 Offer Letter Preview & Branding

* Live Offer Letter Preview
* Real-Time Offer Data Preview
* Company Logo Upload & Preview
* Authorized Signature Upload & Preview
* Professional Offer Letter Layout

---

### 💰 Compensation Management

* Base Salary
* Variable Pay
* Joining Bonus
* Retention Bonus
* Automatic Total CTC Calculation

---

### 📧 Email Features

* Password Reset Emails
* SMTP Email Integration

---

## 🔄 Forgot Password Workflow

1. User clicks **Forgot Password**.
2. User enters registered email address.
3. System generates a secure reset token.
4. Reset email is sent to the registered email.
5. User opens the reset link.
6. User enters a new password.
7. Password is updated successfully.
8. Reset token becomes invalid after use.

---

## 🛠 Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL

### Authentication

* JWT Authentication
* Password Hashing

### Email

* Nodemailer
* SMTP

---

## 🚀 Getting Started

Start PostgreSQL:

```bash
docker compose up -d db
```

Install dependencies and start development server:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🌱 Database Seed

```bash
npm run prisma:seed
```


## 👨‍💻 My Contributions

During my AI/ML Internship, I contributed to the development and enhancement of the Offer Letter Management System (OLMS), focusing on authentication, offer generation workflows, and user experience improvements.

### Authentication & Security

* Implemented Forgot Password and Reset Password functionality
* Developed secure email-based password recovery workflow
* Added Password Strength Validation and user-friendly password requirements
* Enhanced authentication and form validation mechanisms
* Implemented secure reset token generation and validation

### Database & Backend

* Updated Prisma database schema to support password recovery features
* Created and managed database migrations
* Improved backend validation logic for authentication and offer management

### Offer Management Enhancements

* Enhanced the Offer Creation workflow
* Implemented real-time Offer Letter Preview functionality
* Added automatic synchronization between form inputs and offer preview

### Branding & Customization Features

* Implemented Company Logo Upload and Preview
* Added Authorized Signature Upload and Preview
* Improved offer letter customization and branding capabilities

### Frontend Development

* Developed and enhanced user interface components using Next.js and React
* Improved form usability, validation feedback, and overall user experience
* Contributed to responsive and professional UI design across multiple modules


Demo available at: https://github.com/AARTI756/full_OLMS/blob/main/demo_OLMS.mp4
