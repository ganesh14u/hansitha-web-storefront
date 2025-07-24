import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "All fields required" });

  const user = await User.findById(req.user._id);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return res.status(401).json({ message: "Current password is incorrect" });

  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
};

export const deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.clearCookie("token");
  res.status(200).json({ message: "Account deleted" });
};
