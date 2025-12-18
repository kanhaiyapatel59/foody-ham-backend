const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { admin } = require('../config/firebase');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Input validation helper
const validateInput = (fields) => {
    for (const [key, value] of Object.entries(fields)) {
        if (!value || value.trim() === '') {
            return `${key} is required`;
        }
    }
    return null;
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        const validationError = validateInput({ name, email, password });
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        const validationError = validateInput({ email, password });
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone, 
            address, 
            bio, 
            dateOfBirth, 
            dietaryRestrictions, 
            favoriteCategories 
        } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update basic fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        
        // Handle address - can be string or object
        if (address !== undefined) {
            if (typeof address === 'string') {
                user.address = { street: address };
            } else {
                user.address = address;
            }
        }
        
        user.bio = bio || user.bio;
        user.dateOfBirth = dateOfBirth || user.dateOfBirth;
        
        // Update preferences
        if (!user.preferences) {
            user.preferences = {};
        }
        
        if (dietaryRestrictions !== undefined) {
            user.preferences.dietaryRestrictions = dietaryRestrictions;
        }
        
        if (favoriteCategories !== undefined) {
            user.preferences.favoriteCategories = favoriteCategories;
        }
        
        const updatedUser = await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        

        const isMatch = await user.comparePassword(currentPassword);
        
        if (!isMatch) {
       
            return res.status(401).json({ success: false, message: 'Invalid current password' });
        }
        
        
        user.password = newPassword;
        await user.save(); 

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// Social Authentication (Google, Facebook, Apple)
exports.socialAuth = async (req, res) => {
    try {
        const { token, provider } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Firebase token is required'
            });
        }

        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const { email, name, picture, firebase } = decodedToken;

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user
            user = await User.create({
                name: name || `${provider} User`,
                email,
                password: Math.random().toString(36).slice(-8), // Random password for social users
                profileImage: picture,
                authProvider: provider?.toLowerCase() || 'google'
            });
        } else {
            // Update profile image if not set
            if (picture && !user.profileImage) {
                user.profileImage = picture;
                await user.save();
            }
        }

        // Generate JWT token
        const jwtToken = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: `${provider} authentication successful`,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                authProvider: user.authProvider,
                token: jwtToken
            }
        });
    } catch (error) {
        console.error('Social Auth Error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid Firebase token',
            error: error.message
        });
    }
};

// Backward compatibility - Google Auth
exports.googleAuth = async (req, res) => {
    req.body.provider = 'Google';
    return exports.socialAuth(req, res);
};

// authcontroller