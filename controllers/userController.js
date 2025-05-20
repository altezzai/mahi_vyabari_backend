require("../config/database");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { deletefile, deletefilewithfoldername } = require("../utils/util");
const createToken = require("../utils/createToken");
// const { hashPassword } = require("../utils/hashData");

const User = require("../models/User");
const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");
const UserOtp = require("../models/Otp");
const { sendEmail } = require("../utils/nodemailer");
const { hashData } = require("../utils/hashData");
const { where, Op } = require("sequelize");
const sendSMS = require("../utils/tiwilio");

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
            // otp: await hashData(otp),
            // otp,
          },
        });
        const otpMatch = await bcrypt.compare(otp, otpEntry.otp);
        console.log(otpEntry);
        console.log(otpMatch);
        if (!otpEntry || !otpMatch) {
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
        const userData = {
          ...req.body,
          password: await hashData(password),
        };
        await otpEntry.destroy();
        const savedUser = await User.create(userData);
        const tokenData = { userId: savedUser.id, email: savedUser.email };
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
          // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({
          success: true,
          result: savedUser,
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
      const user = await User.findByPk(req.params.id);
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
        password: await hashPassword(req.body.password),
        image: req.file ? req.file.filename : oldImage,
      };
      await user.update(updatedUserData);
      res.status(200).json({
        success: true,
        result: user,
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
      const tokenData = { userId: user.id, email: user.email };
      const token = await createToken(tokenData);
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "An error occured while creating jwt Token",
        });
      }
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
      res.status(200).json({
        success: true,
        result: user,
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
  getAllComplaints: async (req, res) => {
    try {
      const complaints = await Complaint.findAll();
      res.status(200).json({ success: true, complaints });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getComplaintsById: async (req, res) => {
    try {
      const complaints = await Complaint.findAll({
        where: { userId: req.params.userId },
      });
      res.status(200).json(complaints);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  updateComplaints: async (req, res) => {
    try {
      const { status, resolution } = req.body;
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ status, resolution });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  deleteComplaints: async (req, res) => {
    try {
      const complaint = await Complaint.findByPk(req.params.id);
      if (!complaint) {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
      await complaint.update({ trash: true });
      res.status(200).json({ success: true, complaint });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  Logout: async (req, res) => {
    try {
      res.clearCookie("jwt", {
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
      console.log(email);
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
  isAuthenticated: async (req, res) => {
    try {
      return res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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
      const resetOTP = String(Math.floor(100000 + Math.random() * 900000));
      await UserOtp.create({
        userId: user.id,
        // otp: await hashData(otp),
        resetOTP,
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
          ${resetOTP}
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
    const { email, resetOTP, newPassword } = req.body;
    if (!email || !resetOTP || !newPassword) {
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
          userId: user.id,
          resetOTP,
        },
      });
      if (!otpEntry) {
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
      await otpEntry.destroy();
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
};
