// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  const tokenUrl = "https://accounts.spotify.com/api/token";

  let accessToken = ""; // Declare accessToken variable in a scope accessible to both fetches

  // Function to fetch access token
  function fetchAccessToken() {
    fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `grant_type=client_credentials&client_id=${"d64ddd06cf434e508ad8f6689c54b5bb"}&client_secret=${"5d9f7d1458e647dba256db3c4423d531"}`,
    })
      .then((response) => response.json())
      .then((data) => {
        accessToken = data.access_token; // Store the access token in the variable
        // You can perform additional actions here if needed
      })
      .catch((error) => {
        console.error("Error getting access token:", error);
      });
  }

  const button = document.getElementById("search-publication-button");

  button.addEventListener("click", function (event) {
    event.preventDefault();
    fetchAccessToken();
    const artistsSearched = document.getElementById("search");
    const formSelect = document.getElementById("publication")
    const optionSelected = document.getElementById("optionSelected").value;
    const option = document.getElementById("option").value;
    if (optionSelected === "Ar") {
      fetch(
        `https://api.spotify.com/v1/search/?q=artist:${option}&type=artist`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          artistsSearched.innerHTML = ``;
          formSelect.innerHTML = ``
          for (let i = 0; i < 3; i++) {
            if (data.artists.items[i].images[1].url) {
              console.log(data.artists.items[i].id);
              artistsSearched.innerHTML += `>
              <div class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-2 mb-2">
                  <img class="p-8 rounded-t-lg" src="${data.artists.items[i].images[1].url}" alt="Artist image" />
                  <div class="px-5 pb-5">
                      <h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">${data.artists.items[i].name}</h5>
                  </div>
              </div>
            `;
              formSelect.innerHTML += `
              <option class="text-white" value="${data.artists.items[i].id}">${data.artists.items[i].
              name}</option>
              `
            }
          }
        })
        .catch((err) =>
          console.log("The error while searching artists occurred: ", err)
        );
    } else if (optionSelected === "Al") {
      fetch(`https://api.spotify.com/v1/search/?q=album:${option}&type=album`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          artistsSearched.innerHTML = ``;
          formSelect.innerHTML = ``;
          for (let i = 0; i < 3; i++) {
            if (data.albums.items[i].images[1].url) {
              artistsSearched.innerHTML += `>
              <div class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-2 mb-2">
                  <img class="p-8 rounded-t-lg" src="${data.albums.items[i].images[1].url}" alt="Artist image" />
                  <div class="px-5 pb-5">
                      <h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">${data.albums.items[i].name}</h5>
                  </div>
              </div>
            `;
            formSelect.innerHTML += `
              <option class="text-white" value="${data.albums.items[i].id}">${data.albums.items[i].
              name}</option>
              `
            }
          }
        })
        .catch((err) =>
          console.log("The error while searching artists occurred: ", err)
        );
    } else if (optionSelected === "Tr") {
      fetch(`https://api.spotify.com/v1/search/?q=track:${option}&type=track`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          artistsSearched.innerHTML = ``;
          formSelect.innerHTML = ``
          for (let i = 0; i < 3; i++) {
            let id = i 
            if (data.tracks.items[i].album.images[1].url) {
              artistsSearched.innerHTML += `>
              <div class="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 mt-2 mb-2">
                  <img class="p-8 rounded-t-lg" src="${data.tracks.items[i].album.images[1].url}" alt="Artist image" />
                  <div id="" class="px-5 pb-5">
                      <h5 class="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">${data.tracks.items[i].name}</h5>
                      <audio controls>
                        <source src="${data.tracks.items[i].preview_url}" type="audio/mpeg">
                        Your browser does not support the audio element.
                      </audio>)
                  </div>
              </div>
            `;
            formSelect.innerHTML += `
              <option class="text-white" value="${data.tracks.items[i].id}">${data.tracks.items[i].
              name}</option>
              `
            }           
          }
        })
        .catch((err) =>
          console.log("The error while searching artists occurred: ", err)
        );
    }
  });
});
