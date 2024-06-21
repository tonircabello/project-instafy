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

    // Get Recommendations Based on Seeds Función para obtener recomendaciones de artistas
async function getRecommendedArtists() {
  try {
    const data = await spotifyApi.getRecommendations({
      min_energy: 0.4,
      seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'], // IDs de artistas para referência
      min_popularity: 50
    });
    return data.body.tracks.map(track => track.artists[0]);
  } catch (err) {
    console.error("Something's gone wrong!", err);
    return [];
  }
}

// Função para obter recomendações de artistas
async function getRecommendedArtists() {
  try {
    const data = await spotifyApi.getRecommendations({
      seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'], // IDs de artistas que você gosta
      seed_genres: ['pop', 'rock'], // Gêneros de música que você gosta
      min_popularity: 50,
      limit: 10 // Limite de recomendações
    });
    return data.body.tracks.map(track => track.artists[0]);
  } catch (err) {
    console.error("Erro ao obter recomendações de artistas!", err);
    return [];
  }
}
/*
// Get available genre seeds
spotifyApi.getAvailableGenreSeeds()
.then(function(data) {
let genreSeeds = data.body;
console.log(genreSeeds);
}, function(err) {
console.log('Something went wrong!', err);
}); */

/* GET home page */
router.get("/", isLoggedIn, (req, res, next) => {
  Publication.find().then((userPublications) => {
    spotifyApi
      .searchArtists("love")
      .then((data) => {
        res.render("Protected/search", {
          artists: data.body.artists.items,
          publications: userPublications,
        });
      })
      .catch((err) =>
        console.log("The error while searching artists occurred: ", err)
      );
  });
});
router.get('/',isLoggedIn, async (req, res) => {
  const artists = await getRecommendedArtists();
  res.render('Protected/search', { artists });
});
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const userPublications = await Publication.find(); // Assumindo que Publication é um modelo Mongoose ou similar
    const recommendedArtists = await getRecommendedArtists();

    res.render("Protected/search", {
      artists: recommendedArtists,
      publications: userPublications,
    });
  } catch (err) {
    console.error("Erro ao obter dados para a página inicial", err);
    res.status(500).send("Erro ao carregar a página");
  }
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
    // Retrieve the user from the database
    User.findById(req.session.currentUser._id).then((user) => {
      // Update the user document by pushing the new publication to the publications array
      user.publications.push(data);
      user.save().then(() => {
        res.redirect("/");
      });
    });
  });
});



module.exports = router;
