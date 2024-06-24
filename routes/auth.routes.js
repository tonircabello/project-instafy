const express = require("express");
const router = express.Router();

const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();

// ℹ️ Handles password encryption
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default - 10 rounds)
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const fileUploader = require('../config/cloudinary.config');

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

// GET /auth/signup
router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

// POST /auth/signup
router.post("/signup", isLoggedOut,fileUploader.single("profilePicture"), (req, res, next) => {
  const { username, email, password, genres} = req.body;
  console.log("Body:", req.body);
  console.log("File:", req.file);
  // Check that username, email, and password are provided
  if (username === "" || email === "" || password === "") {
     res.status(400).render("auth/signup", {
      errorMessage:"All fields are mandatory. Please provide your username, email and password.",
    });

    return;
  }
  if (password.length < 6) {
     res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });

    return;
  }
  if (!genres) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please select at least one genre.",
    });
  }
  let genreList = Array.isArray(genres) ? genres : genres.split(',').map(genre => genre.trim());
  const allowedGenres = [
    "rock",
    "pop",
    "blues",
    "hip-hop",
    "jazz",
    "reggae",
    "classical",
    "electronic"
  ];
  const invalidGenres = genreList.filter(genre => !allowedGenres.includes(genre));
  if (invalidGenres.length > 0) {
    return res.status(400).render("auth/signup", {
      errorMessage: `Invalid genre(s): ${invalidGenres.join(', ')}. Please select valid genres.`,
    });
  }
  
/*
  //   ! This regular expression checks password for special characters and minimum length
  
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(400)
      .render("auth/signup", {
        errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }
  */

  // Create a new user - start by hashing the password
bcrypt
  .genSalt(saltRounds)
  .then((salt) => bcrypt.hash(password, salt))
  .then((hashedPassword) => {
    
    return User.create({ username, email, genres, password: hashedPassword });
  })
  
  .then((user) => {
    console.log("User created:", user); 
    res.redirect("/auth/login");
  })
  .catch((error) => {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(500).render("auth/signup", { errorMessage: error.message });
    } else if (error.code === 11000) {
      res.status(500).render("auth/signup", {
        errorMessage:
          "Username and email need to be unique. Provide a valid username or email.",
      });
    } else {
      next(error);
    }
  });
});
// GET /auth/login
router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

// POST /auth/login
router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, email, password } = req.body;

  // Check that username, email, and password are provided
  if (username === "" || email === "" || password === "") {
    res.status(400).render("auth/login", {
      errorMessage:
        "All fields are mandatory. Please provide username, email and password.",
    });

    return;
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 6) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 6 characters long.",
    });
  }

  // Search the database for a user with the email submitted in the form
  User.findOne({ email })
    .then((user) => {
      // If the user isn't found, send an error message that user provided wrong credentials
      if (!user) {
        res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
        return;
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt
        .compare(password, user.password)
        .then((isSamePassword) => {
          if (!isSamePassword) {
            res
              .status(400)
              .render("auth/login", { errorMessage: "Wrong credentials." });
            return;
          }

          // Add the user object to the session object
          req.session.currentUser = user.toObject();
          // Remove the password field
          delete req.session.currentUser.password;

          res.redirect("/");
        })
        .catch((err) => next(err)); // In this case, we send error handling to the error handling middleware.
    })
    .catch((err) => next(err));
});

// GET /auth/logout
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).render("auth/logout", { errorMessage: err.message });
      return;
    }

    res.redirect("/");
  });
});

module.exports = router;