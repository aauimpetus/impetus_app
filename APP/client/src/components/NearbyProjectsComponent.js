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
import {BsFillEmojiDizzyFill, BsCaretLeftFill, BsCheckCircle} from "react-icons/bs";
import apis from '../api';

// Nearby Projects Component
// This view shows some nearby projects. The user shall choose only one to save the questionnaire results in the end.
const NearbyProjectView = ({setUserLoggedLevel}) => {

    // Component state
    const {currentUserId, prList, setQuestionnaireList, setProjectId, setProjectTitle, clearPrList} = useProgressController(); //global state
    // Alert handling state
    const [error, setError] = useState("");

    // Button "Select" onClick event handler (submits to server the selected project and redirects to IO selection view)
    const chooseProject = async function(p) {
        const payload = {
            projectId: prList[p].prId,
            userIdx: currentUserId,
            title: prList[p].prTitle,
            category: "",
            description: "",
            lat: prList[p].prLat,
            lon: prList[p].prLng
        }
//console.log("Selected project: ", payload)
        setProjectTitle(prList[p].prTitle)
        // Error handling function
        const handleErr = function(err) {
            console.warn(err.response);
            setError(err.response.data.message)
        };
        const response = await apis.setProject(payload).then(res => res).catch(err => {handleErr(err);});
        
        if (response !== undefined && response.data.success === true){
//console.log("ProjectID: ",response.data.projectID)
            setProjectId(response.data.projectID)
            const resList = await apis.getQuestionnaireList().then(res => res).catch(err => {handleErr(err);});
            let QList = resList.data.data.map((listdata) => {
                return({
                    questionnaireName: listdata.questionnaireName,
                    questionnaireType: listdata.questionnaireType
                })
            })
            setQuestionnaireList(QList)
            setUserLoggedLevel("IO")
        }
    }
    useEffect(()=> {console.log("List2",prList)}, [])

    // Button "Back" onClick event handler (redirects the user back to the dashboard to choose how to select a project)
    const goBack = () => {
        clearPrList()
        setUserLoggedLevel("dashboard")
    }

    // object that maps all nearby projects 
    let nearbyPr = prList.map((project, index) => {
            return(
                <Col xs={12} md={6} className="mb-3">
                    <Card key={index}>
                    <Card.Header as="h5" className="bg-blue">{project.prTitle}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Distance from you: (in km)
                                <br/>
                                <b>{project.prDistance}</b>
                            </Card.Text>
                            <Button variant="success" className="bg-complete" size="lg" onClick={() => chooseProject(index)}><BsCheckCircle/>Select</Button>
                        </Card.Body>
                    </Card>
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
                <h1 className="mb-2"><b>Projects</b></h1>
                <h5>Step 2 - Project Selection</h5>
                <h5>Let's select the project that we want to submit our questionnaire.</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="qbox no-margin pad">
                    <h2 className="mb-2"><b>Nearby Projects</b></h2>
                    <br/>
                    <p>Select one of the nearby projects to submit your questionnaire.</p>
                    <Row className="mb-2">
                        {prList.length === 0
                        ? <p>There are no nearby projects available at the moment.</p>
                        : nearbyPr
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
        );
}

export default NearbyProjectView;