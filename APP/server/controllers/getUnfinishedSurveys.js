const {findAllUserSurveys} = require("../db/models");
const {userCache} = require('../globals')
/**
 * Gets a list of a user's unfinished surveys from the db (the algorithm has 3 steps)
 * @param {Request} req properties: userIdx
 * @param {Response} res properties: success, surveyList
 * @returns response with list of surveys (format: surveyID, surveyName, projectID, projectStatus, projectTitle, surveyType)
 */
const getUnfinishedSurveys = async (req, res) => {
    // 1. Check if any information is received or the user exists in the cache. 
    const userIdx = String(req.body.userIdx); 
    const currentUser = userCache.get(userIdx);
    if (currentUser === undefined || !req.body) {
	// if the user is not available, respond to client with error 401(Unauthorized)
        return res.status(401).json({
            success: false,
            message: "Unauthorized user! Please login to proceed.",
        })
    }

    // 2. Get a list of the unfinished surveys from the db
    const response = await findAllUserSurveys(userIdx);

    // 3.1 If there was any error, respond to client with 500(Internal Server Error)
    if (response instanceof Error) { 
        console.error(response.message);
        return res.status(500).json({
            success: false,
            message: "An error occured. Please try again!"
        })
    }
    // 3.2 If a list is retrieved, forward it to the client
    else {
//console.log("User: ",userIdx," SurveyList: ",response)
        return res.status(200).json({
            success: true,
            surveyList: response
        });
    }
}
module.exports = {getUnfinishedSurveys};
