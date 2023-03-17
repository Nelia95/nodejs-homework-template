const User = require('../service/schemaUsers');

const getUserById = async userId => {
  return await User.findOne({ _id: userId });
};

const getUserByEmail = async email => {
  return await User.findOne({ email });
};

const getUserByToken = async token => {
  return await User.findOne({ token });
};

const getUserVerificationToken = async verificationToken => {
  return await User.findOne({ verificationToken: verificationToken });
};

const createUser = async userOptions => {
  const createdUser = new User(userOptions);
  return await createdUser.save();
};

const updateToken = async (id, token) => {
  return await User.updateOne({ _id: id }, { token });
};

const updateUserAvatar = async (id, avatarURL) => {
  return await User.updateOne({ _id: id }, { avatarURL });
};
const updateVerificationToken = async (id, verify, verificationToken) => {
  return await User.updateOne({ _id: id }, { verify, verificationToken });
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByToken,
  createUser,
  updateToken,
  updateUserAvatar,
  getUserVerificationToken,
  updateVerificationToken,
};
