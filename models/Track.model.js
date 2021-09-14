const { Schema, model } = require("mongoose");

const trackModel = new Schema(
    {
        name: String,
        id: String,
        artists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
        album: Schema.Types.ObjectId, ref: "Album",
        availableMarkets: [ String ],
        previewUrl: String,
        durationMS: Number,
    }
)

const Track = model("Track", trackSchema)

module.exports = Track;