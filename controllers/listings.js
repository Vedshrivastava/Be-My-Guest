if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const listing = require("../models/listings");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const baseClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const alllistings = await listing.find({})
    res.render('listings/index.ejs', { alllistings });
};

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs')
};

module.exports.show = async (req, res) => {
    let { id } = req.params;
    const listingval = await listing.findById(id).populate("owner").populate({ path: "reviews", populate: { path: "author" } });
    //most important for parsing whole review object to show.ejs.
    if (!listingval) {
        req.flash("error", "The Listing does not exists.");
        res.redirect("/listing")
    }
    console.log(listingval);
    res.render('listings/show.ejs', { listingval });
};

module.exports.create = async (req, res, next) => {
    if (!req.body) {
        res.send(new ExpressError(400, "Send Valid Data for listing."))
    }
    let response = await baseClient.forwardGeocode({
        query: req.body.location,
        limit: 1,
    })
        .send()

    let url = req.file.path;
    const newlisting = new listing(req.body);
    newlisting.owner = req.user;
    newlisting.url = url;
    newlisting.geometry = response.body.features[0].geometry;
    let savedListing = await newlisting.save();
    console.log(savedListing);
    req.flash("success", "new listing created.");
    res.redirect("/listing");
};

module.exports.edit = async (req, res) => {
    let { id } = req.params;
    const prevlisting = await listing.findById(id);
    if (!prevlisting) {
        req.flash("error", "The Listing does not exists.");
        res.redirect("/listing")
    }
    res.render('listings/edit.ejs', { prevlisting });
};

module.exports.update = async (req, res) => {
    let { id } = req.params;
    let listingval = await listing.findByIdAndUpdate(id, { ...req.body });
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        listingval.url = url;
        await listingval.save();
    };
    res.redirect(`/listing/${id}`);
};

module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted.")
    res.redirect("/listing");
};
