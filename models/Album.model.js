const { Schema, model } = require("mongoose");

const albumSchema = new Schema({
  name: String,
  spotifyId: String,
  images: [Object],
  artists: [Object],
  tracks: [Object],
  genres: [String],
  releaseDate: String,
  popularity: Number,
  totalTracks: Number,
  type: String,
  favoriteOwner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Album = model("Album", albumSchema);

module.exports = Album;
