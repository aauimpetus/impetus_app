import axios from 'axios';

const api = axios.create({baseURL: '/api',});

export const continueSurvey = (payload) => api.post('/continueSurvey', payload);
export const deleteRecord = (payload) => api.post('/deleteRecord', payload);
export const deleteProject = (payload) => api.post('/deleteProject', payload);
export const getCategoryList = (payload) => api.post('/categoryList', payload);
export const getNextQuestion = (payload, reqHeader) => api.post('/nextQ', payload, reqHeader);
export const getPreviousQuestion = (payload) => api.post('/previousQ', payload);
export const getSurveyPreview = (payload) => api.post('/previewS', payload);
export const listProjects = (payload) => api.post('/listProjects', payload);
export const nearbyProjects = (payload) => api.post('/nearbyProjects', payload);
export const getQuestionnaireList = () => api.get('/listQuestionnaires');
export const getUnfinishedSurveys = (payload) => api.post('/unfinishedSurveys', payload);
export const submitLogin = (authHeader) => api.post('/userLogin', authHeader);
export const submitLogout = (payload) => api.post('/userLogout', payload);
export const setProject = (payload) => api.post('/setupProject', payload);
export const setSurvey = (payload) => api.post('/setupSurvey', payload);
export const startSurvey = (payload) => api.post('/newSurvey', payload);
export const submitSurvey = (payload) => api.post('/submitS', payload)

const apis = {
    continueSurvey,
    deleteRecord,
    deleteProject,
    getCategoryList,
    getNextQuestion,
    getPreviousQuestion,
    getSurveyPreview,
    listProjects,
    nearbyProjects,
    getQuestionnaireList,
    getUnfinishedSurveys,
    submitLogin,
    submitLogout,
    setProject,
    setSurvey,
    startSurvey,
    submitSurvey
}
export default apis;
