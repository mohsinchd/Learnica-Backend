export const verificationTemplate = (url) => {
  return `
    
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification - Learnica</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      text-align: center;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
    }

    p {
      color: #555;
      line-height: 1.6;
    }

    .verification-button {
      display: inline-block;
      padding: 10px 20px;
      background-color: #007bff;
      color: #333;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
    }

    .verification-button:hover {
      background-color: #0056b3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Learnica!</h1>
    <p>Thank you for registering with Learnica, your online learning platform. To get started, please verify your email address by clicking the button below:</p>

    <a href="${url}" class="verification-button">Verify Email Address</a>

    <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
    <p><a href="${url}">${url}</a></p>

    <p>If you didn't create an account on Learnica, you can ignore this email.</p>
  </div>
</body>
</html>

    `;
};

export const verificationMessage = (frontendUrl) => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification Success - Learnica</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
          text-align: center;
        }
    
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
    
        h1 {
          color: #4caf50;
        }
    
        p {
          color: #555;
          line-height: 1.6;
        }
    
        .login-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
    
        .login-button:hover {
          background-color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Email Verified!</h1>
        <p>Your email has been successfully verified. You are now ready to explore Learnica, your online learning platform.</p>
    
        <p>Click the button below to log in to your account:</p>
    
        <a href="${frontendUrl}" class="login-button">Log In</a>
    
        <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${frontendUrl}">${frontendUrl}</a></p>
    
        <p>Thank you for choosing Learnica! If you have any questions or need assistance, feel free to contact our support team.</p>
      </div>
    </body>
    </html>
    `;
};
