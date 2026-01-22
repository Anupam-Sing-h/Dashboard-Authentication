// ==========================================
// 1. IMPORTS & SETUP
// ==========================================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware: Allows the frontend to talk to this backend
app.use(cors());
// Middleware: Parses incoming JSON data (from forms)
app.use(express.json());

// ==========================================
// 2. DATABASE CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// ==========================================
// 3. MODELS (The Blueprints)
// ==========================================

// User Model: Defines what a user looks like in the DB
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true } // This will be hashed!
});
const User = mongoose.model('User', UserSchema);

// Task Model: Defines what a task looks like
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Links task to a user
});
const Task = mongoose.model('Task', TaskSchema);


// ==========================================
// 4. AUTH MIDDLEWARE (The Security Guard)
// ==========================================
// This function runs before protected routes to check for a valid token
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    
    // 1. Check if token exists
    if (!token) return res.status(401).json({ message: "No token, authorization denied" });

    try {
        // 2. Verify the token using our secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // 3. Add the user from the payload to the request object
        req.user = decoded;
        next(); // Move to the next function (the route handler)
    } catch (e) {
        res.status(400).json({ message: "Token is not valid" });
    }
};


// ==========================================
// 5. ROUTES: AUTHENTICATION
// ==========================================

// REGISTER (Sign Up)
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save new user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN (Sign In)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ==========================================
// 6. ROUTES: TASKS (CRUD)
// ==========================================

// GET ALL TASKS (Protected)
app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        // Find tasks strictly for the logged-in user
        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CREATE TASK (Protected)
app.post('/tasks', authMiddleware, async (req, res) => {
    const { title } = req.body;
    try {
        const newTask = new Task({
            title,
            userId: req.user.id // Get ID from the token (added by authMiddleware)
        });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE TASK (Mark as Completed)
app.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        // We need to check userId to ensure users can't edit each other's tasks
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id }, 
            { isCompleted: true },
            { new: true } // Return the updated document
        );
        if (!updatedTask) return res.status(404).json({ message: "Task not found" });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE TASK
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deletedTask) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 7. START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));