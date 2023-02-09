/**
 * Calculates the final score for IO3 type of questionnaires (the algorithm has 3 steps)
 * @param {Object} answerList The answers and assigned scores, properties: stepID, questionID, question, answer, userScore
 * @returns {Number} The calculated final score of the survey
 */
 const getScore = (answerList) => {
    const answers = answerList;

    // 1. Calculate the score for the questions with stepIDs 4-8
    const startingCursor = answers.map(elem => elem.stepID).indexOf(4); //question with stepID=4
    let fscore;
    // for the question with stepID=4, if the answer is: there are trees(1), we have answers for the next 3 questions
    if (Number(answers[startingCursor].answer) === 1) {
        const currentCursor = startingCursor + 1; //question with stepID=5
        let userScore = 0;
        // for the questions with stepIDs 5,6,7 calculate the score
        for (let i = currentCursor; i < currentCursor + 3; i++) {
            const ans = Number(answers[i].answer);
            const scr = Number(answers[i].userScore);
            userScore += ans * scr;
        }
        // for question with stepID=8, calculate the length of the street
        let distance =  Number(answers[startingCursor + 4].answer);
        distance = distance !== 0 ? distance : 100;
        distance /= 100;
        // final score is the division of the score with the distance
        fscore = Math.round(userScore / distance);
        // final score has a threshold(max value) of 40
        fscore>40&&(fscore = 40);
    }
    // else if the answer is: no trees(0), then we didin't answer the questions 5,6,7,8 so fscore = undefined

    // 2. Calculate the final score for the rest of questions (stepIDs > 8 & answers with a score)
    const sscore = answers.filter(elem => elem.stepID > 8)
                            .filter(elem => elem.userScore !== null)
                            .map(elem => elem.userScore)
                            .reduce((pScore, cScore) => pScore + cScore);

    // 3. Calculate the total final score and return it                       
    const totalScore = (fscore !== undefined) ? fscore + sscore : sscore
    return Number(totalScore);
}
//------------------------------------------------------------------------------------------------------------------
/**
 * Calculates the water index for IO1 type of questionnaires (the algorithm has 3 steps)
 * @param {Object} answerList The answers and assigned scores, properties: stepID, questionID, question, answer, userScore
 * @returns {String} The calculated final index of the survey with appropriate category text
 */
 const getIndex = (answerList) => {
    const answers = answerList;
    let wbp;

    // 1. Check special conditions for Very Low Index
    let aConA =  answers.filter(elem => elem.questionID === 9)
                        .map(elem => elem.userScore)
    let aConB =  answers.filter(elem => elem.questionID === 10)
                        .map(elem => elem.userScore)
    let bCon =  answers.filter(elem => elem.questionID === 18)
                        .map(elem => elem.userScore)
    let cCon =  answers.filter(elem => elem.questionID === 21)
                        .map(elem => elem.userScore)
    let dCon =  answers.filter(elem => elem.questionID === 23)
                        .map(elem => elem.userScore)
    let eCon =  answers.filter(elem => elem.questionID === 25)
                        .map(elem => elem.userScore)             
    if(aConA.length>0 && aConB.length>0 && aConA+aConB >= 5){wbp = "Very Low (condition 1)"}
    else if(bCon.length>0 && bCon === 4){wbp = "Very Low (condition 2)"}
    else if(cCon.length>0 && cCon === 4){wbp = "Very Low (condition 3)"}
    else if(dCon.length>0 && dCon === 3){wbp = "Very Low (condition 4)"}
    else if(eCon.length>0 && eCon === 5){wbp = "Very Low (condition 5)"}
    else {

    // 2. If no special condition applies, calculate the total final score &
    // Save appropriate text with the assigned final score
        const totalScore = answers.filter(elem => elem.userScore !== null)
                                    .map(elem => elem.userScore)
                                    .reduce((pScore, nScore) => pScore + nScore);

        if(totalScore<7){wbp = "Very High: 7";}
        else if(totalScore>=7 && totalScore<=13){wbp = "Very High: "+totalScore;}
        else if(totalScore>=14 && totalScore<=19){wbp = "High: "+totalScore;}
        else if(totalScore>=20 && totalScore<=29){wbp = "Medium: "+totalScore;}
        else if(totalScore>=30 && totalScore<=35){wbp = "Low: "+totalScore;}
        else if(totalScore>=36 && totalScore<=40){wbp = "Very Low: "+totalScore;}
        else {wbp = "Very Low: 40"};
    }

    // 3. Return the assigned index with the category text
    return wbp;
 }
module.exports = {getScore, getIndex};
