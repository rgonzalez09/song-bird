const { Schema, model } = require("mongoose");

const albumSchema = new Schema(
    {
        name: String,
        SpotifyId: String,
        imageUrl: [{type: String}],
        artists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
        tracks: [{ type: Schema.Types.ObjectId, ref: "Track" }],
        genre: [String],
        releaseDate: String,
        availableMarkets: String,
    }
)

const Album = model("Album", albumSchema)

module.exports = Album;