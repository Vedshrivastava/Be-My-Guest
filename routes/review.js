const express = require("express");
const router = express.Router({mergeParams: true});
const wrapasync = require("../utils/wrapasync.js");
const { reviewSchema} = require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js")
const { isLoggedin, isReviewAuthor } = require("../middleware");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    //validating through joi import in schema.js and types in schema.js
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

router.post("/:id/review",isLoggedin, validateReview, wrapasync(reviewController.createReview));
router.delete("/:listingId/review/:reviewId", isLoggedin, isReviewAuthor, wrapasync(reviewController.deleteReview));

module.exports = router;