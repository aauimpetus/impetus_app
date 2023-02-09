const fetch = require("node-fetch");
/**
 *  Given the current position coordinates, it gets the nearby projects from climatescan (the algorithm has 3 steps)
 * @param {Request} req properties: lat(latitude), lon(longitude)
 * @param {Response} res properties: success, projectList
 * @returns response with projectList:(list with the nearby projects information)
 */
const getProjectNearby = async (req, res) => {
    // 1. Check if any position is received. If not, respond to the client with 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Please specify your location.",
        })
    }
    const lat = req.body.lat;
    const lon = req.body.lon;

    // 2. Prepare and send a request to climatescan
    const nearbyURL = 'https://www.climatescan.org/api/v1/projects/';
    const nearbyRequest = nearbyURL + 'nearby?lat=' + lat.toString() + '&' + 'lon=' + lon.toString();
    
    const response = await fetch(nearbyRequest).catch(err => new Error("ClimateScan projectsAPI failed: ",err))
    
    // 3.1 If data was received from climatescan, forward it to the client 
    if (response.ok) { 
        const data = await response.json();
        return res.status(200).json({
            success: true,
            projectList: JSON.stringify(data)
        });
    }
    
    // 3.2 If climatescan couldn't find any data, respond to client with error 404(Not Found)
    else if(response.status === 404) {
        return res.status(404).json({
            success: false,
            message: "There are no nearby projects at the moment.",
        })
    }
    
    // 3.3 If the response is an error, respond to client with error 500(Internal Server Error)
    else {
        console.error(response);
        return res.status(500).json({
            success: false,
            message: (response instanceof Error)?response.message :response.statusText
        })
    }
}
module.exports = {getProjectNearby};
