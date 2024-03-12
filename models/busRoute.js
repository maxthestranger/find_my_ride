const mongoose = require('mongoose');
const blogSchema = new Schema({
    code: String,
    route: String,
    station: String,
    avg_price: String,
    peak_price: String,
    time: String,
});

module.exports = mongoose.model('BusRoute', blogSchema);
