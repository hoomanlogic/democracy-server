var cheerio = require('cheerio');
var firebase = require('firebase');

const config = {
   apiKey: "AIzaSyDpARKylspEmH6yi8vJePuiwRVre0nKOb4",
   authDomain: "doozy-31df5.firebaseapp.com",
   databaseURL: "https://doozy-31df5.firebaseio.com",
   storageBucket: "doozy-31df5.appspot.com",
   messagingSenderId: "694975571209"
};

function clearIndoorAirLog () {
    // Initialize Firebase
    firebase.initializeApp(config);
    var dbRef = firebase.database().ref();
    // Update database
    var updates = {};
    updates[`/data/users/geoffreyfloyd/logs/indoor-air`] = null;
    dbRef.update(updates);
}

module.exports = clearIndoorAirLog;
