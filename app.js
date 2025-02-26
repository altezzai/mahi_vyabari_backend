require("dotenv").config();
require("./utils/passport");
require("./config/database");
const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const PORT = process.env.PORT || 3000;

const shopRouter = require("./routes/shopRoute");
const categoryRouter = require("./routes/categoryRoute");
const classifiedRouter = require("./routes/classifiedRoute")
const emergenctRouter = require("./routes/emergencyRoute")
const medDirectoryRouter = require("./routes/medDirecotoryRoute");
const vehicleRouter = require("./routes/vehicleRoute");
const workersRouter = require('./routes/workersRoute');
const userRouter = require("./routes/userRoute");

app.use(session({
    resave:false,
    saveUninitialized:true,
    secret:process.env.SESSION_SECRET
}))

app.use(passport.initialize());
app.use(passport.session())
app.use(bodyparser.json());
app.use(express.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.urlencoded({extended:true}))
app.use(cors());

app.use("/api/shop",shopRouter);
app.use("/api/category",categoryRouter);
app.use("/api/classified",classifiedRouter);
app.use("/api/emergency",emergenctRouter);
app.use("/api/medDirectory",medDirectoryRouter);
app.use("/api/vehicle",vehicleRouter);
app.use("/api/workers",workersRouter);
app.use("/api/user",userRouter);


app.listen(PORT,()=>{
    console.log(`server started on port number ${PORT}`);
})