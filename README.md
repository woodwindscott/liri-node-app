# liri-node-app
Homework #10 - Bands in Town, Spotify, and OMDB API - command line interface

# Resources
GitHub Repo - https://github.com/woodwindscott/liri-node-app
Video Link - Full Demo: https://drive.google.com/file/d/1PyX3_lHchnsrU3eMXDfi0bFC8LPkGrNV/view

### User Instructions
## What to enter in the command line

1. `node liri.js concert-this <artist/band name here>`

   * This will search the Bands in Town Artist Events API for an artist and render the following information about each event:

     * Name of the venue
     * Venue location
     * Date of the Event

2. `node liri.js spotify-this-song '<song name here>'`

   * This will search Spotify and show the following information about the song:

     * Artist(s)
     * The song's name
     * A preview link of the song from Spotify
     * The album that the song is from

   * If no song is provided, then the program will default to "The Sign" by Ace of Base.

3. `node liri.js movie-this '<movie name here>'`

   * This will search the OMDB API and output the following information:

       * Title of the movie.
       * Year the movie came out.
       * IMDB Rating of the movie.
       * Rotten Tomatoes Rating of the movie.
       * Country where the movie was produced.
       * Language of the movie.
       * Plot of the movie.
       * Actors in the movie.

   * If no movie is entered, the program will output data for the movie 'Mr. Nobody.'

4. `node liri.js do-what-it-says`

   * LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.

     * The default will `spotify-this-song` for "I Want it That Way," as follows the text in `random.txt`.
     * The text in `random.txt` can be changed to run any of the LIRI commands.

*******************************************************

### Notes about the development process

## Technologies Used

1. Javascript
2. Node.js
3. fs (file system) package provided by node.js
4. dotenv package provided by node.js to store the API credentials for Spotify
5. NPM Modules:

    * node-spotify-api
    * axios
    * moment

## How the code is structured

There are basically four types of searches that can be run ("movie-this", "concert-this", "spotify-this-song", "do-what-it-says). These commands are taken in from the command line entry and a function runs through a switch statement to route the application to deliver the necessary data.  Each of these commands have their own functions.  "do-what-it-says" is unique in that it gets the search command and search terms from random.txt.  Once that information is gathered, we have to start back at the beginning of the application and go through the switch statement a second time to get the necessary data.

All of the search terms and resulting data are stored in log.txt.

## Problems encountered

1. The Spotify API was the most daunting aspect of this project, as the resulting JSON from every search is extremely dense.  I found that the data retrieved wasn't always exactly what I was looking for.  For example, if I search for the song "Shake It Off", it gets multiple results, but the first result links to a compilation album of popular songs by various artists.  I would have expected it to pull the song from the artist's own album where it first appeared.  The functionality still works just fine and I do find my way to the correct song, but I could not find a way to consistently get the result I want.

2. In the Spotify search, I wanted to provide a link to the 30-preview of each song, but not every song has that in the resulting JSON.  In order to avoid an error while displaying the data, I had to substitute a link to the album if there was no preview link available.

3. In the movie search, I ran into a similar problem with the Rotten Tomatoes rating.  While that exists for most movies, it doesn't exist for every movie ever produced.  When I searched for a movie that did not have a Rotten Tomatoes rating, there was an error.  So I check to see if that data is present in the JSON and if it is not there, replace the data with "Unavailable".

4. The concert search was tricky as well, because it provides a large number of results if the artist is actively touring.  I ultimately decided to display all of the results and worked to format it so it was readable in the terminal.

## Future Development

While this was a great exercise to get familiar with node.js and working on the back end, it would be great to see this as a web application where users could enter search terms from their browswer.