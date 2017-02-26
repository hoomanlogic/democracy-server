var cheerio = require('cheerio');
var firebase = require('firebase');
var request = require('request');
var config = require('.././config');
var moment = require('moment-timezone');

var motions = {
    '115_1_00054': 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00054.xml', // Elisabeth DeVos
    '115_1_00059': 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00059.xml', // Jeff Sessions
    '115_1_00071': 'https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00071.xml', // Scott Pruitt
};

function voteToInt (str) {
    var vote = str.toLowerCase();
    if (vote === 'yea') {
        return 1;
    }
    else if (vote === 'nay') {
        return 0;
    }
    else if (vote === 'not voting') {
        return -1;
    }
    else {
        return -2
    }
}

function getUsSenatorVotes() {
    // Initialize Firebase
    firebase.initializeApp(config);
    var dbRef = firebase.database().ref();
    
    Object.keys(motions).forEach(key => {
        // Get data from senate.gov
        request(motions[key], function (error, response, body) {
            // Request failed - Abort
            if (error || response.statusCode !== 200) {
                throw new Error(error.message || 'Web request failed');
            }

            // Load xml into cheerio
            var votes = {};
            var $ = cheerio.load(body, { xmlMode: true });

            // Extract vote text
            var date = moment.tz($('roll_call_vote').find('vote_date').first().text(), 'MMM D, YYYY, hh:mm A', 'America/New_York').format();
            var text = $('roll_call_vote').find('vote_document_text').first().text();
            var tieBreaker = voteToInt($('roll_call_vote > tie_breaker').find('tie_breaker_vote').first().text());
            if (tieBreaker !== -2) {
                tieBreaker = {
                    by: $('roll_call_vote > tie_breaker').find('by_whom').first().text(),
                    vote: tieBreaker
                }
            }
            else {
                tieBreaker = '';
            }

            // Extract senator votes from xml
            $('members').find('member').each(function (index, element) {
                var id, vote;
                id = $(this).find('lis_member_id').first().text();
                vote = voteToInt($(this).find('vote_cast').first().text());
                
                votes[id] = vote;
            });

            // Update database
            var updates = {};
            updates[`/vote/usa-senate/${key}`] = {
                date: date,
                text: text,
                results: votes,
                tieBreaker: tieBreaker,
            };
            dbRef.update(updates);
        });
    });
}

module.exports = getUsSenatorVotes;