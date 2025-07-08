const bodyParser = require('body-parser');
const express = require('express')
const cors = require('cors'); 
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");

const studentRoutes = require('./src/routes/student');
const teacherRoutes = require('./src/routes/teacher');
const teacherSalaryRoutes=require('./src/routes/teacherSalary');
const enrollFeeRoutes = require('./src/routes/fee');
const loginRoutes=require('./src/routes/login')



const connectDB = require('./src/config/db');


dotenv.config();

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000', // frontend origin
  credentials: true, // allow credentials (cookies, auth headers)
};
app.use(cors(corsOptions));

const PORT = process.env.PORT || 4200;

app.use(express.json());

app.use(cookieParser());


// Connect to MongoDB

connectDB();


// Middleware

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



// Set up routes

app.use('/api/students', studentRoutes);

app.use('/api/teachers', teacherRoutes);

app.use('/api/enrollfee', enrollFeeRoutes);

app.use('/api/teacherSalary', teacherSalaryRoutes);

app.use("/api/class", require("./src/routes/class"));

app.use("/api/login", loginRoutes);



app.get('/', (req, res) => {

res.send('API is running...');

});



// Start the server

app.listen(PORT, () => {

console.log(`Server is running on port ${PORT}`);

console.log(`URL: http://localhost:${PORT}`);



});