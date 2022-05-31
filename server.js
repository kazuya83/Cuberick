const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { Console } = require('console');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const MATCHING_INFO = {};
const ROOM_INFO = {};
const BLACK = 0;
const WHITE = 1;
const clients = [];
const socketsList = [];

const OPPONENT_UNIQUE_ID = 'OPPONENT_UNIQUE_ID';

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Run When client connects
io.on('connection', socket => {
    socketsList.push(socket);
    console.log('New WS Connection...');

    // Welcom current connects
    socket.emit('message', 'Welcome to Cuberick');

    // Broadcast when a user connects
    socket.broadcast.emit('message', 'user has joined the chat');

    // Runs when client disconnects
    socket.on('disconnect', () => {
        socketsList.splice(socketsList.indexOf(socket), 1);
        io.emit('message', 'user has left the chat');

        console.log('MATCHING_INFO[socket.id]: ',MATCHING_INFO[socket.id]);
        if (!MATCHING_INFO[socket.id]) { return; }
        const opponentSocketId = MATCHING_INFO[socket.id].OPPONENT_UNIQUE_ID;
        delete MATCHING_INFO[socket.id];
        console.log('opponentSocketId: ',opponentSocketId);
        if (!opponentSocketId) { return; }
        io.emit('opponentDisconnect', opponentSocketId);
    });

    // Listne for chatMessage
    socket.on('chatMessage', (messageList) => {
        io.emit('chatMessage_render', messageList);
    });

    socket.on('searchingOppenent', (uniqueId) => {
        MATCHING_INFO[uniqueId] = {};
        MATCHING_INFO[uniqueId][OPPONENT_UNIQUE_ID] = '';

        let isMatchOpponentUniqueId = '';
        const opponentList = Object.keys(MATCHING_INFO);
        for (let i = 0; i < opponentList.length; i++) {
            const opponentUniqueId = opponentList[i];
            if (opponentUniqueId === uniqueId) { continue; }
            if (MATCHING_INFO[opponentUniqueId][OPPONENT_UNIQUE_ID] === '') {
                MATCHING_INFO[opponentUniqueId][OPPONENT_UNIQUE_ID] = uniqueId;
                MATCHING_INFO[uniqueId][OPPONENT_UNIQUE_ID] = opponentUniqueId;
                isMatchOpponentUniqueId = opponentUniqueId;
                break;
            }
        }

        if (isMatchOpponentUniqueId) {
            const matchingList = [isMatchOpponentUniqueId, uniqueId];
            const roomId = `${getUniqueId()}_room_id`
            ROOM_INFO[roomId] = { 'janken': {} };
            io.emit('matchedOpponent', {'matchingList': matchingList, 'roomId': roomId});
            io.emit('chatMessage_render', {users: [isMatchOpponentUniqueId, uniqueId], messageList: []});
        }
    });

    socket.on('boardGameInfo', (boardInfo) => {
        console.log(boardInfo);
        console.log(boardInfo.boardInfo.length);
        for (let i = 0; i < boardInfo.boardInfo.length; i++) {
            for(let j = 0; j < boardInfo.boardInfo[i].length; j++) {
                if (boardInfo.boardInfo[i][j].count === 1) {
                    boardInfo.boardInfo[i][j].isMove = true;
                } else {
                    boardInfo.boardInfo[i][j].isMove = false;
                }
            }
        }
        const keys = Object.keys(boardInfo);
        const clientList = keys.filter(key => key !== 'order' && key !== 'boardInfo');
        boardInfo.order = clientList.find(key => key !== boardInfo.order);
        io.emit('cuberick_get_info', boardInfo);
    });

    socket.on('reflectBoardInfo', (boardInfo) => {
        io.emit('reflect_cuberick', boardInfo);
    });

    socket.on('janken', (jankenInfo) => {
        ROOM_INFO[jankenInfo.roomId].janken[jankenInfo.uniqueId] = jankenInfo['handType'];
        const janken = ROOM_INFO[jankenInfo.roomId].janken;
        const clientKeys = Object.keys(janken);
        console.log('clientKeys');
        console.log(clientKeys);
        if (clientKeys.length !== 2) {
            return;
        }
        // Trade-off
        if (janken[clientKeys[0]] === janken[clientKeys[1]]) {
            io.emit('janken_onemore', clientKeys);
            ROOM_INFO[jankenInfo.roomId].janken = {};
            console.log('あいこ');
            return;
        }

        const winClient = judgeJanken(clientKeys[0], clientKeys[1], janken[clientKeys[0]], janken[clientKeys[1]]);
        const loseClient = winClient === clientKeys[0] ? clientKeys[1] : clientKeys[0];
        const boardInfo = {};
        boardInfo[winClient] = {
            'color': BLACK,
            'havePie': createInitOwnPie(BLACK)
        };
        boardInfo[loseClient] = {
            'color': WHITE,
            'havePie': createInitOwnPie(WHITE)
        };
        boardInfo['order'] = winClient;
        boardInfo.boardInfo = Array(4).fill(Array(4).fill({'putColor': -1, 'isMove': false, count: 0}));
        io.emit('cuberick_start', boardInfo);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const getUniqueId = () => {
    return Date.now().toString(16) + Math.floor(1050 * Math.random()).toString(16);
}

const judgeJanken = (firstClientId, secondClientId, firstHandType, secondHandType) => {
    let isFirstClientWin = false;

    switch (firstHandType) {
        case 0:
            isFirstClientWin = secondHandType === 1;
            break;
        case 1:
            isFirstClientWin = secondHandType === 2;
            break;
        case 2:
            isFirstClientWin = secondHandType === 0;
            break;
    }

    if (isFirstClientWin) {
        return firstClientId;
    }
    return secondClientId;
};

const createInitOwnPie = (color) => {
    const convertRandomPieOrderInFour = (list, color) => {
        const targetIndex = Math.floor( Math.random() * 4);
        list[targetIndex] = opponentColor;
    };
    const firstFourList = Array(4).fill(color);
    const secondFourList = Array(4).fill(color);
    const opponentColor = color === BLACK ? WHITE : BLACK;
    convertRandomPieOrderInFour(firstFourList, color);
    convertRandomPieOrderInFour(secondFourList, color);
    return flatten([firstFourList, secondFourList]);
};

const flatten = (array) => {
    return array.reduce((a, c) => {
        return Array.isArray(c) ? a.concat(flatten(c)) : a.concat(c);
    }, []);
};