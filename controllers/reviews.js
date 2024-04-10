const listing = require("../models/listings.js");
const Review = require("../models/reviews.js")

module.exports.createReview = async (req, res) => {
    let Listing = await listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    Listing.reviews.push(newReview);

    await newReview.save();
    await Listing.save();
    // As we need to change in the existing document in database therefore we need to save everything after changing.
    // here Listing is akso changed and review is created therefore need both to be saved.
    console.log("new review saved");
    res.redirect(`/listing/${Listing._id}`);
};

module.exports.deleteReview = async (req, res) => {
    //findOneAndDelete in listings.js is the only reason why review is deleted from the db also.
    let { listingId, reviewId } = req.params;

    await listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listing/${listingId}`);
};