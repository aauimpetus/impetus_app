# 1.Server
The server part of the app is based on Node.js and express.js . The server implements the Model & Controller part of the MVC architecture. The file structure is as follows:
In the server folder of the app we can find:
1. `db folder`: The folder that contains all the files related with the database interaction and other application related data. It contains the following:
    - `model.js file`: The file that has all the necessary CUID functions (models) for interacting with the database server (Business logic)
    - `db_setup.js file`: The file that has the functions to automatically create the database schema. It runs every time we start the server and checks that the db schema is up and ready. If there is an error, it automatically recreates the db schema.
    - `config.js file`: The file that has the configuration for the connection with the database server.
    - `Questionnaires folder`: The folder that contains all the available questionnaires in json format (questions, answers & order of appearance)
2. `Routes folder`: The data-route.js file listens to all the incident and actions triggered in the view and links them with the appropriate contollers for further actions.
3. `Controllers folder`: The folder that contains all the controller files, that are in between the model and the view element. The controllers receive the http requests and perform an appropriate response back. (Input logic) Available controllers are:
    - loginUser
    - logoutUser
    - getProjectNearby
    - getProjectList
    - getCategoryList
    - getUnfinishedSurveys
    - getQuestionnaireList
    - setProject
    - setSurvey
    - startSurvey
    - continueSurvey
    - deleteSurveyRecord
    - getNextQuestion
    - getPreviousQuestion
    - getPreview
    - submitSurvey
    - helper: contains secondary functions that support the controllers
4. `node_modules folder`: The files of the necessary node packages
5. `Important files (.env, package.json, package-lock.json)`: necessary for the setup of the server
6. `globals.js file`: Global mem-cache for storing user information 
7. `MainDev.js file`: The file that starts the server for the developer mode
8. `Main.js file`: The file that starts the server for the production mode

### 1.1 How to start the server
In order to start the server, assuming that we have already installed the app by following the installation guide, we need to open a new terminal/console/cmd and execute the following commands: 
_(For the production mode)_
```sh
cd [path of the app folder]/impetus_2/APP/server
npm run build
npm run start
```
The app will run in a background process. If we want to run it in no-daemon mode and have the logs printed through the terminal, we execute the following script:
```sh
cd [path of the app folder]/impetus_2/APP/server
npm run build
npm run debug
```
Open [http://localhost:4354](http://localhost:4354) to view it in the browser.

If we want to kill the process and stop the server, we can execute the following script:
```sh
cd [path of the app folder]/impetus_2/APP/server
npm run stop
```

_(For the development mode)_
We can run the following script: (Important: After this script, we need also to enable the developer mode of the frontend with npm start. Check client README for more info.)
```sh
cd [path of the app folder]/impetus_2/APP/server
npm run dev
```

---

# 2. Database
The __rethinkdb_data__ folder contains all the files that contain the application data. This folder is the storage space of the databse server.
The database server used is the RethinkDB. It is a scalable JSON database implemented in C++. It uses the ReQL query language and there is a javascript client driver that works in combination with node.js applications.

### 2.1 Database Schema
The schema used for this app consitsts of the following 5 documents(tables):
1. `projects`: It has the following attributes
- __id__: Primary key, unique for every project
- __status__: "NEW" if it is a new project or the id provided from climatescan
- __title__: the title of the project
- __category__: the category of the project
- __description__: optional description of the project
- __latitude__: the location provided from the map or from climatescan
- __longitude__: the location provided from the map or from climatescan
- __userID__: the userId (provided from climatescan) that created or used this project

2. `surveys`: It has the following attributes
- __id__: Primary key, unique for every survey
- __name__: the name of the selected questionnaire
- __type__: the IO type of the selected questionnaire
- __projectID__: the id of the selected project (Secondary index key of projects/id)
- __userID__: the userId (provided from climatescan) that started this questionnaire
- __userName__: the user name (provided from climatescan) that started this questionnaire
- __public__: the status of this questionnaire [boolean] (the answers will be publicly available in climatescan for everyone or not)

3. `answers`: It has the following attributes
- __id__: Primary key, unique for every answer
- __surveyID__: the id of the survey that is being answered (Secondary index key of surveys/id)
- __stepID__: the current step number in the questionnaire
- __questionID__: the current question number that was answered
- __question__: the current question text that was answered
- __answer__: the provided answer
- __answerTxt__: the provided text of the answer
- __userScore__: ["" or Number] the score assigned for this answer (for IO3) 

4. `ongoing_surveys`: It has the following attributes
- __surveyID__: Primary key, the same with the survey that is recorded
- __progress__: the recorded progress in list form. It has the following attributes
    - __stepID__: the last step of the active questionnaire 
    - __answerID__: the id of the answer of the active question

5. `submissions_backup`: It has the following attributes
- __id__: Primary key, unique for every succesfull submission
- __projectData__: a list with all the necessary project information that the answers were submitted
- __surveyAnswers__: a list with all the provided questions-answers for a selected questionnaire
- __submitted_on__: timestamp of the submission

### 2.2 How to start the database server
In order to start the database, assuming that we have already installed the database server by following the installation guide, we need to open a new terminal/console/cmd and execute the following commands:
```sh
cd [path of the app folder]/impetus_2/APP
rethinkdb
```
For accesing the adiministration panel, we open a browser and navigate to http://localhost:8080