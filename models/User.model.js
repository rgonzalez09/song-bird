const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    firstName: String,
    lastName: String,
    password: String,
    favoriteArtist: [{
      type: Schema.Types.ObjectId,
        ref: "Artist"
    }],
    favoriteAlbum: [{
      type: Schema.Types.ObjectId,
        ref: "Album"
    }],
    favoriteTrack: [{
      type: Schema.Types.ObjectId,
        ref: "Track"
    }],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
