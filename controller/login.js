const User = require("../database/schema/Schema");
const { createSecretToken } = require("../tokenGeneration/generateToken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).json({ message: "All input is required" });
  }
  const user = await User.findOne({ email });
  if (!(user && (await bcrypt.compare(password, user.password)))) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    path: "/",
    expires: new Date(Date.now() + 86400000),
    secure: false,
    httpOnly: true,
    sameSite: "Lax",
  });

  res.json({ redirectUrl: '/home' });
};

// Exporta la función correctamente
module.exports = login;
