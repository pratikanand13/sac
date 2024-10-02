import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
 

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function(email) {
                return validator.isEmail(email) && email.endsWith('@iiitg.ac.in');  
            },
            message: 'Email must be a valid iiitg.ac.in domain address.'
        }
    },
    collegeId: { type: Number },
    batch: { type: Number, required: true },
    branch: { type: String, required: true },
    tokens: [{ token: { type: String } }]
}, {
    timestamps: true
});


studentSchema.pre('save', async function (next) {
    const student = this;
    if (student.isModified('password')) {
        student.password = await bcrypt.hash(student.password, 10);
    }
    next();
});


studentSchema.methods.generateAuthToken = async function () {
    const student = this;
    const token = jwt.sign({ _id: student._id.toString() }, 'Abhiram', { expiresIn: '1h' });
    student.tokens = student.tokens.concat({ token });
    await student.save();
    return token;
};


studentSchema.statics.findByCredentials = async (email, password) => {
    const student = await Student.findOne({ email });
    if (!student) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    return student;
};


studentSchema.methods.toJSON = function () {
    const student = this;
    const studentObject = student.toObject();
    delete studentObject.password;
    delete studentObject.tokens;
    return studentObject;
};

const Student = mongoose.model('Student', studentSchema);
export default Student;
