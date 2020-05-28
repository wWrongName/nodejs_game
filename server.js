const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const express   = require("express");
const ApiHead   = require("./openApi");
const openApi   = swaggerJSDoc(ApiHead);
const fs        = require('fs');
const app       = express();
const newWS     = new require('ws');

app.use("/api", swaggerUI.serve, swaggerUI.setup(openApi));

app.get("/game", (req, res) => {
    console.log("New user connected");
    fs.readFile(ApiHead.path + "/front.html", function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end('404 Not Found');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
});

app.get("/doc", (req, res) => {
    fs.readFile(ApiHead.path + "/out/index.html", function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            return res.end('404 Not Found');
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
});

app.get("/*", (req, res) => {
    fs.readFile(ApiHead.path + "/out" + req.url, function (err, data) {
        if (err) {
            res.send("WRONG REQUEST. GO TO '" + openApi.info.servers[0] + "/api'");
            return res.end('404 Not Found');
        }
        res.write(data);
        return res.end();
    });
});

app.listen(ApiHead.swaggerDefinition.info.HSPort);

let webSS = new newWS.Server({
    port:ApiHead.swaggerDefinition.info.WSPort
});

module.exports = webSS;