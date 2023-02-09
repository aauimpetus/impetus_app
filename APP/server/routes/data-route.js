// This file defines the API routes
const express = require('express');
const dataRouter = express.Router()
// controller imports
const {continueSurvey} = require('../controllers/continueSurvey');
const {deleteSurveyRecord} = require('../controllers/deleteSurveyRecord');
const {deleteUserProject} = require('../controllers/deleteUserProject');
const {getCategoryList} = require('../controllers/getCategoryList');
const {getNextQuestion} = require('../controllers/getNextQuestion');
const {getPreview} = require('../controllers/getPreview');
const {getPreviousQuestion} = require('../controllers/getPreviousQuestion');
const {getProjectList} = require('../controllers/getProjectList');
const {getProjectNearby} = require('../controllers/getProjectNearby');
const {getQuestionnaireList} = require('../controllers/getQuestionnaireList');
const {getUnfinishedSurveys} = require('../controllers/getUnfinishedSurveys');
const {loginUser} = require('../controllers/loginUser');
const {logoutUser} = require('../controllers/logoutUser');
const {setProject} = require('../controllers/setProject');
const {setSurvey} = require('../controllers/setSurvey');
const {startSurvey} = require('../controllers/startSurvey');
const {submitSurvey} = require('../controllers/submitSurvey');

dataRouter.post('/continueSurvey', continueSurvey);
dataRouter.post('/deleteRecord', deleteSurveyRecord);
dataRouter.post('/deleteProject', deleteUserProject);
dataRouter.post('/categoryList', getCategoryList);
dataRouter.post('/nextQ', getNextQuestion);
dataRouter.post('/previewS', getPreview);
dataRouter.post('/previousQ', getPreviousQuestion);
dataRouter.post('/listProjects', getProjectList);
dataRouter.post('/nearbyProjects', getProjectNearby);
dataRouter.get('/listQuestionnaires', getQuestionnaireList);
dataRouter.post('/unfinishedSurveys', getUnfinishedSurveys);
dataRouter.post('/userLogin', loginUser);
dataRouter.post('/userLogout', logoutUser);
dataRouter.post('/setupProject', setProject);
dataRouter.post('/setupSurvey', setSurvey);
dataRouter.post('/newSurvey', startSurvey);
dataRouter.post('/submitS', submitSurvey);

module.exports = dataRouter;
