const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // google login
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 255,
    },
    googleID: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    thumbnail: {
        type: String
    },
    // local login
    email: {
        type: String,
    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 1024,
    },
});

module.exports = mongoose.model("User", userSchema);