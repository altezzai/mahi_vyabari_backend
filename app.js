require("dotenv").config();
require("./utils/passport");
require("./config/database");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const allowOrigins = [process.env.CLIENT_URL];
const PORT = process.env.PORT || 4000;

const shopRouter = require("./routes/shopRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRoute");
const classifiedRouter = require("./routes/classifiedRoute");
const emergencyRouter = require("./routes/emergencyRoute");
const medDirectoryRouter = require("./routes/medDirectoryRoute");
const vehicleRouter = require("./routes/vehicleRoute");
const workersRouter = require("./routes/workersRoute");
const userRouter = require("./routes/userRoute");
const publicRouter = require("./routes/publicRoute");
const customerRouter = require("./routes/customerRoute");
const couponRouter = require("./routes/couponRoute");
const tourismRouter = require("./routes/tourismRoute");
const bannerRouter = require("./routes/bannerRoute")

// app.use(
//   session({
//     resave: false,
//     saveUninitialized: true,
//     secret: process.env.SESSION_SECRET,
//   })
// );

app.use("/public/uploads", express.static("public/uploads"));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: allowOrigins }));
app.use(helmet());
app.use(compression());

app.use("/api/shop", shopRouter);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/classified", classifiedRouter);
app.use("/api/emergency", emergencyRouter);
app.use("/api/medDirectory", medDirectoryRouter);
app.use("/api/vehicle", vehicleRouter);
app.use("/api/workers", workersRouter);
app.use("/api/user", userRouter);
app.use("/api/public", publicRouter);
app.use("/api/customer", customerRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/tourism", tourismRouter);
app.use("/api/banners",bannerRouter)

app.listen(PORT, () => {
  console.log(`server started on port number ${PORT}`);
});
