var mongoose = require( 'mongoose' );

//subdocument
var procdocSchema = new mongoose.Schema({
    title: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    lpar_proc: {type: Array, required: true}
});

module.exports.procdocs = mongoose.model('PROCActivity', procdocSchema);