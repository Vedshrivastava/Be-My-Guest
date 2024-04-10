const wrapasync = require("./utils/wrapasync");
const listing = require("./models/listings")
const Review = require("./models/reviews.js")

module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        // Flash message for not logged in
        req.flash("error", "You are not logged in! Please login first");
        return res.redirect('/login');
    }
    next();
}

module.exports.saveredirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = wrapasync (async (req, res, next) => {
    let { id } = req.params;
    let listingval = await listing.findById(id);
    if(!listingval.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not allowed!");
        return res.redirect(`/listing/${id}`);
    }
    next();
})

module.exports.isReviewAuthor = wrapasync (async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not allowed!");
        return res.redirect(`/listing/${id}`);
    }
    next();
})