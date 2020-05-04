const swaggerUI = require("swagger-ui-express");
const express   = require("express");
const openApi   = require("./openApi");
const fs        = require('fs');
const app       = express();
const newWS     = new require('ws');

app.use("/api", swaggerUI.serve, swaggerUI.setup(openApi));

app.get("/game", (req, res) => {
    console.log("New user connected");
    fs.readFile("./front.html", function (err, data) {
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
    res.send("WRONG REQUEST. GO TO '" + openApi.info.servers[0] + "/api'");
});

app.listen(1234);

let webSS = new newWS.Server({
    port:1235
});

module.exports = webSS;