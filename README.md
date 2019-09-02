Star Wars Characters and Comics App
===================================

This app provides users a list of Star Wars characters from the first seven movies. When the user selects a character, they receive a list of comics and magazines the character has appeared in.

URL
---
[Star Wars App Link](https://hudsonst.github.io/SW_app/index.html)

Home Page
---------
The app loads a list of characters from the SWAPI api. The user selects a character from the list, and the loading icon appears.

Results
-------
The app calls the SWAPI and ComicVine apis to populate the results. The results are returned in pages, 20 issues on each page. Each issue has the name and issue number as a caption. The character details and first page of results are loaded. The user can click the pages numbers on the pagination bar to navigate the rest of the results.

If there are no results, the user gets the message "Sorry, no match for `<character>` found".

Technology used
---------------
The app uses HTML, CSS, Javascript and JQuery.

Screenshots
-----------
[!Screenshot of home](/img/screenshot_home.png)
[!Screenshot of results 1](/img/screenshot_results1.png)
[!Screenshot of results 2](/img/screenshot_results2.png)
[!Screenshot of results 3](/img/screenshot_results3.png)



