import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import Student from "../models/studentSchema.js";
import dotenv from 'dotenv';

dotenv.config();

let otpStore = {};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

async function sendOTP(email) {
    const student = await Student.findOne({ email });

    if (!student) {
        throw new Error("Email not found");
    }

    const otp = otpGenerator.generate(6, {
        upperCase: false,
        specialChars: false,
    });
    otpStore[email] = otp;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP for Password Reset",
        text: `Your OTP is: ${otp}`,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error(error);
                reject("Failed to send OTP");
            } else {
                resolve("OTP sent successfully");
            }
        });
    });
}

function verifyOTP(email, otp) {
    if (otpStore[email] === otp) {
        delete otpStore[email];
        return "OTP verified, you can reset your password now.";
    } else {
        throw new Error("Invalid OTP");
    }
}

async function resetPassword(email, newPassword) {
    if (!newPassword) {
        throw new Error("New password is required.");
    }

    const student = await Student.findOne({ email });
    if (!student) {
        throw new Error("User not found");
    }

    student.password = newPassword;
    await student.save();
    return "Password reset successful!";
}

export { sendOTP, verifyOTP, resetPassword };
