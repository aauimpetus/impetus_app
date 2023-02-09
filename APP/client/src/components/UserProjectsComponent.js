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
import {BsFillEmojiDizzyFill, BsCaretLeftFill,BsCheckCircle,BsFillTrashFill} from "react-icons/bs";
import apis from '../api';

// User Projects Component
// This view shows all projects that the current user created. The user shall choose only one to save the questionnaire results in the end.
const UserProjectView = ({setUserLoggedLevel}) => {
    
     // Component state
     const {currentUserId, prList, setQuestionnaireList, setProjectId, setProjectTitle, setPrList, clearPrList} = useProgressController(); //global state
    // Alert handling state
    const [error, setError] = useState("");

    // Button "Select" onClick event handler (submits the selected project and redirects to IO selection view)
    const chooseProject = async function(p) {
        //Error handling function
        const handleErr = function(err) {
            console.warn(err.response);
            setError(err.response.data.message)
        };
        // Check if the project is from climatescan or the database
        // Climatescan: we need to save project details in the db
        if (prList[p].prUrl !== undefined){
            const payload = {
                projectId: prList[p].prId,
                userIdx: currentUserId,
                title: prList[p].prTitle,
                category: "",
                description: "",
                lat: prList[p].prLat,
                lon: prList[p].prLng
            }
            setProjectTitle(prList[p].prTitle)
            const response = await apis.setProject(payload).then(res => res).catch(err => {handleErr(err);});
            if (response !== undefined && response.data.success === true){
                setProjectId(response.data.projectID)
            }
        }
        // Database: we just set the projectID as it is already saved in the db
        else {
            setProjectTitle(prList[p].prTitle)
            setProjectId(prList[p].prId)
        }
        // When the project is selected, request Questionnaire list and redirect to questionnaire selection
        await apis.getQuestionnaireList().then(res => res)
            .then(res => {
                let QList = res.data.data.map((listdata) => {
                    return({
                        questionnaireName: listdata.questionnaireName,
                        questionnaireType: listdata.questionnaireType
                    })
                })
                setQuestionnaireList(QList)
                setUserLoggedLevel("IO")
            })
            .catch(err => {handleErr(err);});
    }

    // Button "Delete" onClick event handler (deletes the selected project from the database)
    const deleteProject = async function(p) {
        const payload = {
            userIdx: currentUserId,
            projectID: prList[p].prId
        }
        apis.deleteProject(payload).then(res => res).catch(err => {setError(err.data.message);}); 
        let newList = prList.filter(pr => pr.prId !== prList[p].prId)
        setPrList(newList);
    }

    // Button "Back" onClick event handler (redirects the user back to the dashboard to choose how to select a project)
    const goBack = () => {
        clearPrList()
        setUserLoggedLevel("dashboard")
    }
    useEffect(()=> {console.log("List2",prList)}, [])

    // object that maps all user projects 
    let userPr = prList.map((project, index) => {
        // check if the project is from climatescan to display relevant info
        if(project.prUrl !== undefined){
            return(
                <Col xs={12} md={6} className="mb-3">
                    <Card>
                    <Card.Header as="h5" className="bg-blue">{project.prTitle}</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                Focus Topic / Category:
                                <br/>
                                <b>{project.prTopic} / {project.prCategory}</b>
                                <br/>
                                <a href={project.prUrl} target="_blank">Check it in climatescan</a>
                            </Card.Text>
                            <Button variant="success" className="bg-complete" size="lg" onClick={() => {chooseProject(index)}}><BsCheckCircle/>Select</Button>
                        </Card.Body>
                    </Card>
                </Col>
            )
        }
        // If the project is a new one WITHOUT any linked unfinished questionnaire (not yet submitted to climatescan), display relevant info
        else {
            return(
                <Col xs={12} md={6} className="mb-3">
                    {project.prlinkedSurveys === 0 &&
                    <Card>
                    <Card.Header as="h5" className="bg-blue">
                     <Row><Col sm={9} className="align-self-center">{project.prTitle}</Col>
                        <Col sm={3} className='ms-auto'>
                            <Button className="navbar-dark" onClick={() => {deleteProject(index)}}><BsFillTrashFill className='no-margin'/></Button>
                        </Col>
                    </Row>
                    </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                <small>* This project has not been submitted to climatescan yet.</small>
                                <br/>
                                Questionnaires linked with this project:
                                <br/>
                                <b>{project.prlinkedSurveys}</b>
                            </Card.Text>
                            <Button variant="success" className="bg-complete" size="lg" onClick={() => {chooseProject(index)}}><BsCheckCircle/>Select</Button>
                        </Card.Body>
                    </Card>}
                </Col>
            )
        }
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
                    <h2 className="mb-2"><b>Your Projects</b></h2>
                        <br/>
                        <p>Select one of your own projects to submit your questionnaire.</p>
                        <Row className="mb-2">
                            {prList.length === 0
                            ? <p>You haven't created any projects yet.</p>
                            : userPr
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

export default UserProjectView;