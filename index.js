"use strict";
(function() {
  let results = new Map();
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
    id("search-btn").addEventListener("click", searchClick);
    // id("search-term").addEventListener("input", function() {
    //     let hasText = id("search-term").value.length > 0;
    //     id("search-btn").disabled = !hasText;
    //   });

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
    // id("search-btn").disabled = true;
    let listActivity = gen("li");
    listActivity = fetchSongs(searchTerm);
    //id("display").appendChild(listActivity);
    id("search-term").value = searchTerm;
  }

  /**
   * Attaches the name of the activity that was generated earlier. This shows the prmise to the
   * viewer to look at.
   * @param {Object} response The API object that was generated earlier in the promise chain
   */
  function proccessResponse(res ,acronym) {
    var Path, foundFiles, aFile, Path, attr, i, e, dyear;
    var DateVal, Handle, FileDate, ReadOnlyFile;
    console.log('RES: '+ res);
    for(let i = 0; i < res.length; i++){
      console.log("SONG TITLE: " + res[i].song);
      let currName = res[i].song; //name; ex: 'tis_the_damn_season.txt'
      let currLyrics = res[i].content; //Lyrics
      let originalDict = res[i].content;
      originalDict = originalDict.replace(/[()]/g, '');
      originalDict = originalDict.replace(/…/g, '...');
      originalDict = originalDict.replace(/-/g, " ");
      originalDict = originalDict.split(/\s+/);
      originalDict = originalDict.filter(token => token !== '...');
      originalDict = originalDict.filter(token => !/^[\p{P}]+$/u.test(token));
      //originalDict = originalDict.match(/[\w'-]+|[.,!?;:"']/g);

      currLyrics = currLyrics.replace(/-/g, " ");
      currLyrics = currLyrics.replace(/[^\sA-Za-z0-9]/g, "");
      currLyrics = currLyrics.replace(/[\n\r]/g, " ");
      let dictarr = currLyrics.split(' ');
      dictarr = dictarr.filter(token => token !== '');
      //console.log(dictarr);
      let songMap = makeMap(dictarr);
     // console.log(originalDict);
      console.log('currName' + currName);
      findPhrase(songMap, dictarr, acronym, 0, currName, results, originalDict);
      //console.log(results);
      
    }
    console.log(results);
    let done = convert(results);
    console.log(done);
    // if (done.length == 0) {
    //   displayDone.textContent("No results found");
    // }

    let displayUL = id("display");
    displayUL.innerHTML = "";

    // this is for single line output
    //   results.forEach((lyrics, song) => {
    //       lyrics.forEach(lyric => {
    //           // Create a div to group each song and its lyric
    //           let songDiv = gen("div");
    //           songDiv.classList.add("song-group");
    //
    //           // Create an element for the combined lyric and song title
    //           let combinedElement = gen("p");
    //           combinedElement.innerHTML = `${lyric} <span class="song-title">${song}</span>`;
    //           combinedElement.classList.add("lyric-item");
    //           songDiv.appendChild(combinedElement);
    //
    //           displayUL.appendChild(songDiv);
    //       });
    //   });

      // this is for lyric and title on separate line
      results.forEach((lyrics, song) => {
          lyrics.forEach(lyric => {
              // Create a div to group each lyric and song title
              let songDiv = gen("div");
              songDiv.classList.add("song-group");

              // Create an element for the lyric
              let lyricElement = gen("p");
              lyricElement.textContent = lyric;
              lyricElement.classList.add("lyric-item");
              songDiv.appendChild(lyricElement);

              // Create an element for the song title
              let songTitleElement = gen("p");
              songTitleElement.textContent = song;
              songTitleElement.classList.add("song-title");
              songDiv.appendChild(songTitleElement);

              // Append the song div to the display area
              displayUL.appendChild(songDiv);
          });
      });

      if (results.size == 0) {
          let displayDone = gen("p");
          displayDone.textContent = "No results found";
          id("display").appendChild(displayDone);
      }
      // this is the original simple way
    // for(let i = 0; i < done.length; i++){
    //   let displayDone = gen("li");
    //   displayDone.textContent = done[i];
    //   console.log(done[i]);
    //   id("display").appendChild(displayDone);
    // }
    // if (done.length == 0) {
    //   let displayDone = gen("p");
    //   displayDone.textContent = "No results found";
    //   id("display").appendChild(displayDone);
    // }
    
    console.log(results);
    results.clear();


  }

  function dictMaker(songName) {
    const content = fs.readFileSync(songName, 'utf-8');
    const dictionary = content.split(/\s+/).map(token => token.replace(/[^a-zA-Z0-9]/g, '').toLowerCase());
    return dictionary;
  }

  function makeMap(dict) {

    //makes map after making dictionary
    var map = new Map();
    for (var i = 0; i < dict.length; i++) {
        addTo(map, dict[i], i);
    }
    return map;
  }

  function findPhrase(map, dict, acronym, count, song, results, originalDict) {
    // console.log(map);
    // console.log(dict);
    // console.log(acronym);
     console.log('IN FINDPHRASE .. song' + song);
    // console.log(results);
    for (const key of map.keys()) {
        
        const currList = map.get(key);
        for (const i of currList) {
            if (i + count < dict.length) {
                if (dict[i + count].length > 0 && dict[i + count][0].toLowerCase() === acronym[count].toLowerCase()) {
                    const newMap = new Map();
                    addTo(newMap, dict[i], i);
                    if (count === acronym.length - 1) {
                        const ret = makePhrase(originalDict, i, acronym);
                        mapAdd(song, ret, results);
                    } else {
                        findPhrase(newMap, dict, acronym, count + 1, song, results, originalDict);
                    }
                }
            }
        }
    }
  }

  
  

  function makePhrase(dict, i, acronym) {
    console.log(dict);
    let ret = '"' + dict[i];
    for (let j = 1; j < acronym.length; j++) {
        ret += ' ' + dict[i + j];
    }
    ret += '"';
    return ret;
  }

  function addTo(map, word, i) {
    if (!map.has(word)) {
        map.set(word, []);
    }
    map.get(word).push(i);
  }

  function resultsAdd() {

    // add to final map
  }

  function mapAdd(song, phrase, map) {
    console.log('IN mapAdd .. song ' + song);
    if (!map.has(song)) {
        map.set(song, new Set());
    }
    map.get(song).add(phrase);
  }

  function convert(map) {
    const list = [];
    for (const [key, phrases] of map.entries()) {
        for (const phrase of phrases) {
            // this line below is for the original version
            //const songTitle = key.substring(0, key.length - 4).replace(/_/g, ' ');
            const songTitle = key;
            const one = `${phrase} (${songTitle})`;
            list.push(one);
        }
    }
      console.log(list);
    return list;
  }

  /**
  function fetchSongs (acronym) {
    fetch("/mang")
      .then(statusCheck)
      .then(res => res.json())
      .then(function(res) {
        console.log(res);
        proccessResponse(res, acronym);
      })
      //.catch(errorHandler);
  }**/
  /**
   * THIS ONE WORKS
   * @param acronym

  function fetchSongs(acronym) {
    const artist = 'Taylor Swift'; // Set artist name
    const songTitles = ['Down Bad', 'loml', 'Slut!', 'Blank Space', 'Better Than Revenge(Taylor\'s Version)', 'All Too Well (10 Minute Version) (Taylor\'s Version) (From The Vault)', 'The Very First Night (Taylor\'s Version) (From The Vault)']; // Example song titles

    const promises = songTitles.map(title => {
      const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;

      return fetch(url)
          .then(statusCheck)
          .then(res => res.json())
          .then(data => {
            if (data.lyrics) {
              return { song: title, content: data.lyrics };
            } else {
              return { song: title, content: "No lyrics found." };
            }
          })
          .catch(error => {
            console.error(`Error fetching lyrics for ${title}:`, error);
            return { song: title, content: "Error fetching lyrics." };
          });
    });

    Promise.all(promises)
        .then(responses => {
          proccessResponse(responses, acronym);
        })
        .catch(error => {
          errorHandler();
        });
  }

  **/

    /**
     * THIS ALSO WORKS
     * @param acronym
     */

  // function fetchSongs(acronym) {
  //   fetch('test.json')
  //       .then(statusCheck)
  //       .then(res => res.json())
  //       .then(data => {
  //         const artist = 'Taylor Swift';
  //         const songTitles = data.songs;
  //         console.log('DATA SONGS ' +  songTitles);
  //
  //         const promises = songTitles.map(title => {
  //           const url = `https://api.lyrics.ovh/v1/${artist}/${title}`;
  //
  //           return fetch(url)
  //               .then(statusCheck)
  //               .then(res => res.json())
  //               .then(data => {
  //                 if (data.lyrics) {
  //                   return { song: title, content: data.lyrics };
  //                 } else {
  //                   return { song: title, content: "No lyrics found." };
  //                 }
  //               })
  //               .catch(error => {
  //                 console.error(`Error fetching lyrics for ${title}:`, error);
  //                 return { song: title, content: "Error fetching lyrics." };
  //               });
  //         });
  //
  //         Promise.all(promises)
  //             .then(responses => {
  //               proccessResponse(responses, acronym);
  //             })
  //             .catch(error => {
  //               errorHandler();
  //             });
  //       })
  //       .catch(error => {
  //         errorHandler();
  //       });
  // }

    function fetchSongs(acronym) {
        fetch('lyrics.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Process the JSON data
                console.log('DATA:', data);

                // Map the data to create an array of objects with song titles and lyrics
                const lyricsArray = data.map(item => {
                    return {
                        song: item.song,
                        content: item.content
                    };
                });

                // Pass the processed lyrics to the function that handles them
                proccessResponse(lyricsArray, acronym);
            })
            .catch(error => {
                console.error('Error fetching or processing the JSON file:', error);
                errorHandler();
            });
    }


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