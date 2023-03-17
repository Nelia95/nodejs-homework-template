const User = require('../models/userModel');
const jsonwebtoken = require('../helper/jsonwebtoken');
const createVerifyEmail = require('../helper/createVerifyEmail');
const sendEmail = require('../helper/sgMail');
const fs = require('fs/promises');
const path = require('path');
const jimp = require('jimp');
const verifyEmailUser = require('../validation/verifyEmailUser');
const { VERTICAL_ALIGN_MIDDLE } = require('jimp');
// const { nanoid } = require('nanoid');
const { v4: uuidv4 } = require('uuid');

const tempDir = path.join(__dirname, '..', 'public', 'avatars');

require('dotenv').config();

const register = async (req, res, next) => {
  const { email, password, subscription } = req.body;
  const user = await User.getUserByEmail(email);
  console.log('user', user);
  if (user) {
    return res.status(409).json({
      message: 'Email in use',
    });
  }

  const verificationToken = uuidv4();
  console.log('verify', verificationToken);
  const newUser = await User.createUser({
    email,
    password,
    subscription,
    verificationToken,
  });
  const token = jsonwebtoken.create(newUser.id);
  const mail = createVerifyEmail(email, verificationToken);
  console.log('mail', mail);
  await sendEmail(mail);
  await User.updateToken(newUser.id, token);
  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: 'starter',
      verificationToken: newUser.verificationToken,
      avatarURL: newUser.avatarURL,
    },
  });
  // const user = await User.getUserByEmail(req.body.email);
  // if (user) {
  //   return res.status(409).json({
  //     message: 'Email in use',
  //   });
  // }
  // try {
  //   const verificationToken = nanoid();
  //   console.log('verify', verificationToken);
  //   const newUser = await User.createUser(req.body, verificationToken);
  //   console.log('newUser', newUser);
  //   const token = jsonwebtoken.create(newUser.id);
  //   const mail = createVerifyEmail(req.body.email, verificationToken);
  //   console.log('mail', mail);
  //   await sendEmail(mail);
  //   await User.updateToken(newUser.id, token);
  //   return res.status(201).json({
  //     token,
  //     user: {
  //       subscription: newUser.subscription,
  //       email: newUser.email,
  //       avatarURL: newUser.avatarURL,
  //       verificationToken: newUser.verificationToken,
  //     },
  //   });
  // } catch (error) {
  //   next(error);
  // }
};

const logIn = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.getUserByEmail(email);
  const isValidPassword = await user?.validPassword(password);

  console.log('isValidPassword: ', isValidPassword);
  if (!user || !isValidPassword) {
    return res.status(401).json({
      message: 'Email or password is wrong',
    });
  }
  if (!user.verify) {
    return res.status(401).json({
      message: 'Email not verify',
    });
  }
  const token = jsonwebtoken.create(user.id);
  await User.updateToken(user.id, token);

  return res.status(200).json({
    token,
    user: {
      subscription: user.subscription,
      email: user.email,
    },
  });
};

const getCurrent = async (req, res, next) => {
  const { user } = req;
  if (!user) {
    return res.status(401).json({
      message: 'Not authorized',
    });
  }
  return res.status(200).json({
    token: user.token,
    user: {
      subscription: user.subscription,
      email: user.email,
    },
  });
};

const logOut = async (req, res, next) => {
  const id = req.user?.id;
  const user = await User.getUserById(id);
  if (!user) {
    return res.status(401).json({
      message: 'Not authorized',
    });
  }
  await User.updateToken(user.id, null);
  return res.status(204).json({});
};

const updateAvatars = async (req, res, next) => {
  try {
    const id = req.user?.id;

    const { path: tempUpload, originalname } = req.file;

    const [extention] = originalname.split('.').reverse();
    const avatarName = `${id}.${extention}`;

    const resultUpload = path.join(tempDir, avatarName);

    const { file } = req;

    const img = await jimp.read(file.path);

    await img
      .autocrop()
      .cover(250, 250, jimp.HORIZONTAL_ALIGN_CENTER || VERTICAL_ALIGN_MIDDLE)
      .writeAsync(file.path);

    await fs.rename(tempUpload, resultUpload);

    const avatarURL = path.join('avatars', resultUpload);
    await User.updateUserAvatar(id, avatarURL);

    res.json({
      user: {
        avatarURL,
      },
      message: 'Avatar renewed',
    });
  } catch (error) {
    next();
  }
};

const resendVerify = async (req, res) => {
  const { error } = verifyEmailUser.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
  const { email } = req.body;
  const user = await User.getUserByEmail(email);

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  if (user.verify) {
    return res
      .status(400)
      .json({ message: 'Verification has already been passed' });
  }

  const mail = await createVerifyEmail(email, user.verificationToken);
  await sendEmail(mail);

  res.json({
    message: 'Verification email sent',
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  console.log('verificationToken', verificationToken);
  const user = await User.getUserVerificationToken(verificationToken);
  console.log('user', user);
  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }
  await User.updateVerificationToken(user._id, true, null);
  res.json({
    message: 'Verification successful',
  });
};

module.exports = {
  register,
  logIn,
  getCurrent,
  logOut,
  updateAvatars,
  resendVerify,
  verify,
};
