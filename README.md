# IMPETUS Application

## _Requirements_
This app, uses __Node.js__, __React__ and __RethinkDB__. Please make sure that you install everything before you try to run the final app.

### Installation Guide (Part 1 - Install the requirements)

1. First install __Node.js__. (version: >= 16.16) Follow the instructions of this link according to the OS of your PC. Link: https://nodejs.org/en/download/ .

2. To make sure that everything is installed correctly, open a terminal/console/cmd and execute the following command: 
```sh
node -v
npm -v 
```

If everything was succesfully installed, you should be able to see the versions of node and npm.

3. Next installation is __rethinkdb__. (version: 2.4.2) You install the db server by following the instructions of this link: https://rethinkdb.com/docs/install/ . 

4. The port for communicating with the app's server is 8080. Make sure that this port is available.

### Installation Guide (Part 2 - Install the app)

1. You clone this git repo.

2. Open 2 terminals/consoles/cmd and change the directories accordingly:
1st terminal: 
```sh
cd impetus_2/APP/server
```
2nd terminal: 
```sh
cd impetus_2/APP/client
```

3. Now you have to install the dependent packages for the server to work. On the 1st terminal execute the following command: 
```sh
npm install
```

This will create a new directory called __node_modules__ in the server folder of the app. The port for receiving HTTP requests from clients is __4354__. Make sure this port is available.

4. Then you go to the 2nd terminal and you do the same for the client packages. So you again execute the command: 
```sh
npm install 
```
---

## _How to run the app_
1. In order to run the app in __production mode__, open 2 terminals/consoles/cmd and run the following commands:
1st terminal (First we start the database server): 
```sh
cd impetus_2/APP
rethinkdb
```
2nd terminal (Then we start the app): 
```sh
cd impetus_2/APP/server
npm run build
npm run start
```
All logs can be found under the "logFile.txt" file

2. In order to run the app in __development mode__, open 3 terminals/consoles/cmd and run the following commands:
1st terminal (First we start the database server): 
```sh
cd impetus_2/APP
rethinkdb
```
2nd terminal (Then we start the app server): 
```sh
cd impetus_2/APP/server
npm run dev
```
3rd terminal (Finally we start the app client): 
```sh
cd impetus_2/APP/client
npm start
```
> Note: The used ports for this app are: `8080, 4354, 3000`. Please make sure that they are available.

_The European Commission's support for the production of this publication does not constitute an endorsement of the contents, which reflect the views only of the authors, and the Commission cannot be held responsible for any use which may be made of the information contained therein._