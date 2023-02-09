const {findAnswer, insertAnswer, updateAnswer, deleteAnswers, findRecord, updateRecord, replaceRecord} = require("../db/models");
const {readFile, rm} = require('fs/promises');
const path = require('path');
const {userCache} = require('../globals');
/**
 * Gets the NEXT question of the questionnaire in progress & saves the received CURRENT answer (the algorithm has 6 steps)
 * @param {Request} req properties: userIdx, surveyID, stepId, answer
 * @param {Response} res properties: success, data, answer, back, cursor
 * @returns response with data:(next question block), answer:(saved answer if exists), back button flag & next progress cursor
 */
const getNextQuestion = async (req, res) => {
    // 1. Check if any information is received. If not, respond to the client with error 400(Bad Request)
    if (!req.body.stepID || !req.body.surveyID || !req.body.userIdx) {
        return res.status(400).json({
            success: false,
            message: "Bad Request! Answer the question to continue.",
        })
    }
    let surveyID = req.body.surveyID;
    let currentStep = Number(req.body.stepID);
    let answer = req.body.answer;
    let currentCursor = Number(req.body.cursor);
    let nextCursor = (currentCursor+1);
    let userInfo = userCache.get(String(req.body.userIdx));
    const file = req.file;
    if (file !== undefined) {answer = file;}

    // 2. Load the current questionnaire context from cache
    // If the user is not cached, respond to the client with error 401(Unauthorized User)
    if (userInfo === undefined) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized User! Please login to continue.",
        })
    }
    const questionnaire = userInfo.questionnaire;

    // 3. Find the current question block and save the received answer
    const currentBlock = questionnaire.find(block => block.stepId === currentStep);
    let questionID = currentBlock.questionId;
    let questionTxt = currentBlock.question;
    let answerTxt = "";
    let nextStepID, userScore;
    if (currentBlock.questionType === "radio" && currentBlock.answer[answer] !== undefined){
        answerTxt = currentBlock.answer[answer].answer;
        userScore = currentBlock.answer[answer].score;
        nextStepID = currentBlock.answer[answer].nextStep;
        // For IO6: Save in cache the num of clickers that will be rendered
        if(currentBlock.nextcategories !== undefined){
            userInfo["squaremeters"] = 22+Number(answerTxt);
            userCache.set(String(req.body.userIdx), userInfo);
        }
    }
    else if(currentBlock.questionType === "clicker"){ 
        let clickerList = [];
        let clickerItem = {};
        // Loop through the answers and save them in a nicer format under answerTxt
        currentBlock.categories.map(c => {
            c.questions.map(q => {
                q.answers.map(a => {
                    clickerItem["category"] = c.category;
                    clickerItem["subcategory"] = q.question;
                    clickerItem["ospar_id"] = a.osparId;
                    clickerItem["type"] = a.answer;
                    clickerItem["number"] = String(answer[a.answer]);
                    clickerList.push(clickerItem);
                    clickerItem = {};
                })
            })
        })
        answerTxt = clickerList;
        // Calculate the nextStepID (3 steps)
        // 1. Retrieve cache to check the num of clickers to be rendered
        let sqmts = Number(userInfo.squaremeters)
        // 2. As long as we have squaremeters to measure, +1 the nextstepID
        if(currentStep > 22 && currentStep < sqmts ){
            nextStepID = currentStep+1;
        }
        // 3. When we measure the last squaremeter, we finalize the questionnaire
        else {
            nextStepID = currentBlock.nextStep;
        }
    }
    else if(currentBlock.questionType === "file" && answer.path !== undefined){
        nextStepID = currentBlock.answer[0].nextStep;
        // Encode the image in base64 and save under answer
        const imageFilePath = path.join(__dirname, "..",file.path);
        const imageFile = await readFile(imageFilePath, 'base64');
        const uri = `data:image/jpeg;base64,${imageFile}`;
        answer = uri;
        answerTxt = uri;
    }
    else {
        if (answer !== "" || answer !== undefined) {
            answerTxt = answer;
            userScore = currentBlock.answer[0].score; 
        }
        nextStepID = currentBlock.answer[0].nextStep;
    }

    // 4. Load the next question block from questionnaire
    const nextQuestion = questionnaire.find(q => q.stepId === nextStepID);
    // 5. Save the answer to db under answers & check if next answer exists
    // 5.1 Load the progress record from db & find the current step
    const record = await findRecord(surveyID);
//console.log("User: ",req.body.userIdx," Record data:  ",record);
    // If the progress is NOT retrieved, respond to the client with error 500(Internal Server Error)
    if (record instanceof Error || record === null){
        console.error(record.message);
        return res.status(500).json({
            success: false,
            message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
        })
    }
    const currentProgress = record.progress.find(block => block.stepID === currentStep);

    // 5.2 If the current step exists in the progress (we traverse already explored questions)
    if (currentProgress !== undefined){
        let currentIdx = record.progress.findIndex(block => block.stepID === currentStep);
        const nextStep = record.progress[currentIdx+1];
        
        // 5.2.1 If the current step is the last element of progress,
        // update the answer with the received one from the request
        if (nextStep === undefined){
             let info = {
                    answer: answer,
                    answerTxt: answerTxt,
                    userScore: (userScore === undefined) ? "" : userScore
                }
            const result = await updateAnswer(currentProgress.answerID,info);
            // If the answer was NOT updated, respond to client with error 500(Internal Server Error)
            if(result instanceof Error){
                console.error(result.message);
                return res.status(500).json({
                    success: false,
                    message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                })
            }

            // 6. If the answer was succesfully updated, respond to client with the next question block
            else {
                // Delete files as they are now saved in the database
                if(file !== undefined){
                    const imageFilePath = path.join(__dirname, "..",file.path);
                    const delFile = await rm(imageFilePath, {force: true});
                }
                return res.status(200).json({
                    success: true,
                    data: JSON.stringify(nextQuestion),
                    answer: "",
                    back: true,
                    cursor: nextCursor
                });
            }

        }

        // 5.2.2 If the current step is not at the end of the progress (we have next questions answered)
        // 5.2.2.1 The answer didn't change path (same nextStep),
        else {
            if (nextStep !== undefined && nextStep.stepID === nextQuestion.stepId) {
                // update the answer with the received one from the request
                let info = {
                       answer: answer,
                       answerTxt: answerTxt,
                       userScore: (userScore === undefined) ? "" : userScore
                   }
                const result = await updateAnswer(currentProgress.answerID,info);
                // If the answer was NOT updated, respond to client with error 500(Internal Server Error)
                if(result instanceof Error){
                    console.error(result.message);
                    return res.status(500).json({
                        success: false,
                        message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                    })
                }
                // If the answer was succesfully updated,
                else {
                    // get the next saved answer & respond to client with next question block + answer
                    const nextAnswer = await findAnswer(nextStep.answerID);
                    // If the answer was NOT retrieved, respond to client with error 500(Internal Server Error)
                    if (nextAnswer instanceof Error){
                        console.error(nextAns.message);
                        return res.status(500).json({
                            success: false,
                            message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                        })
                    }

                    // 6. Respond to client with next question block & answer
                    else {
                        // Delete files as they are now saved in the database
                        if(file !== undefined){
                            const imageFilePath = path.join(__dirname, "..",file.path);
                            const delFile = await rm(imageFilePath, {force: true});
                        }
                        return res.status(200).json({
                            success: true,
                            data: JSON.stringify(nextQuestion),
                            answer: nextAnswer.answer,
                            back: true,
                            cursor: nextCursor
                        });
                    }
                }
            }

            // 5.2.2.2 The answer changed path (different nextStep)
            else {
                // update the answer with the received one from the request
                let info = {
                       answer: answer,
                       answerTxt: answerTxt,
                       userScore: (userScore === undefined) ? "" : userScore
                   }
                const result = await updateAnswer(currentProgress.answerID,info);
                // If the answer was NOT updated, respond to client with error 500(Internal Server Error)
                if(result instanceof Error){
                    console.error(result.message);
                    return res.status(500).json({
                        success: false,
                        message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                    })
                }
                // If the answer was succesfully updated,
                else {
                    // update the progress record and delete the unused answers
                    let newProgress = record.progress.slice(0, currentIdx+1);
                    const info = {
                        surveyID: surveyID,
                        progress: newProgress
                    }
//console.log("User: ",req.body.userIdx," Sliced Record:  ",newProgress);
                    const replaced = await replaceRecord(surveyID,info);
                    await deleteAnswers(surveyID,currentStep);
                    // 6. Then respond to client with next question block
                    if (replaced){
                        // Delete files as they are now saved in the database
                        if(file !== undefined){
                            const imageFilePath = path.join(__dirname, "..",file.path);
                            const delFile = await rm(imageFilePath, {force: true});
                        }
                        return res.status(200).json({
                            success: true,
                            data: JSON.stringify(nextQuestion),
                            answer: "",
                            back: true,
                            cursor: nextCursor
                        });
                    }
                    // If any error occured, respond to client with error 500(Internal Server Error)
                    else {
                        console.error(replaced.message);
                        return res.status(500).json({
                            success: false,
                            message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                        })
                    }
                }
            }
        }

    }

    // 5.3 If the current step doesn't exist (we traverse a NEW question)
    else {
        // Save a new answer to db
        let info = {
                    surveyID: surveyID,
                    stepID: currentStep,
                    questionID: questionID,
                    question: questionTxt,
                    answer: answer,
                    answerTxt: answerTxt,
                    userScore: (userScore === undefined) ? "" : userScore
                }
        const answerId = await insertAnswer(info);
//console.log("User: ",req.body.userIdx," NewAnswerID: ",answerId);
        // If the answer was NOT saved, respond to client with error 500(Internal Server Error)
        if (answerId instanceof Error){
            console.error(answerId.message);
            return res.status(500).json({
                success: false,
                message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
            })
        }

        // 5.3.1 After saving the answer succesfully, update the progress record
        else {
            progressData = {
                stepID: Number(currentStep),
                answerID: answerId
            }
            const newProgress = await updateRecord(surveyID,progressData);
            // If the record was NOT updated, respond to client with error 500(Internal Server Erro)
            if (newProgress instanceof Error){
                console.error(newProgress.message);
                return res.status(401).json({
                    success: false,
                    message: "Server Error. Your answer was not saved. Please answer again and press NEXT.",
                })
            }

            // 6. If the answer and record were saved succesfully, respond to client with the next question block
            else {
                // Delete files as they are now saved in the database
                if(file !== undefined){
                    const imageFilePath = path.join(__dirname, "..",file.path);
                    const delFile = await rm(imageFilePath, {force: true});
                }
                return res.status(200).json({
                    success: true,
                    data: JSON.stringify(nextQuestion),
                    answer: "",
                    back: true,
                    cursor: nextCursor
                });
            }
        }
    }
}
module.exports = {getNextQuestion};
