const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

// create cookie
passport.serializeUser((user, done) => {
    // console.log("Serializing user now.");
    done(null, user._id);
});   

// Server要解讀cookie的資料
passport.deserializeUser((_id, done) => {
    // console.log("Deserializing user now.");
    User.findById({_id}).then((user) => {
        console.log("Found user.");
        done(null, user);
    });
});

passport.use(
    new LocalStrategy((username, password, done) => {
        console.log(username, password);
        User.findOne({email: username}).then(async (user) => {
            // 如果User不存在就不認證這個User(false)
            if (!user) {
                return done(null, false);
            }
            // 確認password是否跟DB裡的password一樣(result)
            await bcrypt.compare(password, user.password, function (err, result) {
                // 如果出現error就不認證
                if (err) {
                    return done(null, false);
                }
                if (!result) {    // 如果result是false就不認證
                    return done(null, false);
                } else {    // 如果result是true就認證user
                    return done(null, user);
                }
            });
        }).catch((err) => {
            return done(null, false);
        });
    })
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,     // GOOGLE_CLIENT_ID
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,     // GOOGLE_CLIENT_SECRET
            callbackURL: "/auth/google/redirect"
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            User.findOne({googleID: profile.id}).then((foundUser) => {
                if (foundUser) {
                    console.log("User already exist.");
                    done(null, foundUser);
                } else {
                    new User({
                        name: profile.displayName,
                        googleID: profile.id,
                        thumbnail: profile.photos[0].value,
                        email: profile.emails[0].value,
                    }).save().then((newUser) => {
                        console.log("New user created.");
                        done(null, newUser);
                    })
                }
            });
        }
    )
);