require('dotenv/config');
const r = require('rethinkdb');
const config = require('./config');

/**
 * Module for inserting a new project in the db (under "projects" table)
 * @param {Object} object -> project information to be saved
 * @returns -> projectID(String|Error): of the project that was just created OR error
 */
module.exports.insertProject = async function (object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("projects").insert(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.inserted === 1 && response.errors === 0) {
            result = response.generated_keys[0].toString();
        }
        else {result = new Error("Project was not saved!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for inserting a new survey in the db (under "surveys" table)
 * @param {Object} object -> survey information to be saved
 * @returns -> surveyID(String|Error): of the survey that was just created OR error
 */
module.exports.insertSurvey = async function (object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").insert(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.inserted === 1 && response.errors === 0) { 
            result = response.generated_keys[0].toString();
        }
        else {result = new Error("Survey was not saved!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for inserting a new answer in the db (under "answers" table)
 * @param {Object} object -> answer information to be saved
 * @returns -> answerID(String|Error): of the answer that was just saved OR error
 */
module.exports.insertAnswer = async function (object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("answers").insert(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.inserted === 1 && response.errors === 0) { 
            result = response.generated_keys[0].toString();
        }
        else {result = new Error("Answer was not saved!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for inserting a new progress record of ongoing surveys in the db (under "ongoing_surveys" table)
 * @param {Object} object -> progress record information to be saved (surveyID MUST be included)
 * @returns -> recordID(Boolean|Error): TRUE if the record was successfully created OR error
 */
module.exports.insertRecord = async function (object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("ongoing_surveys").insert(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.inserted === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The progress record is not initialized!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for inserting a new submission in the db (under "submissions_backup" table)
 * @param {Object} object -> submission information to be saved
 * @returns -> result(Boolean|Error): TRUE if the submission was succesfully saved OR error
 */
module.exports.insertSubmission = async function (object) {
    let result;
    try {
        object["submitted_on"] = r.now(); // add timestamp
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("submissions_backup").insert(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.inserted === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("Submission was not saved as backup!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for removing a specified project from the "projects" table
 * @param {String} id -> the projectID to be removed
 * @returns -> result(Boolean|Error): TRUE if the project was succesfully deleted OR error
 */
module.exports.deleteProject = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("projects").get(id).delete().run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.deleted === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The project was not deleted!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for removing a specified survey/associated answers from the "surveys" and "answers" tables
 * @param {String} sid -> surveyID to be removed
 * @param {String} uid -> userID for checking the ownership of the survey
 * @returns -> true: if the survey and associated answers were succesfully deleted OR 
 *          -> false: if the survey was deleted but the associated answers were not OR 
 *          -> error: if an error occured
 */
module.exports.deleteSurvey = async function (sid, uid) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").filter({id:sid, userID:uid}).delete().run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.deleted === 1 && response.errors === 0){
            const query2 = async () => {let c =  r.db(config.database.db).table("answers").getAll(sid, {index: "surveyID"}).delete().run(connection).then(res=>res); return c;}
            const res = await query2();
            (res.errors === 0 ? result=true : result=false); 
        }
        else {result = new Error("The survey was not deleted!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for removing changed answers from the "answers" table
 * @param {String} sid -> surveyID of the answers to be removed
 * @param {Number} step -> stepID: all answers with step > stepID will be removed
 * @returns -> result(Boolean|Error): TRUE if the answers were succesfully deleted OR error
 */
module.exports.deleteAnswers = async function (sid,step) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("answers").getAll(sid,{index: "surveyID"}).filter(r.row("stepID").gt(step)).delete().run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.deleted > 0 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The answers were not deleted!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for removing a specified progress record from the "ongoing_surveys" table
 * @param {String} id -> recordID = surveyID to be removed
 * @returns -> result(Boolean|Error): TRUE if the progress record was succesfully deleted OR error
 */
module.exports.deleteRecord = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("ongoing_surveys").get(id).delete().run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.deleted === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The record was not deleted!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for removing submissions from the "submissions_backup" table
 * @param {Date} date -> everything created before the specified date will be deleted
 * @returns -> result(Boolean|Error): TRUE if the selected submissions were succesfully deleted OR error
 */
//TODO: Check the date format
module.exports.deleteSubmissions = async function (date) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("submissions_backup").filter(r.row("submitted_on").date().lt(date)).delete().run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.deleted > 0 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The submissions were not deleted!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for updating a specified answer from the "answers" table
 * @param {String} id -> answerID of the answer we want to update
 * @param {Object} object -> infromation we want to update
 * @returns -> result(Boolean|Error): TRUE if the answer was succesfully updated OR error
 */
module.exports.updateAnswer = async function (id, object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("answers").get(id).update(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if ((response.replaced === 1 || response.unchanged === 1) && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The answer was not updated!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for updating a specified survey from the "surveys" table
 * @param {String} id -> surveyID of the survey we want to update
 * @param {Object} object -> infromation we want to update
 * @returns -> result(Boolean|Error): TRUE if the survey was succesfully updated OR error
 */
 module.exports.updateSurvey = async function (id, object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").get(id).update(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if ((response.replaced === 1 || response.unchanged === 1) && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The survey was not updated!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for updating the progress attribute of a specified survey record from the "ongoing_surveys" table
 * @param {String} id -> recordID = surveyID that we want to update
 * @param {Object} object -> information we want to update (the new progress list)
 * @returns -> result(Boolean|Error): TRUE if the record was updated succesfully OR error
 */
module.exports.updateRecord = async function (id, object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("ongoing_surveys").get(id).update({progress:r.row("progress").append(object)}).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.replaced === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The progress was not updated!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for updating the whole progress of a specified survey record from the "ongoing_surveys" table
 * @param {String} id -> progressID = surveyID that we want to update
 * @param {Object} object -> progress info we want to replace with
 * @returns -> result(Boolean|Error): TRUE if the record was updated succesfully OR error
 */
module.exports.replaceRecord = async function (id, object) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("ongoing_surveys").get(id).replace(object).run(connection).then(res=>res); return c;}
        const response = await query();
        if (response.replaced === 1 && response.errors === 0) { 
            result = true;
        }
        else {result = new Error("The progress was not updated!!!")}
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for getting a list of all ongoing surveys of a user (for Listing of Ongoing Surveys functionality)
 * @param {String} id -> userID for filtering this user's surveys
 * @returns -> results(List|Error): list of objects of the form {surveyID,surveyName,surveyType,projectID,projectName,projectStatus} OR error
 */
module.exports.findAllUserSurveys = async function (id) {
    let results;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").filter({userID:id}).filter(function(surv) {return r.db(config.database.db).table("ongoing_surveys").filter(function(prog) {return prog("surveyID").eq(surv("id"))}).count().gt(0)} )
            .eqJoin("projectID", r.db(config.database.db).table("projects")).without([{left: ['userName','userID']}, {right: ['id','projectStatus', 'longitude', 'latitude', 'category', 'description', 'userID']}]).zip().run(connection).then(res=>res); return c;}
        const cursor = await query();
        results = [];
        const res = async () => {let c = cursor.toArray().then(res=>res); return c;}
        const arr = await res();
        results = arr;
        return results;
    } catch (error) {
        console.error(error);
        results = new Error(error.message);
        return results;
    }
};
/**
 * Module for getting all saved answers of a survey (for Survey Preview functionality)
 * @param {String} sid -> surveyID for filtering all the answers of the selected survey
 * @returns returns -> results(List|Error): list of answers OR error
 */
module.exports.findAllAnswers = async function (sid) {
    let results;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("answers").getAll(sid, {index: "surveyID"}).run(connection).then(res=>res); return c;}
        const cursor = await query();
        results = [];
        const res = async () => {let c = cursor.toArray().then(res=>res); return c;}
        const arr = await res();
        results = arr;
        return results;
    } catch (error) {
        console.error(error);
        results = new Error(error.message);
        return results;
    }
};
/**
 * Module for getting all saved NEW projects of a user (for User Project Preview functionality)
 * @param {String} uid -> userID for filtering all the new projects of this user
 * @returns returns -> results(List|Error): list of projects OR error
 */
 module.exports.findAllUserProjects = async function (uid) {
    let results;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("projects").filter({userID:uid, status:"NEW"}).run(connection).then(res=>res); return c;}
        const cursor = await query();
        results = [];
        const res = async () => {let c = cursor.toArray().then(res=>res); return c;}
        const arr = await res();
        results = arr;
        return results;
    } catch (error) {
        console.error(error);
        results = new Error(error.message);
        return results;
    }
};
/**
 * Module for counting all surveys linked to the specified project
 * @param {String} pid -> projectID we want to examine
 * @returns -> result(Number|Error): the number of linked surveys OR error
 */
 module.exports.countSurveys = async function (pid) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").filter({projectID:pid}).count().run(connection).then(res=>res); return c;}
        const response = await query();
        result = response;
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for getting the information of a specified answer
 * @param {String} id -> answerID we want to retrieve
 * @returns -> result(Object|Error): the resulted info of the answer OR error
 */
module.exports.findAnswer = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("answers").get(id).run(connection).then(res=>res); return c;}
        const response = await query();
        result = response;
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for getting the information of a specified survey
 * @param {String} id -> surveyID that we want to retrieve
 * @returns -> result(Object|Error): the resulted info of the survey OR error
 */
module.exports.findSurvey = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("surveys").get(id).run(connection).then(res=>res); return c;}
        const response = await query();
        result = response;
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for getting the information of a specified project
 * @param {String} id -> projectID that we want to retrieve
 * @returns -> result(Object|Error): the resulted info of the project OR error
 */
module.exports.findProject = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("projects").get(id).run(connection).then(res=>res); return c;}
        const response = await query();
        result = response;
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};
/**
 * Module for getting the progress of an ongoing survey of user (for Survey Continuation functionality)
 * @param {String} id -> progressID = surveyID that we want to retrieve
 * @returns -> result(Object|Error): the saved progress (questions,answers that are explored) OR error
 */
module.exports.findRecord = async function (id) {
    let result;
    try {
        const conn = async () => {let c = r.connect(config.database); return c;}
        const connection = await conn();
        const query = async () => {let c = r.db(config.database.db).table("ongoing_surveys").get(id).run(connection).then(res=>res); return c;}
        const response = await query();
        result = response;
        return result;
    } catch (error) {
        console.error(error);
        result = new Error(error.message);
        return result;
    }
};