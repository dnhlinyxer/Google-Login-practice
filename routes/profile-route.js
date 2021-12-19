const router = require("express").Router();
const Post = require("../models/post.model");

// middleware
const authCheck = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;     // 原本輸入的網址Url放進sesion，並當作最後要導向到的Url
        res.redirect("/auth/login");
    } else {
        next();
    }
}

// 如果已經登入了，會直接進到個人頁面 
router.get("/", authCheck, async (req, res) => {
    let postFound = await Post.find({author: req.user._id});
    res.render("profile", {user: req.user, posts: postFound});
});

router.get("/post", authCheck, (req, res) => {
    res.render("post", {user: req.user});
});

router.post("/post", authCheck, async (req, res) => {
    let {title, content} = req.body;
    let newPost = new Post({title, content, author: req.user._id});
    try {
        await newPost.save();
        res.status(200).redirect("/profile");
    } catch (err) {
        req.flash("error_msg", "Both title and content are required.");
        res.redirect("/profile/post");
    }
});

module.exports = router;