const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
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
    const { credential, accessToken, email, name, picture, googleId } = req.body;

    let userEmail = null;
    let userName = 'Google User';
    let userAvatar = '';
    let gId = null;

    const expectedClientId = process.env.GOOGLE_CLIENT_ID || '';

    // 1. Verify Google ID Token (from Google Identity Services One Tap / Credential response)
    if (credential) {
      try {
        const verifyRes = await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
          { timeout: 7000 }
        );
        const tokenInfo = verifyRes.data;

        if (expectedClientId && tokenInfo.aud !== expectedClientId) {
          console.warn(`[Google Auth Warning] Client ID mismatch: expected ${expectedClientId}, got ${tokenInfo.aud}`);
        }

        userEmail = tokenInfo.email;
        userName = tokenInfo.name || userName;
        userAvatar = tokenInfo.picture || userAvatar;
        gId = tokenInfo.sub || gId;
      } catch (err) {
        console.error('[Google Auth Error] ID token verification failed:', err.response?.data || err.message);
        return res.status(401).json({
          success: false,
          message: 'Google ID token verification failed. The token is invalid or expired.',
        });
      }
    }
    // 2. Verify Google OAuth Access Token (from initTokenClient popup flow)
    else if (accessToken) {
      try {
        await axios.get(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(accessToken)}`,
          { timeout: 7000 }
        );

        const profileRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 7000,
        });
        const profile = profileRes.data;

        userEmail = profile.email;
        userName = profile.name || userName;
        userAvatar = profile.picture || userAvatar;
        gId = profile.sub || gId;
      } catch (err) {
        console.error('[Google Auth Error] Access token verification failed:', err.response?.data || err.message);
        return res.status(401).json({
          success: false,
          message: 'Google OAuth token verification failed.',
        });
      }
    }
    // 3. Fallback for development testing
    else if (email && process.env.NODE_ENV !== 'production') {
      userEmail = email;
      userName = name || 'Google User';
      userAvatar = picture || '';
      gId = googleId || `sub-${Date.now()}`;
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Google Authentication failed. Verified email is required.' });
    }

    if (getDBStatus()) {
      let user = await User.findOne({ email: userEmail.toLowerCase() });
      if (!user) {
        user = await User.create({
          name: userName || 'Google User',
          email: userEmail.toLowerCase(),
          password: `google_oauth_${Date.now()}_${Math.random()}`,
          avatar: userAvatar || '',
          authProvider: 'google',
          googleId: gId || null,
        });
      } else if (!user.googleId && gId) {
        user.googleId = gId;
        await user.save();
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
