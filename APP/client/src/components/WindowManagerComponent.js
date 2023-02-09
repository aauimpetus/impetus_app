import React, {useState} from 'react';
import Container from 'react-bootstrap/Container';
import IOContinuation from './IOContinuationComponent'
import UserView from './UserDashboardComponent';
import Questions from './QuestionnaireComponent';
import Preview from './PreviewSurveyComponent';
import NotFound from './NotFound';
import Main from './MainComponent';
import Info from './InfoComponent';
import PositionView from './PositionComponent';
import NewProjectView from './CreateProjectComponent';
import NearbyProjectView from './NearbyProjectsComponent';
import UserProjectView from './UserProjectsComponent';
import IOSelectionView from './IOSelectionComponent';

const WindowManager = () => {
    const [userLoggedLevel, setUserLoggedLevel] = useState("main")

    // Control of component rendering
    switch (userLoggedLevel) {
        case "main" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <Main setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "info" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <Info setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "IOcontinue" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <IOContinuation setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "map" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <PositionView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "dashboard" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <UserView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "newProject" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <NewProjectView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "nearbyProject" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <NearbyProjectView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "userProject" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <UserProjectView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "IO" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <IOSelectionView setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "questions" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <Questions setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        case "preview" : {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <Preview setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
        default: {
            return (
                <Container fluid="lg" className="h-100">
                    <div className="text-center">
                        <Container fluid="lg" className="h-100">
                            <NotFound setUserLoggedLevel={setUserLoggedLevel}/>
                        </Container>
                    </div>
                </Container>
            )
        }
    }
}

export default WindowManager;