const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

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
  (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      res.status(400).json({ errors: err.array() });
    }
    console.log(req.body);
    res.send("User Route");
  }
);

module.exports = router;
