import { User } from "../models/user.js";
import { TempUser } from "../models/tempUser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const sendEmailViaBrevo = async (email, subject, htmlContent) => {
  const senderEmail = process.env.SMTP_USER || "support@fabricare.com";
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Fabricare Support", email: senderEmail },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Brevo returned status ${response.status}`);
    }
    console.log(`[Brevo] Email sent successfully to ${email}. Message ID: ${data.messageId || data.id}`);
    return true;
  } catch (err) {
    console.error(`[Brevo Error] Failed to send email to ${email}:`, err.message);
    throw new Error(`Could not send email via Brevo: ${err.message}`);
  }
};

const sendRegisterOtpEmail = async (email, otp) => {
  const subject = "Email Verification OTP - Fabricare";
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #4caf50; text-align: center;">Verify Your Email Address</h2>
        <p>Welcome to Fabricare!</p>
        <p>Thank you for signing up. Please use the following 6-digit OTP code to verify your email and complete your registration. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px dashed #4caf50;">
            ${otp}
          </span>
        </div>
        <p>If you did not request this registration, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">This is an automated system email. Please do not reply.</p>
      </div>
    `;

  if (process.env.BREVO_API_KEY) {
    return await sendEmailViaBrevo(email, subject, htmlContent);
  }

  let transporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
   
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[SMTP] Created temporary Ethereal account: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to create Ethereal SMTP account. Falling back to console log only.", err.message);
      return null;
    }
  }

  const mailOptions = {
    from: `"Fabricare Support" <${process.env.SMTP_USER || "support@fabricare.com"}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    
   
    if (!process.env.SMTP_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[SMTP Demo] Preview Sent Email URL: ${previewUrl}`);
      return previewUrl;
    }
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send email to ${email}:`, err.message);
    throw new Error("Could not send email. Please check SMTP settings.");
  }
};

// Helper to generate 3 available username suggestions (like Google)
const generateUsernameSuggestions = async (baseUsername) => {
  const suggestions = [];
  const suffixes = [
    () => Math.floor(10 + Math.random() * 90), // 2 digit number
    () => Math.floor(100 + Math.random() * 900), // 3 digit number
    () => "_" + Math.floor(1 + Math.random() * 9), // _1 to _9
    () => Math.floor(1000 + Math.random() * 9000), // 4 digit number
    () => "_" + Math.floor(10 + Math.random() * 90) // _10 to _99
  ];

  let attempts = 0;
  while (suggestions.length < 3 && attempts < 50) {
    attempts++;
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]();
    const candidate = `${baseUsername}${randomSuffix}`.toLowerCase();

    // Check if candidate exists in verified User collection
    const exists = await User.findOne({ username: candidate });
    if (!exists && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  // Fallback if we couldn't find enough unique ones
  while (suggestions.length < 3) {
    const candidate = `${baseUsername}${Math.floor(10000 + Math.random() * 90000)}`.toLowerCase();
    suggestions.push(candidate);
  }

  return suggestions;
};

export const register = async (req, res) => {
  const { name, email, username, password, role } = req.body;

  try {
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existUsername = await User.findOne({
      username: username.toLowerCase(),
    });
    if (existUsername) {
      const suggestions = await generateUsernameSuggestions(username);
      return res.status(400).json({ 
        message: "Username already taken", 
        suggestions 
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    let otpSentCount = 1;
    const existingTempUser = await TempUser.findOne({ email: email.toLowerCase() });
    if (existingTempUser) {
      const timeSinceLastOtp = Date.now() - new Date(existingTempUser.lastOtpSentAt).getTime();
      
      // 40 seconds cooldown check
      if (timeSinceLastOtp < 40 * 1000) {
        const secondsLeft = Math.ceil((40000 - timeSinceLastOtp) / 1000);
        return res.status(400).json({ message: `Please wait ${secondsLeft} seconds before requesting another OTP.` });
      }

      // 24 hours daily limit check
      let currentCount = existingTempUser.otpSentCount;
      const isOver24Hours = timeSinceLastOtp >= 24 * 60 * 60 * 1000;
      if (isOver24Hours) {
        currentCount = 0;
      }

      if (currentCount >= 5) {
        return res.status(400).json({ message: "Daily OTP limit exceeded. Please try again after 24 hours." });
      }

      otpSentCount = currentCount + 1;
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    
    await TempUser.findOneAndUpdate(
      { email: email.toLowerCase() },
      {
        name,
        username: username.toLowerCase(),
        password: hashPassword,
        role: (email.toLowerCase() === "adityachigare019@gmail.com" || email.toLowerCase() === process.env.SMTP_USER?.toLowerCase()) ? "admin" : "user",
        otp,
        otpExpire,
        otpSentCount,
        lastOtpSentAt: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[REGISTRATION OTP] For ${email} (${username}): ${otp}`);

    
    const previewUrl = await sendRegisterOtpEmail(email, otp);

    res.status(200).json({
      message: "Verification OTP code sent to your email",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyRegistration = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const tempUser = await TempUser.findOne({
      email: email.toLowerCase(),
      otp: otp,
      otpExpire: { $gt: Date.now() },
    });

    if (!tempUser) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    
    const existEmail = await User.findOne({ email: tempUser.email });
    if (existEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const existUsername = await User.findOne({ username: tempUser.username });
    if (existUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    
    const newUser = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      username: tempUser.username,
      password: tempUser.password,
      role: tempUser.role,
    });

    
    await TempUser.deleteOne({ _id: tempUser._id });

    res.status(201).json({
      message: "Registration Successful",
      user: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {

    if (!username || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    const loginIdentifier = username.toLowerCase();
    const existingUser = await User.findOne({
      $or: [
        { username: loginIdentifier },
        { email: loginIdentifier }
      ]
    });

    if (!existingUser) {
      return res.status(400).json({
        message: "Invalid Username/Email or Password"
      });
    }

    // 🔥 BLOCK CHECK
    if (existingUser.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked by admin"
      });
    }

    const compare = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!compare) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      {
        id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: existingUser._id,
        username: existingUser.username,
        role: existingUser.role,
        wishlist: existingUser.wishlist || [],
      },
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

// Email sending helper function using Nodemailer
const sendOtpEmail = async (email, otp) => {
  const subject = "Password Reset OTP - Fabricare";
  const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #6366f1; text-align: center;">Fabricare Password Reset</h2>
        <p>Hello,</p>
        <p>You requested a password reset for your Fabricare account. Use the following 6-digit OTP code to verify your identity. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111; background-color: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px dashed #6366f1;">
            ${otp}
          </span>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">This is an automated system email. Please do not reply.</p>
      </div>
    `;

  if (process.env.BREVO_API_KEY) {
    return await sendEmailViaBrevo(email, subject, htmlContent);
  }

  let transporter;

  // Check if SMTP environment variables are defined
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dynamic Ethereal Test Mailer (out-of-the-box working demo)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[SMTP] Created temporary Ethereal account: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to create Ethereal SMTP account. Falling back to console log only.", err.message);
      return null;
    }
  }

  const mailOptions = {
    from: `"Fabricare Support" <${process.env.SMTP_USER || "support@fabricare.com"}>`,
    to: email,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Email sent successfully to ${email}. Message ID: ${info.messageId}`);
    
    // If using Ethereal, generate a preview URL
    if (!process.env.SMTP_USER) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`[SMTP Demo] Preview Sent Email URL: ${previewUrl}`);
      return previewUrl;
    }
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send email to ${email}:`, err.message);
    throw new Error("Could not send email. Please check SMTP settings.");
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body; // email field from request can contain email or username

  try {
    if (!email) {
      return res.status(400).json({ message: "Please enter your Email or Username" });
    }

    const searchIdentifier = email.toLowerCase();
    const user = await User.findOne({
      $or: [
        { username: searchIdentifier },
        { email: searchIdentifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ message: "Email or Username not found in our records." });
    }

    // Check rate limits
    if (user.lastOtpSentAt) {
      const timeSinceLastOtp = Date.now() - new Date(user.lastOtpSentAt).getTime();

      // 40 seconds cooldown check
      if (timeSinceLastOtp < 40 * 1000) {
        const secondsLeft = Math.ceil((40000 - timeSinceLastOtp) / 1000);
        return res.status(400).json({ message: `Please wait ${secondsLeft} seconds before requesting another OTP.` });
      }

      // 24 hours daily limit check
      let currentCount = user.otpSentCount || 0;
      const isOver24Hours = timeSinceLastOtp >= 24 * 60 * 60 * 1000;
      if (isOver24Hours) {
        currentCount = 0;
      }

      if (currentCount >= 5) {
        return res.status(400).json({ message: "Daily OTP limit exceeded. Please try again after 24 hours." });
      }

      user.otpSentCount = currentCount + 1;
    } else {
      user.otpSentCount = 1;
    }

    user.lastOtpSentAt = Date.now();

    // Generate a 6-digit verification code (OTP)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    console.log(`[PASSWORD RESET OTP] For ${user.email}: ${otp}`);

    // Send the real-time email
    const previewUrl = await sendOtpEmail(user.email, otp);

    res.status(200).json({
      message: "Reset code sent to your email",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { name, username } = req.body;
  const userId = req.user._id;

  try {
    if (!name || !username) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if username is already taken by another user
    const existUsername = await User.findOne({
      username: username.toLowerCase(),
      _id: { $ne: userId }
    });

    if (existUsername) {
      return res.status(400).json({ message: "Username already taken by another user" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, username: username.toLowerCase() },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.wishlist) {
      user.wishlist = [];
    }

    const index = user.wishlist.indexOf(productId);
    if (index === -1) {
      user.wishlist.push(productId);
      await user.save();
      return res.status(200).json({
        message: "Added to wishlist",
        wishlist: user.wishlist
      });
    } else {
      user.wishlist.splice(index, 1);
      await user.save();
      return res.status(200).json({
        message: "Removed from wishlist",
        wishlist: user.wishlist
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlistProducts = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).populate("wishlist");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.wishlist || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
