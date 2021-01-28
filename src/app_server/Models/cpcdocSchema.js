var mongoose = require( 'mongoose' );

//subdocument
var cpcdocSchema = new mongoose.Schema({
    title: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    caption: {type: Array, required: true},
    lpar: {type: Array, required: true}
});

module.exports.cpcdocs = mongoose.model('CPCActivity', cpcdocSchema);