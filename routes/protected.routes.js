const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const app = require("../app");
const User = require("../models/User.model");
const Publication = require("../models/Publication.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

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

/* GET home page */
router.get("/", isLoggedIn, (req, res, next) => {
  User.findById(req.session.currentUser._id)
    .populate({ path: "publications" })
    .then((user) => {
      spotifyApi
      .getRecommendations({
        seed_genres: ['pop', 'rock'], 
        min_popularity: 50,
        limit: 20 
      })
      .then((data) => {
        const albums1 = data.body.tracks;
          res.render("Protected/search", {
            albums: albums1,
            publications: user.publications,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      })
      .catch((err) =>
        console.log("The error while searching artists occurred: ", err)
      );
  });


router.get("/artist-search", isLoggedIn, (req, res) => {
  const search = req.query.artist;
  spotifyApi
    .searchArtists(search)
    .then((data) => {
      console.log(data.body.artists.items);
      res.render("Protected/artists.hbs", { artists: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

router.get("/albums/:artistId", isLoggedIn, (req, res) => {
  const artistId = req.params.artistId;
  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      const albums = data.body.items;
      res.render("Protected/albums.hbs", { artistId, albums });
    })
    .catch((err) =>
      console.log("The error while searching albums occurred: ", err)
    );
});

router.get("/tracks/:albumId", isLoggedIn, (req, res) => {
  const albumId = req.params.albumId;
  spotifyApi
    .getAlbumTracks(albumId)
    .then((data) => {
      const tracks = data.body.items;
      res.render("Protected/tracks.hbs", { tracks });
    })
    .catch((err) =>
      console.log("The error while searching tracks occurred: ", err)
    );
});

router.get("/create-publication", isLoggedIn, (req, res) => {
  res.render("Protected/create-publication.hbs");
});

router.post("/create-publication", isLoggedIn, (req, res) => {
  const newPublication = {
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
    about: req.body.about,
    user: req.session.currentUser,
  };

  Publication.create(newPublication).then((data) => {
    User.findById(req.session.currentUser._id).then((user) => {
      user.publications.push(data);
      user.save().then(() => {
        res.redirect("/");
      });
    });
  });
});

router.get("/publication-details/:id", isLoggedIn, (req, res) => {
  const publicationId = req.params.id;
  Publication.findById(publicationId).then((publication) => {
    console.log(publication);
    res.render("Protected/publication-details.hbs", {publication: publication });
  });
});

module.exports = router;
