import express from 'express';
import cors from 'cors';
import studentRoute from './src/routes/studentRoute.js';
import adminRoute from './src/routes/adminRoute.js';
import './src/db/mongoose.js';

const app = express();
app.use(express.json());
app.use(cors());
app.use(studentRoute);
app.use(adminRoute);

const port = 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
