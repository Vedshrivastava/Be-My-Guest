const initData = require("./data");
const mongoose = require("mongoose");
const listing = require("../models/listings.js");
const { object } = require("joi");

const db_URL = "mongodb://127.0.0.1:27017/Hodophile";

async function main() {
    await mongoose.connect(db_URL);
}
main().then(() => {
    console.log("connected to database");
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
})

const initDB = async ()=> {
    await listing.deleteMany({});
    //inorder to clear whole database.
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6604188d7e55b5e7f9ab682a",
    }))
    await listing.insertMany(initData.data);
    //inorder to save data in schema order we inserted through listings.
    console.log("data was initialised");
}

initDB();




