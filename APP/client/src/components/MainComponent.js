import React, {useState, useEffect} from 'react';
import useProgressController from '../StoreApi';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Alert from 'react-bootstrap/Alert';
import {BsFillEyeSlashFill,BsFillEyeFill,BsFillEmojiDizzyFill} from "react-icons/bs";
import apis from '../api';
import {Buffer} from 'buffer';

const mStyle = {
        backgroundImage: `url('/assets/welcome.jpg')`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
    }

// Home page Component
// This is the initial view that acts as a welcome page and login occurs
const Main = ({setUserLoggedLevel}) => {

    // Component state
    const {currentUserEmail, currentUserPass, setUser, setUserId, setEmail, setPass, setLoginStatus} = useProgressController();
    // Alert handling state
    const [error, setError] = useState("");
    const [status, setStatus] = useState("start");
    const [showPassword, setToggle] = useState(false);

    // Text input onChange events (sets the state according with every change in the form)
    const onUserSet = (e) => {
        e.preventDefault()
        setEmail(e.target.value)
    }
    const onPassSet = (e) => {
        e.preventDefault()
        setPass(e.target.value)
    }
    // Toggle the visibility of the password text
    const togglePass = () => {
        setToggle(!showPassword);
    };   

    // Login button onClick event handler (sends credentials to server for login authentication & redirects to the info component) 
    const loginUser = async (e) => {
        // preparation and sending credentials to server
        if (currentUserEmail !== "" && currentUserPass !== "") {
            let auth = currentUserEmail+":"+currentUserPass
			let enc = Buffer.from(auth).toString('base64');
            const authHeader = {
				authorization: 'Basic '+enc,
			}
            setStatus("waiting")
            const handleErr = function(err) {
                setEmail("")
                setPass("")
                setStatus("error")
                console.warn(err.response);
                setError(err.response.data.message)
            };
            const response = await apis.submitLogin(authHeader).then(res => res).catch(error => {handleErr(error);});
            // if login is successful, redirects to info component
            if (response !== undefined && response.data.success === true){
                setStatus("completed")
                setLoginStatus(true)
                setUser(response.data.display_name)
                setUserId(response.data.id)
                setUserLoggedLevel("info")
            }
        }
        else {
            setEmail("")
            setPass("")
            setStatus("error")
            setError("Please fill out your credentials to proceed!")
        }
    }
    
    useEffect(()=>{console.log(status)});

    // View rendering
    return (
        <Container fluid style={mStyle}>
        <Row className='h100'>
            <Col sm={12}>
                <Jumbotron lg={{ span: 6, offset: 3 }} className="text-white bg-transparent no-margin pad">
                    <h1><b>Welcome to</b></h1>
                    <h2><b className="tonedb pulsetxt">IMPETUS Data Collection App</b></h2>
                    <Col sm={{span: 8, offset: 2}}><p className="toned">
                    This is an innovative measurement tool that aims to raise urban environmental awareness.
                    With the completion of the following questionnaires, you contribute to research projects related with the environment.
                    Before we start, you need to login.
                    </p></Col>
                </Jumbotron>
            </Col>
            <Col md={{span: 6, offset: 3}} style={{minHeight: '58vh'}}>
                <Card className="qbox logbox">
                    <Card.Header className="bg-blue" text="light" as="h3"><b>Login</b></Card.Header>
                    <Card.Body>
                            <Form>
                                <Form.Group controlId="formLogin">
                                    <Row>
                                        <Col>
                                        <Form.Text className="text-success">
                                            <b>Use your climatescan* credentials to login!</b>
                                        </Form.Text>
                                        </Col>
                                        <Col lg={{ span: 8, offset: 2 }}>
                                        <Form.Label className="formlabels">Email:</Form.Label>
                                        </Col>
                                        <Col lg={{ span: 8, offset: 2 }}>
                                        <Form.Control name="email" type="email" onChange={onUserSet} placeholder="Enter your email" value={currentUserEmail}/>
                                        </Col>
                                        <Col lg={{ span: 8, offset: 2 }}>
                                        <Form.Label className="formlabels">Password:</Form.Label>
                                        </Col>
                                        <Col lg={{ span: 8, offset: 2 }}>
                                        <Form.Control name="password" type={(showPassword)?"text":"password"} onChange={onPassSet} placeholder="Enter your password" value={currentUserPass}/>
                                        </Col>
                                        <Col lg={{ span: 8, offset: 2 }}>
                                        <Form.Check type="checkbox" onClick={togglePass} label={(showPassword)?<BsFillEyeFill/>:<BsFillEyeSlashFill/>} className="ltxt small mt-2"/>
                                        </Col>
                                    </Row>
                                </Form.Group>
                                <Row>
                                    <Col lg={{ span: 8, offset: 2 }}>
                                    <Button size="lg" block className="credentials-btn" onClick={loginUser}>Let's Go</Button>
                                    </Col>
                                </Row>
                                <Row>
                                <small className="mt-3">* If you do not have an account, please make one at <a href="https://climatescan.org/" target="_blank">https://climatescan.org/</a> and use these credentials to login this app.</small>
                                </Row>
                            </Form>
                            {status === "error" &&
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
        </Container>
    );
}

export default Main;