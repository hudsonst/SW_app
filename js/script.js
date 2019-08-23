'use strict';
//API for Comic Vine
const apiKey = 'e8b99470591e7c5c3c1db6e743ec26ff8548ea82';
const searchURL = 'http://comicvine.gamespot.com/api/search/';

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getComics(char, maxResults = 10) {
    const params = {
        query: char,
        resources: "character",
        format: "json",
        api_key: apiKey,
    };
    const queryString = formatQueryParams(params);
    const proxyurl = "https://cors-anywhere.herokuapp.com/"; //to bypass CORS issue
    const url = searchURL + '?' + queryString;

    console.log(url);

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson, char))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong getting comics: ${err.message}`)
        });;
}

function displayResults(responseJson, char) {
    // if there are previous results, remove them
    $('.old').empty();
    // iterate through the items array
    let match = 0;
    for (let i = 0; i < responseJson.results.length; i++) {
        const matchArr = ["Endor", "Stormtrooper", "Star Wars", "Skywalker", "X-Wing", "Death Star", "Yavin", "Jedi", "Padmé", "Palpatine", "Ewok"];

        // Because ComicVine's API returns too many results with no way to specify, we need to match. If it's just 1 return it's probably correct.
        if (responseJson.results.length === 0) {
            $('.result').append(
                `<li><h3>Sorry, no match for ${char} found.</h3>`);
        };

        if (responseJson.results.length === 1) {
            appendResults(responseJson.results[i])
            match++;
        }

        if (match === 0) {
            matchArr.forEach(term => {
                if (match === 0 && responseJson.results[i].deck !== null && responseJson.results[i].deck.includes(`${term}`)) {
                    appendResults(responseJson.results[i]);
                    console.log(`Deck matched! ${term}`);
                    match++;
                    console.log(`${match}`);
                } else if (match === 0 && responseJson.results[i].description !== null && responseJson.results[i].description.includes(`${term}`)) {
                    appendResults(responseJson.results[i]);
                    console.log(`Description matched! ${term}`);
                    match++;
                    console.log(`${match}`);
                }
            })
        }
    };


    if (match === 0) {
        responseJson.results.forEach(name => {
            if (char === name.name || char === name.real_name) {
                appendResults(name);
                match++;
            }
        })
    };

    if (match === 0) {
        $('.result').append(
            `<li><h3>Sorry, no match for ${char} found.</h3>`);
    };

    //display the results section  
    $('.hidden').removeClass('hidden');
};

function appendResults(results) {
    $('.result').append(
        `
   <h3>${results.name}</h3>
   <p class="thumb"><img src="${results.image.thumb_url}"/><p>
   <p>${results.deck}</p>

   <p>Numbers of comic issues appeared in: ${results.count_of_issue_appearances}</p>
   <a href="${results.site_detail_url}">${results.site_detail_url}</a>
   `);
};

function displayCharacters(characters) {
  characters.forEach(obj => {
      obj.results.forEach(arr => {
        const name = arr.name;
        if (name && name.length) {
            const charSelect = `<option value="${name}">${name}</option>`;
            const select = document.querySelector('.char_select');
            select.innerHTML += charSelect;
        }
    })
  });
};

function submit_form() {
    event.preventDefault();
    const character = document.getElementById("char").value;
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