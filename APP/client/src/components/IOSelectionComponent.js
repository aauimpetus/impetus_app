import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import MenuBar from './MenubarComponent';
import {BsFillEmojiDizzyFill} from "react-icons/bs";
import apis from '../api';

// Questionnaire Type Selection Component
// The user shall choose a prefered questionnaire type to render
const IOSelectionView = ({setUserLoggedLevel}) => {

    // Component state
    const {currentUserId, currentUser, currentProjectId, questionnaireList, setQuestionnaireName, setQuestionnaireType, setSurveyId} = useProgressController(); // global state
    // Alert handling state
    const [error, setError] = useState("");

    // Button onClick event handler (sets the selected questionnaire type and redirects to the questionnaire)
    const qSelection = async function(q) {
        setQuestionnaireName(q.questionnaireName)
        setQuestionnaireType(q.questionnaireType)
        const payload = {
            userIdx: currentUserId,
            userName: currentUser,
            projectID: currentProjectId,
            surveyType: q.questionnaireType,
            surveyName: q.questionnaireName
        }
        //Error handling function
        const handleErr = function(err) {
            console.warn(err.response);
            setError(err.response.data.message)
        };
        const response = await apis.setSurvey(payload).then(res => res).catch(err => {handleErr(err);});
        if (response !== undefined && response.data.success === true){
//console.log("surveyID",response.data.surveyID)
            setSurveyId(response.data.surveyID);
            setUserLoggedLevel("questions")
        }
    }
    useEffect(()=> {console.log("QList",questionnaireList)}, [])

    // object that maps all questionnaire types available 
    let Qtypes = questionnaireList.map(q => {
        return(
            <Col xs={12} className="mt-1 mb-4">
                <Button key={q.questionnareName} variant="light" size="lg" onClick={() => qSelection(q)}><b>{q.questionnaireName}</b></Button>
            </Col>
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
                <h1 className="mb-2"><b>Questionnaires</b></h1>
                <h5>Step 3 - Questionnaire Selection</h5>
                <h5>Let's select the type of questionnaire we want to solve.</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="qbox no-margin pad">
                    <Row>
                        <Col>
                            <Card className="bg-blue" text="light">
                                <Card.Header as="h5">Available Choices:</Card.Header>
                                <Card.Body>
                                    <Row>
                                    {Qtypes}
                                    </Row>
                                    {error !== "" &&
                                    <Row className="mt-2">
                                        <Alert variant="danger" className="errors">
                                            <BsFillEmojiDizzyFill/>
                                            {error}
                                        </Alert>
                                    </Row>
                                    }
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Jumbotron>
            </Col>
        </Row>      
        </Container>  
    );
}

export default IOSelectionView;