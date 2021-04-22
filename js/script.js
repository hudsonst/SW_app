'use strict';
//API for Comic Vine
const apiKey = 'e8b99470591e7c5c3c1db6e743ec26ff8548ea82';
const searchURL = 'https://comicvine.gamespot.com/api/search/';

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function getComics(character) {
    $('.loader').removeClass('hidden');
    const charArr = character.split("_");
    const char = charArr[0];
    const swURL1 = charArr[1];
    const swURL = swURL1.replace("http", "https")

    //Get Comic Vine comics
    const params = {
        query: char,
        resources: "character",
        format: "json",
        api_key: apiKey,
    };
    const queryString = formatQueryParams(params);
    const proxyurl = "https://cors.bridged.cc/"; //to bypass CORS issue
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
            $('.loader').addClass('hidden');
            $('#js-error-message').text(`Something went wrong getting comics: ${err.message}`)
        });
};

function getComicsTable(charUrl) {
    const params = {
        format: "json",
        api_key: apiKey,
    };

    const queryString = formatQueryParams(params);
    const proxyurl = "https://cors.bridged.cc/"; //to bypass CORS issue
    const url = charUrl + '?' + queryString;

    fetch(proxyurl + url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayComicsTable(responseJson.results.issue_credits))
        .catch(err => {
            $('.loader').addClass('hidden');
            $('#js-error-message').text(`Something went wrong getting comics table: ${err.message}`)
        });
};

function getNextPage(issues, currentPage) {
    let urlArr = [];
    const num = 20; // how many results we want to return
    let maxNum = (currentPage * num);
    if (maxNum > issues.length) {
        maxNum = issues.length;
    }
    let i = (currentPage - 1); // index

    for (i = i * num; i < maxNum; i++) {
        const issue = issues[i].api_detail_url;
        if (issue) {
            urlArr.push(issue);
        };
    };
    return urlArr;
};

function displayComicsTable(issueCredits) {
    $('.pageLoader').removeClass('hidden');
    const num = 20; // how many results we want to return
    const pages = Math.ceil(issueCredits.length / num); //round up number of pages

    //set up page buttons
    let page = 1;
    for (let i = 1; i <= pages; i++) {
        const urlArr = getNextPage(issueCredits, page);
        const urlStringArr = urlArr.map(url => `'${url}'`).join(',');
        if (page === 1) {
            $('.pages').append(`<span class="page active" onclick="getComicUrls([${urlStringArr}], this)">${page}</span>`);
        } else {
            $('.pages').append(`<span class="page" onclick="getComicUrls([${urlStringArr}], this)">${page}</span>`);
        }
        page++
    };

    // append number of results
    $('.pages').prepend(`<span class="numResults">${issueCredits.length} results</span>`)

    //get first page of results
    const urlArr = getNextPage(issueCredits, 1);
    const activePage = $('.active');
    getComicUrls(urlArr, activePage);
};


function getComicUrls(urlArr, activePage) {

    //show page loader
    $('.pageLoader').removeClass('hidden')

    //highlight active page in nav bar
    $('.active').removeClass('active');
    $(activePage).addClass('active');

    //empty out comics table
    $('.table').empty();

    urlArr.forEach(url => {
        const params = {
            format: "json",
            api_key: apiKey,
        };

        const queryString = formatQueryParams(params);
        const proxyurl = "https://cors.bridged.cc/"; //to bypass CORS issue
        const finalUrl = url + '?' + queryString;

        fetch(proxyurl + finalUrl)
            .then(response => {
                if (response.ok) {

                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(responseJson => {
                if (responseJson.results.name === null) {
                    $('.table').append(`
        <li class="old"><figure><a href="${responseJson.results.site_detail_url}" target="_blank"><img class="issue" src="${responseJson.results.image.thumb_url}" alt="${responseJson.results.volume.name} Issue ${responseJson.results.issue_number}"/></a>
        <figcaption>${responseJson.results.volume.name} Issue ${responseJson.results.issue_number}</figcaption></figure>
        </li>
        `);
                } else {
                    $('.table').append(`
        <li class="old"><figure><a href="${responseJson.results.site_detail_url}" target="_blank"><img class="issue" src="${responseJson.results.image.thumb_url}" alt="${responseJson.results.volume.name} ${responseJson.results.name} Issue ${responseJson.results.issue_number}"/></a>
        <figcaption>${responseJson.results.volume.name} ${responseJson.results.name} Issue ${responseJson.results.issue_number}</figcaption></figure>
        </li>
        `);
                }
            })
            .catch(err => {
                $('.loader').addClass('hidden');
                $('#js-error-message').text(`Something went wrong getting comic URLs: ${err.message}`)
            })
    })
    $('.pageLoader').addClass('hidden');
};

function getSWAPIperson(swURL, cvresults, char) {
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
            $('.loader').addClass('hidden');
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
            urlArr.push(swResults[prop]);
        }
    });
    urlArr.forEach(url => {
        const url_https = url.replace("http", "https")
        fetch(url_https)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error(response.statusText);
            })
            .then(responseJson => {
                if (url_https.includes("species")) {
                    $('.species').append(
                        `Species: ${responseJson.name}<br>`)
                };

                if (url_https.includes("planets")) {
                    $('.homeworld').append(
                        `Homeworld: ${responseJson.name}</p>`)
                };

                if (url_https.includes("films")) {
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

            })
            .catch(err => {
                $('.loader').addClass('hidden');
                $('#js-error-message').text(`Something went wrong getting SWAPI items: ${err.message}`)
            });
    });
};

function displayResults(cvResults, swResults, char) {
    // if there are previous results, remove them
    $('.swapi').empty();
    $('.old').empty();

    // Because ComicVine's API returns too many results with no way to specify,
    // we need to match Star Wars terms to confirm character is correct. 
    let match = 0;
    let matchName = "";
    for (let i = 0; i < cvResults.results.length; i++) {
        const matchArr = ["Endor", "Stormtrooper", "Star Wars", "Skywalker", "X-Wing", "Death Star", "Yavin", "Jedi", "Padmé", "Palpatine", "Ewok", "Jabba", "Phasma", "Clone Wars", "Obi-Wan"];


        if (cvResults.results.length === 0) {
            $('.result').append(
                `<h3 class="old">Sorry, no match for ${char} found.</h3>`);
        };


        // If it's just 1 return it's probably correct.
        if (cvResults.results.length === 1) {
            appendResults(cvResults.results[i], swResults)
            matchName = cvResults.results[i];
            match++;
        }
        // If we haven't found a match yet, cycle thru the deck, and then the description to find the Star Wars terms.
        // Also check that they're not null.
        if (match === 0) {
            matchArr.forEach(term => {
                if (match === 0 && cvResults.results[i].deck !== null && cvResults.results[i].deck.includes(`${term}`)) {
                    appendResults(cvResults.results[i], swResults);
                    matchName = cvResults.results[i];
                    match++;
                } else if (match === 0 && cvResults.results[i].description !== null && cvResults.results[i].description.includes(`${term}`)) {
                    appendResults(cvResults.results[i], swResults);
                    matchName = cvResults.results[i];
                    match++;
                }
            })
        }
    };
    // If we haven't found a match yet, check to see if the character name from SWAPI and the one from ComicVine is an
    // EXACT match. If so, it's probably correct.
    if (match === 0) {
        cvResults.results.forEach(name => {
            if (char === name.name || char === name.real_name) {
                appendResults(name, swResults);
                matchName = name;
                match++;
            }
        })
    };

    //If there's a match, get the comics for that character
    if (match > 0) {
        getComicsTable(matchName.api_detail_url);
    }

    //display the results section, remove loader
    $('.hidden').removeClass('hidden');
    $('.loader').addClass('hidden');

    //add old class to swapi results
    $('.swapi').addClass('old');

    //If nothing matches, then display message
    if (match === 0) {
        $('.loader').addClass('hidden');
        $('.pageLoader').addClass('hidden');
        $('.comics').addClass('hidden');
        $('.result').append(
            `<h3 class="old">Sorry, no match for ${char} found.</h3>`);
    };
    // remove spaceholding block (for body border)
    $('.emptyblock').empty();
};


function appendResults(cvresults, swResults) {
    const swapiArr = ["species", "homeworld", "films"];
    getSWAPIitems(swResults, swapiArr);
    $('.thumb').prepend(`<img src="${cvresults.image.thumb_url}" alt="${cvresults.name}"/>`);
    $('.name').append(`${cvresults.name}`);
    $('.deck').append(
        `
<p>${cvresults.name} appears in ${cvresults.count_of_issue_appearances} comics and magazine articles.</p>
<p class="characterPage"><a href="${cvresults.site_detail_url}" target="_blank">${cvresults.name}'s Comic Vine Character Page</a></p>
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
    const character = $('.char_select').val();
    $('.loader').removeClass('hidden');
    getComics(character);
};

function list_all_characters() {

    let urls = [];
    for (let i = 1; i < 10; i++) {
        const url = `https://swapi.dev/api/people/?page=${i}`;
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