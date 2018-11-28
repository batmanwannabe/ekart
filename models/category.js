var mongoose = require('mongoose');


//category schema
var CategorySchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    key:{
        type: String
    }
});

var Category = module.exports = mongoose.model('Category',CategorySchema);