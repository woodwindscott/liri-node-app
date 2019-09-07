// Necessary to access .env file with Spotify API credentials
require("dotenv").config();

//***** This should be in random.txt - spotify-this-song I Want It That Way */



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

var isTextCommand = false;
var artist = "";
var displayData = [];
var finalData = "";

// Declaration of variable to be used in for loop to enter full search terms
var myString = "";

// This will take additional process.argv entries to save search terms as a single string
function makeString() {

    if (!isTextCommand) {
        myString = process.argv.slice(3).join("+");

        // for (var i = 3; i < process.argv.length; i++) {
        //     if (i < process.argv.length - 1) {
        //         myString += process.argv[i] + "+";
        //     } else {
        //         myString += process.argv[i];
        //     }
        // }
    } else {
        isTextCommand = false;
    }
} // End makeString function

function resultDisplay() {

   finalData = displayData.join("\n");

   var header = "***************************\nCommand: " + myCommand + "\nSearch Terms: " + myString + "\n";
   console.log(finalData);
   fs.appendFile("log.txt", header + finalData, function(err) {
    if(err) {
        return console.log(err);
    }

});

}

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
            isTextCommand = true;
            textCommand();
            break;
    }

    // resultDisplay();

}

// ------------------------
// First run of the program
// ------------------------

mainSearch();

// OMDB API - this function will run when someone enters movie-this
function movie() {

    makeString();

    if (myString) {
        movieSearch = myString;
    }

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

                // Display the desired data

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

                resultDisplay();
                // console.log(displayData.join("\n"));

        }).catch 
            (function(error) {
            console.log(error)
        })
}

// BANDS IN TOWN API - this function will run when someone enters concert-this
function bands() {

    makeString();

        if (myString) {
            artist = myString;
        }

        var artistQueryUrl = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp";
        axios.get(artistQueryUrl).then(
            function(response) {
                var results = response.data

                for (var i = 0; i < results.length; i++) {

                    // Since some locations are outside of the US and do not have a "Region" entry, this is required to properly display the location data
                    var location = results[i].venue.city + ", ";
                    if (results[i].venue.region) {
                        location = location + results[i].venue.region + ", ";
                    }
                    location = location + results[i].venue.country;
                    
                    // Display the desired data
                    console.log("\n--------------------\n\u2726 Venue: " + results[i].venue.name);
                    console.log("\u2726 Location: " + location)
                    console.log("\u2726 Event Date: " + moment(results[i].datetime).format("MM/DD/YYYY"));
                    console.log("--------------------\n");

                    displayData.push(
                        "\n--------------------",
                        "\u2726 Venue: " + results[i].venue.name,
                        "\u2726 Location: " + location,
                        "\u2726 Event Date: " + moment(results[i].datetime).format("MM/DD/YYYY"),
                        "--------------------\n"
                    )

                }
                resultDisplay();

                // console.log(displayData.join("\n"))

            }).catch 
                (function(error) {
                console.log(error)
        })
}

// SPOTIFY - this function will run when someone enters spotify-this-song
function song() {

    makeString();

    if (myString) {
        // Removes the plus sign that was generated in makeString() function - seems to work better with spaces when searching Spotify
        songQuery = myString.replace(/\+/g, " ");
    }

    var spotify = new Spotify(keys.spotify);

    spotify.search({ type: 'track', query: songQuery }, function(err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        var results = data.tracks.items[0];

        var artists = "";

        for (var i = 0; i < results.artists.length; i++) { 
            if (i === results.artists.length - 1) {
                artists = artists + results.artists[i].name;
            } else {
                artists = artists + results.artists[i].name + ", ";
            }
        }

        var previewUrl = "";
        if (results.preview_url) {
            previewUrl = results.preview_url;
        } else {
            previewUrl = "** Preview Unavailable **\n\u2726 Try this link to the album instead: " + results.external_urls.spotify;
        } 
        
        displayData = [
            "\n--------------------",
            "\u2726 Artist(s): " + artists,
            "\u2726 Song Name: " + data.tracks.items[0].name,
            "\u2726 Album Name: " + data.tracks.items[0].album.name,
            "\u2726 Preview link: " + previewUrl,
            "--------------------\n"
        ]
        resultDisplay();

        // console.log(displayData.join("\n"));

    });
}

function textCommand() {
    fs.readFile("random.txt", "utf8", function(err, content) {
        
        if(err) {
            return console.log(err);
        }

        var array = content.split(" ");
        myCommand = array[0];
        myString = array.slice(1).join("+");

        mainSearch();
        });

}

// Should be able to take in one of the following commands:
// COMPLETE - concert-this
// COMPLETE - spotify-this-song
// COMPLETE - movie-this
// do-what-it-says




//************* DO WHAT IT SAYS **********

// node liri.js do-what-it-says

// Using fs Node package, LIRI will take text inside of random.txt and use it to call of of LIRI's commands

// It should run spotify-this-song for "I Want It That Way"
// Edit text in random.txt to test out feature for movie-this and concert-this


// **************** BONUS **********

// In addition to logging the data to your terminal window, output data to .txt file called log.txt
// Make sure you append each command you run to the log.txt file



