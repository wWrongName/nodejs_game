const engine  = require("./game");
const assert  = require("assert");
const axios   = require('axios');
const ApiHead = require("./openApi");

let game;
let gameStruct = {
    hero : {
        hp : 0,
        power : 0,
        speed : 0,
        bonusTime : 0,
    },
    danger : [],
    levels : 0
};

let sendRequest = function (url) {
    return new Promise((resolve, reject) => {
        try {
            let response = axios.get(url);
            resolve(response);
        } catch (err) {
            reject(err);
        }
    });
};

let end = 0;
setInterval(() => {
    if (end === 1)
        process.exit(0);
}, 1000);

testSettings = engine.createGame("set 2 levels");
testSettings.settings("set 1 level warnings 5");
testSettings.settings("set 2 level warnings 2");
testSettings.settings("set 3 level warnings -1");

describe("Unit tests for nodejs-game", function() {
    describe("Test create function", function() {
        it("write wrong command", function() {
            game = engine.createGame("set abc");
            assert.equal("error", game);
        });
        it("set endless", function() {
            game = engine.createGame("set endless");
            assert.equal(JSON.stringify(game.game), JSON.stringify(gameStruct));
        });
        it("set 1 level", function() {
            game = engine.createGame("set 1 level");
            gameStruct.levels = "1";
            assert.equal(JSON.stringify(game.game), JSON.stringify(gameStruct));
        });
        it("set 2 levels", function() {
            game = engine.createGame("set 2 levels");
            gameStruct.levels = "2";
            assert.equal(JSON.stringify(game.game), JSON.stringify(gameStruct));
        });
    });
    describe("Test settings function", function() {
        it("check main game settings for 1L", function() {
            assert.equal(testSettings.game.danger[0].level, 1);
            assert.equal(testSettings.game.danger[0].volume,   5);
        });
        it("check main game settings for 2L", function() {
            assert.equal(testSettings.game.danger[1].level, 2);
            assert.equal(testSettings.game.danger[1].volume,   2);
        });
        it("check wrong game settings", function() {
            // mean that wrong set was not passed
            assert.equal(testSettings.game.danger.length, 2);
        });
    });
    describe("Test requests", function() {
        it("send /api request", async () => {
            let result = await sendRequest(ApiHead.swaggerDefinition.info.servers[0] + "/api");
            assert.equal(result.status, 200);
        });
        it("send /game request", async () => {
            let result = await sendRequest(ApiHead.swaggerDefinition.info.servers[0] + "/game");
            assert.equal(result.status, 200);
        });
        it("send /doc request", async () => {
            let result = await sendRequest(ApiHead.swaggerDefinition.info.servers[0] + "/doc");
            assert.equal(result.status, 200);
        });
        it("send /asdasdasd request", async () => {
            let result = await sendRequest(ApiHead.swaggerDefinition.info.servers[0] + "/asdasdasdasd");
            assert.equal(result.data, "WRONG REQUEST. GO TO \'" + ApiHead.swaggerDefinition.info.servers[0] + "/api\'");
            end = 1;
        });
    });
});