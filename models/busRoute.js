const mongoose = require("mongoose");
const busSchema = new mongoose.Schema({
    code: String,
    route: String,
    station: String,
    avg_price: String,
    peak_price: String,
    time: String,
});

module.exports = mongoose.model('BusRoute', busSchema);
