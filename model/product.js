const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please provide product name"],
    trim: true,
    maxlength: [120, " product name should not be more than 120 characters"],
  },
  price: {
    type: Number,
    // required: [true, "Please provide product price"],
    maxlength: [6, "Product price should not be more than 6 digits"],
  },
  description: {
    type: String,
    required: [true, "please provide product description"],
  },
  photos: [
    {
      id: {
        type: String,
        require: true,
      },
      secure_url: {
        type: String,
        require: true,
      },
    },
  ],
  category: {
    type: String,
    required: [
      true,
      "Please select categories from - shortsleeves, longsleeves, sweetshirts, hoodies ",
    ],
    enum: {
      values: ["short-sleeves", "long-sleeves", "sweats-shirt", "hoodies"],
      message:
        "Please select categories ONLY from - shortsleeves, longsleeves, sweetshirts, hoodies ",
    },
  },
  // this field updated in order videos later
  stock: {
    type: Number,
    required: [true, "Please add a number in stock"],
  },
  brand: {
    type: String,
    // required: [true, "please add a brand for clothing"],
  },
  ratings: {
    type: String,
    default: 0,
  },
  // stock: {
  //   type: Number,
  //   required: true,
  // },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comments: {
        type: String,
        require: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
