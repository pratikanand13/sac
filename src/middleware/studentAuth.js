import jwt from 'jsonwebtoken';
import Student from '../models/studentSchema.js';


const studentAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    
    const decoded = jwt.verify(token, "Abhiram");
    const student = await Student.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!student) throw new Error();
    req.token = token;
    req.student = student;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};
export default studentAuth