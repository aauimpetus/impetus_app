const {findAnswer,findRecord} = require("../db/models");
const path = require('path');
const {readFile} = require('fs/promises');
const {userCache} = require('../globals');
/**
 * Gets a selected survey progress from the db and returns the last answered question
 * to the client for continuing the survey (the algorithm has 6 steps)
 * @param {Request} req properties: surveyID, surveyType, userIdx
 * @param {Response} res properties: success, data, answer, numQuestions, back, cursor
 * @returns response with data:(the last question block data), answer: (the last provided answer), numQuestions:(the total number of questions of the questionnaire), back:(false if we are in 1st question) & cursor:(the last answered question cursor position from the progress)
 */
const continueSurvey = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with 400(Bad Request)
    if (!req.body.surveyType || !req.body.surveyID || !req.body.userIdx) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select a survey.",
        })
    }
    const surveyID = req.body.surveyID;
    const surveyType = req.body.surveyType;

    // 2. Retrieve from the db the progress record of the specified survey
    const record = await findRecord(surveyID);
//console.log("User: ",req.body.userIdx," Record data:  ",record);
    // If the record was NOT retrieved, respond to client with error 500(Internal Server Error)
    if (record instanceof Error || record === null) {
        (record instanceof Error)&& console.error(record.message);
        return res.status(500).json({
            success: false,
            message: "Can't load your progress. Please try again later."
        })
    }

    // 3. Load the cursor of the last answered question &
    const cursor = record.progress.length - 1;
    // Load the question stepID and the associated answer
    const lastStep = Number(record.progress[cursor].stepID);
    const answerID = record.progress[cursor].answerID;
    const lastAnswer = await findAnswer(answerID);
//console.log("User: ",req.body.userIdx," Last answer data:  ",lastAnswer);
    let answerRecord = lastAnswer.answer;
    let answerRecordTxt = lastAnswer.answerTxt;
    // If the answer was NOT retrieved, set answer to "" EMPTY STRING
    if (lastAnswer instanceof Error || lastAnswer === null){
        (lastAnswer instanceof Error)&& console.error(lastAnswer.message);
        answerRecord = "";
        answerRecordTxt = "";
    }

    // 4. Read the selected questionnaire file to retrieve all the questions
    const questionnaireFileName = surveyType + ".json";
    const questionnaireFilePath = path.join(__dirname, '..', 'db', 'questionnaires', questionnaireFileName);
    const surveyData = await readFile(questionnaireFilePath,'utf8').catch(err => new Error("ReadingJSON failed:",err.message));
    // if the file reading failed, respond to the client with error 500(Internal Server Error)
    if (surveyData instanceof Error) {
        console.error(surveyData.message);
        return res.status(500).json({
            success: false,
            message: "Can't load your progress. Please try again later."
        })
    }

    // 5. Save in cache the questionnaire & the survey type for later use (+ squaremeters for IO6)
    const data = JSON.parse(surveyData); //questions
    if (userCache.has(req.body.userIdx)){
        let userInfo = userCache.get(String(req.body.userIdx));
        userInfo["questionnaire"] = data.questions;
        userInfo["surveyType"] = data.type;
        if (surveyType === "IO6" && lastStep > 22) {
            const numofclickersBlock = record.progress.find(block => block.stepID === 22);
            const answerBlock = await findAnswer(numofclickersBlock.answerID);
            userInfo["squaremeters"] = 22+Number(answerBlock.answerTxt);
        }
        userCache.set(String(req.body.userIdx), userInfo);
console.log("User: ",req.body.userIdx," Cached questionnaire: ", data.type," Continuing survey: ", surveyID)
    }
    // If the user is not cached, respond to the client with error 401(Unauthorized User)
    else {
        return res.status(401).json({
            success: false,
            message: "Unauthorized User! Please login to continue.",
        })
    }

    // 6. Prepare data for sending &
    const questionnaire = data.questions;
    const numBlocks = data.totalQ; //num of questions in this questionnaire
    const currentBlock = questionnaire.find(block => block.stepId === lastStep); //last answered question block
    // Respond to client with the question to display and the saved answer
    return res.status(200).json({
        success: true,
        data: JSON.stringify(currentBlock),
        answer: (currentBlock.questionType === 'radio' || currentBlock.questionType === 'clicker' || currentBlock.questionType === 'file')? answerRecord : answerRecordTxt,
        numQuestions: numBlocks,
        back: (lastStep === 2)? false : true,
        cursor: cursor
    });
}
module.exports = {continueSurvey};
