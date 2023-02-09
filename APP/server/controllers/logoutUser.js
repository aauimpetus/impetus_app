const {userCache} = require("../globals");
/**
 * Logs out the current user by deleting him from the mem-cache (the algorithm has 3 steps)
 * @param {Request} req properties: userIdx
 * @param {Response} res status of the logout
 * @returns response with the status of the logout
 */
const logoutUser = (req, res) => {
    // 1. Get the userIdx from the request
    const userIdx = String(req.body.userIdx);

    // 2 If the user is in the cache, remove him
    if (userCache.has(userIdx)) {
        const value = userCache.del(userIdx);
        if (value === 1) {
console.log("["+Date(Date.now()).toString()+"] User ",userIdx," successfuly logged out.")

            //3.1 If the user is succesfully removed, respond to client with success(200)
            return res.status(200).json({
                success: true,
                message: "User logged out"
            })
        }

	    // 3.2 If the logout/removal failed, respond to client with error 500(Internal Server Error)
        else {
            return res.status(500).json({
                success: false,
                message: "Can't logout the user."
            })
        }
    }
    
    // 3.3 If the user is not cached, respond to client with error 401(Unauthorized User)
    else {
        return res.status(401).json({
            success: false,
            message: "Unauthorized User!"
        })
    }
}
module.exports = {logoutUser};
