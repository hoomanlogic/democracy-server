var getUsSenators = require('./tasks/get-us-senators');
var getUsSenatorVotes = require('./tasks/get-us-senator-votes');

var task = [].slice.call(process.argv, -1);

var tasks = {
   'get-us-senators': getUsSenators,
   'get-us-senator-votes': getUsSenatorVotes,
};

if (!tasks[task]) {
   throw new Error('Invalid arg:' + task);
}

tasks[task]();
