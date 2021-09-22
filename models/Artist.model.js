const {
    Schema,
    model
} = require("mongoose");

const artistSchema = new Schema({
    name: String,
    spotifyId: String,
    images: [Object],
    genres: [String],
    popularity: Number,
    favoriteOwners: [{
        type: Schema.Types.ObjectId,
        ref: "User"

    }]
});

const Artist = model("Artist", artistSchema);

module.exports = Artist;