var mongoose = require( 'mongoose' );


//subdocument
var usagedocSchema = new mongoose.Schema({
    title: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    lpar_usage: {type: Array, required: true}
});

module.exports.usagedocs = mongoose.model('USAGEActivity', usagedocSchema);