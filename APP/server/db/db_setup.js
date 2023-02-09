// Import the rethinkdb api and the config file
require('dotenv/config');
const r = require( 'rethinkdb' );
const config = require( './config' );
/* 
* Automated database & table schema creation
*/

//Create the database if not existing
module.exports.setupDB = function() {
    console.log("Setting up Database...");
    const conn = r.connect(config.database).then(c => c)
    conn.then(function(conn) {
        r.dbList().contains(config.database.db).do(function(containsDb) {
            return r.branch(containsDb,{created: 0},r.dbCreate(config.database.db)); }).run(conn)
        .then(function(result) {
            console.log("The database is up.",result);
            conn.close();
        })
    }).error(function(error) {
        console.log("Could not open a connection to setup the database");
        console.error(error.message);
    })

}

//If db is setup, move to table creations if not existing
module.exports.setupTables = function() {
    console.log("Setting up Tables...");
    const conn = r.connect(config.database).then(c => c)
    conn.then(function(conn){
        r.tableList().contains("projects").do(function(containsTable) {
            return r.branch(containsTable,{created: 0},r.db(config.database.db).tableCreate("projects")); }).run(conn)
        .then(function(result) {console.log("Projects ",result);})
    })
    conn.then(function(conn){
        r.tableList().contains("surveys").do(function(containsTable) {
            return r.branch(containsTable,{created: 0},r.db(config.database.db).tableCreate("surveys")); }).run(conn)
        .then(function(result) {console.log("Surveys ",result);})
    })
    conn.then(function(conn){
        r.tableList().contains("answers").do(function(containsTable) {
            return r.branch(containsTable,{created: 0},r.db(config.database.db).tableCreate("answers")); }).run(conn)
        .then(function(result) {console.log("Answers ",result);})
    })
    conn.then(function(conn){
        r.tableList().contains("submissions_backup").do(function(containsTable) {
            return r.branch(containsTable,{created: 0},r.db(config.database.db).tableCreate("submissions_backup")); }).run(conn)
        .then(function(result) {console.log("Submissions ",result);})
    })
    conn.then(function(conn){
        r.tableList().contains("ongoing_surveys").do(function(containsTable) {
            return r.branch(containsTable,{created: 0},r.db(config.database.db).tableCreate("ongoing_surveys", {primaryKey: 'surveyID'})); }).run(conn)
        .then(function(result) {
            console.log("Progress ",result);
            console.log("The 5 tables are up.");
            conn.close();
        })
    })
}

//If tables are setup, move to index creations if not existing
module.exports.setupIndexes = function() {
    console.log("Setting up Indexes...");
    const conn = r.connect(config.database).then(c => c)
    conn.then(function(conn){
        r.table("surveys").indexList().contains("projectID").do(function(hasIndex) {
            return r.branch(hasIndex,{created: 0}, r.table("surveys").indexCreate("projectID")); }).run(conn) 
        .then(function(result) {console.log("Index1 ",result);})
    })
    conn.then(function(conn){
        r.table("answers").indexList().contains("surveyID").do(function(hasIndex) {
            return r.branch(hasIndex,{created: 0}, r.table("answers").indexCreate("surveyID")); }).run(conn)
        .then(function(result) {
            console.log("Index2 ",result);
            console.log("The 2 indexes are up.");
            console.log("------ Database is ready for use ------")
            conn.close();
        })
    })
    conn.error(function(error) {
        console.error(error.message);
    })
}
