const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/find_my_ride', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

module.exports = mongoose; 
