const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
//this passport-local-mongoose adds username and hashed passwod field by itself in the userSchema therfore no need to add them.

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);