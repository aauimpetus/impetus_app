import React, {useState, useEffect} from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import MenuBar from './MenubarComponent';
import useProgressController from '../StoreApi';
import {BsFillGeoAltFill, BsFileEarmarkMedicalFill, BsInboxesFill, BsListTask, BsFillEmojiDizzyFill} from "react-icons/bs";
import apis from '../api';

// Main Dashboard Component
// The user shall choose a way to select a project to submit the final questionnaire data
const UserView = ({setUserLoggedLevel}) => {

    // Component state
    const {currentUserId, currentPosition, prList, setPrList} = useProgressController(); //global state
    // Alert handling state & handling function
    const [error, setError] = useState("");

    // Error handling function
    const handleErr = function(err) {
        console.warn(err.response);
        setError(err.response.data.message)
    };

    // ------ Button onClick event handlers ------
    // Asks the server for all available categories and saves them in the global state
    const getCategory = async () => {
        const payload = {
            userIdx: currentUserId
        }
        const response = await apis.getCategoryList(payload).then(res => res).catch(err => {handleErr(err);});
        let catList = JSON.parse(response.data.data);
        setPrList(catList)
        if (response.data.success){
            setUserLoggedLevel("newProject")
        }
    }

    // Asks the server for the nearby projects and saves them in the global state
    const getNearbyProjects = async () => {
        const payload = {
            lat: currentPosition.lat,
            lon: currentPosition.lng
        }
        await apis.nearbyProjects(payload).then(res => res)
        .then(res => {
            let resData = JSON.parse(res.data.projectList).map((listdata) => {
                return({
                    prId: listdata.id,
                    prLat: listdata.latitude,
                    prLng: listdata.longitude,
                    prTitle: listdata.title,
                    prDistance: listdata.distance_km
                })
            })
            setPrList(resData)
            if(res.data.success){
                setUserLoggedLevel("nearbyProject")
            }
        })
        .catch(err => {handleErr(err);});
    }

    // Asks the server for the user projects and saves them in the global state
    const getUserProjects = async () => {
        const payload = {
            userIdx: currentUserId
        }
        await apis.listProjects(payload).then(res => res)
        .then(res => {
            let resProj = JSON.parse(res.data.projectList).map((listdata) => {
                return({
                    prId: listdata.id,
                    prLat: listdata.latitude,
                    prLng: listdata.longitude,
                    prTitle: listdata.title,
                    prCategory: listdata.categories[0].name,
                    prTopic: listdata.categories[0].focustopic_name,
                    prUrl: listdata.url
                })
            })
            let resUserProj = res.data.userList.map((listdata) => {
                return({
                    prId: listdata.id,
                    prLat: listdata.latitude,
                    prLng: listdata.longitude,
                    prTitle: listdata.title,
                    prlinkedSurveys: listdata.linked_surveys
                })
            })
            let resData = [...resProj, ...resUserProj];
            setPrList(resData)
            if(res.data.success) {
                setUserLoggedLevel("userProject")
            }
        })
        .catch(err => {handleErr(err);});
    }

    // Asks the server for the unfinished questionnaires and saves them in the global state
    const getUnfinishedQuestionnaires = async () => {
        const payload = {
            userIdx: currentUserId
        }
        await apis.getUnfinishedSurveys(payload).then(res => res)
        .then(res => {
            let resData = [];
            if(res.data.surveyList.length !== 0){
                resData = res.data.surveyList.map((listdata) => {
                    return({
                        prId: listdata.projectID,
                        prTitle: listdata.title,
                        surveyId: listdata.id,
                        surveyName: listdata.name,
                        surveyType: listdata.type
                    })
                }) 
            }
            setPrList(resData)
//console.log("Unfinished List: ",resData)
            if(res.data.success){
                setUserLoggedLevel("IOcontinue")
            }
        })
        .catch(err => {handleErr(err);});
    }

    useEffect(()=> {console.log("List1",prList)})

    // View rendering
    return(
        <Container fluid>
            <Row>
                <MenuBar setUserLoggedLevel={setUserLoggedLevel} />
            </Row>
        <Row>
            <Col xs={12} className="text-white mb-3">
                <h1 className="mb-2"><b>Dashboard</b></h1>
                <h5>Step 2 - Project Selection</h5>
                <h5>Let's select the project that we want to submit our questionnaire.</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="qbox no-margin pad">
                    <Row>
                        <Col md={{span: 8, offset: 2}}>
                            <Card className="bg-darkgreen mb-4" text="light">
                                <Card.Header as="h5"><b>Unfinished Questionnaires:</b></Card.Header>
                                <Card.Body>
                                    <Row>
                                    <Col xs={12} className="mt-1 mb-4">
                                        <Button variant="light" size="lg" block onClick={getUnfinishedQuestionnaires}><b><BsListTask/>Check unfinished questionnaires!</b></Button>
                                    </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{span: 8, offset: 2}}>
                            <Card className="bg-blue" text="light">
                                <Card.Header as="h5"><b>Available Choices:</b></Card.Header>
                                <Card.Body>
                                    <Row>
                                    <Col xs={12} className="mt-1 mb-4">
                                        <Button variant="light" size="lg" onClick={getCategory}><b><BsFileEarmarkMedicalFill/>Create New Project</b></Button>
                                    </Col>
                                    <Col xs={12} className="mt-1 mb-4">
                                        <Button variant="light" size="lg" onClick={getNearbyProjects}><b><BsFillGeoAltFill/>Check Nearby Projects</b></Button>
                                    </Col>
                                    <Col xs={12} className="mt-1 mb-4">
                                        <Button variant="light" size="lg" onClick={getUserProjects}><b><BsInboxesFill/>Check Your Own Projects</b></Button>
                                    </Col>
                                    </Row>
                                </Card.Body>
                                {error !== "" &&
                                <Card.Footer>
                                    <Row>
                                        <Alert variant="danger" className="errors">
                                            <BsFillEmojiDizzyFill/>
                                            {error}
                                        </Alert>
                                    </Row>
                                </Card.Footer>
                                }
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} className="mt-3 footer">
                            <Row>
                                <Col sm={3} className='align-self-center'>
                                    <img
                                        src='/assets/EU-Logo.png'
                                        alt="EU logo"
                                        width='100%'
                                    />
                                </Col>
                                <Col sm={9}> 
                                    <small>The European Commission's support for the production of this publication does not constitute an endorsement of the contents, which reflect the views only of the authors, and the Commission cannot be held responsible for any use which may be made of the information contained therein.</small>
                                </Col>
                            </Row>
                        </Col>
                    </Row>    
                </Jumbotron>
            </Col>
        </Row>  
        </Container>  
        );
}

export default UserView;