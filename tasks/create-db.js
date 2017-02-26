var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

function createDb () {
    var file = 'democracy.db';
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
    var db = new sqlite3.Database(file);

    db.serialize(() => {
        // Create tables
        db.run(
            `CREATE TABLE body (
                id TEXT PRIMARY KEY,
                name TEXT,
                jurisdiction TEXT
            )`
        );
        db.run(
            `CREATE TABLE division (
                id TEXT,
                bodyId TEXT,
                name TEXT,
                UNIQUE (id, bodyId) ON CONFLICT REPLACE,
                FOREIGN KEY(bodyId) REFERENCES body(id)
            )`
        );
        db.run(
            `CREATE TABLE politician (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                icon TEXT,
                name TEXT,
                sort TEXT,
                wiki TEXT
            )`
        );
        db.run(
            `CREATE TABLE membership (
                politicianId INTEGER,
                bodyId TEXT,
                divisionId TEXT,
                refId TEXT,
                termEnd TEXT,
                UNIQUE (politicianId, bodyId) ON CONFLICT REPLACE,
                FOREIGN KEY(bodyId) REFERENCES body(id),
                FOREIGN KEY(divisionId) REFERENCES division(id),
                FOREIGN KEY(politicianId) REFERENCES politician(id)
            )`
        );
        db.run(
            `CREATE TABLE issue (
                issueId TEXT PRIMARY KEY,
                icon TEXT,
                name TEXT
            )`
        );
        db.run(
            `CREATE TABLE issue_activity (
                issueId TEXT PRIMARY KEY,
                icon TEXT,
                name TEXT
            )`
        );
        db.run(
            `CREATE TABLE tally (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bodyId INTEGER,
                name TEXT,
                pass INTEGER,
                tiebreaker TEXT,
                tiebreakerVote INTEGER,
                FOREIGN KEY(bodyId) REFERENCES body(id)
            )`
        );
        db.run(
            `CREATE TABLE vote (
                tallyId INTEGER,
                politicianId INTEGER,
                vote INTEGER
            )`
        );
    });

    db.close();
}

module.exports = createDb;
