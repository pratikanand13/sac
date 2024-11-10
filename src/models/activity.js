import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    collegeID : {type:Number,
        required:true
    },
    name: {
        type: String, 
        required: true,
        enum: ['gym', 'tabletennis', 'badminton'],  // Restricting the activity name to only these three
    },
    maxParticipants: { type: Number, default: 0 },  // Specifies the maximum number of participants for an activity
    courtsAvailable: { type: Number, default: 0 }  // Useful for activities like Table Tennis and Badminton
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
