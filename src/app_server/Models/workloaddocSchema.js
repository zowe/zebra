var mongoose = require( 'mongoose' );

//subdocument
var workloaddocSchema = new mongoose.Schema({
    title: {type: String, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    Caption: {type: Array, required: true},
    Class: {type: Array, required: true}
});



module.exports.wokloaddocs = mongoose.model('WorkloadActivity', workloaddocSchema);