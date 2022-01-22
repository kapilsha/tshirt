const User = require("../model/user");
const BigPromise = require("../middleware/bigPromise");
const CustomError = require("../utils/customError");
const cookieToken = require("../utils/cookieToken");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
const mailHelper = require("../utils/emailHelper");
const crypto = require("crypto");

exports.signup = BigPromise(async (req, res, next) => {
  // let result;
  // if (!req.files) {
  //   return next(new CustomError("photo is required for signup", 400));
  // }

  const { name, email, password } = req.body;

  if (!email || !name || !password) {
    return next(new CustomError("Name,email and password are requied", 400));
  }

  // let file = req.files.photo;
  // result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
  //   folder: "users",
  //   width: 150,
  //   crop: "scale",
  // });

  const user = await User.create({
    name,
    email,
    password,
    // photo: {
    //   id: result.public_id,
    //   secure_url: result.secure_url,
    // },
  });

  cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
  const { email, password } = req.body;

  // check of presence of email and password
  if (!email || !password) {
    return next(new CustomError("Please provide email and password", 400));
  }

  //we use select here because we decleared password 'false' in our user model
  // get user from db
  const user = await User.findOne({ email }).select("+password");

  // if user is not found in db
  if (!user) {
    return next(
      new CustomError("Email or password does not match or exists", 400)
    );
  }

  // match the password
  const isPasswordCorrect = await user.isValidatedPassword(password);
  // if password do not match
  if (!isPasswordCorrect) {
    return next(
      new CustomError("Email or password does not match or exists", 400)
    );
  }

  // if all goes good and we send the token
  // you can also use cookieToken below
  // cookieToken(user,res)
  const token = user.getJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  user.password = undefined;
  res.status(200).cookie("token", token, options).json({
    success: true,
    token,
    user,
  });
});

exports.logout = BigPromise(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).send({ success: true, message: "Logout success" });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  // collect email
  const { email } = req.body;

  // find user in DB
  const user = await User.findOne({ email });

  // if user not found in database
  if (!user) {
    return next(new CustomError("Email not found as register", 400));
  }

  // get token from user model methods
  const forgotToken = user.getForgotPasswordToken();

  // save user fields in db
  await user.save({ validateBeforeSave: false });

  // create a url
  const myUrl = `${req.protocol}://${req.get(
    "host"
  )}api/v1/password/reset/${forgotToken}`;

  // craft a message
  const message = `Copy paste this link in your URL and hit enter\n\n ${myUrl}`;

  // attempt to send email
  try {
    await mailHelper({
      email: user.email,
      subject: "LCO TStore - Password reset email",
      message,
    });
    res.status(200).json({
      success: true,
      message: "email sent successfully",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new CustomError(error.message, 500));
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new CustomError("Token is invalid or expired", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new CustomError("password and confirm do not match", 400));
  }

  user.password = req.body.password;

  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();

  // send a JSON response OR send token
  cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

exports.changePassword = BigPromise(async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId).select("+password");

  const isCorrectOldPassword = await user.isValidatedPassword(
    req.body.oldPassword
  );

  if (!isCorrectOldPassword) {
    return next(new CustomError("Old password is incorrect", 400));
  }

  user.password = req.body.password;

  await user.save();

  cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
  // addd a check for email and name in body

  if (!req.body.name || !req.body.email) {
    return next(
      new CustomError(
        "Your name or email field is empty. Please provide the requried information",
        400
      )
    );
  }
  const newData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    success: true,
    users,
  });
});

exports.managerAllUser = BigPromise(async (req, res, next) => {
  const users = await User.find({ role: "user" });

  res.status(200).json({
    success: true,
    users,
  });
});

exports.adminGetOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No user found", 400));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminUpdateOneUserDetails = BigPromise(async (req, res, next) => {
  // addd a check for email and name in body

  if (!req.body.name || !req.body.email) {
    return next(
      new CustomError(
        "Your name or email field is empty. Please provide the requried information",
        400
      )
    );
  }
  const newData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

exports.adminDeleteOneUser = BigPromise(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new CustomError("No such user found"), 401);
  }

  await user.remove();
  res.status(200).json({
    success: true,
  });
});
