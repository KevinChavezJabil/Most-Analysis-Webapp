const User = require("../database/schema/Schema");
const { createSecretToken } = require("../tokenGeneration/generateToken");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    if (!(first_name && last_name && email && password)) {
      return res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createSecretToken(user._id);

    res.cookie("token", token, {
      path: "/",
      expires: new Date(Date.now() + 86400000),
      secure: true,
      httpOnly: true,
      sameSite: "None",
    });

    console.log("cookie set successfully");
    res.json({ redirectUrl: '/home' });
  } catch (error) {
    console.log("Got an error", error);
    res.status(500).send("Error creating user");
  }
};

module.exports = createUser;