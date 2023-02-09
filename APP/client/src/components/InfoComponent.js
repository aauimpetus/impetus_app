import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MenuBar from './MenubarComponent';

// App Information Component
// It displays information about how to use the app
const Info = ({setUserLoggedLevel}) => {

    // Button "Let's Start" onClick event handler (redirects the user to the position component to pin their location)
    const onStart = () => {
        setUserLoggedLevel("map")
    }

    // View rendering
    return(
         <Container fluid>
         <Row>
             <MenuBar setUserLoggedLevel={setUserLoggedLevel} />
         </Row>
        <Row>
            <Col xs={12} className="text-white">
                <h1 className="mb-2"><b>Instructions</b></h1>
                <h5>Let's see how to use this app to solve and save questionnaires in climatescan!</h5>
            </Col>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="tbox no-margin">
                <div className="pulse"><Button size="lg" className="general-btn mb-4" onClick={onStart}>Let's Start</Button></div>
                <p>
                    This tool can collect measurements through the completion of a list of questionnaires and save them in climatescan.
                    In order to do so, we need to follow these 5 steps: 
                </p>
                <ul className="info-v">
                    <li className="info-v__step">
                        <h4>Step 1</h4>
                        <p>Pin the location of interest on the map.</p>
                    </li>
                    <li className="info-v__step">
                        <h4>Step 2</h4>
                        <p>Choose a climatescan project that will host the final data.</p>
                    </li>
                    <li className="info-v__step">
                        <h4>Step 3</h4>
                        <p>Choose the type of questionnaire to be answered.</p>
                    </li>
                    <li className="info-v__step">
                        <h4>Step 4</h4>
                        <p>Start the questionnaire and answer all the questions.</p>
                    </li>
                    <li>
                        <h4>Step 5</h4>
                        <p>Preview/save and submit the questionnaire to climatescan.</p>
                    </li>
                </ul>
                <p>Every questionnaire that is not fully answered (step 4), is saved under the "unfinished questionnaires" list.
                This list is available in the dashboard. We can continue answering and submitting the listed questionnaires or we can discard them.
                </p>
                </Jumbotron>
            </Col>
        </Row>
    </Container>
    )
}

export default Info;