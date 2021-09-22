const { Schema, model } = require("mongoose");

const trackSchema = new Schema(
    {
        name: String,
        spotifyId: String,
        artists: [Object],
        album: Object,
        availableMarkets: [ String ],
        previewUrl: String,
        durationMS: Number,
        popularity: Number,
        favoriteOwner: {
            type: Schema.Types.ObjectId, 
            ref: "User"
        }
    }
);

const Track = model("Track", trackSchema);

module.exports = Track;