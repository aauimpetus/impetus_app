const {findAnswer, findRecord} = require("../db/models");
const {readFile} = require('fs/promises');
const path = require('path');
const {userCache} = require('../globals');
/**
 * Gets the previous question & saved answer of the questionnaire in progress (the algorithm has 6 steps)
 * @param {Request} req properties: userIdx, surveyID, stepId(current)
 * @param {Response} res properties: success, data, answer, back, cursor
 * @returns response with data:(previous question block), answer:(saved answer if exists), back button flag & previous progress cursor
 */
const getPreviousQuestion = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with error 400(Bad Request)
    if (!req.body.stepID || !req.body.surveyID || !req.body.userIdx || !req.body.cursor) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Click again the Back button.",
        })
    }
    let surveyID = req.body.surveyID;
    let currentStep = Number(req.body.stepID);
    let currentCursor = Number(req.body.cursor);
    let previousCursor = (currentCursor-1);
    const userInfo = userCache.get(String(req.body.userIdx));

    // 2. Load the question data from cache
    // If the user is not cached, respond to the client with error 401(Unauthorized User)
    if(userInfo === undefined){
        return res.status(401).json({
            success: false,
            message: "Unauthorized User! Please login to continue.",
        })
    }
    const questionnaire = userInfo.questionnaire;

    // 3. Load the progress and update the cursor
    const record = await findRecord(surveyID);
//console.log("User: ",req.body.userIdx," Record details: ",record);
    // If the progress is NOT retrieved, respond to the client with error 500(Internal Server Error)
    if (record instanceof Error || record === null){
        (record instanceof Error)&& console.error(record.message);
        return res.status(500).json({
            success: false,
            message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
        })
    }
    const previousStep = record.progress[previousCursor];

    // 4. Load the associated answer
    const previousAnswer = await findAnswer(previousStep.answerID);
//console.log("User: ",req.body.userIdx," Prev answer:  ",previousAnswer);
    (previousAnswer instanceof Error)&& console.error(previousAnswer.message);

    // 5. Load the previous question data block
    const previousQuestion = questionnaire.find(block => block.stepId === previousStep.stepID);

    // 6. Prepare and send the question block & answer to the client
    // If the answer is NOT retrieved, return "" EMPTY ANSWER
    return res.status(200).json({
        success: true,
        data: JSON.stringify(previousQuestion),
        answer: (previousAnswer instanceof Error)? "" : previousAnswer.answer,
        back: (currentStep === 2)? false : true,
        cursor: previousCursor
    });
}
module.exports = {getPreviousQuestion};
