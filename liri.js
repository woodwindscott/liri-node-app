// Necessary to access .env file with Spotify API credentials
require("dotenv").config();

// Require modules
var fs = require("fs");
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var axios = require("axios");
var moment = require("moment");

// Determines which API is called during the command line entry
var myCommand = process.argv[2];

// Default values for movie and song search if nothing is entered
var movieSearch = "Mr. Nobody";
var songQuery = "The Sign Ace of Base";

// Variables to be accessed later
var isTextCommand = false;
var artist = "";
var displayData = [];
var finalData = "";

// Declaration of variable to be used in for loop to enter full search terms
var myString = "";


// This is the main run of the program that handles the command line entry and routes it through the proper functions.
function mainSearch() {

    switch (myCommand) {

        case "movie-this":
            movie();
            break;

        case "concert-this":
            bands();
            break;
        
        case "spotify-this-song":
            song();
            break;

        case "do-what-it-says":
            isTextCommand = true; // Necessary for creating myString to rerun the command from do-what-it-says
            textCommand();
            break;
    }

} // end mainSearch() function


// This function will take additional process.argv entries to save search terms as a single string
function makeString() {

    // First we check to see if "isTextCommand" is false.  If so, it means a user entered a command in the command line.
    // If it's true, myString has already been declared when entering do-what-it-says.  This will also reset it to false.
    if (!isTextCommand) {
        myString = process.argv.slice(3).join("+");
    } else {
        isTextCommand = false;
    }
} // End makeString function


// This function takes all of the data provided from the API requests and makes it "printable" to the screen as well as log.txt.
function resultDisplay() {

    // Data is stored as an array...join will create line breaks in between each item and prep it for display.
    finalData = displayData.join("\n");
    console.log(finalData);

    // Special header for log.txt entries...then appending to the file
    var header = "***************************\nCommand: " + myCommand + "\nSearch Terms: " + myString + "\n";
    fs.appendFile("log.txt", header + finalData, function(err) {
        if(err) {
            return console.log(err);
        }

    });

} // end resultDisplay function


// OMDB API - this function will run when someone enters movie-this
function movie() {

    // Runs makeString() function to create search terms
    makeString();

    // If myString exists, it is copied over to movieSearch for the query URL.
    if (myString) {
        movieSearch = myString;
    }

    // full movieQueryUrl plus API call
    var movieQueryUrl = "http://www.omdbapi.com/?t=" + movieSearch + "&y=&plot=short&apikey=trilogy";
    axios.get(movieQueryUrl).then(
        function(response) {
                var results = response.data

                // This is necessary because some movies don't have Rotten Tomatoes Ratings, which will result in an error when we search the resulting JSON
                if (results.Ratings.length > 1) {
                    var tempTomatoesRating = JSON.stringify(results.Ratings[1].Value);
                    var tomatoesRating = tempTomatoesRating.replace(/"/g,"");
                } else {
                    var tomatoesRating = "unknown";
                }

                // Storing the info to be displayed as an array
                displayData = [
                    "\n--------------------",
                    "\u2726 Title: " + results.Title,
                    "\u2726 Year: " + results.Year,
                    "\u2726 IMDB Rating: " + results.imdbRating,
                    "\u2726 Rotten Tomatoes Rating: " + tomatoesRating,
                    "\u2726 Produced in: " + results.Country,
                    "\u2726 This movie is in " + results.Language,
                    "\u2726 Plot: " + results.Plot,
                    "\u2726 Actors: " + results.Actors,
                    "--------------------\n"
                ];

                // Print the data to the console and log.txt.
                resultDisplay();

        }).catch // error checking
            (function(error) {
            console.log(error)
        })
} // End movie() function


// BANDS IN TOWN API - this function will run when someone enters concert-this
function bands() {

    // Runs makeString() function to create search terms
    makeString();

        // If myString, exists, it will save it to artist for the query URL.
        if (myString) {
            artist = myString;
        }

        // Full Query URL and API call
        var artistQueryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
        axios.get(artistQueryUrl).then(
            function(response) {
                var results = response.data

                // Usually there are multiple concert dates, so this loops through the array to find and display them all
                for (var i = 0; i < results.length; i++) {

                    // Since some locations are outside of the US and do not have a "Region" entry, this is required to properly display the location data
                    var location = results[i].venue.city + ", ";

                    if (results[i].venue.region) {
                        location = location + results[i].venue.region + ", ";
                    }
                    location = location + results[i].venue.country;

                    // This will push the data to be displayed into an array for each iteration of the loop
                    displayData.push(
                        "\n--------------------",
                        "\u2726 Venue: " + results[i].venue.name,
                        "\u2726 Location: " + location,
                        "\u2726 Event Date: " + moment(results[i].datetime).format("MM/DD/YYYY"),
                        "--------------------\n"
                    )

                } // End of for loop
                
                // Print the data to the console and log.txt.
                resultDisplay();

            }).catch // Error checking
                (function(error) {
                console.log(error)
        })
} // End of bands() function


// SPOTIFY - this function will run when someone enters spotify-this-song
function song() {

    // Runs makeString() function to create search terms
    makeString();

    // If myString exists, it will reformat it to have spaces instead of the plus sign
    if (myString) {
        // Removes the plus sign that was generated in makeString() function - seems to work better with spaces when searching Spotify
        // Replaces myString with songQuery for query URL.
        songQuery = myString.replace(/\+/g, " ");
    }

    // Spotify Search - grabs the keys that are saved in .env file
    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: songQuery }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        // Storing the response JSON
        var results = data.tracks.items[0];

        // For songs where there are multiple artists, this is necessary to loop through the array to catch them all
        var artists = "";

        for (var i = 0; i < results.artists.length; i++) { 
            if (i === results.artists.length - 1) {
                artists = artists + results.artists[i].name;
            } else {
                artists = artists + results.artists[i].name + ", ";
            }
        }

        // The 30 second preview isn't available for all songs, so this grabs the album link instead.
        var previewUrl = "";
        if (results.preview_url) {
            previewUrl = results.preview_url;
        } else {
            previewUrl = "** Preview Unavailable **\n\u2726 Try this link to the album instead: " + results.external_urls.spotify;
        } 
        
        // Storing the info to be displayed as an array
        displayData = [
            "\n--------------------",
            "\u2726 Artist(s): " + artists,
            "\u2726 Song Name: " + results.name,
            "\u2726 Album Name: " + results.album.name,
            "\u2726 Preview link: " + previewUrl,
            "--------------------\n"
        ]

       // Print the data to the console and log.txt.
        resultDisplay();

    });
} // End of song() function

// This function will run if someone enters do-what-it-says and it reads from random.txt
function textCommand() {

    // Access random.txt file
    fs.readFile("random.txt", "utf8", function(err, content) {
        
        if(err) { // Error checking
            return console.log(err);
        }

        // Takes all of the text from random.txt and puts it into a usable format to grab the command (action) and search string.
        var array = content.split(" ");
        myCommand = array[0];
        myString = array.slice(1).join("+");

        // This will re-run the mainSearch function with the new command and search terms
        mainSearch();
        
    });

} // End of textCommand() function


// -------------------------
// Actual run of the program
// -------------------------

mainSearch();