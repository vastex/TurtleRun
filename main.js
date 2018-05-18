(function init() {
    const socket = io.connect('http://192.168.0.114:3000');
    const P1 = 'X';
    const P2 = 'O';
    const P3 = 'I';
    class Player {
        constructor(name, type) {
            this.name = name;
            this.type = type;
            this.currentTurn = true;
            this.playsArr = 0;
        }

        static get wins() {
            return [7, 56, 448, 73, 146, 292, 273, 84];
        }

        // Set the bit of the move played by the player
        // tileValue - Bitmask used to set the recently played move.
        updatePlaysArr(tileValue) {
            this.playsArr += tileValue;
        }

        getPlaysArr() {
            return this.playsArr;
        }

        // Set the currentTurn for player to turn and update UI to reflect the same.
        setCurrentTurn(turn) {
            this.currentTurn = turn;
            var time = 10
            const message = turn ? 'Your turn' : 'Waiting for Opponent';
            $("#countdown").html(time);
        }

        getPlayerName() {
            return this.name;
        }

        getPlayerType() {
            return this.type;
        }

        getCurrentTurn() {
            return this.currentTurn;
        }
    }
    class Game {
        constructor(roomId) {
            this.roomId = roomId;
        }

        showGame(message) {
            $('.login').css('display', 'none');
            $('.gameBoard').css('display', 'block');
            $('#userHello').html(message);
        }
    }
    var game2;
    Game.prototype.playTurn = function (tile) {
        var clickedButton = tile;
        if (clickedButton == "player1") {
            $("#p1").css("left", "+=8");
        }
        if (clickedButton == "player2") {
            $("#p2").css("left", "+=8");
        }
        if (clickedButton == "player3") {
            $("#p3").css("left", "+=8");
        }
        var sendObj = {
            tile: clickedButton,
            room: game2.roomId
        }
        //console.log(game2);
        console.log(sendObj);
        socket.emit('playTurn', sendObj);
    }
    $('#new').on('click', () => {
        const name = $('#nameNew').val();
        if (!name) {
            alert('Please enter your name.');
            return;
        }
        socket.emit('createGame', { name });
        player = new Player(name, P1);
    });
    // Join an existing game on the entered roomId. Emit the joinGame event.
    $('#join').on('click', () => {
        const name = $('#nameJoin').val();
        const roomID = $('#room').val();
        if (!name || !roomID) {
            alert('Please enter your name and game ID.');
            return;
        }
        socket.emit('joinGame', { name, room: roomID });
        player = new Player(name, P2);
    });

    socket.on('player1', (data) => {
        const message = `Hello, ${player.getPlayerName()}`;
        $('#userHello').html(message);
        player.setCurrentTurn(true);
    });

    /**
       * Joined the game, so player is P2(O). 
       * This event is received when P2 successfully joins the game room. 
       */
    socket.on('player2', (data) => {
        const message = `Hello, ${data.name}`;
        // Create game for player 2
        game = new Game(data.room);
        game.showGame(message);
        game2 = new Game(data.room);
        player.setCurrentTurn(true);
    });
    socket.on('player3', (data) => {
        const message = `Hello, ${data.name}`;
        // Create game for player 2
        game = new Game(data.room);
        game.showGame(message);
        game2 = new Game(data.room);
        player.setCurrentTurn(true);
    });

    // New Game created by current client. Update the UI and create new Game var.
    socket.on('newGame', (data) => {
        const message =
          `Hello, ${data.name}. Game ID:
      ${data.room}. Waiting for player 2...`;

        // Create game for player 1
        game = new Game(data.room);
        game2 = new Game(data.room);
        game.showGame(message);
    });

    socket.on('turnPlayed', function (data) {
        console.log(data.tile);
        console.log(data.room);
        if (data.tile == "player1") {
            $("#p1").css("left", "+=8");
        }
        if (data.tile == "player2") {
            $("#p2").css("left", "+=8");
        }
        if (data.tile == "player3") {
            $("#p3").css("left", "+=8");
        }
    });

   
    $('#player1').on('click', function() {
        Game.prototype.playTurn($(this).attr('id'));
    });
    $('#player2').on('click', function () {
        Game.prototype.playTurn($(this).attr('id'));
    });
    $('#player3').on('click', function () {
        Game.prototype.playTurn($(this).attr('id'));
    });
}());