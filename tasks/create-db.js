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
            `CREATE TABLE value (
                id TEXT PRIMARY KEY,
                icon TEXT,
                name TEXT
            )`
        );
        db.run(`INSERT INTO value (id, icon, name) VALUES ('education', '//www.freeiconspng.com/uploads/education-png-32.png', 'Education')`);
		db.run(`INSERT INTO value (id, icon, name) VALUES ('environment', '//www.onegov.nsw.gov.au/New/persistent/listings_page/environment.png', 'Environment')`);
		db.run(`INSERT INTO value (id, icon, name) VALUES ('equality', '//pbs.twimg.com/profile_images/565486644740911104/UQPE6tgy_reasonably_small.png', 'Equality')`);
        db.run(
            `CREATE TABLE motion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                bodyId TEXT,
                name TEXT,
                date TEXT,
                pass INTEGER,
                tiebreaker TEXT,
                tiebreakerId INTEGER,
                tiebreakerVote INTEGER,
                FOREIGN KEY(bodyId) REFERENCES body(id),
                FOREIGN KEY(tiebreakerId) REFERENCES politician(id)
            )`
        );
        db.run(
            `CREATE TABLE value_activity (
                valueId TEXT PRIMARY KEY,
                motionId INTEGER,
                FOREIGN KEY(motionId) REFERENCES motion(id)
            )`
        );
        db.run(
            `CREATE TABLE vote (
                motionId INTEGER,
                politicianId INTEGER,
                vote INTEGER,
                UNIQUE (politicianId, motionId) ON CONFLICT REPLACE,
                FOREIGN KEY(motionId) REFERENCES motion(id),
                FOREIGN KEY(politicianId) REFERENCES politician(id)
            )`
        );
        db.run(
            `CREATE TABLE data_version (
                versionNumber INTEGER
            )`
        );
        db.run(
            `INSERT INTO data_version (versionNumber) VALUES (0)`
        );
    });

    db.close();
}

module.exports = createDb;
