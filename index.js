var createDb = require('./tasks/create-db');
var getUsSenators = require('./tasks/get-us-senators');
var getUsSenatorVotes = require('./tasks/get-us-senator-votes');

var task = [].slice.call(process.argv, -1);

var tasks = {
    'create-db': createDb,
    'get-us-senators': getUsSenators,
    'get-us-senator-votes': getUsSenatorVotes,
};

if (!tasks[task]) {
    throw new Error('Invalid arg:' + task);
}

tasks[task]();
