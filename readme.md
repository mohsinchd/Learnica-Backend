# Learnica Backend

Learnica is an online learning platform that empowers users to be both instructors and students. Instructors can create and monetize courses, while students can enroll in these courses. This README provides information about the Learnica backend, including setup instructions and details on running the API.

## Project Overview

Learnica's backend is built using the (MongoDB, Express.js, Node.js) stack. It manages user authentication, course creation, enrollment, and transaction processing.

## Getting Started

Follow these steps to set up and run the Learnica backend on your local machine.

### Prerequisites

1. Node.js and npm should be installed. [Download here](https://nodejs.org/).
2. MongoDB should be installed. [Download here](https://www.mongodb.com/try/download/community).

### Installation

```bash
git clone https://github.com/mohsinchd/Learnica-Backend.git
cd Learnica-Backend
npm install

We have Created a config folder in the root directory and you have to add a config.env file inside it.

config
└── config.env

Open config.env and add the following environment variables. Replace values with your configurations:

PORT=5000
MONGO_URI=<your-mongo-uri <use mongodb on locally or mongoAtlas>>
JWT_SECRET=<your-jwt-secret <jwt secret can be anything>>
CLOUDINARY_CLIENT_NAME=<your-cloudinary-client-name <Go to cloudinary and get your credentials>>
CLOUDINARY_CLIENT_API=<your-cloudinary-client-api <Go to cloudinary and get your credentials>>
CLOUDINARY_CLIENT_SECRET=<your-cloudinary-client-secret <Go to cloudinary and get your credentials>>
SMTP_USER=<your-smtp-user <Your google account email>>
SMTP_PASS=<your-smtp-password <Go to Your Google account and generate the application password from their and paste it here>>
RAZOR_PAY_KEY=<your-razorpay-key <Go to RazorPay SignUp and generate the credentials from the account settings.>>
RAZOR_PAY_SECRET=<your-razorpay-secret <Go to RazorPay SignUp and generate the credentials from the account settings.>>
FRONTEND_URL=<your-frontend-url>
API_URL=http://localhost:5000
```

### To Run the API

npm run dev

### Backend Deployment

The backend of LEARNICA is deployed using Railway and is accessible at the following link:

[LEARNICA Backend Deployment](https://learnica-backend-production.up.railway.app/)

Thank you for your interest in LEARNICA! If you have any questions or suggestions, please don't hesitate to reach out.
