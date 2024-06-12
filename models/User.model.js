const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: false,
    },
    roles: {
      type: [String],
      default: ['user'], 
    },

    privateUser: {
      type: Boolean,
      required: true,
    },
  },
  // mirar bien el type para profilePicture
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
