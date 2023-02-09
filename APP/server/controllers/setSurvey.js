const {insertSurvey} = require("../db/models");
/**
 * Saves a selected survey to the db (the algorithm has 3 steps)
 * @param {Request} req properties: surveyName, surveyType, projectID, userIdx (contains the selected survey information)
 * @param {Response} res properties: success, surveyID
 * @returns response with the newly created surveyID
 */
const setSurvey = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select a survey.",
        })
    }

    // 2. Insert the received survey information to the db
    const surveyInfo = {
        name: req.body.surveyName,
        type: req.body.surveyType,
        projectID: req.body.projectID,
        userID: req.body.userIdx,
        userName: req.body.userName,
        public: false
    };
    const response = await insertSurvey(surveyInfo);
//console.log("User: ",req.body.userIdx," NewSID:  ",response);    

    // 3.1 If an error occured, respond to client with error 500(Internal Server Error)
    if (response instanceof Error) { 
        console.error(response.message)
        return res.status(500).json({
            success: false,
            message: "An error occured. Please select again a questionnaire!"
        })
    }
    
    // 3.2 If the survey was succesfully saved, forward the new ID to the client 
    else {
console.log("User: ",req.body.userIdx," New survey: "+response)
        return res.status(200).json({
            success: true,
            surveyID: response
        });
    }
}
module.exports = {setSurvey};
