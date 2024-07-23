const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
//mports the built-in Node.js module path, which provides utilities for working with file and directory paths.
const methodOverride = require("method-override");
//mports the method-override middleware, which allows you to use HTTP verbs such as PUT or DELETE in places where
//the client doesn't support it directly (e.g., in HTML forms).
const ejsMate = require("ejs-mate");
//Imports the ejs-mate module, which is an extension for the EJS templating engine. 
//It provides additional features and functionalities for working with EJS templates.
const ExpressError = require("./utils/ExpressError.js");
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review");
const userRoute = require("./routes/user.js");
const session = require("express-session");
//mports the express-session middleware, which provides session management capabilities for your Express application. 
//It enables you to create and manage user sessions. i.e. related to cookies and authentication.
const flash = require("connect-flash");
//Flash messages are typically used to show notifications or alerts after certain actions (e.g., form submissions).
const passport = require("passport");
//mports the Passport.js library, which is used for authentication in Node.js applications. 
//Passport provides a flexible and modular authentication middleware.
const localStrategy = require("passport-local");
//this adds username and hashed passwod field by itself in the userSchema therfore no need to add them.
//mports the local strategy for Passport authentication. 
//This strategy is commonly used for username/password authentication, where user credentials are verified locally.
const User = require("./models/user.js");
const dbURL = process.env.ATLASDB_URL;
const MongoStore = require('connect-mongo');
//Imports the connect-mongo module, 
//which is used with express-session to store session data in MongoDB. 
//MongoStore acts as a session store for Express sessions.

if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// Middleware Setup
app.use(express.urlencoded({ extended: true }));
//Parses incoming request bodies with URL-encoded data. It's used to handle form submissions where data is sent as URL parameters.
app.use(methodOverride("_method"));
//Overrides the HTTP method of a request. It's often used to support PUT and DELETE requests in HTML forms.
app.set("view engine", "ejs");
//Sets the view engine to EJS (Embedded JavaScript) for rendering dynamic HTML templates.
app.set("views", path.join(__dirname, "views"));
//Specifies the directory where your EJS templates are located. __dirname represents the current directory.
app.engine('ejs', ejsMate);
//Configures EJS templates to use the ejsMate engine, which is an extension for EJS with additional features
app.use(express.static(path.join(__dirname, "/public")));
//Serves static files (e.g., CSS, JavaScript, images) from the specified directory (/public in this case) to the client.

// MongoDB Connection.
async function main() {
    await mongoose.connect(dbURL);
}

// Session and Passport Setup.
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24 * 3600 //seconds
});
//this is the order for store.

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

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

// Middleware for Flash Messages and User
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Route Definitions
app.use("/listing", listingRoute);
app.use("/listing", reviewRoute);
app.use("/", userRoute);

// Error Handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// Server Start
main()
    .then(() => {
        app.listen(3000, () => {
            console.log("Server is listening on port 3000");
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });
