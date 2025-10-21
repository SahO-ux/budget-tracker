import { services } from "../../modules-loader.js";

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name)
      return res
        .status(400)
        .json({ message: "Missing name,email or password" });

    const user = await services.UserService.createUser({
      name,
      email,
      password,
    });
    return res.status(201).json({ _id: user._id });
  } catch (err) {
    console.error("register error:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await services.UserService.authenticate({
      email,
      password,
    });
    return res.json({ token, user });
  } catch (err) {
    console.error("login error:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const id = req.userId || req.body.userId || (req.user && req.user._id);
    if (!id) return res.status(401).json({ message: "Unauthenticated" });
    const user = await services.UserService.getUserById(id);
    return res.json(user);
  } catch (err) {
    console.error("me error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

export default {
  controllerName: "UserController",
  register,
  login,
  getUserInfo,
};
