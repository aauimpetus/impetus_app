const {insertProject} = require("../db/models");
/**
 * Saves a selected project to the db (the algorithm has 3 steps)
 * @param {Request} req properties: projectId, userIdx, title, category, description, lat, lon (contains the selected project information)
 * @param {Response} res properties: success, projectId
 * @returns response with the newly created projectId
 */
const setProject = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please select a project.",
        })
    }

    // 2. Insert the received project information to the db
    const projectInfo = {
        status: req.body.projectId,
        userID: req.body.userIdx,
        title: req.body.title,
        category: req.body.category,
        description: req.body.description,
        latitude: req.body.lat,
        longitude: req.body.lon
    };
    const response = await insertProject(projectInfo);
//console.log("User: ",req.body.userIdx," NewPID:  ",response);

    // 3.1 If an error occured, respond to client with error 500(Internal Server Error) 
    if (response instanceof Error) { 
        console.error(response.message)
        return res.status(500).json({
            success: false,
            message: "An error occured. Please resubmit the project form!"
        })
    }
    
    // 3.2 If the project was succesfully saved, forward the new ID to the client 
    else {
console.log("User: ",req.body.userIdx," New project: "+response)
        return res.status(200).json({
            success: true,
            projectID: response
        });
    }
}
module.exports = {setProject};
