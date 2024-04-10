const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js")
const listingRoute = require("./routes/listing.js")
const reviewRoute = require("./routes/review");
const userRoute = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const dbURL = process.env.ATLASDB_URL;
const MongoStore = require('connect-mongo');

async function main() {
    await mongoose.connect(dbURL);
}

if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.set("view engine", "ejs");
// when you render a view in your routes or controllers, Express will automatically look for EJS files in the views directory.
app.set("views", path.join(__dirname, "views"));
// constructs an absolute path to the "views" directory relative to the current module file.
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600 //seconds
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err)
});

//Using sessions:- 
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
//First flash and sessions(basically all ap.use) then routes are implemented.

app.get("/demoUser", async (req, res) => {

})

main().then(() => {
    console.log("connected to database");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
})

app.use("/listing", listingRoute);
app.use("/listing", reviewRoute);
app.use("/", userRoute);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"))
})
//gives page not found to any undefines route search.

/*app.use((err, req, res, next) => {
    let {statusCode = 500,message = "Something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
})*/

app.listen(3000, () => {
    console.log("Server is listening on port 3000")
});