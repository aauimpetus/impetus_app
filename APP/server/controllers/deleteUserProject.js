const {userCache} = require('../globals');
const {deleteProject} = require("../db/models");
/**
 * Deletes a selected project from the db (the algorithm has 4 steps)
 * @param {Request} req properties: userIdx, projectID (to be deleted)
 * @param {Response} res properties: success, message
 * @returns response with the status of the request
 */
const deleteUserProject = async (req, res) => {
    // 1. Check if any information is received. If not respond to client with error 400(Bad Request)
    if (!req.body.userIdx || !req.body.projectID) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select the survey you want to delete.",
        })
    }
    const userIdx = String(req.body.userIdx);

    // 2. Check if the user is in the cache. If not respond to client with error 401(Unauthorized User)
    const currentUser = userCache.get(userIdx);
    if (currentUser === undefined) {
            return res.status(401).json({
               success: false,
               message: "Unauthorized User! Please login to be able to continue.",
            })
    }
    
    // 3. Delete the selected project from the db
    const result = await deleteProject(req.body.projectID);
    
    // 4.1 If the project was succesfully deleted, respond to the client with code 200
    if (result) { 
console.log("User: ",userIdx," Project:  ",req.body.projectID," was succesfully deleted.")
        return res.status(200).json({
            success: true,
            message: "The project was deleted"
        });
    }
    // 4.2 If an error occured, respond to client with error 500(Internal Server Error)
    else {
        (result instanceof Error)&& console.error(result.message);
        return res.status(500).json({
            success: false,
            message: "An error occured. Please select again the project you want to delete!"
        })
    }
}
module.exports = {deleteUserProject};
