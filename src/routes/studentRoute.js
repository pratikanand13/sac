import express from 'express';
import Student from '../models/studentSchema.js'; 
import studentAuth from '../middleware/studentAuth.js'; 
import { resetPassword,sendOTP,verifyOTP } from '../utils/generateOtp.js';
import Booking from '../models/booking.js';

const router = new express.Router();

router.post('/students/register', async (req, res) => {
    try {
        console.log(req.body)
        const { name, email, password, collegeId, batch, branch } = req.body;
        
        if (!email.endsWith('@iiitg.ac.in')) {
            return res.status(400).send({ error: 'Only iiitg.ac.in email addresses are allowed.' });
        }

        const student = new Student({ name, email, password, collegeId, batch, branch });
        await student.save();
        const token = await student.generateAuthToken();
        res.status(201).send({ student, token });
    } catch (error) {
        res.status(400).send(error);
    }
});


router.post('/students/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email.endsWith('@iiitg.ac.in')) {
            return res.status(400).send({ error: 'Only iiitg.ac.in email addresses are allowed.' });
        }

        const student = await Student.findByCredentials(email, password);
        const token = await student.generateAuthToken();
        res.send({ student, token });
    } catch (error) {
        res.status(400).send({ error: 'Login failed' });
    }
});


router.post('/students/logout', studentAuth, async (req, res) => {
    try {
        req.student.tokens = req.student.tokens.filter((t) => t.token !== req.token);
        await req.student.save();
        res.send({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).send({ error: 'Logout failed' });
    }
});

router.get('/students/profile', studentAuth, async (req, res) => {
    res.send(req.student);
});


router.patch('/students/update', studentAuth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'password', 'collegeId', 'batch', 'branch'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => (req.student[update] = req.body[update]));
        await req.student.save();
        res.send(req.student);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.delete('/students/delete', studentAuth, async (req, res) => {
    try {
        await req.student.remove();
        res.send({ message: 'Student account deleted' });
    } catch (error) {
        res.status(500).send({ error: 'Failed to delete student' });
    }
});

router.post('/api/bookings', studentAuth, async (req, res) => {
    const { activity, slot: { start: slotStart, end: slotEnd }, position } = req.body;
    const startTime = new Date(slotStart);
    const endTime = new Date(slotEnd);

    try {
        const count = await Booking.countDocuments({
            collegeId: req.student.collegeId,
            activityId: activity,
            'slot.start': startTime,
            'slot.end': endTime,
            position
        });

        if (count === 0) {
            const newBooking = new Booking({
                studentId: req.student._id,
                collegeId: req.student.collegeId,
                activityId: activity,
                slot: { start: startTime, end: endTime },
                position
            });

            await newBooking.save(); 
            res.status(201).send(true);
        } else {
            res.status(409).send({ message: "Booking already exists" }); 
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

router.post('/api/getBookings', async (req, res) => {
    const { activity, slot: { start: slotStart, end: slotEnd } } = req.body;
    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    try {
        const bookings = await Booking.find({
            activityId: activity, 
            'slot.start': { $lte: end }, 
            'slot.end': { $gte: start }  
        });

        if (bookings.length) {
            res.status(200).json(bookings);
        } else {
            res.status(404).send({ message: 'No bookings found for the specified activity and time range.' });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});



router.post('/api/deleteBookings', studentAuth, async (req, res) => {
    const { slot: { start: slotStart, end: slotEnd }, position } = req.body;
    if (!slotStart || !slotEnd || !position) {
        return res.status(400).send({ message: 'Complete slot information and position must be provided.' });
    }

    try {
        const startTime = new Date(slotStart);
        const endTime = new Date(slotEnd);
        const result = await Booking.findOneAndDelete({
            'slot.start': startTime,
            'slot.end': endTime,
            position: position,
            collegeId: req.student.collegeId  
        });

        if (!result) {
            return res.status(404).send({ message: 'No booking found for the specified slot, position, and college ID.' });
        }

        res.status(204).send(); 
    } catch (error) {
        res.status(500).send({ message: 'Failed to delete booking', error: error.message });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const message = await sendOTP(req.body.email);
        res.json({ success: true, message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/verify-otp", (req, res) => {
    try {
        const message = verifyOTP(req.body.email, req.body.otp);
        res.json({ success: true, message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const message = await resetPassword(req.body.email, req.body.newPassword);
        res.json({ success: true, message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



export default router;
