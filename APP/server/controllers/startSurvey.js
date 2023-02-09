const {insertRecord, insertAnswer, updateSurvey} = require("../db/models");
const path = require('path');
const {readFile} = require('fs/promises');
const {userCache} = require('../globals');
/**
 * Starts a new survey by receiving the 1st question of the selected questionnaire 
 * & sets a new progress record in db (the algorithm has 6 steps)
 * @param {Request} req properties: surveyType, surveyID, userIdx, public
 * @param {Response} res properties: success, data, answer, numQuestions, back, cursor
 * @returns response with the 1st question block data and the total number of questions of the questionnaire
 */
const startSurvey = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select a valid questionnaire.",
        })
    }
    const questionnaireType = req.body.surveyType;
    const userIdx = req.body.userIdx;

    // 2. Insert a new answer & progress record in the db
    // Update the questionnaire status if it is set to public 
    const publicS = {public: req.body.public};
    (req.body.public === true)&& await updateSurvey(req.body.surveyID, publicS);
    
    const initAnswers = {
        surveyID: req.body.surveyID,
        stepID: 0,
        questionID: "",
        question: "",
        answer: "",
        answerTxt: "",
        userScore: ""
    }
    const firstAnswer = await insertAnswer(initAnswers);
//console.log("User: ",userIdx," NewAnswer:  ",firstAnswer);
    const recordData = {
        surveyID: req.body.surveyID,
        progress: [
            {
                stepID: 0,
                answerID: firstAnswer
            }
        ] 
    };
    const response = await insertRecord(recordData);
console.log("User: ",userIdx," NewRecord:  ",response);
    // If an error occured, respond to the client with error 500(Internal Server Error)
    if (response instanceof Error){
        console.error(response.message)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Cannot start the questionnaire. Please try again later."
        })
    }

    // 3. Read the selected questionnaire file to retrieve all the questions
    const questionnaireFileName = questionnaireType + ".json";
    const questionnaireFilePath = path.join(__dirname, '..', 'db', 'questionnaires', questionnaireFileName);
    const surveyData = await readFile(questionnaireFilePath,'utf8').catch(err => new Error("ReadJSON failed: ",err.message));
    // If the file reading failed, respond to the client with error 500(Internal Server Error)
    if (surveyData instanceof Error) {
        console.error(surveyData.message);
        return res.status(500).json({
            success: false,
            message: "Can't load this questionnaire. Please try again later."
        })
    }
    
    // 4. Save in cache the questionnaire & the survey type
    const data = JSON.parse(surveyData);
    if (userCache.has(userIdx) && response){
        const userInfo = userCache.get(String(userIdx));
        userInfo["questionnaire"] = data.questions;
        userInfo["surveyType"] = data.type;
        userCache.set(String(userIdx), userInfo);
console.log("User: ",userIdx," started a new survey ", data.type)

        // 5. Respond to client with the 1st question block
        const firstQuestion = data.questions[1];
        const numBlocks = data.totalQ; //num of questions in this questionnaire
        return res.status(200).json({
            success: true,
            data: JSON.stringify(firstQuestion),
            numQuestions: numBlocks,
            back: false,
            cursor: 0
        });
    }
    // If the user is not cached, respond with error 401(Unauthorized User)
    else {
        return res.status(401).json({
            success: false,
            message: "Unauthorised User. Please login to proceed."
        })
    }
}
module.exports = {startSurvey};
