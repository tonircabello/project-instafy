const { Schema, model } = require("mongoose");

const publicationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      }
    ],
    aboutType:{
      type:String,
      enum: ['Al', 'Tr', 'Ar'],
    },
    about:{
      type:String,
      required: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Publication = model("Publication", publicationSchema);

module.exports = Publication;