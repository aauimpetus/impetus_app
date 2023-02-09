import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Image from 'react-bootstrap/Image';
import Table from 'react-bootstrap/Table';
import Alert from 'react-bootstrap/Alert';
import Accordion from 'react-bootstrap/Accordion';
import MenuBar from './MenubarComponent';
import {BsPlusLg, BsDashLg, BsFillEmojiDizzyFill} from "react-icons/bs";
import {BiHappyAlt} from "react-icons/bi";
import apis from '../api';
import Compressor from 'compressorjs';

// Questions Component
// This is the view that renders the questions one-by-one and submit the selected answers to the server
const Questions = ({setUserLoggedLevel}) => {

    // Component state
    const {currentStep, currentCursor, currentAnswerId, currentQuestionData, currentUserId, currentSurveyId, questionnaireName, questionnaireType, currentProjectTitle, totalNumQ,
        questionnaireList, backbtn, skippable, setBackbtn, setSkippable, setCursor, setAnswersList, setScore, setAnswerId, setQuestionData, setStep, setTotalNumQ} = useProgressController();
    // Local state for the validation and error handling of the answers
    const [validated, setValidated] = useState(false);
    // Local state for file uploads(images)
    const [selectedFile, setSelectedFile] = useState();
    const [previewFile, setPreviewFile] = useState();
    // Alert handling state
    const [error, setError] = useState("");
    // Local state for the Riverine Plastic Waste questionnaire (IO6 - clicker)
    const [counter, setCounter] = useState({});
    // Local state for the type of questionnaire (public/private)
    const [publicQ, setPublicQ] = useState(true);

    useEffect(()=> {
        if (currentQuestionData.questionType === "clicker") {
            setCounter(questionnaireList)
        }
        if (currentQuestionData.questionType === "file") {
            setPreviewFile(currentAnswerId.toString())
        }
    }, [])
    useEffect(() => {
        console.log('Answer validation: ', validated);
      }, [validated]);

    //Error handling function --------------------------------------------------------------------------
    const handleErr = function(err) {
        console.warn(err.response);
        setError(err.response.data.message)
    };
    // "Start" button event handler ---------------------------------------------------------------------
    // Gets the 1st question of the selected questionnaire from the server
    const onStart = async () => {
        const payload = {
            userIdx: currentUserId,
            surveyType: questionnaireType,
            surveyID: currentSurveyId,
            public: publicQ
        }
        const response = await apis.startSurvey(payload).then(res => res).catch(err => {handleErr(err);});
        const rawdata = await response.data.data;
        const data = JSON.parse(rawdata);
//console.log("1stQ: ",data)
        const questionData = {
            questionId: data.questionId,
            question: data.question,
            questionType: data.questionType,
            answer: data.answer,
            note: data.note,
            noteButtonText: data.noteButtonText,
            images: data.images,
        };
        setTotalNumQ(Number(response.data.numQuestions))
        setQuestionData(questionData)
        setStep(data.stepId)
        setCursor(Number(response.data.cursor));
    }
    
    // Button "Back" on the starting point event handler ------------------------------------------------
    // Redirects the user back to the dashboard
    const goBack = () => {
        setUserLoggedLevel("dashboard")
    }

    // End button "See Answers" event handler -----------------------------------------------------------
    // Submits the questionnaire answers to climatescan
    const showPreview = async () => {
        const payload = {
            userIdx: currentUserId,
            surveyID: currentSurveyId
        }
        const response = await apis.getSurveyPreview(payload).then(res => res).catch(err => {handleErr(err);});
        const rawdata = await response.data.preview;
        let preview = JSON.parse(rawdata);
        if(questionnaireType === "IO6"){
            let allAnswers = preview.map(a => {
                a.answer = JSON.parse(a.answer);
                return a;
            })
            preview = allAnswers;
        }
        if (response !== undefined && response.data.success === true){
            setScore(response.data.score)
            setAnswersList(preview)
            setUserLoggedLevel("preview")
        }
        else {
            alert(response.message)
        }
    }
    // Checkbox for making a questionnaire public for download (at the start screen)-------------------
    const setPublic = (e) => {
        (e.target.checked)?setPublicQ(true):setPublicQ(false)
    }

    // Radio button event handler ---------------------------------------------------------------------
    const onRadioSelect = (i) => {
        setAnswerId(i)
    }

    // Text input event handler -----------------------------------------------------------------------
    const onTextChange = (e) => {
        e.preventDefault()
        setAnswerId(e.target.value)
    }

    // File input & Button "Uplaod" event handlers ----------------------------------------------------
    let selectedImg;
    const onFileChange = (e) => {
        setSelectedFile(e.target.files[0])
        selectedImg = e.target.files[0]
        new Compressor(selectedImg, {
            quality: 0.1,
            success(result) {
                 // Preview of the image
                setPreviewFile(URL.createObjectURL(e.target.files[0]));
                 // Assigning the file and necessary fields to the answer
                const formData = new FormData();
                formData.append("File", result);
                formData.append("userIdx", currentUserId);
                formData.append("surveyID", currentSurveyId);
                formData.append("stepID", currentStep);
                formData.append("cursor",currentCursor);
                console.log("file", formData.get('File'))
                
                setAnswerId(formData)
            }
        })
    }

    // Button handlers for the Riverine Plastic Waste (IO6 - clicker) --------------------------------------
    const plusOne = (item,value) => {
        value += 1;
        setCounter(previousState => ({...previousState, [item]: value}))
    }
    const minusOne = (item,value) => {
        value -= 1;
        setCounter(previousState => ({...previousState, [item]: value}))
    }
    const onCountChange = (e) => {
        e.preventDefault()
        setValidated(e.currentTarget.checkValidity())
        if (e.currentTarget.checkValidity() === false) {
            e.stopPropagation();
        }
        else {
            const name = e.target.name;
            const value = Number(e.target.value);
            setCounter(previousState => ({...previousState, [name]: value}))
        }
    }
    // Button "Continue" onClick event handler for saving the answers in the db
    const handleFinish = async () => {
        // Answer data is prepared and submitted to server
        let userResponse = {
                userIdx: currentUserId,
                surveyID: currentSurveyId,
                stepID : currentStep,
                answer: counter,
                cursor: currentCursor  
            }
        const reqHeader = {
            headers : {"Content-type": (userResponse instanceof FormData) ? "multipart/form-data" : "application/json"}
        }
        const response = await apis.getNextQuestion(userResponse, reqHeader).then(res => res).catch(err => {handleErr(err);});
        // Server response with the next question data
        const dataString = await response.data.data;
        const data = JSON.parse(dataString);
        const answerId = await response.data.answer;
        const questionData = {
            questionId: data.questionId,
            question: data.question,
            categories: data.categories,
            questionType: data.questionType,
            answer: data.answer,
            note: data.note,
            noteButtonText: data.noteButtonText,
            images: data.images,
        };
        setSkippable(data.skip)
        setQuestionData(questionData)
        setStep(data.stepId)
        setAnswerId(answerId)
        if (answerId === ""){
            const newState = {};
            Object.keys(counter).forEach(key => {newState[key] = 0});
            setCounter(newState)
        }
        else {
            setCounter(answerId)
        }
        setBackbtn(response.data.back)
        setCursor(Number(response.data.cursor));
    }

    // Next & Skip buttons of the questions onClick event handler ---------------------------------------
    // Sends the current selected answer to the server and requests the next question for rendering
    const handleNext = async (e) => {
        e.preventDefault()  
        // validation of data
        setValidated(e.currentTarget.checkValidity())
        if (e.currentTarget.checkValidity() === false) {
            e.stopPropagation();
        }
        else {
            // Check that the user provided an answer
            if (e.target.innerText === "Next" && currentAnswerId === "") {
                alert("You must provide an answer to proceed!")
            }
            else {
                // Answer data is prepared and submitted to server
                let userResponse; 
                if(e.target.innerText === "Skip" && currentAnswerId !== ""){
                    userResponse = {
                        userIdx: currentUserId,
                        surveyID: currentSurveyId,
                        stepID : currentStep,
                        answer: "",
                        cursor: currentCursor  
                    }
                }
                else {
                    if (currentAnswerId instanceof FormData) { 
                        userResponse = currentAnswerId;
                    }
                    else {
                        userResponse = {
                            userIdx: currentUserId,
                            surveyID: currentSurveyId,
                            stepID : currentStep,
                            answer: currentAnswerId,
                            cursor: currentCursor
                        };
                    }
                }
                const reqHeader = {
                    headers : {"Content-type": (userResponse instanceof FormData) ? "multipart/form-data" : "application/json"}
                }
                const response = await apis.getNextQuestion(userResponse, reqHeader).then(res => res).catch(err => {handleErr(err);});
//console.log("AnswerID from currentQ: ",userResponse)
                // Server response with the next question data & answer
                const dataString = await response.data.data;
                const answerId = await response.data.answer;
//console.log("AnswerID from nextQ: ",answerId)
                const data = JSON.parse(dataString);
                const questionData = {
                    questionId: data.questionId,
                    question: data.question,
                    categories: data.categories,
                    questionType: data.questionType,
                    answer: data.answer,
                    min: data.min,
                    max:data.max,
                    note: data.note,
                    noteButtonText: data.noteButtonText,
                    images: data.images,
                };
                if (data.nextcategories !== undefined) {
                    const counterList = {}; 
                    data.nextcategories.map(c => {counterList[c.answer] = 0}); 
                    setCounter(counterList)
//console.log("Counter:",counter)
                }
                setSkippable(data.skip)
                setQuestionData(questionData)
                setStep(data.stepId)
                setAnswerId(answerId)
                setBackbtn(response.data.back)
                setSelectedFile()
                setCursor(Number(response.data.cursor));
                (currentQuestionData.categories !== undefined) && setCounter()
                answerId.toString().match(/^data:image*/g) ? setPreviewFile(answerId.toString()) : setPreviewFile()
            }
        }
    }

    // Back button of the questions onClick event handler -----------------------------------------------
    // Requests the previous question for rendering
    const handleBack = async () => {
        const payload = {
            userIdx: currentUserId,
            surveyID: currentSurveyId,
            stepID: currentStep,
            cursor: currentCursor
        }
        const response = await apis.getPreviousQuestion(payload).then(res => res).catch(err => {handleErr(err);});
        // Server response with the previous question data & answer
        const dataString = await response.data.data;
        const answerId = await response.data.answer;
//console.log("AnswerID from prevQ:",answerId)
        const data = JSON.parse(dataString);
        const questionData = {
            questionId: data.questionId,
            question: data.question,
            categories: data.categories,
            questionType: data.questionType,
            answer: data.answer,
            min: data.min,
            max:data.max,
            note: data.note,
            noteButtonText: data.noteButtonText,
            images: data.images,
        };
        setSkippable(data.skip)
        setQuestionData(questionData)
        setStep(data.stepId)
        setAnswerId(answerId)
        setCounter(answerId)
        setBackbtn(response.data.back)
        setSelectedFile()
        setCursor(Number(response.data.cursor));
        answerId.toString().match(/^data:image*/g) ? setPreviewFile(answerId.toString()) : setPreviewFile()
    }

    // Variable declaration for answers and images and image view rendering ----------------------------------
    let AnswerMap;
    let ImageMap;
    let num = currentQuestionData.questionId *100/totalNumQ // percentage for the progress bar
    if (currentQuestionData.images !== undefined && currentQuestionData.images.length !== 0) {
        ImageMap = currentQuestionData.images.map(imgObj => {
            const img = imgObj.imgPath;
            if (currentQuestionData.images.length === 1) {
            return (
                <Col md={{span: 8, offset: 2}} className="mt-2">
                    <Image src={"/assets/" + img} style={{ width: "100%", maxWidth: "500px"}} alt="image"/>
                    <p>{imgObj.answerId}</p>
                </Col>
            )
            } else if (currentQuestionData.images.length === 2) {
                return (
                    <Col md={6} className="mt-2">
                        <Image src={"/assets/" + img} style={{ width: "100%", maxWidth: "450px"}} alt="image"/>
                        <p>{imgObj.answerId}</p>
                    </Col>
                )
            } else {
                return (
                    <Col md={4}>
                        <Image src={"/assets/" + img} style={{ width: "100%", maxWidth: "300px"}} alt="image"/>
                        <p>{imgObj.answerId}</p>
                    </Col>
                )
            }

        })
    }

    // View rendering ---------------------------------------------------------------------------------------------------
    // Renders the questions according to the question type (radio,number,text,file,note,instruction,safety or start,end)
    switch (currentQuestionData.questionType) {
        case "radio": {
            AnswerMap = currentQuestionData.answer.map((ans, i) => {
                return (
                    <ListGroupItem>
                        <Col md={{ span: 8, offset: 2 }}>
                            <Form.Check 
                                id={i} 
                                type={'radio'}
                                label={ans.answer} 
                                checked={true ? i === currentAnswerId : false}
                                onChange={() => {onRadioSelect(i)}}
                                className="font-weight-bold"
                            />
                        </Col>
                    </ListGroupItem>
                )
            })
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Row>
                        <Form className="w-100">
                            <Card className="qbox">
                                <Card.Body className="w-100">
                                    <Form.Group controlId="formCheckBox">
                                    {questionnaireType === "IO2" || currentQuestionData.questionId === "" ?
                                        <Card.Header className="qcard">
                                            <Form.Label>Question {currentQuestionData.questionId}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                        :
                                        <Card.Header className="qcard">
                                            <ProgressBar variant="warning" now={num} /> <br/>
                                            <Form.Label>Question {currentQuestionData.questionId} of {totalNumQ}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>                                        
                                    }
                                        <ListGroup className="list-group-flush" style={{padding: "20px"}}>
                                            {AnswerMap}
                                        </ListGroup>
                                        <Row>
                                            {ImageMap}
                                        </Row>
                                    </Form.Group>
                                    <Card.Body>
                                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                                        <Button size="lg" className="note-btn" onClick={handleNext}>Next</Button>
                                        {skippable === 1 &&
                                        <Button size="lg" className="q-btn" onClick={handleNext}>Skip</Button>
                                        }
                                    </Card.Body>
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
                        </Form>
                    </Row>
                </Container>
            )
        }
        case "number": {
            AnswerMap = <Form.Control type="number" min={currentQuestionData.min} max={currentQuestionData.max} value={currentAnswerId} className="text-inpt mb-2" onChange={onTextChange} onKeyPress={(e) => { if(e.key === 'Enter') {e.preventDefault();console.log(e.keyCode);}}}/>
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Row>
                        <Form className="w-100" noValidate validated={validated}>
                            <Card className="qbox">
                                <Card.Body className="w-100">
                                    <Form.Group controlId="formNumber">
                                    {questionnaireType !== "IO2" ?
                                        <Card.Header className="qcard">
                                            <ProgressBar variant="warning" now={num} /> <br/>
                                            <Form.Label>Question {currentQuestionData.questionId} of {totalNumQ}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                        :
                                        <Card.Header className="qcard">
                                            <Form.Label>Question {currentQuestionData.questionId}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                    }
                                        {AnswerMap}
                                        <Form.Control.Feedback type="invalid">
                                            Please provide a valid number. (min: {currentQuestionData.min} , max: {currentQuestionData.max})
                                        </Form.Control.Feedback>
                                        <Row>
                                            {ImageMap}
                                        </Row>
                                    </Form.Group>
                                    <Card.Body>
                                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                                        <Button size="lg" className="note-btn" onClick={handleNext}>Next</Button>
                                        {skippable === 1 &&
                                        <Button size="lg" className="q-btn" onClick={handleNext}>Skip</Button>
                                        }
                                    </Card.Body>
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
                        </Form>
                    </Row>
                </Container>
            )
        }
        case "text": {
            AnswerMap = <Form.Control as="textarea" rows={3} className="text-inpt mb-2" value={currentAnswerId} onChange={onTextChange} autoFocus/>
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Row>
                        <Form className="w-100">
                            <Card className="qbox">
                                <Card.Body className="w-100">
                                    <Form.Group controlId="formNumber">
                                    {questionnaireType !== "IO2" ?
                                        <Card.Header className="qcard">
                                            <ProgressBar variant="warning" now={num} /> <br/>
                                            <Form.Label>Question {currentQuestionData.questionId} of {totalNumQ}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                        :
                                        <Card.Header className="qcard">
                                            <Form.Label>Question {currentQuestionData.questionId}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                    }
                                        {AnswerMap}
                                        <Row>
                                            {ImageMap}
                                        </Row>
                                    </Form.Group>
                                    <Card.Body>
                                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                                        <Button size="lg" className="note-btn" onClick={handleNext}>Next</Button>
                                        {skippable === 1 &&
                                        <Button size="lg" className="q-btn" onClick={handleNext}>Skip</Button>
                                        }
                                    </Card.Body>
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
                        </Form>
                    </Row>
                </Container>
            )
        }
        case "file": {
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Row>
                        <Form className="w-100">
                            <Card className="qbox">
                                <Card.Body className="w-100">
                                    <Form.Group controlId="formFile">
                                    {questionnaireType !== "IO2" ?
                                        <Card.Header className="qcard">
                                            <ProgressBar variant="warning" now={num} /> <br/>
                                            <Form.Label>Question {currentQuestionData.questionId} of {totalNumQ}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                        :
                                        <Card.Header className="qcard">
                                            <Form.Label>Question {currentQuestionData.questionId}</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question} </Form.Label>
                                        </Card.Header>
                                    }
                                        <Card.Body>
                                            <Row>
                                            <Col md={{ span: 8, offset: 2 }}><Form.Label className="text-left"><h5>Image upload:</h5><small className="mb-3">* Only image files can be uploaded</small></Form.Label></Col>
                                            <Col md={{ span: 6, offset: 3 }}><Form.Control type="file" accept="image/*" onChange={onFileChange}/></Col>
                                            </Row>
                                        </Card.Body>
                                    </Form.Group>
                                    {previewFile && 
                                    <Card.Body>
                                        <h5>Image Preview:</h5>
                                        <img className="preview" src={previewFile} alt="preview" />
                                    </Card.Body>
                                    }
                                    <Card.Body>
                                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                                        <Button size="lg" className="note-btn" onClick={handleNext}>Next</Button>
                                        {skippable === 1 &&
                                        <Button size="lg" className="q-btn" onClick={handleNext}>Skip</Button>
                                        }
                                    </Card.Body>
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
                        </Form>
                    </Row>
                </Container>
            )
        }
        case "clicker": {
            AnswerMap = currentQuestionData.categories.map(cat => {
                return (
                <Card>
                    <Accordion.Toggle as={Card.Header} eventKey={cat.categoryId} style={{ color: "#FFFFFF", backgroundColor: cat.color }}>
                      <b>{cat.category}</b>
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey={cat.categoryId}>
                        <Card.Body>
                            <Accordion>
                            {cat.questions.map(quest => {
                                return (
                                    cat.questions.length > 1 ?
                                    <Card>
                                    <Accordion.Toggle as={Card.Header} className="sub" eventKey={quest.questionId}>
                                    {quest.question}
                                    </Accordion.Toggle>
                                    <Accordion.Collapse eventKey={quest.questionId}>
                                      <Card.Body>
                                      {quest.answers.map((ans, i) => (
                                            <Table responsive striped bordered hover className="bg-white">
                                            <tbody className="text-left">
                                                <tr>
                                                    <td key={ans.osparId} colSpan={3}><Form.Label>{ans.answer}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td key={i}><Form.Control type="number" name={ans.answer} min={0} value={counter[ans.answer]} onChange={onCountChange} onKeyPress={(e) => { if(e.key === 'Enter') {e.preventDefault();console.log(e.keyCode);}}}/></td>
                                                    <td key={"+"+i}><Button variant="success" className="bg-complete" onClick={() => plusOne(ans.answer,counter[ans.answer])}><BsPlusLg className="no-margin"/></Button></td>
                                                    <td key={"-"+i}><Button variant="danger" onClick={() => minusOne(ans.answer,counter[ans.answer])}><BsDashLg className="no-margin"/></Button></td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                        ))}
                                      </Card.Body>
                                    </Accordion.Collapse>
                                  </Card>
                                  :
                                  <Card>
                                    <Card.Body>
                                      {quest.answers.map((ans, i) => (
                                            <Table responsive striped bordered hover className="bg-white">
                                            <tbody className="text-left">
                                                <tr>
                                                    <td key={ans.osparId} colSpan={3}><Form.Label>{ans.answer}</Form.Label></td>
                                                </tr>
                                                <tr>
                                                    <td key={i}><Form.Control type="number" name={ans.answer} min={0} value={counter[ans.answer]} onChange={onCountChange} onKeyPress={(e) => { if(e.key === 'Enter') {e.preventDefault();console.log(e.keyCode);}}}/></td>
                                                    <td key={"+"+i}><Button variant="success" className="bg-complete" onClick={() => plusOne(ans.answer,counter[ans.answer])}><BsPlusLg className="no-margin"/></Button></td>
                                                    <td key={"-"+i}><Button variant="danger" onClick={() => minusOne(ans.answer,counter[ans.answer])}><BsDashLg className="no-margin"/></Button></td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                        ))}
                                      </Card.Body>
                                  </Card>
                                )
                            } 
                            )}
                        </Accordion>
                        </Card.Body>
                    </Accordion.Collapse>
                </Card>
                )
            })
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Row>
                        <Form className="w-100">
                            <Card className="qbox">
                                <Card.Body className="w-100">
                                    <Form.Group controlId="formFile">
                                        <Card.Header className="qcard">
                                            <Form.Label>RIVERINE PLASTIC WASTE MONITORING</Form.Label> <br/>
                                            <Form.Label className="question-txt">{currentQuestionData.question}</Form.Label>
                                        </Card.Header>
                                        <Card.Body className="bg-lighter">
                                            <Accordion>{AnswerMap}</Accordion>
                                        </Card.Body>
                                    </Form.Group>
                                    <Card.Body>
                                        {(backbtn && currentQuestionData.questionId !== 7) && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                                        <Button size="lg" className="note-btn" onClick={handleFinish}>Continue</Button>
                                    </Card.Body>
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
                        </Form>
                    </Row>
                </Container>
            )
        }
        case "note": {
            let noteTitles = currentQuestionData.note.titles.map(tt => {
                return(
                    <Row>
                        <Col>
                            <h1 className="note-title">{tt}</h1>
                        </Col>
                    </Row>
                )
            })
            let noteSteps = currentQuestionData.note.steps.map(stp => {
                return (
                    <Row>
                        <Col className="note-step">
                            <p><b>{stp}</b></p>
                        </Col>
                    </Row>
                )
            })
            let noteText = currentQuestionData.note.text.map(txt => {
                return (
                    <Row>
                        <Col>
                        <p className="note-txt">{txt}</p>
                        </Col>
                    </Row>
                )
            })
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Jumbotron className="qbox pad">
                        {noteTitles}
                        {noteText}
                        {noteSteps}
                        <Row>
                            {ImageMap}
                        </Row> 
                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                        <Button size="lg" className="note-btn" onClick={handleNext}>{currentQuestionData.noteButtonText}</Button>
                        {error !== "" &&
                            <Row className="mt-2">
                                <Alert variant="danger" className="errors">
                                    <BsFillEmojiDizzyFill/>
                                    {error}
                                </Alert>
                            </Row>
                        }
                    </Jumbotron>
                </Container>
            )
        
        }
        case "safety": {
            let noteTitles = currentQuestionData.note.titles.map(tt => {
                return(
                    <Row>
                        <Col>
                            <h1 className="safety-title">{tt}</h1>
                        </Col>
                    </Row>
                )
            })
            let noteSteps = currentQuestionData.note.steps.map(stp => {
                return (
                    <Row>
                        <Col md={{ span: 8, offset: 2 }} className="safety-step">
                            <p><b>{stp}</b></p>
                        </Col>
                    </Row>
                )
            })
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Jumbotron className="safety-box pad">
                        {noteTitles}
                        {noteSteps}
                        <Row>
                            {ImageMap}
                        </Row>
                        {backbtn && <Button size="lg" className="safety-btn" onClick={handleBack}>Back</Button>}
                        <Button size="lg" onClick={handleNext} className="note-btn">{currentQuestionData.noteButtonText}</Button>
                        {error !== "" &&
                            <Row className="mt-2">
                                <Alert variant="danger" className="errors">
                                    <BsFillEmojiDizzyFill/>
                                    {error}
                                </Alert>
                            </Row>
                        }
                    </Jumbotron>
                </Container>
            )
        
        }
        case "instruction": {
            let noteTitles = currentQuestionData.note.titles.map(tt => {
                return(
                    <Row>
                        <Col>
                            <h1 className="instruction-title">{tt}</h1>
                        </Col>
                    </Row>
                )
            })
            let noteSteps = currentQuestionData.note.steps.map(stp => {
                return (
                    <Row>
                        <Col md={{ span: 8, offset: 2 }} className="note-step">
                            <p><b>{stp}</b></p>
                        </Col>
                    </Row>
                )
            })
            let noteText = currentQuestionData.note.text.map(txt => {
                return (
                    <Row>
                        <Col>
                        <p className="instruction-txt">{txt}</p>
                        </Col>
                    </Row>
                )
            })
            return (
                <Container fluid>
                    <Row>
                        <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                    </Row>
                    <Jumbotron className="qbox pad">
                        {noteTitles}
                        {noteText}
                        {noteSteps}
                        <Row>
                            {ImageMap}
                        </Row>
                        {backbtn && <Button size="lg" className="q-btn" onClick={handleBack}>Back</Button>}
                        <Button size="lg" className="note-btn" onClick={handleNext}>{currentQuestionData.noteButtonText}</Button>
                        {error !== "" &&
                            <Row className="mt-2">
                                <Alert variant="danger" className="errors">
                                    <BsFillEmojiDizzyFill/>
                                    {error}
                                </Alert>
                            </Row>
                        }
                    </Jumbotron>
                </Container>
            )
        
        }
        case "start": {   
            return (
                <Container fluid>
                <Row>
                    <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                </Row>
                <Row>
                    <Col xs={12} className="text-white mb-3">
                        <h4>Step 4 - Your Questionnaire</h4>
                        <h5>Let's Start a new questionnaire!</h5>
                    </Col>
                    <Col>
                        <Jumbotron className="qbox pad">
                            <Table striped bordered className="bg-white">
                                <thead className="bg-blue">
                                    <tr>
                                    <th colSpan="2">You are going to submit your answers to the following project:</th>
                                    </tr>
                                </thead>
                                <tbody className="text-left">
                                    <tr>
                                    <td className="td-lbl" key="project">Project:</td>
                                    <td key="1">{currentProjectTitle}</td>
                                    </tr>
                                    <tr>
                                    <td className="td-lbl" key="questionnaire">Questionnaire Type:</td>
                                    <td key="2">{questionnaireName}</td>
                                    </tr>
                                </tbody>
                            </Table>
                            <Col xs={12}><Form.Check type="checkbox" checked={publicQ} onChange={setPublic} label="Do you want to let everyone see and download your final answers?" className="ltxt small mt-2"/></Col>
                            <Button size="lg" className="q-btn" onClick={goBack} block>Back</Button>
                            <Button size="lg" className="general-btn" onClick={onStart} block><span className="pulse">Let's Start</span></Button>
                            {error !== "" &&
                            <Row className="mt-2">
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
        case "end": {
            return(
                <Container fluid>
                <Row>
                    <MenuBar setUserLoggedLevel={setUserLoggedLevel}/>
                </Row>
                <Jumbotron className="tbox pad">
                    <p className="question-txt">Congratulations! You just completed your questionnaire.</p>
                    <br/> <p><BiHappyAlt className="happy"/></p> <br/>
                    <p className="question-txt">Check all your answers and submit them to climatescan.</p>
                    <br/>
                    <Button size="lg" className="general-btn" onClick={showPreview} block><span className="pulse">See Your Answers</span></Button>
                    {error !== "" &&
                        <Row className="mt-2">
                            <Alert variant="danger" className="errors">
                                <BsFillEmojiDizzyFill/>
                                {error}
                            </Alert>
                        </Row>
                    }
                </Jumbotron>
                </Container>
            )
        }
    } // end of switch
}

export default Questions