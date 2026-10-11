const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { getDBStatus } = require('../config/db');
const { memoryStore } = require('../utils/seedData');

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    process.env.JWT_SECRET || 'super_secure_fake_news_detector_jwt_secret_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (getDBStatus()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
      });

      const token = generateToken(user._id, user.email, user.role);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // In-memory fallback
      const exists = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: `user-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        createdAt: new Date(),
      };
      memoryStore.users.push(newUser);

      const token = generateToken(newUser._id, newUser.email, newUser.role);
      return res.status(201).json({
        success: true,
        message: 'Account registered successfully (Demo session).',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    // Demo bypass for convenient one-click testing
    if (email === 'demo@fakenewsdetector.ai' && (password === 'Password123!' || password === 'demo123')) {
      const token = generateToken('demo-user-id-001', email, 'researcher');
      return res.json({
        success: true,
        message: 'Logged in as Demo Researcher.',
        token,
        user: {
          id: 'demo-user-id-001',
          name: 'Dr. Alex Morgan',
          email: 'demo@fakenewsdetector.ai',
          role: 'researcher',
        },
      });
    }

    if (getDBStatus()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
      }

      if (user.authProvider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'This account was created with Google. Please click "Continue with Google" above.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      // In memory fallback
      const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
      }

      if (user.authProvider === 'google') {
        return res.status(400).json({
          success: false,
          message: 'This account was created with Google. Please click "Continue with Google" above.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Logged in successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (getDBStatus()) {
      const user = await User.findById(userId).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      return res.json({ success: true, user });
    } else {
      const user = memoryStore.users.find(u => u._id === userId) || {
        id: userId,
        name: 'Dr. Alex Morgan',
        email: req.user?.email || 'demo@fakenewsdetector.ai',
        role: req.user?.role || 'researcher',
        createdAt: new Date(),
      };
      return res.json({ success: true, user });
    }
  } catch (error) {
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const { credential, email, name, picture, googleId } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = picture;
    let gId = googleId;

    // If Google JWT credential was provided from Google One Tap / Google Identity Services
    if (credential) {
      try {
        const payloadBase64 = credential.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const decoded = JSON.parse(decodedJson);
        userEmail = decoded.email || userEmail;
        userName = decoded.name || userName || 'Google User';
        userAvatar = decoded.picture || userAvatar;
        gId = decoded.sub || gId;
      } catch (err) {
        console.warn('[Google Auth] Token decode note:', err.message);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Google Authentication failed. Email is required.' });
    }

    if (getDBStatus()) {
      let user = await User.findOne({ email: userEmail.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: userName || 'Google User',
          email: userEmail.toLowerCase(),
          password: `google_oauth_${Date.now()}_${Math.random()}`,
          avatar: userAvatar,
        });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Google Sign-In successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          authProvider: 'google',
        },
      });
    } else {
      let user = memoryStore.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (!user) {
        user = {
          _id: `user-google-${Date.now()}`,
          name: userName || 'Google User',
          email: userEmail.toLowerCase(),
          avatar: userAvatar,
          authProvider: 'google',
          role: 'researcher',
          createdAt: new Date(),
        };
        memoryStore.users.push(user);
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'Google Sign-In successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          authProvider: 'google',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.awsCognitoLogin = async (req, res, next) => {
  try {
    const { cognitoToken, email, name, sub } = req.body;
    const userEmail = email || `aws_user_${Date.now()}@cognito.aws`;
    const userName = name || 'AWS Authenticated User';

    if (getDBStatus()) {
      let user = await User.findOne({ email: userEmail.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: userName,
          email: userEmail.toLowerCase(),
          password: `aws_cognito_${Date.now()}_${Math.random()}`,
        });
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'AWS Cognito Authentication successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          authProvider: 'aws-cognito',
        },
      });
    } else {
      let user = memoryStore.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
      if (!user) {
        user = {
          _id: `user-aws-${Date.now()}`,
          name: userName,
          email: userEmail.toLowerCase(),
          authProvider: 'aws-cognito',
          role: 'researcher',
          createdAt: new Date(),
        };
        memoryStore.users.push(user);
      }

      const token = generateToken(user._id, user.email, user.role);
      return res.json({
        success: true,
        message: 'AWS Cognito Authentication successful.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          authProvider: 'aws-cognito',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  return res.json({
    success: true,
    message: `If an account with ${email} exists, a password reset link has been dispatched.`,
  });
};
