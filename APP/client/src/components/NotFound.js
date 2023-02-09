import React from 'react';
import Button from 'react-bootstrap/Button';

const NotFound = ({setUserLoggedLevel}) => {
    return(
        <div className="qcard">
            <h1>404 Not Found</h1>
            <Button variant="light" onClick={setUserLoggedLevel("main")}>Go to main page</Button>
        </div>
    )
}

export default NotFound;