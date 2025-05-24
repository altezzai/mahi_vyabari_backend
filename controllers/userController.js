require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { startOfMonth, endOfMonth, subMonths } = require("date-fns");
const { deletefile, deletefilewithfoldername } = require("../utils/util");
const createToken = require("../utils/createToken");
// const { hashPassword } = require("../utils/hashData");

const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const UserOtp = require("../models/Otp");
const { sendEmail } = require("../utils/nodemailer");
const { hashData } = require("../utils/hashData");
const { where, Op, fn, literal, col } = require("sequelize");
const sendSMS = require("../utils/tiwilio");
const Shop = require("../models/Shop");
const HealthcareProvider = require("../models/MedDirectory");
const VehicleService = require("../models/VehicleService");
const Worker = require("../models/Worker");
const Classified = require("../models/Classified");
const Type = require("../models/Type");
const Category = require("../models/Category");
const UserCoupen = require("../models/userCoupon");

const uploadPath = path.join(__dirname, "../public/uploads/userImages");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({ storage });

module.exports = {
  upload,
  registerUser: async (req, res) => {
    try {
      const { userName, email, password, phone, otp } = req.body;
      if (!userName || !email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: "Missing Details",
        });
      }
      const user = await User.findOne({
        where: { email },
      });
      if (user) {
        return res.status(409).json({
          success: false,
          message: "User is already existing",
        });
      } else {
        const otpEntry = await UserOtp.findOne({
          where: {
            email,
          },
          order: [["createdAt", "DESC"]],
        });
        const otpMatch = await bcrypt.compare(otp, otpEntry.otp);
        if (!otpMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid OTP",
          });
        }
        if (UserOtp.expiresAt < Date.now()) {
          return res.status(410).json({
            success: false,
            message: "OTP Expired",
          });
        }
        const userData = {
          ...req.body,
          password: await hashData(password),
        };
        const savedUser = await User.create(userData);
        const tokenData = {
          id: savedUser.id,
          email: savedUser.email,
          role: savedUser.role,
          userName: savedUser.userName,
        };
        const token = await createToken(tokenData);
        if (!token) {
          return res.status(401).json({
            success: false,
            message: "An error occured while creating jwt Token",
          });
        }
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        await UserOtp.destroy({ where: { email } });
        return res.status(200).json({
          success: true,
          message: "User Registered Successfully",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  editUser: async (req, res) => {
    try {
      const user = await User.findByPk(req.body.id);
      if (!user) {
        await deletefilewithfoldername(uploadPath, req.file?.filename);
        res.status(409).json({
          success: false,
          message: "user not found",
        });
      }
      const oldImage = user.image;
      try {
        if (req.file?.filename) {
          if (oldImage) {
            const coverPath = path.join(uploadPath, oldImage);
            if (fs.existsSync(coverPath)) {
              fs.unlinkSync(coverPath);
            }
          }
        }
      } catch (error) {
        console.log("error on deleting old user image: ", error);
      }
      const updatedUserData = {
        ...req.body,
        password: await hashData(req.body.password),
        image: req.file ? req.file.filename : oldImage,
      };
      await user.update(updatedUserData);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
      });
    } catch (error) {
      await deletefilewithfoldername(uploadPath, req.file?.filename);
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  userLogin: async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(409).json({
        success: false,
        message: "email and password is required..!!",
      });
    }
    try {
      const user = await User.findOne({
        where: { email },
      });

      if (!user) {
        return res.status(403).json({
          success: false,
          message: "invalid email or phone, or account is not registered..!",
        });
      }
      // if (verificationMethod === "password") {
      //   const isMatch = await bcrypt.compare(password, user.password);
      //   if (!isMatch) {
      //     res.status(401).json({
      //       success: false,
      //       message: "invalid password..!",
      //     });
      //   }
      //   const tokenData = { userId: user.id, email: user.email };
      //   const token = await createToken(tokenData);
      //   if (!token) {
      //     res.status(401).json({
      //       success: false,
      //       message: "An error occured while creating jwt Token",
      //     });
      //   }
      //   res.cookie("jwt", token, {
      //     httpOnly: true,
      //     secure: process.env.NODE_ENV === "production",
      //     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      //     maxAge: 1000 * 60 * 60 * 24 * 7,
      //   });
      //   res.status(200).json({
      //     success: true,
      //     result: user,
      //   });
      // } else {
      //   const otpEntry = await UserOtp.findOne({
      //     where: {
      //       userId: user.id,
      //       loginOTP: otp,
      //     },
      //   });
      //   if (!otpEntry) {
      //     return res.status(404).json({
      //       success: false,
      //       message: "Invalid OTP",
      //     });
      //   }
      //   if (otpEntry.expiresAt < Date.now()) {
      //     return res.status(410).json({
      //       success: false,
      //       message: "OTP Expired",
      //     });
      //   }
      //   const tokenData = { userId: user.id, email: user.email };
      //   const token = await createToken(tokenData);
      //   if (!token) {
      //     res.status(401).json({
      //       success: false,
      //       message: "An error occured while creating jwt Token",
      //     });
      //   }
      //   res.cookie("jwt", token, {
      //     httpOnly: true,
      //     secure: process.env.NODE_ENV === "production",
      //     sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      //     maxAge: 1000 * 60 * 60 * 24 * 7,
      //   });
      //   await otpEntry.destroy();
      //   res.status(200).json({
      //     success: true,
      //     result: user,
      //   });
      // }
      // const otpEntry = await UserOtp.findOne({
      //   where: {
      //     email,
      //     otp,
      //   },
      // });
      // if (!otpEntry) {
      //   return res.status(404).json({
      //     success: false,
      //     message: "Invalid OTP",
      //   });
      // }
      // if (otpEntry.expiresAt < Date.now()) {
      //   return res.status(410).json({
      //     success: false,
      //     message: "OTP Expired",
      //   });
      // }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "invalid password..!",
        });
      }
      let shopId;
      if (user.role === "shop") {
        shopId = await Shop.findOne({ where: { email }, attributes: ["id"] });
      }
      const tokenData = {
        id: user.id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        shopId: shopId?.id,
      };
      const token = await createToken(tokenData);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "An error occured while creating jwt Token",
        });
      }
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(200).json({
        success: true,
        message: "User Logged In Successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getDashboard: async (req, res) => {
    console.log(req.body);
    res.status(200).json({
      success: true,
      message: "successfully registered...!",
    });
  },
  feedback: async (req, res) => {
    try {
      const { userId, shopId, rating } = req.body;
      if (!userId || !shopId || !rating) {
        return res.status(400).json({
          success: false,
          message: "User ID, Shop ID, and Rating are required!",
        });
      }
      const existingFeedback = await Feedback.findOne({
        where: { userId, shopId },
      });

      if (existingFeedback) {
        existingFeedback.rating = rating;
        await existingFeedback.save();
        return res.status(200).json({
          success: true,
          message: "Rating updated successfully",
          feedback: existingFeedback,
        });
      }
      const feedback = await Feedback.create({
        userId,
        shopId,
        rating,
      });
      // const feedback = await Feedback.bulkCreate(req.body,{validate:true})
      res
        .status(201)
        .json({ success: true, message: "Rating submitted", feedback });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  complaints: async (req, res) => {
    try {
      const { userId, shopId, title, description } = req.body;
      const complaint = await Complaint.create({
        userId,
        shopId,
        title,
        description,
      });
      // const complaint = await Complaint.bulkCreate(req.body,{validate:true});
      res.status(201).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.findAll({
        where: { userId: req.body.userId },
        order: [["createdAt", "DESC"]],
      });
      if (!complaints) {
        return res
          .status(404)
          .json({ success: false, message: "No complaints found" });
      }
      res.status(200).json({ success: true, complaints });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getComplaintsById: async (req, res) => {
    try {
      const complaints = await Complaint.findAll({
        where: { userId: req.body.userId },
      });
      res.status(200).json(complaints);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getPersonalDetails: async (req, res) => {
    const { id } = req.body;
    try {
      const user = await User.findOne({
        where: { id },
        attributes: ["id", "image", "userName", "email", "phone", "area"],
      });
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  Logout: async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      });
      res
        .status(200)
        .json({ success: true, message: "Successfully Logged Out" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: true, message: error.message });
    }
  },
  sendVerifyOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
      if (user) {
        return res
          .status(400)
          .json({ success: false, message: "User already registered...!" });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await UserOtp.create({
        email,
        otp: await hashData(otp),
      });
      const subject = "Email Verification OTP";
      const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>OTP Verification</h2>
        <p>Your OTP code is:</p>
        <div style="
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          padding: 10px 0;
        ">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Please Verify Your Email.</p>
        <br />
        <p style="font-size: 14px; color: #999;">Mahe Vyapari</p>
      </div>
    `;
      await sendEmail(email, subject, message);
      res
        .status(200)
        .json({ success: true, message: "Verification OTP Send on Email" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  verifyAccount: async (req, res) => {
    const { userId, verificationOTP } = req.body;
    if (!userId || !verificationOTP) {
      return res
        .status(404)
        .json({ success: false, message: "Missing Details" });
    }
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User Not Found",
        });
      }
      // const isMatch = await bcrypt.compare(password, user.password);
      const otpEntry = await UserOtp.findOne({
        where: {
          userId,
          verificationOTP,
        },
      });
      if (!otpEntry) {
        return res.status(404).json({
          success: false,
          message: "Invalid OTP",
        });
      }
      if (UserOtp.expiresAt < Date.now()) {
        return res.status(410).json({
          success: false,
          message: "OTP Expired",
        });
      }
      user.verified = true;
      await user.save();
      await otpEntry.destroy();
      return res.status(200).json({
        success: true,
        message: "User Account Verified Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  sendResetOtp: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res
        .status(404)
        .json({ success: false, message: "Email is Required" });
    }
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User Not Found" });
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      await UserOtp.create({
        email,
        otp: await hashData(otp),
      });
      const subject = "Password Reset OTP";
      const message = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>OTP Verification</h2>
        <p>Hello <strong>${user.userName}</strong>,</p>
        <p>Your OTP code is:</p>
        <div style="
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          padding: 10px 0;
        ">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>Please Verify Your Email.</p>
        <br />
        <p style="font-size: 14px; color: #999;">Mahe Vyapari</p>
      </div>
    `;
      await sendEmail(user.email, subject, message);
      return res.status(200).json({
        success: true,
        message: "sent password reset OTP to your Email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(410).json({
        success: false,
        message: "Email,OTP and new password are required",
      });
    }
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User Not Found" });
      }
      const otpEntry = await UserOtp.findOne({
        where: {
          email,
        },
        order: [["createdAt", "DESC"]],
      });
      const otpMatch = await bcrypt.compare(otpEntry.otp, otp);
      if (!otpMatch) {
        return res.status(401).json({ success: false, message: "Invalid OTP" });
      }
      if (otpEntry.expiresAt < Date.now()) {
        return res
          .status(401)
          .json({ success: false, message: "OTP has expired" });
      }
      await user.update({
        password: await hashData(newPassword),
      });
      await UserOtp.destroy({ where: { email } });
      return res
        .status(200)
        .json({ success: true, message: "Password Reset Successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  sendLoginOtp: async (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email is Required or phone is required",
      });
    }
    try {
      const user = await User.findOne({
        where: { email },
      });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User Not Found" });
      }
      const loginOTP = String(Math.floor(100000 + Math.random() * 900000));
      await UserOtp.create({
        email,
        // otp: await hashData(otp),
        otp: loginOTP,
      });
      // const isValidPhone = (userId) =>
      //   /^(\+91[\-\s]?)?[6-9]\d{9}$/.test(userId);
      // console.log(isValidPhone());
      const subject = "Login OTP";
      const message = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>OTP Verification</h2>
          <p>Your OTP code is:</p>
          <div style="
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            padding: 10px 0;
          ">
            ${loginOTP}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>Please Verify Your account.</p>
          <br />
          <p style="font-size: 14px; color: #999;">Mahe Vyapari</p>
        </div>
      `;
      // if (!isValidPhone(userId)) {
      //   await sendEmail(user.email, subject, message);
      //   return res.status(200).json({
      //     success: true,
      //     message: "sent Login OTP to your Email",
      //   });
      // } else {
      //   await sendSMS(userId, `Your Login OTP is ${loginOTP}`);
      //   return res.status(200).json({
      //     success: true,
      //     message: "sent Login OTP to your Phone",
      //   });
      // }
      await sendEmail(email, subject, message);
      return res.status(200).json({
        success: true,
        message: "sent Login OTP to your Email",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCurrentUser: async (req, res) => {
    const { id, email, role, shopId } = req.body;
    const user = await User.findOne({
      where: { id },
      attributes: ["image", "userName"],
    });
    try {
      res.status(200).json({
        id,
        userName: user.userName,
        email,
        role,
        shopId,
        image: user.image,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getRegistrationStatus: async (req, res) => {
    try {
      const now = new Date();
      const currentMonthStart = startOfMonth(now);
      const currentMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      const countModel = async (model, where = {}, start, end) => {
        return model.count({
          where: {
            ...where,
            createdAt: { [Op.between]: [start, end] },
            trash: false,
          },
        });
      };

      const countTotalModel = async (model, where = {}) => {
        return model.count({
          where: {
            ...where,
            trash: false,
          },
        });
      };

      const getChange = (current, last) => {
        if (last === 0) return current > 0 ? "+100%" : "0%";
        const diff = ((current - last) / last) * 100;
        return `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}%`;
      };

      const [
        userCurrent,
        userLast,
        userTotal,
        shopCurrent,
        shopLast,
        shopTotal,
        doctorCurrent,
        doctorLast,
        doctorTotal,
        hospitalCurrent,
        hospitalLast,
        hospitalTotal,
        vehicleCurrent,
        vehicleLast,
        vehicleTotal,
        workerCurrent,
        workerLast,
        workerTotal,
        classifiedCurrent,
        classifiedLast,
        classifiedTotal,
      ] = await Promise.all([
        countModel(User, {}, currentMonthStart, currentMonthEnd),
        countModel(User, {}, lastMonthStart, lastMonthEnd),
        countTotalModel(User),

        countModel(Shop, {}, currentMonthStart, currentMonthEnd),
        countModel(Shop, {}, lastMonthStart, lastMonthEnd),
        countTotalModel(Shop),

        countModel(
          HealthcareProvider,
          { category: "doctor" },
          currentMonthStart,
          currentMonthEnd
        ),
        countModel(
          HealthcareProvider,
          { category: "doctor" },
          lastMonthStart,
          lastMonthEnd
        ),
        countTotalModel(HealthcareProvider, { category: "doctor" }),

        countModel(
          HealthcareProvider,
          { category: "hospital" },
          currentMonthStart,
          currentMonthEnd
        ),
        countModel(
          HealthcareProvider,
          { category: "hospital" },
          lastMonthStart,
          lastMonthEnd
        ),
        countTotalModel(HealthcareProvider, { category: "hospital" }),

        countModel(VehicleService, {}, currentMonthStart, currentMonthEnd),
        countModel(VehicleService, {}, lastMonthStart, lastMonthEnd),
        countTotalModel(VehicleService),

        countModel(Worker, {}, currentMonthStart, currentMonthEnd),
        countModel(Worker, {}, lastMonthStart, lastMonthEnd),
        countTotalModel(Worker),

        countModel(Classified, {}, currentMonthStart, currentMonthEnd),
        countModel(Classified, {}, lastMonthStart, lastMonthEnd),
        countTotalModel(Classified),
      ]);

      return res.status(200).json({
        success: true,
        users: {
          currentMonth: userCurrent,
          lastMonth: userLast,
          total: userTotal,
          change: getChange(userCurrent, userLast),
        },
        shops: {
          currentMonth: shopCurrent,
          lastMonth: shopLast,
          total: shopTotal,
          change: getChange(shopCurrent, shopLast),
        },
        healthcare: {
          doctors: {
            currentMonth: doctorCurrent,
            lastMonth: doctorLast,
            total: doctorTotal,
            change: getChange(doctorCurrent, doctorLast),
          },
          hospitals: {
            currentMonth: hospitalCurrent,
            lastMonth: hospitalLast,
            total: hospitalTotal,
            change: getChange(hospitalCurrent, hospitalLast),
          },
        },
        vehicleServices: {
          currentMonth: vehicleCurrent,
          lastMonth: vehicleLast,
          total: vehicleTotal,
          change: getChange(vehicleCurrent, vehicleLast),
        },
        workers: {
          currentMonth: workerCurrent,
          lastMonth: workerLast,
          total: workerTotal,
          change: getChange(workerCurrent, workerLast),
        },
        classifieds: {
          currentMonth: classifiedCurrent,
          lastMonth: classifiedLast,
          total: classifiedTotal,
          change: getChange(classifiedCurrent, classifiedLast),
        },
      });
    } catch (error) {
      console.error("Error in getRegistrationStats:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getCategoryDistribution: async (req, res) => {
    try {
      const types = await Type.findAll({
        include: {
          model: Category,
          as: "category",
          attributes: ["id"],
        },
      });
      //const results = {};
      const results = [];
      let grandTotal = 0;
      const counts = {};

      for (const type of types) {
        const categoryIds = type.category.map((cat) => cat.id);

        let count = 0;

        switch (type.typeName.toLowerCase()) {
          case "shop":
            count = await Shop.count({
              where: {
                categories: {
                  [Op.ne]: null,
                },
                trash: false,
              },
            });
            break;
          case "medical":
            count = await HealthcareProvider.count({
              where: {
                subCategory: {
                  [Op.in]: categoryIds,
                },
                trash: false,
              },
            });
            break;
          case "taxi":
            count = await VehicleService.count({
              where: {
                category: {
                  [Op.in]: categoryIds,
                },
                trash: false,
              },
            });
            break;
          case "worker":
            count = await Worker.count({
              where: {
                trash: false,
              },
            });
            break;
          case "classified":
            count = await Classified.count({
              where: {
                category: {
                  [Op.in]: categoryIds,
                },
                trash: false,
              },
            });
            break;
          default:
            break;
        }

        counts[type.typeName] = count;
        grandTotal += count;
      }

      // for (const [typeName, count] of Object.entries(counts)) {
      //   const percentage =
      //     grandTotal === 0 ? 0 : ((count / grandTotal) * 100).toFixed(2);
      //   results[typeName] = {
      //     total: count,
      //     percentage: `${percentage}%`,
      //   };
      // }
      for (const [typeName, count] of Object.entries(counts)) {
        const percentage =
          grandTotal === 0 ? 0 : ((count / grandTotal) * 100).toFixed(2);
        results.push({
          type: typeName,
          total: count,
          percentage: `${percentage}%`,
        });
      }
      return res.status(200).json({
        success: true,
        totalRegistrations: grandTotal,
        breakdown: results,
      });
    } catch (error) {
      console.error("Error getting type stats:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getUserMonthlyRegistration: async (req, res) => {
    try {
      const registrations = await User.findAll({
        attributes: [
          [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
          [fn("COUNT", col("id")), "totalUsers"],
        ],
        where: { trash: false },
        group: [literal("month")],
        order: [literal("month ASC")],
        raw: true,
      });

      return res.status(200).json({
        success: true,
        data: registrations,
      });
    } catch (error) {
      console.error("Error fetching user registrations by month:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getRecentActivities: async (req, res) => {
    try {
      const limit = 5;

      const recentUsers = (
        await User.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "userName",
            "createdAt",
            literal("'User' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.userName,
        createdAt: item.createdAt,
        type: "user",
      }));

      const recentShops = (
        await Shop.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "shopName",
            "createdAt",
            literal("'Shop' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.shopName,
        createdAt: item.createdAt,
        type: "shop",
      }));

      const recentHealthcare = (
        await HealthcareProvider.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "name",
            "createdAt",
            literal("'HealthcareProvider' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.name,
        createdAt: item.createdAt,
        type: "medical",
      }));

      const recentWorkers = (
        await Worker.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "workerName",
            "createdAt",
            literal("'Worker' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.workerName,
        createdAt: item.createdAt,
        type: "worker",
      }));

      const recentClassifieds = (
        await Classified.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "itemName",
            "createdAt",
            literal("'Classified' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.itemName,
        createdAt: item.createdAt,
        type: "classified",
      }));

      const recentVehicleServices = (
        await VehicleService.findAll({
          where: { trash: false },
          attributes: [
            "id",
            "ownerName",
            "createdAt",
            literal("'VehicleService' AS type"),
          ],
          order: [["createdAt", "DESC"]],
          limit,
          raw: true,
        })
      ).map((item) => ({
        id: item.id,
        name: item.ownerName,
        createdAt: item.createdAt,
        type: "taxi",
      }));

      const combinedActivities = [
        ...recentUsers,
        ...recentShops,
        ...recentHealthcare,
        ...recentWorkers,
        ...recentClassifieds,
        ...recentVehicleServices,
      ];

      combinedActivities.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      const recentActivities = combinedActivities.slice(0, limit);

      return res.status(200).json({
        success: true,
        data: recentActivities,
      });
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  getTopShopUserCoupon: async (req, res) => {
    try {
      const topShops = await UserCoupen.findAll({
        attributes: [
          "shopId",
          [fn("SUM", col("assignedCount")), "totalCoupons"],
        ],
        include: [
          {
            model: Shop,
            as: "shop",
            attributes: ["id", "shopName"],
          },
        ],
        group: ["shopId", "shop.id"],
        order: [[literal("totalCoupons"), "DESC"]],
        limit: 5,
        raw: true,
        nest: true,
      });
      const topUsers = await UserCoupen.findAll({
        attributes: [
          "userId",
          [fn("SUM", col("assignedCount")), "totalCoupons"],
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "userName", "phone"],
          },
        ],
        group: ["userId", "user.id"],
        order: [[literal("totalCoupons"), "DESC"]],
        limit: 5,
        raw: true,
        nest: true,
      });

      return res.status(200).json({
        success: true,
        topShops,
        topUsers,
      });
    } catch (error) {
      console.error("Error fetching top coupon distributors:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
