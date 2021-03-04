const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

// @route       POST api/posts
// @desc        Create a post
// @access      Private
router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route       GET api/posts
// @desc        get all posts
// @access      Private(profiles are public but posts aren't)
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route       GET api/posts/:id
// @desc        gets a single post by it's Id
// @access      Private(profiles are public but posts aren't)
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.json(post);
  } catch (err) {
    // console.log(err.message);
    // console.log(err.kind);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route       DELETE api/posts/:id
// @desc        Delete a post
// @access      Private(profiles are public but posts aren't)
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Posts not found" });
    }

    // Check
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.log(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Posts not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route       PUT api/posts/like/:id
// @desc        Adding a like to the post
// @access      Private(profiles are public but posts aren't)
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the user has already like the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }
    post.likes.unshift({ user: req.user.id });

    await post.save();
    res.send(post.likes);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// @route       PUT api/posts/unlike/:id
// @desc        Remove a like from the post
// @access      Private(profiles are public but posts aren't)
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post not yet been liked." });
    }

    // Get remove index
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    post.save();

    res.send(post.likes);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
