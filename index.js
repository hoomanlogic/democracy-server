var getUsSenators = require('./tasks/get-us-senators');

var task = [].slice.call(process.argv, -1);

var tasks = {
   'get-us-senators': getUsSenators
};

if (!tasks[task]) {
   throw new Error('Invalid arg:' + task);
}

tasks[task]();
