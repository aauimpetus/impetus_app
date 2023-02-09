const {findSurvey, findProject, insertSubmission, deleteSurvey, deleteProject, deleteRecord,} = require("../db/models");
const FormData = require("form-data");
const fetch = require("node-fetch");
const {userCache} = require('../globals');
require('dotenv/config');
/**
 * Once a survey is completed, it submits the answers to climate scan,
 * then it creates a backup in db (the algorithm has 7 steps)
 * @param {Request} req properties: userIdx, surveyID, position, answers, score
 * @param {Response} res properties: success, score
 * @returns response with status of submission & final score for IO3 surveyType
 */
const submitSurvey = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with error 400(Bad Request)
    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Select a finished questionnaire for submission.",
        })
    }

    // 2. Get the userIdx, surveyID, position & answers list from request
    const userIdx = req.body.userIdx;
    const surveyID = req.body.surveyID;
    const userPosition = req.body.position;
    const answerList = req.body.answers;

    // 3. Get the authentication from cache and survey & associated project data from db
    const userInfo = userCache.get(String(userIdx));
    // If the user is not cached, respond to the client with error 401(Unauthorized User)
    if (userInfo === undefined) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized User! Please login to continue.",
        })
    }
    let authHeader = String(userInfo.auth);
    const survey = await findSurvey(surveyID);
    const project = await findProject(survey.projectID);
//console.log("User: ",userIdx," Survey:  ",survey);
//console.log("User: ",userIdx," Project:  ",project);
    // If the survey/project data are NOT retrieved, respond to the client with error 500(Internal Server Error)
    if (survey instanceof Error || project instanceof Error){
        (survey instanceof Error)&& console.error(survey);
        (project instanceof Error)&& console.error(project);
        return res.status(500).json({
            success: false,
            message: "Server Error. Please press again SUBMIT or try again later.",
        })
    }

    // 4. Prepare the data for submission & send a request to climatescan
    // 4.1 Add the survey details to the front of the answers list & the score to the end, if exists
    let answers = [{questionnaireType: survey.name}]
    answers.push({longitude: userPosition.lng});
    answers.push({latitude: userPosition.lat});
    (survey.type === "IO2" || survey.type === "IO4") && answers.push({images: true});
    answerList.forEach(answer => answers.push(answer) );
    (survey.type === "IO1") && answers.push({wbpIndex: req.body.score});
    (survey.type === "IO3") && answers.push({score: req.body.score});
//console.log("User: ",userIdx," AllAnswers: ",answers)

    // 4.2 Check if the survey will be submitted in climatescan under an existing project(update project) 
    // or under a new project(create project) and prepare the appropriate payload for each case
    const jsonParams = {
        longitude: String(project.longitude),
        latitude: String(project.latitude),
        research: [
            {
                public: survey.public,
                contentType: 'application/vnd.impetus-survey.v1+json',
            },
        ],
    };
    if (project.status.match(/NEW/gi) !== null) { //if the project is new
        jsonParams["title"] = project.title;
        jsonParams["category"] = project.category;
        jsonParams["description"] = project.description;
    }
    else {
        jsonParams["projectId"] = project.status; //if the project exists
    }
//console.log("User: ",userIdx," JsonParams:  ",jsonParams);
//console.log("User: ",userIdx," surveyAnswers:  ",answers);

    // 4.3 Prepare the data according to climatescan documentation
    const userAnswersString = JSON.stringify(answers);  
    const fileName = survey.name +'_' + userPosition.lat + '_impetus.json';
    const formData = new FormData();
    formData.append('params', JSON.stringify(jsonParams));
    formData.append('research[]', userAnswersString, fileName, {type: 'application/json'});

    const options = {
        method: 'POST',
        headers: {
            'Authorization': authHeader,
        },
        body: formData,
    };

    // 4.4 Send a submission request to climatescan
    const response = await fetch('https://www.climatescan.org/api/v1/projects/new', options);
    const data = await response.json();
    if("errors" in data){ 
console.log("User: ",userIdx," ClimateScan submission error of survey: ",surveyID)
        console.error(data.errors);
        return res.status(500).json({
            success: false,
            message: "The submission was NOT succesfull. Try again later."
        });
    }

    // 5. Save under submissions_backup the submitted info
    const backupInfo = {
        projectData: jsonParams,
        surveyAnswers: answers
    };
    const result = await insertSubmission(backupInfo);
    if (result instanceof Error) {
        console.error(result);
        return res.status(500).json({
            success: true,
            message: "Your answers were submitted, but the backup failed."
        });
    }
    else {
console.log("User: ",userIdx," Successfull submission of survey: ",surveyID)

    // 6. Delete project,survey/answers,record
        const delP = await deleteProject(project.id);
        const delS = await deleteSurvey(surveyID,userIdx);
        const delR = await deleteRecord(surveyID);
        (delP instanceof Error) && console.error(delP.message);
        (delS instanceof Error) && console.error(delS.message);
        (delR instanceof Error) && console.error(delR.message);
        
        // 7. Respond 200 to client
        return res.status(200).json({
            success: true,
            message: "Your answers were submitted succesfully!"
        })
    }
}
module.exports = {submitSurvey};
