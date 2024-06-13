const express = require('express');
const router = express.Router();
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



/* GET home page */
router.get("/", (req, res, next) => {
  spotifyApi
    .searchArtists("love")
    .then((data) => {
      console.log("The received data from the API: ", data.body);
      res.render(('Protected/search'), { artists: data.body.artists.items });
    })
    .catch((err) =>
      console.log("The error while searching artists occurred: ", err)
    );
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

module.exports = router;
