const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews")

const listingSchema = new Schema({
    title: String,
    description: String,
    url: String,
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'], // Make sure this matches your expected geometry type
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
/*    category: {
        type: String,
        enum: [mountains, pool]
    }*/
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing)
    {
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
})

const listing = mongoose.model("listing", listingSchema);

module.exports = listing;