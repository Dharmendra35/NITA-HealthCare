# Doctor Booking Appointment System

Frontend URI: https://doctor-booking-appointment-system.vercel.app/
Backend URI: https://doctor-booking-appointment-system-backend.onrender.com
Admin URI: https://doctor-booking-appointment-system-6twm.vercel.app/

## Project Overview

This project is a doctor booking appointment system website with three main components: **Admin**, **Frontend**, and **Backend**. The admin can manage doctors, handle patient messages, and manage admin users, while clients can book appointments by logging in or registering. The backend handles all the core functionalities and data management.

## Folder Structure

- **admin**: Contains the admin side functionalities.
- **frontend**: The client-facing side of the website.
- **backend**: Handles the core functionalities and data processing.

## Admin Features

- **Register New Doctors**: Admin can register new doctors.
- **Remove Doctors**: Admin can remove existing doctors.
- **Create New Admins**: Admin can create new admin users.
- **Handle Patient Messages**: Admin can handle messages sent by patients.

## Frontend Features

- **User Registration**: New users can register to create an account.
- **User Login**: Existing users can log in to their accounts.
- **Book Appointments**: Clients can book appointments with doctors.

## Backend

All the above functionalities are supported by the backend code. The backend handles data storage, processing, and communication between the admin and frontend.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/devyadav-00/doctor-booking-appointment-system.git
2. Navigate to the Project Directory:
   cd doctor-booking-appointment-system
   
3.Install Dependencies:
  npm install
  
4.Set Up Environment Variables:

  Create a .env file in the root directory.
  Add necessary environment variables for database connection, API keys, etc.

5.Run the Backend Server:
cd backend
npm start

6.Run the Frontend Server:
cd frontend
npm start

7.Run the Admin Panel:
cd admin
npm start