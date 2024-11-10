import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true
    },
    collegeId: {
        type: Number,
        required: true
    },
    activityId: {
        type: String,
        enum: ['Gym', 'TT', 'Badminton'],
        required: true
    },
    slot: {
        start: { type: Date, required: true },
        end: { type: Date, required: true }
    },
    position: {
        type: String, 
        required: true // E.g., 'court 1', 'court 2', etc.
    }
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
