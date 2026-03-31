# Inventory Management System
A full-stack Inventory Management application built with **Spring Boot** (backend) and **React + Vite + TailwindCSS** (frontend). The system allows users to manage products, track transactions, and perform administrative user management through a secure, role-based interface.

## Features
### Frontend
- **Real-time Dashboard**: Visual statistics for total products, stock levels, and revenue/transactions.
- **Dynamic Sidebar**: Collapsible navigation with role-based access to "Manage Users".
- **Product Management (CRUD)**: List, add, update, and delete products from the inventory.
- **User Management**: Exclusive interface for Admin users to manage system accounts.
- **Secure Authentication**: Login and Registration pages with JWT storage and session management.
- **Responsive Design**: Polished UI/UX using Tailwind CSS, optimized for desktop and mobile.
- **Lucide Icons**: Modern, consistent iconography throughout the system.
  
### Backend (Spring Boot + Spring Security)
- **RESTful API**: Clean endpoints for products, authentication, and user data.
- **JWT Authentication**: Stateless token-based security for all sensitive operations.
- **Role-based Access Control (RBAC)**: Authorize specific actions (like adding products or viewing users) for the `ADMIN` role.
- **Spring Data JPA**: Efficient database interactions with MySQL support.
- **BCrypt Encryption**: Secure password hashing for all user accounts.
- **CORS Support**: Configured to work seamlessly with the React frontend.
- **Hibernate**: Automatic database schema synchronization.
  
## Prerequisites
- **Java 21** or later
- **Node.js** & npm
- **MySQL Server**
- **Maven** (optional, you can use the included `mvnw`)
  
## Backend Setup
1. **Navigate to the backend folder**:
   ```bash
   - cd inventory-backend/inventory-backend
   
**Configure the database:**
  - Open src/main/resources/application.properties.
  - Ensure the MySQL URL, username, and password match your local environment:
properties
  - spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
  - spring.datasource.username=root
  - spring.datasource.password=yourpassword
    
**Note**: You must create the inventory_db database manually in MySQL before running.

## Install dependencies and build:

bash
- ./mvnw clean install

## Start the Spring Boot server:

bash
- ./mvnw spring-boot:run
The Backend API will run at http://localhost:8080.

## Frontend Setup

1.**Navigate to the frontend folder**:

bash
- cd inventory-frontend

2.**Install dependencies**:

bash
- npm install

3.**Start the development server**:

bash
- npm run dev
The Frontend will run at http://localhost:5173.

## Connecting Frontend & Backend

* The frontend is configured to communicate with the backend via the base URL http://localhost:8080.
* Authentication tokens are sent in the Authorization: Bearer <TOKEN> header for protected requests.
* CORS is enabled in the backend to allow requests from http://localhost:5173.

## Usage

* Login/Register: Create an account or sign in as an Admin or User.
* Dashboard: View high-level statistics of your current inventory.
* Inventory: Navigate to the Inventory page to add new products or manage existing ones.
* Admin: As an administrator, access the "Users" page to view and manage roles.
* Logout: Securely end your session via the logout button in the sidebar.

## Dependencies

## Backend

* Spring Boot Starter Web
* Spring Boot Starter Security (JWT)
* Spring Data JPA
* MySQL Connector J
* Lombok
* JJWT (JSON Web Token implementation)

## Frontend

* React 19 + TypeScript
* Vite
* Tailwind CSS 4.0
* Lucide React
* React Router DOM 7
* Fetch API for networking

## Notes

* Ensure MySQL is running and the inventory_db database exists before starting the backend.
* The default Admin credentials (if pre-populated) or new registrations will use BCrypt for security.
* Use localStorage to persist the JWT token across page refreshes.
