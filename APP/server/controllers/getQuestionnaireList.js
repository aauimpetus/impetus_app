const {readdir, readFile} = require('fs/promises');
const path = require('path');
/**
 * Gets a list of all the available questionnaires by checking the questionnaires folder (the algorithm has 3 steps)
 * @param {Request} req 
 * @param {Response} res properties: success, data
 * @returns response with data:(list of the names and types of available questionnaires)
 */
const getQuestionnaireList = (req, res) => {
    // 1. Read all json files of the available questionnaires,
    readdir(path.join(__dirname, '..', 'db', 'questionnaires'))
        .then(filenames => {
            // Load all the files in a json list
            return Promise.all(filenames.map(f => readFile(path.join(__dirname, '..', 'db', 'questionnaires', f),'utf8')))
        })
        .then(files => {
            return files.map(file => {
                // 2. For every file in the list, save the name and type properties
                const fileContent = JSON.parse(file);
                const payload = {
                    questionnaireName : fileContent.name,
                    questionnaireType : fileContent.type,
                };
                return payload
            })
        })
        .then(data => {
	    // 3.1 Respond to the client with the survey list and 200 status
            return res.status(200).json({
                success: true,
                data: data,
            })
        })
	// 3.2 If there are errors, respond with error 500(Internal Server Error)
        .catch(err => {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
            })
        })
}
module.exports = {getQuestionnaireList};
