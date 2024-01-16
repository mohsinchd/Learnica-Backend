export const emailTemplate = (message) => {
  let emailTemp = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password - Learnica</title>
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
      <h1>Reseting Password for Learnica Account!</h1>
      <p>Your Reset Password Token has been successfully Generated. Please click the button below to reset your password.:</p>
  
      <a href="${message}" class="verification-button">Reset Password</a>
  
      <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p><a href="${message}">${message}</a></p>
  
      <p>If you didn't request this email, then you can ignore this email.</p>
    </div>
  </body>
  </html>`;

  return emailTemp;
};
