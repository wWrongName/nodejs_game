# NODE.JS GAME

* Version 1.4
* You can find API on http://95.217.212.200:1234/api

### How to:
* run on the server.
    - change constants IP and path in OpenApi.js
    - run:
```
    pm2 start remote-game-start.js
```
or
```
    node remote-game-start.js
```
* generate documentation
    - run:
```
    ./node_modules/.bin/jsdoc ./game.js ./README.md
```
* run tests
    - command for starting unit tests:
```
    source ./unit-test.bash
```
    - command for starting integration tests:
```
    source ./integ-test.bash
```
