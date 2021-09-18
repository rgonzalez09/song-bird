require("dotenv").config();
const router = require("express").Router();
const axios = require("axios");
const SpotifyWebApi = require("spotify-web-api-node");

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});
// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

// ℹ️ Handles password encryption
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

router.post("/signup", isLoggedOut, (req, res) => {
  console.log(req.body);
  const { username, password, firstName, lastName } = req.body;

  if (!username) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your username.",
    });
  }

  if (password.length < 8) {
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

  // Search the database for a user with the username submitted in the form
  User.findOne({
    username,
  }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res.status(400).render("auth.signup", {
        errorMessage: "Username already taken.",
      });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          password: hashedPassword,
          firstName,
          lastName,
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user;
        res.redirect("/");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).render("auth/signup", {
            errorMessage: error.message,
          });
        }
        if (error.code === 11000) {
          return res.status(400).render("auth/signup", {
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
          });
        }
        return res.status(500).render("auth/signup", {
          errorMessage: error.message,
        });
      });
  });
});

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your username.",
    });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res.status(400).render("auth/login", {
      errorMessage: "Your password needs to be at least 8 characters long.",
    });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({
    username,
  })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
        });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).render("auth/login", {
            errorMessage: "Wrong credentials.",
          });
        }
        req.session.user = user;
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        return res.redirect("/");
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render("auth/logout", {
        errorMessage: err.message,
      });
    }
    res.redirect("/");
  });
});

router.get("/profile", (req, res, next) => {
  res.render("auth/profile");
});

router.get("/discover-events", (req, res, next) => {
  res.render("auth/discover-events");
});

router.get("/event-details", (req, res, next) => {
  res.render("auth/event-details");
});

// Search Routes
router.get("/search", (req, res, next) => {
  res.render("auth/search");
});

router.get("/search-results", (req, res) => {
  // console.log(req.query)
  spotifyApi
    .searchTracks(req.query.search, { limit: 10 })
    .then((trackResults) => {
      spotifyApi
        .searchArtists(req.query.search, { limit: 10 })
        .then((artistResults) => {
          spotifyApi
            .searchAlbums(req.query.search, { limit: 10 })
            .then((albumResults) => {
              // console.log({data: trackResults.body.tracks.items[0], artist: artistResults.body.artists.items})
              // const data = {
              //   artists: artistResults.body.artists.items,
              //   albums: albumResults.body.albums.items,
              //   tracks: trackResults.body.tracks.items,
              // }

              console.log("TRACKS:", trackResults.body.tracks.items);
              // console.log("ARTISTS:", artistResults.body.artists.items)
              // console.log("ALBUMS:", albumResults.body.albums.items)
              res.render("auth/search-results", {
                tracksData: trackResults.body.tracks.items,
                artistsData: artistResults.body.artists.items,
                albumsData: albumResults.body.albums.items,
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// const { name, spotifyId: id, imageUrl: images, albums, tracks, genres, popularity } = req.body;

// router.get("/search-results/:id", (req, res) => {
//   // console.log(req.params.id);
//     spotifyApi
//     .getTrack(req.params.id)
//     .then((trackDetails) => {
//       console.log(trackDetails.body)
//       res.render("auth/search-results-details", { tracksData: trackDetails.body })
//     }).catch(err => console.log(err))

//   if (req.params?.id) {
//     spotifyApi
//     .getArtist(req.params.id)
//     .then((artistDetails) => {
//       console.log(artistDetails.body)
//       res.render("auth/search-results-details", { artistsData: artistDetails })
//     }).catch(err => console.log(err))
//   }
//   if (req.params?.id) {
//     spotifyApi
//     .getAlbum(req.params.id)
//     .then((albumDetails) => {
//       console.log(albumDetails.body)
//       res.render("auth/search-results-details", { albumsData: albumDetails })
//     }).catch(err => console.log(err))
//   }
// })

router.get("/search-results/:searchType/:id", (req, res) => {
  // console.log(req.params.id);
  const search =
    req.params.searchType === "tracks"
      ? spotifyApi.getTrack(req.params.id)
      : req.params.searchType === "albums"
      ? spotifyApi.getAlbum(req.params.id)
      : spotifyApi.getArtist(req.params.id);

  search
    .then((results) => {
      // console.log(trackDetails.body)
      // search
      // .then((artistDetails) => {
      //   // console.log(artistDetails.body)
      //   search
      //   .then((albumDetails) => {
      // console.log(results.body)

      const data = {
        results: results.body,
        trackResults: req.params.searchType === "tracks",
        albumResults: req.params.searchType === "albums",
        artistResults: req.params.searchType === "artists",
      };

      // console.log({ data });
      res.render("auth/search-results-details", data);
      //   }).catch(err => console.log(err))
      // }).catch(err => console.log(err))
    })
    .catch((err) => console.log(err));
});

router.get("/userlist", (req, res, next) => {
  User.find().then((users) => {
    //console.log(users[0]);
    res.render("auth/userlist", { users });
  });
});

module.exports = router;
