import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import MenuBar from './MenubarComponent';
import {BsFillEmojiDizzyFill, BsCaretLeftFill, BsPlusCircle} from "react-icons/bs";
import apis from '../api';

// New project Creation Component
// The user shall fill in the form to create a new Project in climatescan database
const NewProjectView = ({setUserLoggedLevel}) => {

    // Component state
    const {currentUserId, currentPosition, prList, setQuestionnaireList, setProjectId, setProjectTitle, clearPrList} = useProgressController(); // global state
    // Alert handling state & form state
    const [error, setError] = useState("");
    const [cat, setCat] = useState("");
    const [prTitle, setTitle] = useState("");
    const [prDescription, setDesc] = useState("");

    // input onChange event handlers (set the state with every change in the form)
    const onTitleSet = (e) => {
        e.preventDefault()
        setTitle(e.target.value)
    }
    const onDescriptionSet = (e) => {
        e.preventDefault()
        setDesc(e.target.value)
    }
    const onCategorySelect = (e) => {
        e.preventDefault()
        setCat(e.target.value)
    }
    useEffect(()=> {console.log("List2",prList)}, [])

    // Button "Create" onClick event handler (sends to server the new project details, then redirects to IO component)
    const createProject = async (e) => {
        if (prTitle !== "" && cat !== "" && prDescription !== "") {
            const payload = {
                projectId: "NEW",
                userIdx: currentUserId,
                title: prTitle,
                category: cat,
                description: prDescription,
                lat: currentPosition.lat,
                lon: currentPosition.lng
            }
            setProjectTitle(prTitle)
            // Error handling function
            const handleErr = function(err) {
                console.warn(err.response);
                setError(err.response.data.message)
            };
            const response = await apis.setProject(payload).then(res => res).catch(err => {handleErr(err);});
            
            if (response !== undefined && response.data.success === true){
                setProjectId(response.data.projectID)
//console.log("ProjectID: ",response.data.projectID)
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
        else {
            setCat("")
            setDesc("")
            setTitle("")
            setError("Please fill out the title, category and description of the new project!")
        }
    }

    // Button "Back" onClick event handler (redirects the user back to the dashboard to choose how to select a project)
    const goBack = () => {
        clearPrList()
        setUserLoggedLevel("dashboard")
    }

    // object that maps all categories
    let categoriesPr = Object.entries(prList).map((elem) => {
        const focustopic = elem[1];
        return(
            <optgroup label={focustopic.fname}>
               {focustopic.items.map((category) => {
                return(
                    <option key={category.name} value={category.id}>{category.name}</option>
                    )
                }) 
                }
            </optgroup>
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
                    <Row>
                        <Col md={{span: 8, offset: 2}}>
                            <Card className="bg-blue pulse" text="light">
                                <Card.Header as="h5">New Project</Card.Header>
                                <Card.Body>
                                    <Card.Text>Create a new project suitable for your questionnaire</Card.Text>
                                    <Form>
                                        <Form.Group controlId="projectForm">
                                            <Col>
                                            <Form.Label className="formlabels">Title: *</Form.Label>
                                            </Col>
                                            <Col>
                                            <Form.Control type="text" onChange={onTitleSet} value={prTitle}/>
                                            </Col>
                                            <Col>
                                            <Form.Label className="formlabels">Category: *</Form.Label>
                                            </Col>
                                            <Col>
                                            <Form.Control as="select" aria-label="Categories" onChange={onCategorySelect}>
                                                <option key="label" value={cat}>Choose a category:</option>
                                               {categoriesPr}
                                            </Form.Control>
                                            </Col>
                                            <Col>
                                            <Form.Label className="formlabels">Description: *</Form.Label>
                                            </Col>
                                            <Col>
                                            <Form.Control as="textarea" rows={3} onChange={onDescriptionSet} value={prDescription}/>
                                            </Col>
                                        </Form.Group>
                                    </Form>
                                    <Button size="lg" className="note-btn" onClick={createProject}><BsPlusCircle/>Continue</Button>
                                    {error !== "" &&
                                    <Row>
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
                    <Row>
                        <Col md={{ span: 6, offset: 3 }}>
                            <Button size="lg" className="q-btn mt-4" onClick={goBack}><BsCaretLeftFill/>Back</Button>
                        </Col>
                    </Row>
                </Jumbotron>
            </Col>
        </Row>      
        </Container>  
    );
}

export default NewProjectView;