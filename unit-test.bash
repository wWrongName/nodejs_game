pm2 stop remote-game-start || echo "game wasn't turned on"
./node_modules/mocha/bin/mocha unit-tests.js
return $?
pm2 start remote-game-start