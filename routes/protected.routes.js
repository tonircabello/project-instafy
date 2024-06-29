const express = require("express");
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const app = require("../app");
const User = require("../models/User.model");
const Publication = require("../models/Publication.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require('../config/cloudinary.config.js');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const upload = multer();
const bodyParser = require('body-parser');


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
      const userGenres = user.genres;
      const seedGenres = userGenres.length > 0 ? userGenres : ["reggae"];
      spotifyApi.getRecommendations({
        seed_genres: seedGenres, 
        min_popularity: 50,
        limit: 20 
      })
        .then((data) => {
          const albums1 = data.body.tracks;
          const otherPublications = [];
          Publication.find()
            .populate({ path: "user" })
            .then((publications) => {
              publications.forEach((publication) => {
                if (
                  publication.user._id.toString() !==
                  req.session.currentUser._id.toString()
                ) {
                  otherPublications.push(publication);
                  
                }
              });
              res.render("Protected/search", {
                albums: albums1,
                userPublications: user.publications,
                otherPublications: otherPublications,
                user: user,
              });
            });

        });
    });
});

router.get("/artist-search", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id).then((user) => {
  const search = req.query.artist;
  spotifyApi
    .searchArtists(search)
    .then((data) => {
      console.log(data.body.artists.items);
      res.render("Protected/artists.hbs", { artists: data.body.artists.items,user });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
})});

router.get("/albums/:artistId", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id).then((user) => {
  const artistId = req.params.artistId;
  spotifyApi
    .getArtistAlbums(artistId)
    .then((data) => {
      const albums = data.body.items;
      res.render("Protected/albums.hbs", { artistId, albums,user });
    })
    .catch((err) =>
      console.log("The error while searching albums occurred: ", err)
    );
})});

router.get("/tracks/:albumId", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id).then((user) => {
  const albumId = req.params.albumId;
  spotifyApi
    .getAlbumTracks(albumId)
    .then((data) => {
      const tracks = data.body.items;
      res.render("Protected/tracks.hbs", { tracks,user });
    })
    .catch((err) =>
      console.log("The error while searching tracks occurred: ", err)
    );
})});

router.get("/create-publication", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id).then((user) => {
  res.render("Protected/create-publication.hbs",{user});
})});
router.get("/userProfile", isLoggedIn, (req, res) => {
  User.findById(req.session.currentUser._id)
    .then((user) => {
      res.render("Protected/UserProfile.hbs", { user });
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
      res.status(500).send("Error fetching user profile.");
    });
});


router.post("/create-publication", isLoggedIn,fileUploader.single("publicationImage"), (req, res) => {
  
  const newPublication = {
    title: req.body.title,
    content: req.body.content,
    tags: req.body.tags,
    about: req.body.about,
    aboutType: req.body.aboutType,
    user: req.session.currentUser,
    publicationImage: req.body.publicationImage
  };
  console.log(newPublication)
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
  User.findById(req.session.currentUser._id).then((user) => {
  const publicationId = req.params.id;
  Publication.findById(publicationId).then((publication) => {
    if (publication.aboutType === "Ar") {
      spotifyApi.getArtist(publication.about).then((data) => {
        res.render("Protected/publication-details.hbs", {
          publication: publication,
          about: data.body,
          user:user,
        });
      });
    } else if (publication.aboutType === "Al") {
      spotifyApi.getAlbum(publication.about).then((data) => {
        res.render("Protected/publication-details.hbs", {
          publication: publication,
          about: data.body,
          user: user,
        });
      });
    } else if (publication.aboutType === "Tr") {
      spotifyApi.getTrack(publication.about).then((data) => {
        res.render("Protected/publication-song-details", {
          publication: publication,
          about: data.body,
          user: user,
        });
      });
    }
  });
})})

module.exports = router;
