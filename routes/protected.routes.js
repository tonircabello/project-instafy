const express = require('express');
const router = express.Router();
const SpotifyWebApi = require("spotify-web-api-node");
const app = require('../app');


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
router.get("/", (req, res, next) => {
  res.render('Protected/search')
});

router.get("/artist-search", (req, res) => {
  const search = req.query.artist;
  spotifyApi
    .searchArtists(search)
    .then((data) => {
      console.log("The received data from the API: ", data.body);
      res.render("Protected/artists.hbs", { artists: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
});

router.get('/albums/:artistId', (req, res) => {
  const artistId = req.params.artistId;
  spotifyApi.getArtistAlbums(artistId)
    .then(data => {
      const albums = data.body.items;
      res.render('/Protected/albums.hbs', { artistId, albums });
    })
    .catch(err => console.log('The error while searching albums occurred: ', err));
});

router.get('/tracks/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  spotifyApi.getAlbumTracks(albumId)
    .then(data => {
      const tracks = data.body.items;
      res.render('Protected/tracks.hbs', { tracks });
    })
    .catch(err => console.log('The error while searching tracks occurred: ', err));
});


module.exports = router;
