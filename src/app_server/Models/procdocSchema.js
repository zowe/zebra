var mongoose = require( 'mongoose' );

//subdocument
var procdocSchema = new mongoose.Schema({
    lparname: {type: String, required: true},
    title: {type: String, required: true},
    datetime: {type: Date, required: true},
    lpar_proc: {type: Array, required: true}
});

module.exports.procdocs = mongoose.model('PROCActivity', procdocSchema);