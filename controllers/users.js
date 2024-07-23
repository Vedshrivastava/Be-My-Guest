const User = require("../models/user");

module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try{
    let {username, password, email} = req.body;
    const newUser = new User({email, username});
    const userRegistered = await User.register(newUser, password);
    req.login(userRegistered, (err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "Welcome to Wanderlust.");
        res.redirect("/listing");
    })
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    };
};

module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.logout = (req, res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out now!");
        res.redirect("/listing")
        //--> res.redirect(req.session.redirectUrl); <--
        //this works if passport is not used as it deletes the redirectUrl from session as login succeeds.
        //therefore we need to make locals and middlewares for this.
    })
};

module.exports.login = async (req, res) => {
    req.flash("success", "You are successfully logged in!");
    let redirect = res.locals.redirectUrl || "/listing";
    res.redirect(redirect);
};