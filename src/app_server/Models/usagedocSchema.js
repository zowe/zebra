var mongoose = require( 'mongoose' );


//subdocument
var usagedocSchema = new mongoose.Schema({
    title: {type: String, required: true},
    datetime: {type: Date, required: true},
    lpar_usage: {type: Array, required: true}
});

module.exports.usagedocs = mongoose.model('USAGEActivity', usagedocSchema);