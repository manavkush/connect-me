const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const gravatar = require("gravatar");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

// @route       POST api/users
// @desc        Register the user
// @access      Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid e-mail").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],

  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ errors: err.array() });
      res.send();
    }
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User already exists" }] });
        res.send();
      }

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      res.send("User Registered");
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }

    console.log(req.body);
  }
);

module.exports = router;
