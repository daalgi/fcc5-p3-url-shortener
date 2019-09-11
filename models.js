const mongoose = require('mongoose');

// Create Counter schema
const counterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: false }, 
    seq: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', counterSchema);

// If the Counter collection is empty, create the first document
Counter.collection.countDocuments({}, function(err, count){
    if(!err && count === 0){
        Counter.create({id: 'url_count', seq: 0}, function(err, data){err ? console.error(err) : data;})
    }
})

// Create Url schema
const shortUrlSchema = new mongoose.Schema({
    original_url: {type: String, unique: true},
    short_url: {type: Number, unique: true}
});

// Just before saving a ShortUrl document, get the counter
shortUrlSchema.pre('save', function save(next) {
    Counter.findOneAndUpdate(
        { id: 'url_count' },
        { $inc: { seq: 1 }},
        { useFindAndModify: false},
        (error, doc) => {
            if (error) next(error);
            this.short_url = doc.seq;
            next();
        }
    );
});

const ShortUrl = mongoose.model('ShortUrl', shortUrlSchema);


// Export the Url model
module.exports = ShortUrl;