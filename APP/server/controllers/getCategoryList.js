const fetch = require("node-fetch");
const {userCache} = require('../globals');
/**
 * Gets a list of project categories from climate scan (the algorithm has 4 steps)
 * @param {Request} req properties: userIdx
 * @param {Response} res properties: success, data(list of IDs/Names)
 * @returns response with a list of the project category names and IDs
 */
const getCategoryList = async (req, res) => {
    // 1. Check if the user is in the cache and get the corresponding auth
    const userIdx = String(req.body.userIdx);
    const currentUser = userCache.get(userIdx);
    if (currentUser === undefined || !req.body.userIdx) {
	// if the user is not available, respond to client with error 401(Unauthorized)
        return res.status(401).json({
            success: false,
            message: "Unauthorized user! Please login to proceed.",
        })
    }
    else {

        // 2. Send a request to climatescan
        const responseData = await fetch('https://www.climatescan.org/api/v1/categories/list', {
            method: 'POST',
            headers: {
                'Authorization': currentUser.auth,
            },
        })

        // 3. Save the categories (categoryID & name) from climate scan grouped by their focus topic
        .then(res => res.json()).then(rawCategories => rawCategories.reduce((prev, current) => {
            if (!prev[current.focustopic_id]) {
                prev[current.focustopic_id] = {
                    fname: current.focustopic_name,
                    items: [],
                };
            }
            let cat = {
                id: current.cat_id,
                name: current.name
            }
            prev[current.focustopic_id].items.push(cat);
            return prev;
        }, {}))
        // if an error occured, respond to client with code 502(Bad Gateway)
        .catch(err => {
            return res.status(502).json({
                success: false,
                message: err.message,
            })
        });

        // 4. Send the category list to the client
         if (!responseData.statusCode) {
            return res.status(200).json({
                success: true,
                data: JSON.stringify(responseData),
            })
        }
    }
}
module.exports = {getCategoryList};
