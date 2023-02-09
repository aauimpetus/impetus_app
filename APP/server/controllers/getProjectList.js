const fetch = require("node-fetch");
const {findAllUserProjects, countSurveys} = require("../db/models");
const {userCache} = require('../globals')
/**
 * Gets a list of projects created by a specific user from climatescan (the algorithm has 4 steps)
 * @param {Request} req properties: userIdx
 * @param {Response} res properties: success, projectList
 * @returns response with projectList:(list of the projects that were created by this user)
 */
const getProjectList = async (req, res) => {
    // 1. Check if any userID is received. If not, respond to the client with 400(Bad Request)
    if (!req.body.userIdx) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please specify the user of the wanted projects.",
        })
    }

    // 2. Check if the user exists in the cache. If not, respond to the client with 403(Forbidden)
    const userIdx = String(req.body.userIdx);
    const currentUser = userCache.get(userIdx);
    if (currentUser === undefined) {
        return res.status(403).json({
            success: false,
            message: "Please login to have further access to the app!",
        })
    }

    // 3. Prepare and send a request to climatescan
    const authHeader = currentUser.auth;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': authHeader,
        }
    }
    const response = await fetch('https://www.climatescan.org/api/v1/projects', options).catch(err => new Error("ClimateScan projectsAPI failed: ",err))
    
    // 4.1 If data was received from climatescan, forward it to the client 
    if (response.ok) { 
        const data = await response.json();
        let userProjects = await findAllUserProjects(userIdx);
        if (userProjects.length > 0) {
            for(let i = 0; i < userProjects.length; i++){
                const linkedSurveys = await countSurveys(userProjects[i].id);
                userProjects[i].linked_surveys = linkedSurveys;
            }
        }
        return res.status(200).json({
            success: true,
            projectList: JSON.stringify(data),
            userList: userProjects
        })
    }

    // 4.2 If climatescan couldn't find any data, respond to client with error 404(Not Found)
    else if (response.status === 404){
        return res.status(404).json({
            success: false,
            message: "You haven't created any projects yet.",
        })
    }
    
    // 4.3 If the response is an error, respond to client with error 500(Internal Server Error)
    else {
        console.error(response);
        return res.status(500).json({
            success: false,
            message: (response instanceof Error)?response.message :response.statusText
        })
    }
}
module.exports = {getProjectList};
