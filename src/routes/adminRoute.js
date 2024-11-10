import express from 'express';
import Admin from '../models/adminSchema.js';
import adminAuth from '../middleware/adminAuth.js';
import Booking from '../models/booking.js';
const router = new express.Router();
router.post('/admins/register', async (req, res) => {
    try {
        const { name, email, password, collegeId, branch } = req.body;

   
        if (!email.endsWith('@iiitg.ac.in')) {
            return res.status(400).send({ error: 'Only iiitg.ac.in email addresses are allowed.' });
        }

        const admin = new Admin({ name, email, password, collegeId, branch });
        await admin.save();
        const token = await admin.generateAuthToken();
        res.status(201).send({ admin, token });
    } catch (error) {
        res.status(400).send(error);
    }
});


router.post('/admins/login', async (req, res) => {
    try {
        const { email, password } = req.body;

  
        if (!email.endsWith('@iiitg.ac.in')) {
            return res.status(400).send({ error: 'Only iiitg.ac.in email addresses are allowed.' });
        }

        const admin = await Admin.findByCredentials(email, password);
        const token = await admin.generateAuthToken();
        res.send({ admin, token });
    } catch (error) {
        res.status(400).send({ error: 'Login failed' });
    }
});


router.post('/admins/logout', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((t) => t.token !== req.token);
        await req.admin.save();
        res.send({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).send({ error: 'Logout failed' });
    }
});


router.get('/admins/profile', adminAuth, async (req, res) => {
    res.send(req.admin);
});

router.patch('/admins/update', adminAuth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'collegeId', 'branch'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => (req.admin[update] = req.body[update]));
        await req.admin.save();
        res.send(req.admin);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/admins/delete', adminAuth, async (req, res) => {
    try {
        await req.admin.remove();
        res.send({ message: 'Admin account deleted' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete admin' });
    }
});

router.post('/admins/addStudent', adminAuth, async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        req.admin.students.push(student._id);
        await req.admin.save();
        res.status(201).send({ student, message: 'Student added successfully.' });
    } catch (error) {
        res.status(400).send({ error: 'Failed to add student' });
    }
});

router.get('/admins/getBookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find({}); 
        res.status(200).json(bookings); 
    } catch (error) {
        res.status(500).send({ message: "Bookings not found" }); 
    }
});



export default router;
