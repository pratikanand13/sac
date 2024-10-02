import express from 'express';
import Student from '../models/studentSchema.js'; 
import studentAuth from '../middleware/studentAuth.js'; 
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

export default router;
