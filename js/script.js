'use strict';
//API for Comic Vine
const apiKey = 'e8b99470591e7c5c3c1db6e743ec26ff8548ea82';
const searchURL = 'http://comicvine.gamespot.com/api/search/';

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getComics(character) {
    $('.loader').removeClass('hidden');
    const charArr = character.split("_");
    const char = charArr[0];
    const swURL = charArr[1];

    //Get Comic Vine comics
    const params = {
        query: char,
        resources: "character",
        format: "json",
        api_key: apiKey,
    };
    const queryString = formatQueryParams(params);
    const proxyurl = "https://cors-anywhere.herokuapp.com/"; //to bypass CORS issue
    const url = searchURL + '?' + queryString;

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => getSWAPIperson(swURL, responseJson, char))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong getting comics: ${err.message}`)
        });
};

function getSWAPIperson(swURL, cvresults, char){
    //Get SWAPI details
    fetch(swURL)
        .then(response => {
          if (response.ok) {
          return response.json();
      }
      throw new Error(response.statusText);
  })
  .then(swresponseJson => displayResults(cvresults, swresponseJson, char))
  .catch(err => {
    $('#js-error-message').text(`Something went wrong getting SWAPI person: ${err.message}`)
  });
};

function getSWAPIitems(swResults, propArr) {
  const urlArr = [];
  let filmCount = 0;
  propArr.forEach(prop => {
    if (Array.isArray(swResults[prop])) {
      urlArr.push(...swResults[prop])
    } else {
    urlArr.push(swResults[prop]);}
  });
  urlArr.forEach(url => {
      fetch(url)
          .then(response => {
              if (response.ok) {
                  return response.json();
              }
              throw new Error(response.statusText);
          })
          .then(responseJson => {
              if (url.includes("species")) {
                  $('.species').append(
                      `Species: ${responseJson.name}<br>`)
              };

              if (url.includes("planets")) {
                  $('.homeworld').append(
                      `Homeworld: ${responseJson.name}</p>`)
              };

              if (url.includes("films")) {
                if (filmCount === 0) {
                $('.films').append(
                    `Films:<br>${responseJson.title}`)
                    filmCount++;
                } else if (filmCount > 0) {
                $('.films').append(
                  `<br>${responseJson.title}`)
                  filmCount++;
                };
            };
            
          });
  });
};

function displayResults(cvResults, swResults, char) {
    // if there are previous results, remove them
    $('.swapi').empty();
    $('.old').empty();
    // iterate through the items array
    let match = 0;
    for (let i = 0; i < cvResults.results.length; i++) {
        const matchArr = ["Endor", "Stormtrooper", "Star Wars", "Skywalker", "X-Wing", "Death Star", "Yavin", "Jedi", "Padmé", "Palpatine", "Ewok"];

        // Because ComicVine's API returns too many results with no way to specify, we need to match. 
        if (cvResults.results.length === 0) {
            $('.result').append(
                `<li><h3>Sorry, no match for ${char} found.</h3>`);
        };


        // If it's just 1 return it's probably correct.
        if (cvResults.results.length === 1) {
            appendResults(cvResults.results[i],swResults)
            match++;
        }

        if (match === 0) {
            matchArr.forEach(term => {
                if (match === 0 && cvResults.results[i].deck !== null && cvResults.results[i].deck.includes(`${term}`)) {
                    appendResults(cvResults.results[i],swResults);
                    match++;
                } else if (match === 0 && cvResults.results[i].description !== null && cvResults.results[i].description.includes(`${term}`)) {
                    appendResults(cvResults.results[i],swResults);
                    match++;
                }
            })
        }
    };


    if (match === 0) {
        cvResults.results.forEach(name => {
            if (char === name.name || char === name.real_name) {
                appendResults(name);
                match++;
            }
        })
    };

    if (match === 0) {
        $('.result').append(
            `<h3 class="old">Sorry, no match for ${char} found.</h3>`);
    };

    //add old class to swapi results
    $('.swapi').addClass('old');
    //display the results section, remove loader
    $('.hidden').removeClass('hidden');
    $('.loader').addClass('hidden');
};


function appendResults(cvresults, swResults) {

$('.species').prepend(
    `<h3>${cvresults.name}</h3>`);

const swapiArr = ["species", "homeworld", "films"];
getSWAPIitems(swResults, swapiArr);
$('.species').append(`<img src="${cvresults.image.thumb_url}"/>`);
$('.deck').append(
  `
<p>Numbers of comic issues appeared in: ${cvresults.count_of_issue_appearances}</p>
<a href="${cvresults.site_detail_url}">${cvresults.site_detail_url}</a>
<p>${cvresults.deck}</p>
   `);
};


function displayCharacters(characters) {
  characters.forEach(obj => {
      obj.results.forEach(arr => {
        const name = arr.name;
        if (name && name.length) {
            const charSelect = `<option value="${name}_${arr.url}">${name}</option>`;
            const select = document.querySelector('.char_select');
            select.innerHTML += charSelect;
        }
    })
  });
  $('.loader').addClass('hidden');
};



function submit_form() {
    event.preventDefault();
    const character = document.getElementById("char").value;
    $('.loader').removeClass('hidden');
    getComics(character);
};

function list_all_characters() {

let i = "";

let urls = [];
for (i = 1; i < 10; i++) {
     const url = `https://swapi.co/api/people/?page=${i}`;
     urls.push(url);
    }

let promises = urls.map(url => fetch(url)
.then(response => {
  if (response.ok) {
      return response.json();
  }
  throw new Error(response.statusText);
}));
Promise.all(promises).then(results => displayCharacters(results));
};

list_all_characters();