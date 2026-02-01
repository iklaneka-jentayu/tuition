# ExcelLearn Tuition Center - Complete Web Application

A comprehensive online and offline tuition center management system with landing page, admin dashboard, and Google Apps Script backend.

## Features

### Landing Page
- Responsive design for desktop and mobile
- SEO-optimized copywriting
- Enrollment form with validation
- ToyyibPay integration for payments
- Contact form and newsletter subscription

### Admin Dashboard
- Secure login system for admin and members
- CRUD operations for student management
- Enrollment and payment tracking
- Data export functionality
- Real-time statistics and reporting

### Backend Integration
- Google Sheets as database
- Google Apps Script for CRUD operations
- No CORS issues with proper setup
- ToyyibPay payment gateway integration

## Setup Instructions

### 1. Google Sheets Setup
1. Create a new Google Spreadsheet named: **ExcelLearn_Tuition_Center_DB**
2. Open Script Editor (Extensions → Apps Script)
3. Replace the default code with the provided `Code.gs`
4. Save the project and deploy as a Web App
5. Set permissions to "Anyone, even anonymous" (for demo) or configure proper authentication
6. Copy the Web App URL for use in the frontend code

### 2. Frontend Setup
1. Create a new GitHub repository
2. Upload all HTML, CSS, and JS files
3. Update the Google Apps Script URL in all JavaScript files:
   - Replace `'YOUR_GOOGLE_APPS_SCRIPT_WEBAPP_URL_HERE'` with your actual Web App URL
4. Enable GitHub Pages in repository settings

### 3. ToyyibPay Integration
1. Register for a ToyyibPay merchant account
2. Get your API Key and User Secret Key
3. Update the ToyyibPay configuration in `Code.gs`
4. Configure your callback URLs

## File Structure
