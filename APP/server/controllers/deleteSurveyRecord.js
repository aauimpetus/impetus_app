const {userCache} = require('../globals');
const {deleteSurvey, deleteRecord, findSurvey, deleteProject} = require("../db/models");
/**
 * Deletes a selected survey and the associated progress record from the db (the algorithm has 5 steps)
 * @param {Request} req properties: userIdx, surveyID (to be deleted)
 * @param {Response} res properties: success, message
 * @returns response with the status of the request
 */
const deleteSurveyRecord = async (req, res) => {
    // 1. Check if any information is received. If not respond to client with error 400(Bad Request)
    if (!req.body.userIdx || !req.body.surveyID) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select the survey you want to delete.",
        })
    }
    const userIdx = String(req.body.userIdx);
    const surveyID = req.body.surveyID;

    // 2. Check if the user is in the cache. If not respond to client with error 401(Unauthorized User)
    const currentUser = userCache.get(userIdx);
    if (currentUser === undefined) {
            return res.status(401).json({
               success: false,
               message: "Unauthorized User! Please login to be able to continue.",
            })
    }

    // 3. Delete the selected survey/answers and the associated project from the db
    const resSurvey = await findSurvey(surveyID);
    const result = await deleteProject(resSurvey.projectID);
    const result1 = await deleteSurvey(surveyID,userIdx);
    
    // 4.1 If the survey was succesfully deleted, continue with the associated progress record
    if (result1) { 
        const result2 = await deleteRecord(surveyID);
        
        // 5. If the progress record was also succesfully deleted, respond to the client with code 200
        if (result2){
console.log("User: ",userIdx," Survey ",surveyID," and related progress record were deleted.")
            return res.status(200).json({
                success: true,
                message: "The survey was succesfully deleted"
            });
        }
        else {
console.log("User: ",userIdx," Survey ",surveyID," was deleted but related progress record was NOT!!!")
            return res.status(200).json({
                success: true,
                message: "The survey was deleted"
            });
        }
    }
    // 4.2 If an error occured, respond to client with error 500(Internal Server Error)
    else {
        (result1 instanceof Error)&& console.error(result1.message);
        return res.status(500).json({
            success: false,
            message: "An error occured. Please select again the survey you want to delete!"
        })
    }
}
module.exports = {deleteSurveyRecord};
