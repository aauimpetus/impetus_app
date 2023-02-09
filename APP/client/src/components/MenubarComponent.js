import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import useProgressController from '../StoreApi';
import {BsHouseFill, BsPower} from "react-icons/bs";
import apis from '../api';

// MenuBar Component 
// It displays the Logo & links to dashboard and logout
const MenuBar = ({setUserLoggedLevel}) => {

    // Component state
    const {setDefaults, resetQuestionnaireStatus, currentUserId} = useProgressController();

    // Error handling function
    const handleErr = function(err) {
        console.warn(err.response);
        alert(err.response.data.message)
    };

    // "Dashboard" link onClick event handler (redirects to the dashboard component)
    const handleDashboard = () => {
        resetQuestionnaireStatus();
        setUserLoggedLevel("dashboard");
    }

    // "Logout" link onClick event handler (performs a logout and redirects to the main component)
    const handleLogout = async () => {
        // let the server know user logging out
        const payload = {
            userIdx: currentUserId, 
        }
        const response = await apis.submitLogout(payload).then(res => res).catch(error => {handleErr(error);});
        setDefaults()
        setUserLoggedLevel("main")
        window.location.reload();
    }

    // View rendering
    return (
            <header>
                <Navbar collapseOnSelect expand="lg" className="mb-3">
                    <Container>
                        <Navbar.Brand>
                            <img 
                            src='/assets/logo_impetus.png'
                            alt="IMPETUS logo"
                            width="185"
                            height="40"/>
                        </Navbar.Brand>
                        <Navbar.Toggle className= "navbar-dark"/>
                        <Navbar.Collapse className="justify-content-end">                       
                            <Nav.Link onClick={handleDashboard}><BsHouseFill/>Dashboard</Nav.Link>
                            <Nav.Link onClick={handleLogout}><BsPower/>Logout</Nav.Link>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
    )
}
export default MenuBar;