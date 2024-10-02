import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import Student from '../models/studentSchema.js';

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: {
            validator: function (email) {
                return validator.isEmail(email) && email.endsWith('@iiitg.ac.in');  // Validate email domain
            },
            message: 'Email must be a valid iiitg.ac.in domain address.'
        }
    },
    password: { type: String, required: true },
    collegeId: { type: Number },
    branch: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    tokens: [{ token: { type: String } }]
}, {
    timestamps: true
});

adminSchema.pre('save', async function (next) {
    const admin = this;
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 10);
    }
    next();
});

adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const token = jwt.sign({ _id: admin._id.toString() }, 'AdminSecret', { expiresIn: '1h' });
    admin.tokens = admin.tokens.concat({ token });
    await admin.save();
    return token;
};


adminSchema.statics.findByCredentials = async (email, password) => {
    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    return admin;
};


adminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObject = admin.toObject();
    delete adminObject.password;
    delete adminObject.tokens;
    return adminObject;
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
