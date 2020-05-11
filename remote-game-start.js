const engine = require("./game");

let game = engine.createGame("set 1 level");
game.settings("set 1 level warnings 5");
game.settings("set 1 level warnHp 4");
game.settings("create character hp 10");
game.settings("create character speed 2");
game.settings("create character power 1");
game.gameOver = function (curSession) {
    if (typeof(curSession) !== "undefined")
        curSession.status = "gameover";
    return curSession;
};
game.victory = function (curSession) {
    if (typeof(curSession) !== "undefined")
        curSession.status = "victory";
    return curSession;
};
game.getBonus = function (hero) {
    hero.hp = 2 + Number(hero.hp);   // plus 2 hp for each killed enemy
    console.log("Plus two hitpoints | now hp = " + hero.hp);
    return hero;
};
engine.start(game);

module.exports = game;