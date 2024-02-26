// const express = require("express")

// const app = express()

// const port = 3000 

// const Router = require("./routers/routes.js")

// app.use(express.json())

// /**routes */

// app.use("/api",Router)

// app.listen(port,()=>{
// console.log(`server is running on ${port}`);
// })

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('views'));

// In-memory storage for email and temporary tokens
const users = new Map();

// Generate a random token
function generateToken() {
    return crypto.randomBytes(20).toString('hex');
}

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
    // Your email service configuration
    // For example, for Gmail:
    service: 'Gmail',
    auth: {
        user: 'mohamedkhalil.kouroghli@gmail.com',
        pass: 'ljov nubb gyra comr'
    }
});

// Route for signing up
app.post('/signup', (req, res) => {
    const email = req.body.email;
    const token = generateToken();
    
    // Store the email and token
    users.set(email, token);

    // Send the email with the link
    const mailOptions = {
        from: 'mohamedkhalil.kouroghli@gmail.com',
        to: "jesserbenkhiria911@gmail.com",
        subject: 'Set Your Password',
        html: `<p>Click <a href="http://localhost:${PORT}/setpassword/${token}">here</a> to set your password.</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send('Failed to send email');
        } else {
            console.log('Email sent:', info.response);
            res.sendStatus(200);
        }
    });
});

// Route for setting password
app.get('/setpassword/:token', (req, res) => {
    const token = req.params.token;

    // Check if the token exists
    if (users.has(token)) {
        const email = users.get(token);
        res.sendFile(__dirname + '/views/set_password.html');
    } else {
        res.status(400).send('Invalid token');
    }
});

// Route for handling password submission
app.post('/setpassword/:token', (req, res) => {
    const token = req.params.token;
    const email = users.get(token);

    // Check if the token exists
    if (email) {
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        // Check if passwords match
        if (password === confirmPassword) {
            // Handle setting password (e.g., store it in database)
            // For simplicity, we just log it
            console.log(`Setting password for ${email}: ${password}`);

            // Remove the email and token from storage
            users.delete(email);

            res.sendStatus(200);
        } else {
            res.status(400).send('Passwords do not match');
        }
    } else {
        res.status(400).send('Invalid token');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
