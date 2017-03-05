var createDb = require('./tasks/create-db');
var getUsSenators = require('./tasks/get-us-senators');
var getUsSenatorVotes = require('./tasks/get-us-senator-votes');
var clearIndoorAirLog = require('./tasks/clear-indoor-air-log.js');
var task = [].slice.call(process.argv, -1);

var tasks = {
    'create-db': createDb,
    'get-us-senators': getUsSenators,
    'get-us-senator-votes': getUsSenatorVotes,
    'clear-indoor-air-log': clearIndoorAirLog
};

if (!tasks[task]) {
    throw new Error('Invalid arg:' + task);
}

tasks[task]();
