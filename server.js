const express = require('express');
const bodyParser = require('body-parser');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, get } = require('firebase/database');
const nodemailer = require('nodemailer');

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCW0nUdkpgFZb0wN7Ue-kauOS2DrIDxqy0",
    authDomain: "brief-a899c.firebaseapp.com",
    databaseURL: "https://brief-a899c-default-rtdb.firebaseio.com",
    projectId: "brief-a899c",
    storageBucket: "brief-a899c.firebasestorage.app",
    messagingSenderId: "1074380539679",
    appId: "1:1074380539679:web:1d6a5c23fdf60baa53522a",
    measurementId: "G-TD8HT4BZ1P"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Initialize Express
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Nodemailer Transport
const transporter = nodemailer.createTransport({
    host: 'mail.macalesterstreet.org',
    port: 465,
    secure: true,
    auth: {
        user: 'closed_briefing@macalesterstreet.org',
        pass: 'Macalester20',
    },
});

// Routes

// Sign Up Endpoint
app.post('/signup', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
        await push(ref(db, 'emailList'), { email });
        res.json({ message: 'Successfully signed up!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving to database.' });
    }
});

// Article Submission Endpoint
app.post('/submit-article', async (req, res) => {
    const { title, author, contact, description, article } = req.body;
    if (!title || !author || !contact || !description || !article) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const snapshot = await get(ref(db, 'emailList'));
        const emailList = [];
        snapshot.forEach((childSnapshot) => {
            emailList.push(childSnapshot.val().email);
        });

        const mailOptions = {
            from: 'closed_briefing@macalesterstreet.org',
            bcc: emailList,
            subject: `New Article Submission: ${title}`,
            text: `Title: ${title}\nAuthor: ${author}\nContact: ${contact}\nDescription: ${description}\n\n${article}`,
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Article submitted and emails sent!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending emails.' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
