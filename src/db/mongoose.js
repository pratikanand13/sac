import mongoose from 'mongoose';

try {
    await mongoose.connect('mongodb://localhost:27017/iitg', {
    });
    console.log('Database connected');
} catch (e) {
    console.error('Error connecting to the database', e);
}
