"use strict";
(function() {
    let results = new Map();
    let lyricsArray = [];

    console.log(results);
    /**
    * Event listener that is called when the window loads for the initiation of a page to be set up
    */
    window.addEventListener("load", init);



    /**
   * Function is called upon window loading. Makes sure there is an initial idea in the current
   * area, as well as setting up the buttons on the screen.
   */
    function init() {
        document.getElementById("title-link").addEventListener("click", function(event) {
            event.preventDefault(); // Prevent the default anchor behavior
            // Clear the search input
            document.getElementById("search-term").value = "";
            // Clear the display area
            document.getElementById("display").innerHTML = "";
            // Optionally, clear any error messages
            document.getElementById("error").classList.add("hidden");
        });
        id("search-btn").addEventListener("click", searchClick);

        id("search-term").addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                // If the Enter key was pressed, call the searchClick function
                searchClick();
            }
        });
    }

    /**
    * Called when the keep button is clicked on. The function stores the current idea into the
    * inventory and kept just incase the viewer wants to look at it later.
    */
    function searchClick() {
        id("display").innerHTML = "";
        let searchTerm = id("search-term").value;
        id("search-term").value = "";
        processSearch(searchTerm);
        //fetchSongs(searchTerm);
        id("search-term").value = searchTerm;
    }

    /**
     *
     * @param res array of objects containing the song title and the song lyrics
     * @param acronym the searched acronym
     **/
    function processResponse(res ,acronym) {
        // loops through entire array of songs and lyrics
        for(let i = 0; i < res.length; i++) {
            let currName = res[i].song; // current song title
            let currLyrics = res[i].content; // lyrics of current song
            let originalDict = res[i].content; // lyrics of current song
            originalDict = originalDict.replace(/[()]/g, '');
            originalDict = originalDict.replace(/…/g, '...');
            originalDict = originalDict.replace(/-/g, " ");
            originalDict = originalDict.split(/\s+/);
            originalDict = originalDict.filter(token => token !== '...');
            originalDict = originalDict.filter(token => !/^[\p{P}]+$/u.test(token));

            currLyrics = currLyrics.replace(/-/g, " ");
            currLyrics = currLyrics.replace(/[^\sA-Za-z0-9]/g, "");
            currLyrics = currLyrics.replace(/[\n\r]/g, " ");

            // dictarr is array of strings representing the lyrics separated word by word
            let dictarr = currLyrics.split(' ');
            dictarr = dictarr.filter(token => token !== '');
            console.log('original dict ' + originalDict);
            console.log('curr lyrics' + currLyrics);

            let songMap = makeMap(dictarr);
            // console.log(originalDict);
            console.log('currName' + currName);

            findPhrase(songMap, dictarr, acronym, 0, currName, results, originalDict);
            //console.log(results);
        }
        console.log(results);


        let displayUL = id("display");
        displayUL.innerHTML = "";

        let totalSongs = results.size;
        let totalResults = 0;
        results.forEach(set => {
            totalResults += set.size;
        });
        let displayDone = gen("p");
        displayDone.classList.add("total-info");
        if (totalSongs == 1) {
            displayDone.textContent = `Found ${totalResults} possible match in ${totalSongs} song`;
        } else {
            displayDone.textContent = `Found ${totalResults} possible matches in ${totalSongs} songs`;
        }
        id("display").appendChild(displayDone);

        // this is for lyric and title on separate line
        results.forEach((lyrics, song) => {
            lyrics.forEach(lyric => {
                // create a div to group each lyric and song title
                let songDiv = gen("div");
                songDiv.classList.add("song-group");

                // create an element for the lyric
                let lyricElement = gen("p");
                lyricElement.textContent = lyric;
                lyricElement.classList.add("lyric-item");
                songDiv.appendChild(lyricElement);

                // create an element for the song title
                let songTitleElement = gen("p");
                songTitleElement.textContent = song;
                songTitleElement.classList.add("song-title");
                songDiv.appendChild(songTitleElement);

                // append the song div to the display area
                displayUL.appendChild(songDiv);
            });
        });

        //console.log(results);
        results.clear();
    }


    /**
     *  creates a map of a song's lyrics, indexing each word
     *  map {string -> array of int} / map {word -> array of indexes where word appears }
     * @param dict array of strings / song lyrics separated word by word in an array
     * @returns {Map<any, any>}
     */
    function makeMap(dict) {
        //makes map after making dictionary
        var map = new Map();
        for (var i = 0; i < dict.length; i++) {
            addTo(map, dict[i], i);
        }
        console.log(map);
        return map;
    }

    /**
     * finding a matching lyric section in a song
     *
     * @param map map of song lyrics and indexes each word appears
     * @param dict array of strings representing the lyrics
     * @param acronym the acronym being searched
     * @param count counter starting at 0, increments by 1 until acronym length reached
     * @param song songtitle
     * @param results overal results map
     * @param originalDict lyrics with words separated by comma
     */
    function findPhrase(map, dict, acronym, count, song, results, originalDict) {
        // iterate over each key in the map (each word in lyrics)
        for (const key of map.keys()) {
            // get the list of indexes where the current word appears in song
            const currList = map.get(key);

            // iterate over each index in the current list
            for (const i of currList) {
                //check if the next index in the lyrics is within song lyric bounds
                if (i + count < dict.length) {
                    // check if word at current index matches current character in acronym
                    if (dict[i + count].length > 0 && dict[i + count][0].toLowerCase() === acronym[count].toLowerCase()) {
                        // create new map to track current phrase
                        const newMap = new Map();
                        addTo(newMap, dict[i], i);

                        // if end of acronym length and the entire acronym is a match, create and add the phrase to the results.
                        if (count === acronym.length - 1) {
                            const ret = makePhrase(originalDict, i, acronym);
                            mapAdd(song, ret, results); // adds phrase to results map
                        } else {
                            // otherwise letter is a match so check if next word matches next character in the acronym
                            findPhrase(newMap, dict, acronym, count + 1, song, results, originalDict);
                        }
                    }
                }
            }
        }
    }


    /**
     * creates the phrase that matches the acronym
     * @param dict array of a song's lyrics
     * @param i index to start the result phrase
     * @param acronym the acronym
     * @returns {string} the result matching lyrics phrase
     */
    function makePhrase(dict, i, acronym) {
        console.log(dict);
        let ret = '"' + dict[i];
        for (let j = 1; j < acronym.length; j++) {
            ret += ' ' + dict[i + j];
        }
        ret += '"';
        return ret;
    }

    /**
     * Processes the acronym search using cached song data.
     * @param acronym The acronym searched.
     */
    function processSearch(acronym) {
        if (lyricsArray.length === 0) {
            console.error('Song data has not been loaded yet.');
            return;
        }

        // Pass the cached lyrics array to the function that handles them
        processResponse(lyricsArray, acronym);
    }

    /**
    * helper function for adding the index of where each word appears to the map
    * @param map map that is being added to
    * @param word
    * @param i index
    */
    function addTo(map, word, i) {
        if (!map.has(word)) {
            map.set(word, []);
        }
        map.get(word).push(i);
    }

    /**
     * adds the phrase to the results map
     * @param song song title
     * @param phrase song lyric phrase matching the acronym
     * @param map the results map
     */
    function mapAdd(song, phrase, map) {
        if (!map.has(song)) {
            map.set(song, new Set());
        }
        map.get(song).add(phrase);
    }


    /**
     * gets all the song titles and lyrics
     * old way // now instead of fetching songs every search, song data stored initially
     * @param acronym the acronym searched
     */
    function fetchSongs(acronym) {
        fetch('lyrics.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {


                // map the data to create an array of objects with song titles and lyrics
                const lyricsArray = data.map(item => {
                    return {
                        song: item.song,
                        content: item.content
                    };
                });

                // pass the processed lyrics to the function that handles them
                processResponse(lyricsArray, acronym);
            })
            .catch(error => {
                console.error('Error fetching or processing the JSON file:', error);
                errorHandler();
            });
    }

    // fetch the song data once when the page loads
    function fetchAndStoreSongs() {
        fetch('lyrics.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // map the data to create an array of objects with song titles and lyrics
                 lyricsArray = data.map(item => ({
                    song: item.song,
                    content: item.content
                }));
            })
            .catch(error => {
                console.error('Error fetching or processing the JSON file:', error);
            });
    }

    // call this function once when the page loads
    fetchAndStoreSongs();


    /**
    * Called when an error needs to be handled, and gives something to happen when an error occures
    */
    function errorHandler() {
        let errorMessage = gen("p");
        errorMessage.textContent = "Sorry in the fetching";
        id("display").appendChild(errorMessage);
    }

    /**
    * This function checks if this bored object is alright to use.
    * @param {Object} res The promise object
    * @returns {object} The checked promise object
    */
    async function statusCheck(res) {
        if (!res.ok) {
            throw new Error(await res.text());
        }
        return res;
    }

    /**
    * The function takes in an element id and returns the pointer of the element passed in
    * @param {string} id - element ID.
    * @returns {object} - DOM object associated with id.
    */
    function id(id) {
        return document.getElementById(id);
    }

    /**
    * This funciton generates and element based on what is passed in (tagName)
    * @param {string} tagName - the name of the element I want to create
    * @return {element}} the element I wanted to create
    */
    function gen(tagName) {
        return document.createElement(tagName);
    }
})();
