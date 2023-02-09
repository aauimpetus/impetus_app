const fetch = require("node-fetch");
const {userCache} = require('../globals');
/**
 * Authenticates user through climatescan and saves him in mem-cache (the algorithm has 5 steps)
 * @param {Request} req authentication information send by the login view
 * @param {Response} res properties: success, display_name, id
 * @returns response according to the status of the login
 */
const loginUser = async (req, res) => {
    // 1. Check if any information is received. If not, respond to client with error 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Please make sure all fields are filled!"
        })
    }

    // 2. Extract the authorization header from the request body &
    const authHeader = req.body.authorization;
    // Build the options object to send to climatescan for authorization
    const options = {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
        }
    }

    // 3. Send request for authentication to climatescan 
    const response = await fetch('https://www.climatescan.org/api/v1/user/login', options).catch(err => new Error("Climatescan login failed: ",err))
    
    // 4.1 If the response from climatescan is sucessfull, add the logged user to the mem-cache (stays in until logout)
    if (response.ok) {
        const data = await response.json();
        const userName = data.user.display_name;
        const userIdx = data.user.id;
        const userInfo = {
            auth: authHeader,
            email: data.user.email
        }
        if (!userCache.has(String(userIdx))) {
console.log("["+Date(Date.now()).toString()+"] New user just logged in: ",userIdx)
            userCache.set(String(userIdx), userInfo, 0);
        }

        // 5. Once the user is successfully logged in and saved in the mem-cache, respond to client with 200(Success)
        return res.status(200).json({
            success: true,
            display_name: userName,
            id: userIdx,
        })
    }

    // 4.2 If the user details are wrong, respond to client with 401(Unauthorized User)
    else if(response.status === 401) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized User. Please try again to login.",
        })
    }
    
    // 4.3 If the response is an error, respond to client with error 500(Internal Server Error)
    else {
        return res.status(500).json({
            success: false,
            message: (response instanceof Error)?response.message :response.statusText
        })
    }
}
module.exports = {loginUser};
