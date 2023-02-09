import React, {createContext, useContext, useReducer} from 'react';

const initialState = {
    userId: "",
    userName: "",
    userEmail: "",
    userPass: "",
    loginStatus: false,
    stepId: 0,
    cursor: 0,
    answerId: "",
    questionnaireName: "",
    questionnaireType: "",
    surveyId: null,
    questionData: {
        questionId: null,
        question: "",
        questionType: "start",
        answer: "",
        note: [],
        noteButtonText: "",
        images: [],
    },
    totalNumQ: 0,
    backbtn: false,
    skippable: 0,
    position: {
        lat: 47.6965,
        lng: 14.4289,
    },
    projectId: null,
    projectTitle: "",
    prList: [],
    questionnaireList: [],
    answersList: [],
    score: 0
}
const StoreContext = createContext(initialState);

const reducer = (state, action) => {
    switch(action.type) {
        case "set_userId":
            return {
                ...state,
                userId: action.userId
            };
        case "set_user":
            return {
                ...state,
                userName: action.userName
            };
        case "set_email":
            return {
                ...state,
                userEmail: action.userEmail
            };
        case "set_pass":
            return {
                ...state,
                userPass: action.userPass
            };
        case "set_login_status":
            return {
                ...state,
                loginStatus: action.loginStatus
            };
        case "set_step":
            return {
                ...state,
                stepId: action.stepId
            }
        case "set_cursor":
            return {
                ...state,
                cursor: action.cursor
            }
        case "set_answer_id":
            return {
                ...state,
                answerId: action.answerId
            };
        case "set_questionnaire_name":
            return {
                ...state,
                questionnaireName: action.questionnaireName
            };
        case "set_questionnaire_type":
            return {
                ...state,
                questionnaireType: action.questionnaireType
            };
        case "set_survey_id":
            return {
                ...state,
                surveyId: action.surveyId
            };
        case "set_question_data":
            return {
                ...state,
                questionData: action.questionData
            };
        case "set_position":
            return {
                ...state,
                position: action.position
            };
        case "set_total_num_q":
            return {
                ...state,
                totalNumQ: action.totalNumQ
            };
        case "set_back_btn":
            return {
                ...state,
                backbtn: action.backbtn
            };
        case "set_skippable":
            return {
                ...state,
                skippable: action.skippable
            };
        case "set_project_id":
            return {
                ...state,
                projectId: action.projectId
            };
        case "set_project_title":
            return {
                ...state,
                projectTitle: action.projectTitle
            };
        case "set_prList":
            return{
                ...state,
                prList: action.prList
            };
        case "clear_prList":
            console.log("prList cleared!")
            return{
                ...state,
                prList: []
            };
        case "set_questionnaireList":
            return{
                ...state,
                questionnaireList: action.questionnaireList
            };
        case "set_answersList":
            return{
                ...state,
                answersList: action.answersList
            };
        case "set_score":
            return{
                ...state,
                score: action.score
            };
        case "reset_questionnaire_status": 
            return {
                ...state,
                stepId: 0,
                cursor: 0,
                answerId: "",
                surveyId: null,
                questionnaireName: "",
                questionnaireType: "",
                totalNumQ: 0,
                backbtn: false,
                questionData: {
                    questionId: null,
                    question: "",
                    questionType: "start",
                    answer: "",
                    note: [],
                    noteButtonText: "",
                    images: [],
                },
                projectId: null,
                projectTitle: "",
                prList: [],
                questionnaireList: [],
                answersList: [],
                score: 0
            };
        case "set_defaults":
            return initialState;
        default: 
            return state;
    };
}

export const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    return (
        <StoreContext.Provider value={{state, dispatch}}>
        {children}
        </StoreContext.Provider>
    );
}
      
export const useStore = () => useContext(StoreContext);