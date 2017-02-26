var cheerio = require('cheerio');
var firebase = require('firebase');
var request = require('request');
var config = require('.././config');

// TASKS
var division = {};
var map = {
    State: function (val, senator) {
        var state = cheerio.load(val).text();
        senator.memberOf['usa-senate'].division = state.toLowerCase();
        division[state.toLowerCase()] = state;
    },
    Class: function (val, senator) {
        var text = '';
        switch (cheerio.load(val).text()) {
            case ('1'):
                text = '2019-01-03';
                break;
            case ('2'):
                text = '2021-01-03';
                break;
            case ('3'):
                text = '2023-01-03';
                break;
        }
        senator.memberOf['usa-senate'].term = text;
    },
    Name: function (val, senator) {
        var $ = cheerio.load(val);
        senator.name = $('a').text();
        senator.sortName = $('span[class=sortkey]').text();
        senator.wiki = $('a').attr('href');
    },
    Portrait: function (val, senator) {
        var $ = cheerio.load(val);
        senator.icon = $('img').attr('src') || '';
    }
}

function getUsSenators() {
    // Get data from wikipedia
    request('http://en.wikipedia.org/wiki/List_of_current_United_States_Senators', function (error, response, body) {
        // Request failed - Abort
        if (error || response.statusCode !== 200) {
            throw new Error(error.message || 'Web request failed');
        }

        // Load html into cheerio
        var fields = [];
        var senate = [];
        var $ = cheerio.load(body);

        // Get column order
        $('#mw-content-text > table').slice(-1).find('th').each(function (index, element) {
            fields.push($(this).html());
        });

        // Get senator data
        $('#mw-content-text > table').slice(-1).find('tr').slice(1).each(function (index, element) {
            var senator = {
                memberOf: {
                    'usa-senate': {
                        division: '',
                        term: '',
                        id: ''
                    }
                }
            };
            $(this).find('td').each(function (index, element) {
                var field = map[fields[index]];
                if (field) {
                    field($(this).html(), senator);
                }
            });
            senate.push(senator);
        });

        // Get data from senate.gov
        request('https://www.senate.gov/legislative/LIS/roll_call_votes/vote1151/vote_115_1_00071.xml', function (error, response, body) {
            // Request failed - Abort
            if (error || response.statusCode !== 200) {
                throw new Error(error.message || 'Web request failed');
            }

            // Load xml into cheerio
            var votes = [];
            var $ = cheerio.load(body, { xmlMode: true });

            // Extract vote text
            var date = new Date(Date.parse($('roll_call_vote').find('vote_date').first().text())).toISOString();
            var text = $('roll_call_vote').find('vote_document_text').first();

            // Extract senator votes from xml
            $('members').find('member').each(function (index, element) {
                var lname, fname, memberId, vote;
                id = $(this).find('lis_member_id').first().text();
                lname = $(this).find('last_name').first().text();
                fname = $(this).find('first_name').first().text();
                
                findSenator = senate.filter(a => a.name.slice(0, fname.length) === fname && a.name.slice(-(lname.length)) === lname);
                if (findSenator.length === 0) {
                    findSenator = senate.filter(a => a.name.slice(-(lname.length)) === lname);
                }
                if (findSenator.length === 0) {
                    findSenator = senate.filter(a => a.name.includes(lname));
                } 
                if (findSenator.length !== 1) {
                    console.log('Expected one senator, found ' + findSenator.length + ': ' + fname + ' ' + lname);
                }                
                
                findSenator[0].memberOf['usa-senate'].id = id;
            });

            // Initialize Firebase
            firebase.initializeApp(config);

            // Update firebase with senators
            var dbRef = firebase.database().ref();
            var updates = {
                '/body/usa-senate/jurisdiction': 'USA',
                '/body/usa-senate/name': 'United States Senate',
                '/body/usa-senate/division': division
            };
            senate.forEach(function (senator) {
                var newKey = dbRef.child('politician').push().key;
                // var newKey = senator.memberOf['usa-senate'].id;
                updates['/politician/' + newKey] = senator;
                //updates['/body/usa-senate/members/' + newKey] = senator;
            });
            console.log(updates);
            dbRef.update(updates);
        });


    });
}

module.exports = getUsSenators;
