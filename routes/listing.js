const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapasync.js")
const { listingSchema } = require("../Schema.js")
const ExpressError = require("../utils/ExpressError.js")
const { isLoggedin, isOwner } = require("../middleware");
const { index, renderNewForm, show, edit, create, update, deleteListing } = require("../controllers/listings");
const multer = require('multer')
const { storage } = require('../coud_config.js');
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    //validating through joi import in schema.js and types in schema.js
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, error);
    } else {
        next();
    }
}

router.route("/")
    .get(wrapasync(index))
    .post(isLoggedin, upload.single('img'),validateListing, wrapasync(create));

router.route("/new")
    .get(isLoggedin, renderNewForm);

router.route("/:id")
    .get(wrapasync(show))
    .put(isLoggedin, isOwner, upload.single('img'), validateListing, wrapasync(update))
    .delete(isLoggedin, isOwner, wrapasync(deleteListing));

router.route("/:id/edit")
    .get(isLoggedin, isOwner, wrapasync(edit));

module.exports = router;