const { Schema, model } = require("mongoose");

const albumSchema = new Schema(
    {
        name: String,
        spotifyId: String,
        imageUrl: [{ type: String }],
        artists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
        tracks: [{ type: Schema.Types.ObjectId, ref: "Track" }],
        genres: [String],
        releaseDate: String,
        availableMarkets: String,
        popularity: Number,
    }
);

const Album = model("Album", albumSchema);

module.exports = Album;