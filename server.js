const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const cors = require('cors'); // Import the cors package

// Initialize the app
const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON data
app.use(cors()); // Enable CORS for all origins

// Create a new SQLite database (or open an existing one)
const db = new sqlite3.Database('callbackForm.db', (err) => {
    if (err) {
        console.error('Error opening SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create a table for storing form submissions (if it doesn't exist)
db.run(`
  CREATE TABLE IF NOT EXISTS callback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    phone TEXT,
    subject TEXT
  )
`, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Table created or already exists.');
    }
});

// POST endpoint to handle form submission
app.post('/submitForm', (req, res) => {
    const { name, phone, subject } = req.body;

    // Insert the form data into the SQLite database
    const query = 'INSERT INTO callback (name, phone, subject) VALUES (?, ?, ?)';
    db.run(query, [name, phone, subject], function (err) {
        if (err) {
            console.error('Error inserting data:', err.message);
            res.json({ success: false, message: 'Failed to save form data' });
        } else {
            res.json({ success: true, message: 'Form data saved successfully', id: this.lastID });
        }
    });
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'obedmeshach29@gmail.com', // Your email address
      pass: 'Machaala@123#'    // Your email password or app password (if 2FA is enabled)
    }
  });
  
  // Endpoint to handle form submission
  app.post('/submitForm', (req, res) => {
    const { name, phone, subject } = req.body;
  
    // Email details
    const mailOptions = {
      from: 'obedmeshach29@gmail.com',
      to: 'obedmeshach29@gmail.com',  // Admin's email where you want to receive messages
      subject: 'New Callback Request',
      text: `You have received a new callback request:\n\nName: ${name}\nPhone: ${phone}\nSubject: ${subject}`
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ success: false, message: 'Failed to send email' });
      }
      res.status(200).json({ success: true, message: 'Form submitted successfully!' });
    });
  });
  

// Start the server
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000');
});
