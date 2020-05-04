const swaggerJSDoc = require("swagger-jsdoc");
const ip = "localhost:1234";

const apiSHeader = {
    swaggerDefinition : {
        info : {
            title : "API for nodejs-game",
            version : "1.0.0",
            description : "This is an API for simple server game, that is based on websockets",
            servers : ["http://" + ip]
        }
    },
    apis : ["./v1/example.js"]
};

module.exports = swaggerJSDoc(apiSHeader);