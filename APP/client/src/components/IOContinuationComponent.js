import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import MenuBar from './MenubarComponent';
import {BsFillTrashFill, BsFillEmojiDizzyFill ,BsCaretLeftFill, BsPlayFill} from "react-icons/bs";
import apis from '../api';

// Questionnaire Continuation Component
// This view shows all questionnaires that the user has not finished/submitted yet. The user shall choose one questionnaire to finish it.
const IOContinuation = ({setUserLoggedLevel}) => {
    
    // Component state
    const {currentUserId, prList, setCursor, setProjectId, setProjectTitle, setQuestionnaireName, setTotalNumQ, setBackbtn, setSkippable,
        setQuestionnaireList, setQuestionnaireType, setSurveyId, setQuestionData, setAnswerId, setStep, clearPrList, setPrList} = useProgressController()
    // Alert handling state
    const [error, setError] = useState("");

    // Button "Back" onClick event handler (redirects the user back to the dashboard to choose how to select a project)
    const goBack = () => {
        clearPrList()
        setUserLoggedLevel("dashboard")
    }
    useEffect(()=> {console.log("List2",prList)}, [])

    // Button "Select" onClick event handler (submits to server the selected quetionnaire and redirects to it)
    const chooseQuestionnaire = async function(p) {
        // Set in the state of the selected questionnaire
        const payload = {
            userIdx: currentUserId,
            surveyID: prList[p].surveyId,
            surveyType: prList[p].surveyType,
        }
        setSurveyId(prList[p].surveyId)
        setProjectId(prList[p].prId)
        setProjectTitle(prList[p].prTitle)
        setQuestionnaireName(prList[p].surveyName)
        setQuestionnaireType(prList[p].surveyType)
        // Error handling function
        const handleErr = function(err) {
            console.warn(err.response);
            setError(err.response.data.message)
        };
        // Send to server the selected questionnaire
        const response = await apis.continueSurvey(payload).then(res => res).catch(err => {handleErr(err);});
        const dataString = await response.data.data;
        const data = JSON.parse(dataString);
        const questionData = {
            questionId: data.questionId,
            question: data.question,
            questionType: data.questionType,
            categories: data.categories,
            answer: data.answer,
            note: data.note,
            noteButtonText: data.noteButtonText,
            images: data.images,
        };
        setQuestionData(questionData)
        setSkippable(data.skip)
        setBackbtn(response.data.back)
//console.log("received answer: ", response.data.answer)
        // If we have IO6, we need to initialize the state for the clicker to work 
        // and then to update it with the provided answer
        if (data.nextcategories !== undefined) {
            const counterList = {}; 
            data.nextcategories.map(c => {counterList[c.answer] = 0}); 
            setQuestionnaireList(counterList)
        }
        else if (data.questionType === "clicker") {
            setQuestionnaireList(response.data.answer)
        }
        else {
            setAnswerId(response.data.answer)
        }
        setStep(data.stepId)
        setCursor(response.data.cursor)
        setTotalNumQ(Number(response.data.numQuestions))
        if (dataString !== undefined){
            setUserLoggedLevel("questions")
        }     
    }

    // Button "Delete" onClick event handler (deletes the selected survey's progress from the database)
    const deleteQuestionnaire = async function(p) {
        const payload = {
            userIdx: currentUserId,
            surveyID: prList[p].surveyId
        }
        apis.deleteRecord(payload).then(res => res).catch(err => {setError(err.data.message);}); 
        let newList = prList.filter(pr => pr.surveyId !== prList[p].surveyId)
        setPrList(newList);
    }

    // object that maps all unfinished questionnaires
    let IOitems = prList.map((io,idx) => {
        return (
            <tr>
            <td key={io.surveyId}>{io.surveyId.slice(0, 5)+'...'}</td>
            <td key={io.prId}>{io.prTitle}</td>
            <td key={io.surveyType}>{io.surveyName}</td>
            <td key={io.surveyName}><Button variant="success" className="bg-complete" onClick={() => chooseQuestionnaire(idx)}><BsPlayFill className='no-margin'/>Continue</Button></td>
            <td key={"del"+idx}><Button variant="secondary" onClick={() => deleteQuestionnaire(idx)}><BsFillTrashFill className='no-margin'/>Del</Button></td>
            </tr>
        )
    })

    // View rendering
    return(
        <Container fluid>
            <Row>
                <MenuBar setUserLoggedLevel={setUserLoggedLevel} />
            </Row>
        <Row>
            <Col xs={12} className="text-white mb-3">
                <h1 className="mb-2"><b>Dashboard</b></h1>
                <h5>Let's select one of the unfinished questionnaires to continue.</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="qbox no-margin pad">
                    <h2 className="mb-2"><b>Unfinished questionnaires:</b></h2>
                    <br/>
                    <Row className="mb-2">
                        {prList.length === 0
                        ? <p>You don't have any unfinished questionnaires!</p>
                        :   <Col xs={12} className="mb-3">
                                <Jumbotron className="tbox">
                                    <Table responsive striped bordered hover className="bg-white">
                                        <thead className="bg-blue">
                                            <tr>
                                            <th colSpan="5">You are going to finish answering the desired questionnaire:</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-left">
                                            <tr>
                                            <td key="id" className="td-lbl">ID:</td>
                                            <td key="title" className="td-lbl">Project Title:</td>
                                            <td key="questionnaire" className="td-lbl">Questionnaire:</td>
                                            <td key="options" colSpan="2">Options:</td>
                                            </tr>
                                            {IOitems}
                                        </tbody>
                                    </Table>
                                </Jumbotron>
                            </Col>
                        }
                    </Row>
                    <Row>
                        <Col md={{ span: 6, offset: 3 }}>
                            <Button size="lg" className="q-btn" onClick={goBack}><BsCaretLeftFill/>Back</Button>
                        </Col>
                    </Row>
                    {error !== "" &&
                    <Row>
                        <Alert variant="danger" className="errors">
                            <BsFillEmojiDizzyFill/>
                            {error}
                        </Alert>
                    </Row>
                    }
                </Jumbotron>
            </Col>
        </Row>      
        </Container>  
    )
}

export default IOContinuation;