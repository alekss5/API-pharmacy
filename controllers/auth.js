const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userSchema");  

const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (req, res,next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Get the first validation error message or combine all messages
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    
    const error = new Error('Validation failed.');
    error.statusCode = 422;
    error.message = errorMessages; // Set the error message with the combined validation messages
    
    return next(error); // Pass the error to the error-handling middleware
  }

  const { name,lastName, age, salary, jobSector, email, password } = req.body;

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user object
    const newUser = new User({
      name,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const payload = {
      user: {
        id: newUser._id,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ token });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }

    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      "privatekey",
      { expiresIn: "30d" }
    );
    res.status(200).json({
      token: token,
      userData: loadedUser      
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
