const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user-model");

router.get("/login", (req, res) => {
    res.render("login", {user: req.user});
});

router.get("/signup", (req, res) => {
    res.render("signup", {user: req.user});
});

router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});

router.post(
    "/login", 
    passport.authenticate("local", { 
        failureRedirect: "/auth/login",     // 登入失敗就導向到這裡
        failureFlash: "Wrong email or password",
    }), 
    (req, res) => {     // 登入成功會執行的function
        if (req.session.returnTo) {
            let newPath = req.session.returnTo;
            req.session.returnTo = "";
            res.redirect(newPath);
        } else {
            res.redirect("/profile");
        }
    }
);

router.post("/signup", async (req, res) => {
    let {name, email, password} = req.body;
    // 檢查這筆資料是否已在資料庫
    const emailExist = await User.findOne({email});
    if (emailExist) {
        // Email重複註冊的訊息
        req.flash("error_msg", "Email has already been registered.");
        res.redirect("/auth/signup");
    }

    // 加密user's password
    const hash = await bcrypt.hash(password, 10);
    password = hash;
    let newUser = new User({name, email, password});
    try {
        await newUser.save();
        // 註冊成功的訊息
        req.flash("success_msg", "Registration succeed. You can login now.");
        res.redirect("/auth/login");
    } catch (err) {
        // 註冊資訊錯誤的訊息
        req.flash("error_msg", err.errors.name.properties.message);
        res.redirect("/auth/signup");
    }
});

router.get(
    "/google", 
    passport.authenticate("google", {   // 使用passport向google做驗證使用者
        scope: ["profile", "email"],     // 獲得使用者資料(profile, email)
    })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    if (req.session.returnTo) {
            let newPath = req.session.returnTo;
            req.session.returnTo = "";
            res.redirect(newPath);
        } else {
            res.redirect("/profile");
        }
});

module.exports = router;