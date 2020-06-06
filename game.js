const webSS     = require("./server");
const frameTime = 1000/60;

/**
 * Function that return a game structure for you server.
 * @param {number} levelType - Positive number - amount of levels(sessions) in the game
 * 
 * @example
 * setData(1)
 */
let setData = function (levelType) {
    return {
        game : {
            hero : {
                hp : 0,
                power : 0,
                speed : 0,
                bonusTime : 0,
            },
            danger : [],
            levels : levelType
        },
        sessions : [],
        /**
         * Function that creates a game structure for you server.
         * @param {string} user - uuid of some user
         * @param {number} w - width of user's browser (measured by pixels)
         * @param {number} h - height of user's browser (measured by pixels)
         * @example
         * 
         * joinUser("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", 2560, 1440)
         */
        joinUser : function (user, w, h) {
            for (let i = 0; i < this.sessions.length; i++) {
                if (this.sessions[i].user === user)
                    return i;
            }
            let heroHp = this.game.hero.hp;
            let danger = this.game.danger;
            this.sessions.push({
                width: w,
                height: h,
                status: "active",
                user : user,
                hero : {hp : heroHp, x: 0, y: 0, d: 1},
                bullet : {x: -1, y: -1, active: 0},
                luck: false,
                enemies : danger.map(el => {
                    let str = '[';
                    str += `{"x":0, "y":0, "d":1, "hp":${el.hp}},`.repeat(el.volume);
                    str = str.slice(0, -1);
                    str += ']';
                    return {
                        level: el.level,
                        power: el.power,
                        coords: JSON.parse(str)
                    };
                }),
                layers : [],
            });
            let l = this.sessions.length - 1;
            this.sessions[l] = prepareGame(this.sessions[l]);
            return l;
        },
        /**
         * Function that are called after defeat
         * 
         * @example
         * 
         * game.gameOver = function (curSession) {
         *   if (typeof(curSession) !== "undefined")
         *      curSession.status = "gameover";
         *   return curSession;
         * }
         */
        gameOver : function () {},
        /**
         * Function that are called after dealing damage to an enemy
         * @param {Object} hero - structure describing properties of game character
         * @param {number} hero.hp - hero's hit points (positive number)
         * @param {number} hero.speed - hero's speed (positive number)
         * @param {number} hero.power - hero's power (positive number)
         * 
         * @example
         * 
         * getBonus(hero) {
         *      hero.hp += 2;
         *      return hero;
         * }
         */
        getBonus : function (hero) {},
        /**
         * Function that are called after victory
         */
        victory  : function () {},
        /**
         * Function that are called for establishing game rules
         * @param {string} description - set warnings for a level and create hero for the game
         * 
         * @example
         * 
         * game.victory = function (curSession) {
         *   if (typeof(curSession) !== "undefined")
         *      curSession.status = "victory";
         *   return curSession;
         * }
         */
        settings : function (description) {
            let commands = description.split(' ');
            console.log(commands);
            if (commands[0] === "set") {
                if (commands[1] > 0 && commands[1] <= this.game.levels && commands[2] === "level") {
                    let createdLevel = this.game.danger.reduce(function (mid, cur, index) {
                        return cur.level === commands[1] ? index : mid;
                    }, -1);
                    switch (commands[3]) {
                        case "warnings":
                            let vol = (Number.isInteger(Number(commands[4])) && commands[4] <= 10 && commands[4] >= 0) ? commands[4] : 1;
                            if (createdLevel === -1) {
                                this.game.danger.push({
                                    level: commands[1],
                                    volume: vol,
                                    hp: 1,
                                    speed: 1,
                                    power: 1
                                });
                                console.log("Set level rules => level " + commands[1] + " | " + vol + " enemies");
                            } else {
                                this.game.danger[createdLevel].warnings = vol;
                                console.log("Update level rules => level " + commands[1] + " | " + vol + " enemies");
                            }
                            break;
                        case "warnHp":
                            let HP = (Number.isInteger(Number(commands[4])) && commands[4] <= 100 && commands[4] >= 0) ? commands[4] : 1;
                            if (createdLevel === -1) {
                                this.game.danger.push({
                                    level: commands[1],
                                    volume: 1,
                                    hp: HP,
                                    speed: 1,
                                    power: 1
                                });
                                console.log("Set level rules => level " + commands[1] + " | " + HP + " warnHp");
                            } else {
                                this.game.danger[createdLevel].hp = HP;
                                console.log("Update level rules => level " + commands[1] + " | " + HP + " warnHp");
                            }
                            break;
                        case "warnSpeed":
                            let SPEED = (Number.isInteger(Number(commands[4])) && commands[4] <= 5 && commands[4] >= 1) ? commands[4] : 1;
                            if (createdLevel === -1) {
                                this.game.danger.push({
                                    level: commands[1],
                                    volume: 1,
                                    hp: 1,
                                    speed: SPEED,
                                    power: 1
                                });
                                console.log("Set level rules => level " + commands[1] + " | " + SPEED + " warnSpeed");
                            } else {
                                this.game.danger[createdLevel].speed = SPEED;
                                console.log("Update level rules => level " + commands[1] + " | " + SPEED + " warnSpeed");
                            }
                            break;
                        case "warnPower":
                            let POWER = (Number.isInteger(Number(commands[4])) && commands[4] <= 10 && commands[4] >= 1) ? commands[4] : 1;
                            if (createdLevel == -1) {
                                this.game.danger.push({
                                    level: commands[1],
                                    volume: 1,
                                    hp: 1,
                                    speed: 1,
                                    power: POWER
                                });
                                console.log("Set level rules => level " + commands[1] + " | " + POWER + " warnPower");
                            } else {
                                this.game.danger[createdLevel].power = POWER;
                                console.log("Update level rules => level " + commands[1] + " | " + POWER + " warnPower");
                            }
                            break;
                        default:
                            console.log("Error, level is not set");
                    }
                } else if (commands[1] === "all" && commands[2] === "levels") {
                    let vol   = (Number.isInteger(Number(commands[4])) && commands[4] <= 10 && commands[4] >= 0)  ? commands[4] : 1;
                    let HP    = (Number.isInteger(Number(commands[4])) && commands[4] <= 100 && commands[4] >= 0) ? commands[4] : 1;
                    let SPEED = (Number.isInteger(Number(commands[4])) && commands[4] <= 5 && commands[4] >= 1)   ? commands[4] : 1;
                    let POWER = (Number.isInteger(Number(commands[4])) && commands[4] <= 10 && commands[4] >= 1)  ? commands[4] : 1;
                    this.game.danger = this.game.danger.map(element => {
                        switch (commands[3]) {
                            case "warnings":
                                element.volume = vol;
                                console.log("Set all levels warnings volume = " + vol);
                                break;
                            case "warnHp":
                                element.hp = HP;
                                console.log("Set all levels warnings hp = " + HP);
                                break;
                            case "warnSpeed":
                                element.speed = SPEED;
                                console.log("Set all levels warnings speed = " + SPEED);
                                break;
                            case "warnPower":
                                element.power = POWER;
                                console.log("Set all levels warnings power = " + POWER);
                                break;
                            default:
                                console.log("Error, levels are not set");
                        }
                        return element;
                    });
                } else {
                    console.log("Error, the rule was not set");
                }
            } else if (commands[0] === "create" && commands[1] === "character") {
                switch (commands[2]) {
                    case "hp":
                        this.game.hero.hp    = (Number.isInteger(Number(commands[3])) && commands[3] <= 100 && commands[3] >= 1) ? commands[3] : 0;
                        console.log("Set hero | hp = " + this.game.hero.hp );
                        break;
                    case "speed":
                        this.game.hero.speed = (Number.isInteger(Number(commands[3])) && commands[3] <= 5 && commands[3] >= 1)   ? commands[3] : 0;
                        console.log("Set hero | speed = " + this.game.hero.speed );
                        break;
                    case "power":
                        this.game.hero.power = (Number.isInteger(Number(commands[3])) && commands[3] <= 10 && commands[3] >= 1)  ? commands[3] : 0;
                        console.log("Set hero | power = " + this.game.hero.power );
                        break;
                    case "bonusTime":
                        this.game.hero.bonusTime = (Number.isInteger(Number(commands[3])) && commands[3] <= 5 && commands[3] >= 1)   ? commands[3] : 0;
                        console.log("Set hero | bonus_time = " + this.game.hero.bonusTime );
                        break;
                    case "skin":
                        this.game.hero.skin = commands[3];
                        console.log("Set hero | skin = " + this.game.hero.skin );
                        break;
                    default:
                        console.log("Error, hero is not created");
                }
            } else {
                console.log("Error, the game is not set");
            }
        }
    };
};

/**
 * Function that return a game structure for you server.
 * @param {string} option - option that sets an amount of levels
 * @example
 * 
 * createGame("set 1 level")
 */
let createGame = function (option) {
    const endless = 0;
    let order = option.split(' ');
    if (order[0] === "set") {
        if (order[1] === "endless") {
            return setData(endless);
        } else if (Number.isInteger(Number(order[1])) && order[1] > 0 && (order[2] === "levels") || (order[2] === "level")) {
            return setData(order[1]);
        } else {
            console.log("Error, a game is not created");
            return "error";
        }
    }
};

/**
 * Function are required for updating physics for all active sessions
 * @param {Object} games - game object from createGame function
 * @param {num} multiplier - element required for floating fps (missing frames)
 */
let physicsUpdate = function (games, multiplier) {
    for (let g_s = 0; g_s < 4; g_s++) {
        for (let j = 0; j < games.sessions.length; j++) {
            if (games.sessions[j].hero.hp <= 0) {
                games.sessions[j].luck = true;
                games.sessions[j] = games.gameOver(games.sessions[j]);
            }
            if (games.sessions[j].status === "active") {
                if (games.sessions[j].hero.x > games.sessions[j].width - 40 && games.sessions[j].hero.y == games.sessions[j].layers[0] && games.sessions[j].luck == true)
                    games.sessions[j] = games.victory(games.sessions[j]);
                if (games.sessions[j].bullet.active != 0) {
                    games.sessions[j].bullet.x += games.game.hero.speed * multiplier * 2 * games.sessions[j].bullet.active;
                }
                for (let i = 0; i < games.sessions[j].enemies.length; i++) {
                    games.sessions[j].enemies[i].coords = games.sessions[j].enemies[i].coords.map(element => {
                        element.x += element.d * multiplier;
                        if (element.x <= 0)
                            element.d = 1;
                        else if (element.x >= games.sessions[j].width)
                            element.d = -1;
                        return element;
                    });
                }
                if (games.sessions[j].bullet.x <= 0 || games.sessions[j].bullet.x >= games.sessions[j].width) {
                    games.sessions[j].bullet.active = 0;
                    games.sessions[j].bullet.x = -10;
                }
                for (let i = 0; i < games.sessions[j].enemies.length; i++) {
                    for (let k = 0; k < games.sessions[j].enemies[i].coords.length; k++) {
                        if (Math.abs(games.sessions[j].enemies[i].coords[k].x - games.sessions[j].hero.x) <= 5 && (games.sessions[j].enemies[i].coords[k].y - games.sessions[j].hero.y) === 0)
                            games.sessions[j].hero.hp -= games.sessions[j].enemies[i].power;
                        if (Math.abs(games.sessions[j].enemies[i].coords[k].x - games.sessions[j].bullet.x) <= 5 && (games.sessions[j].enemies[i].coords[k].y - games.sessions[j].hero.y) === 0) {
                            games.sessions[j].enemies[i].coords[k].hp -= games.game.hero.power;
                            games.sessions[j].bullet.active = 0;
                            games.sessions[j].bullet.x = -10;
                            games.sessions[j].bullet.y = -10;
                        }
                        if (games.sessions[j].enemies[i].coords[k].hp <= 0) {
                            if (games.sessions[j].enemies[i].coords.length == 1)
                                games.sessions[j].luck = true;
                            games.sessions[j].enemies[i].coords.splice(k, 1);
                            games.sessions[j].hero = games.getBonus(games.sessions[j].hero);
                        }
                    }
                }
            }
            if (games.sessions[j].status === "victory" || games.sessions[j].status === "gameover") {
                if (games.sessions[j].bullet.active == -100)
                    games.sessions.splice(j, 1);
                else
                    games.sessions[j].bullet.active--;
            }
        }
    }
    return games;
};

/**
 * Function are required for defining layers' coordinates
 * @param {Object} session - element of array are called sessions (game structure with user's properties)
 */
let prepareGame = function (session) {
    session.layers = [
        session.height / 4,
        session.height / 2,
        session.height * 3 / 4
    ];
    session.hero.x = 20;
    session.hero.y = session.layers[2];
    for (let i = 0; i < session.enemies.length; i++) {
        for (let j = 0; j < session.enemies[i].coords.length; j++) {
            session.enemies[i].coords[j].x = Math.floor(Math.random() * ++session.width);
            session.enemies[i].coords[j].y = session.layers[Math.floor(Math.random() * 3)];
        }
    }
    return session;
};

/**
 * Main function for starting game and establishing ws_server's api
 * @param {Object} struct - structure are returned by function "createGame"
 */
let start = function (struct) {
        let gameStructure = struct;
        webSS.on('connection', function (ws) {
            ws.on('message', function (message) {
                let tmpJson = JSON.parse(message);
                let place = gameStructure.joinUser(tmpJson.token, tmpJson.width, tmpJson.height);
                if (tmpJson.command == 0) { // left
                    for (let i = 0; i < 3; i++) {
                        if (gameStructure.sessions[place].layers[i] - 20 < gameStructure.sessions[place].hero.y && gameStructure.sessions[place].layers[i] + 20 > gameStructure.sessions[place].hero.y) {
                            gameStructure.sessions[place].hero.y = gameStructure.sessions[place].layers[i];
                            gameStructure.sessions[place].hero.d = -1;
                            if (gameStructure.sessions[place].hero.x > 0)
                                gameStructure.sessions[place].hero.x += gameStructure.game.hero.speed * gameStructure.sessions[place].hero.d * 4;
                        }
                    }
                } else if (tmpJson.command == 1) { // right
                    for (let i = 0; i < 3; i++) {
                        if (gameStructure.sessions[place].layers[i] - 20 < gameStructure.sessions[place].hero.y && gameStructure.sessions[place].layers[i] + 20 > gameStructure.sessions[place].hero.y) {
                            gameStructure.sessions[place].hero.y = gameStructure.sessions[place].layers[i];
                            gameStructure.sessions[place].hero.d = 1;
                            if (gameStructure.sessions[place].hero.x < gameStructure.sessions[place].width)
                                gameStructure.sessions[place].hero.x += gameStructure.game.hero.speed * gameStructure.sessions[place].hero.d * 4;
                        }
                    }
                } else if ((gameStructure.sessions[place].hero.x >= 0 && gameStructure.sessions[place].hero.x <= 20) || (gameStructure.sessions[place].hero.x <= gameStructure.sessions[place].width && gameStructure.sessions[place].hero.x >= gameStructure.sessions[place].width - 20)) {
                    if (tmpJson.command == 2) { // up
                        if (gameStructure.sessions[place].hero.y > gameStructure.sessions[place].layers[0])
                            gameStructure.sessions[place].hero.y -= gameStructure.game.hero.speed * 2;
                    } else if (tmpJson.command == 3) { // down
                        if (gameStructure.sessions[place].hero.y < gameStructure.sessions[place].layers[2])
                            gameStructure.sessions[place].hero.y += +gameStructure.game.hero.speed * 2;
                    }
                } else if (tmpJson.command == 4 && gameStructure.sessions[place].bullet.active == 0) { // fire
                    gameStructure.sessions[place].bullet.x = gameStructure.sessions[place].hero.x;
                    gameStructure.sessions[place].bullet.y = gameStructure.sessions[place].hero.y;
                    gameStructure.sessions[place].bullet.active = gameStructure.sessions[place].hero.d;
                } else {}
                if (gameStructure.sessions[place].hero.hp <= 0)
                    gameStructure.gameOver();
                if (gameStructure.sessions[place].enemies[0].length == 0)
                    gameStructure.victory();
                ws.send(JSON.stringify({
                    session : gameStructure.sessions[place],
                    heroSkin : gameStructure.game.hero.skin,
                    dangerSkin : gameStructure.game.dangerSkin,
                    background : gameStructure.game.background
                }));
            });
        });
        setTimeout(function loop(curTime) {
            let newTime = new Date().getTime();
            if (newTime - curTime > frameTime) {
                let skip = Math.round((newTime - curTime) / frameTime);
                gameStructure = physicsUpdate(gameStructure, skip);
            } else {
                gameStructure = physicsUpdate(gameStructure, 1);
            }
            setTimeout(loop, frameTime, newTime);
        }, frameTime, new Date().getTime());
}

module.exports = {
    start : start,
    createGame : createGame
}