import { useStore } from './Store';

const useProgressController = () => {
    const {state, dispatch} = useStore();
    // api object
    return {
        currentUserId: state.userId,
        currentUser: state.userName,
        currentUserEmail: state.userEmail,
        currentUserPass: state.userPass,
        loginStatus: state.loginStatus,
        currentStep: state.stepId,
        currentCursor: state.cursor,
        currentAnswerId: state.answerId,
        questionnaireName: state.questionnaireName,
        questionnaireType: state.questionnaireType,
        currentSurveyId: state.surveyId,
        currentQuestionData: state.questionData,
        totalNumQ: state.totalNumQ,
        backbtn: state.backbtn,
        skippable: state.skippable,
        currentPosition: state.position,
        currentProjectId: state.projectId,
        currentProjectTitle: state.projectTitle,
        prList: state.prList,
        questionnaireList: state.questionnaireList,
        answersList: state.answersList,
        score: state.score,
        setUser: (name) => dispatch({type: "set_user", userName: name}),
        setUserId: (id) => dispatch({type: "set_userId", userId: id}),
        setEmail: (email) => dispatch({type: "set_email", userEmail: email}),
        setPass: (pass) => dispatch({type: "set_pass", userPass: pass}),
        setLoginStatus: (isLogged) => dispatch({type: "set_login_status", loginStatus: isLogged}),
        setStep: (id) => dispatch({type:"set_step", stepId: id}),
        setCursor: (id) => dispatch({type:"set_cursor", cursor: id}),
        setAnswerId: (id) => dispatch({type:"set_answer_id", answerId: id}),
        setQuestionnaireName: (qName) => dispatch({type: "set_questionnaire_name", questionnaireName: qName}),
        setQuestionnaireType: (qType) => dispatch({type: "set_questionnaire_type", questionnaireType: qType}),
        setSurveyId: (id) => dispatch({type: "set_survey_id", surveyId: id}),
        setQuestionData: (data) => dispatch({type: "set_question_data", questionData: data}),
        setTotalNumQ: (num) => dispatch({type: "set_total_num_q", totalNumQ: num}),
        setBackbtn: (flag) => dispatch({type: "set_back_btn", backbtn: flag}),
        setSkippable: (num) => dispatch({type: "set_skippable", skippable: num}),
        setPosition: (newPosition) => dispatch({type: "set_position", position: newPosition}),
        setProjectId: (id) => dispatch({type: "set_project_id", projectId: id}),
        setProjectTitle: (name) => dispatch({type: "set_project_title", projectTitle: name}),
        setPrList: (list) => dispatch({type: "set_prList", prList: list}),
        clearPrList: () => dispatch({type: "clear_prList"}),
        setQuestionnaireList: (list) => dispatch({type: "set_questionnaireList", questionnaireList: list}),
        setAnswersList: (list) => dispatch({type: "set_answersList", answersList: list}),
        setScore: (score) => dispatch({type: "set_score", score: score}),
        resetQuestionnaireStatus: () => dispatch({type: "reset_questionnaire_status"}),
        setDefaults: () => dispatch({type: "set_defaults"})
    };
}

export default useProgressController;
