const {findAllAnswers, findRecord} = require("../db/models");
const {userCache} = require('../globals');
const {getScore, getIndex} = require('./helper');
/**
 * Retrieves a list with all the answers/scores of the current survey from the db and 
 * sends them to client for the preview functionality (the algorithm has 6 steps)
 * @param {Request} req properties: userIdx, surveyID
 * @param {Response} res properties: success, preview, score
 * @returns response with preview: (list of questionID/answer) & score: (final score for IO1, IO3)
 */
const getPreview = async (req, res) => {
     // 1. Check if any information is received. If not, respond to the client with 400(Bad Request)
     if (!req.body.surveyID || !req.body.userIdx) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select a survey.",
        })
    }
    const surveyID = req.body.surveyID;
    const userIdx = req.body.userIdx;

    // 2. Verify the user (check if exists in cache) and save the ongoing survey type 
    const userInfo = userCache.get(String(userIdx));
    // If the user does not exist in cache, respond to the client with error 401(Unauthorized)
     if(userInfo === undefined){   
        return res.status(401).json({
            success: false,
            message: "Unatuthorized User! Please login to proceed."
        })
    }
    const surveyType = userInfo.surveyType;

    // 3. Load all answers from the specified survey
    const result = await findAllAnswers(surveyID);
    // If the answers are NOT retrieved, respond to the client with error 500(Internal Server Error)
    if (result instanceof Error || result === []){
        (result instanceof Error)&& console.error(result.message);
        return res.status(500).json({
            success: false,
            message: "Server Error. Preview is not available. Please press again PREVIEW.",
        })
    }

    // 4. Load the appropriate progress record that has all the answer references
    const record = await findRecord(surveyID);
    const steps = record.progress.map(s => s.stepID); // keep only the stepIDs from the record
    // keep only answered questions that are part of the survey record
    let answers = result.filter(ans => ans.questionID !== "").filter(ans => ans.answer !== "").filter(ans => steps.includes(ans.stepID));
    answers.sort((a,b) => a.stepID-b.stepID);
    const validAnswers = answers.map(elem => {
        return  {
            questionId: elem.questionID,
            question: elem.question,
            answer: (surveyType === "IO6") ? JSON.stringify(elem.answerTxt) : elem.answerTxt
        }
    }); 
//console.log("User: ",userIdx," ValidAnswers:  ",validAnswers);

    // 5. If surveyType is IO1 or IO3, collect all answers that have scores & retrieve the final score
    let score = 0;
    if (surveyType === "IO1"){
        let vanswers = answers.filter(ans => ans.userScore !== "");
        vanswers.sort((a,b) => a.stepID-b.stepID);
        score = getIndex(vanswers);
    }
    if (surveyType === "IO3"){
        let vanswers = answers.filter(ans => ans.userScore !== "");
        vanswers.sort((a,b) => a.stepID-b.stepID);
        score = getScore(vanswers);
    }   
    
    // 6. Respond to the client with the answers list & final score
console.log("User: ",userIdx," asked for survey preview.")
    return res.status(200).json({
        success: true,
        preview: JSON.stringify(validAnswers),
        score: score
    })
}
module.exports = {getPreview};
