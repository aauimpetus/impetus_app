import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import MenuBar from './MenubarComponent';
import {BsSave2Fill} from "react-icons/bs";
import apis from '../api';

// Preview Survey Answers Component
// This is the view that shows a preview of the finished questionnaire and submits everything to climatescan
const Preview = ({setUserLoggedLevel}) => {

    // Component state
    const {currentPosition, currentUserId, currentSurveyId, questionnaireType, answersList, score, resetQuestionnaireStatus} = useProgressController();
    // Local state
    const [fscore, setFscore] = useState(false);

    useEffect(()=> {
        console.log("AnswersList ",answersList);
        (questionnaireType === "IO1"||questionnaireType === "IO3")&& setFscore(true);
    }, [])

    // Button "End" event handler
    // Resets the state and redirects the user to the initial map
    const onEnd = () => {
        resetQuestionnaireStatus()
        setUserLoggedLevel("map")
    }

    // Button "Save" event handler
    // Saves the answered questionnaire
    const saveQuestionnaire = () => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([JSON.stringify(answersList, null, 2)], {
            type: "application/json"
        }));
        a.setAttribute("download", "answers.json");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Button "Submit" event handler
    // Submits the questionnaire answers to climatescan
    const submitQuestionnaire = async () => {
        const handleErr = function(err) {
            console.warn(err.response);
            alert(err.response.data.message)
        };
        const payload = {
            userIdx: currentUserId,
            surveyID: currentSurveyId,
            position: currentPosition,
            answers: answersList,
            score: score,
        }
        const response = await apis.submitSurvey(payload).then(res => res).catch(error => {handleErr(error);});
        if (response !== undefined && response.data.success === true){
            alert(response.data.message)
            resetQuestionnaireStatus()
            setUserLoggedLevel("map")
        }
    }

     // object that maps all answers
     let allAnswers = answersList.map((a,idx) => {
        if(questionnaireType === "IO6" && a.questionId >= 7){
            return(
                <tr>
                <td key={a.questionId}>{a.questionId}</td>
                <td key={a.question}>{a.question}</td>
                <td key={idx+1}><ul>
                  {a.answer.map(ans =>{
                    return(
                        <li>
                            <p>{ans.category}</p>
                            <p>{ans.subcategory}</p>
                            <p><b>{ans.type}</b></p>
                            <p><b>Count: {ans.number}</b></p>
                            <hr/>
                        </li>
                    )
                  })}
                  </ul></td>
                </tr>
            )
        } 
        else {
            return(
                <tr>
                <td key={a.questionId}>{a.questionId}</td>
                <td key={a.question}>{a.question}</td>
                <td key={idx+1}>{a.answer}</td>
                </tr>
            )
        }
    })
    return(
        <Container fluid>
        <Row>
            <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
        </Row>
        <Row>
            <Col xs={12} className="text-white mb-3">
                <h1 className="mb-2"><b>Your Answers</b></h1>
                <h5>Step 5 - Questionnaire Preview/Submission</h5>
                <h5>Click "Submit your Answers" to save your answers under the selected project in climatescan.</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron className="qbox pad">
                    <p className="question-txt">Thank you for your contribution!</p>
                    <br/>
                    <p className="question-txt">You can save your answers to your device by clicking save.</p>
                    <br/>
                    <Row>
                        <Col md={6}><Button size="lg" className="submit-btn" onClick={submitQuestionnaire}><span className="pulse">Submit Your Answers</span></Button></Col>
                        <Col md={6}><Button size="lg" className="general-btn" onClick={onEnd}>Start New Questionnaire</Button></Col>
                    </Row>
                    <Row>
                        <Table responsive striped bordered hover className="bg-white mt-2">
                            <thead className="bg-blue">
                                <tr>
                                <th colSpan="2">Your final answers:</th>
                                <th><Button className="q-btn" size="lg" onClick={saveQuestionnaire}><BsSave2Fill/>Save</Button></th>
                                </tr>
                            </thead>
                            <tbody className="text-left">
                                <tr>
                                <td key="questionId" className="td-lbl">Question ID:</td>
                                <td key="question" className="td-lbl">Question:</td>
                                <td key="answer" className="td-lbl">Answer:</td>
                                </tr>
                                {allAnswers}
                            </tbody>
                        </Table>
                    </Row>
                    {fscore &&
                    <Row>
                        <Col md={{span: 8, offset: 2}}>
                            <Card className="bg-darkgreen mb-4" text="light">
                                <Card.Header as="h5">Final Score:</Card.Header>
                                <Card.Body>
                                    <Row>
                                    <Col xs={12} className="mt-1 mb-4">
                                    {score}
                                    </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    }
                </Jumbotron>
            </Col>
        </Row>
        </Container>
    )
}

export default Preview