const { Schema, model } = require("mongoose");

const artistSchema = new Schema(
    {
        name: String,
        spotifyId: String,
        imageUrl: [{ type: String }],
        albums: [{ type: Schema.Types.ObjectId, ref: "Album" }],
        tracks: [{ type: Schema.Types.ObjectId, ref: "Track" }],
        genres: [ String ],
        popularity: Number,
    }
)

const Artist = model("Artist", artistSchema);

module.exports = Artist;