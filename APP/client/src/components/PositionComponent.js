import React from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Map from './MapComponent';
import MenuBar from './MenubarComponent';

// Position Component: It renders the map component.
// The user shall give the desired location that the research was conducted.
const PositionView = ({setUserLoggedLevel}) => {
      
    // Component state
    const {currentUser} = useProgressController();

    // Button onClick event handler (redirects to dashboard)
    const onStart = () => {
        setUserLoggedLevel("dashboard")
    }

    // View rendering
    return (
        <Container fluid>
        <Row>
            <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
        </Row>
        <Row>
            <Col xs={12} className="text-white mb-3">
                <h1>Welcome {currentUser}</h1>
                <h5>Step 1 - Location</h5>
                <h5>Please pin the location of the conducted measurement/research.</h5>
            </Col>
            <Col>
                <Jumbotron className="qbox pad">
                    <Map/>
                    <Button size="lg" className="general-btn" onClick={onStart} block>Next Step</Button>
                </Jumbotron>
            </Col>
        </Row>
        </Container>
    );
}
export default PositionView;