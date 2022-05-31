import { COMMON } from './common.js';

const socket = io();
const mainBody = COMMON.getElemByClass('main');
const mainBox = COMMON.getElemByClass('main-box');
const gameStartBtn = COMMON.getElemById('gameStartBtn');

const GU = 0;
const CHOKI = 1;
const PA = 2;

const BOARD_COUNT = 4;
const BOARD_SIZE = 60;

const LEFT = 0;
const TOP = 1;
const RIGHT = 2;
const BOTTOM = 3;

let uniqueId = '';
let opponentId = '';
let roomId = '';
let boardInfo;
let isYourTurn = false;
let isYourBoardMoveTurn = false;
let isMoveMode = false;
let nextPieceColor;
let movePreInfo = {};
let moveAbleList = [];
let messageInfo = {};

socket.on('opponentDisconnect', id => {
    if (id === uniqueId) {
        location.reload();
    }
});

socket.on('message', message => {
    console.log(message);
});

socket.on('chatMessage_render', _messageInfo => {
    console.log(_messageInfo.users);
    const isTarget =_messageInfo.users.find(user => user === uniqueId);
    if (!isTarget) { return; }
    messageInfo = _messageInfo;
    renderChatMessage();
});

socket.on('reflect_cuberick', res => {
    boardInfo = res;
    renderBoardInfo();
    craeteOppnentHavePie(boardInfo[opponentId]);
    crateOwnHavePie(boardInfo[uniqueId]);
});

socket.on('cuberick_start', res=> {
        setTimeout(() => {
        boardInfo = res;
        const winClient = boardInfo.order;
        if (uniqueId !== winClient && opponentId !== winClient) {
            return;
        }
        const isWin = uniqueId === winClient;
        COMMON.getElemById('jankenWrapper').remove();
        setCuberickGame(isWin);
        craeteOppnentHavePie(boardInfo[opponentId]);
        crateOwnHavePie(boardInfo[uniqueId]);
        const discription = COMMON.getElemById('gameDiscription');
        let msg;
        if (isWin) {
            msg = 'Your turn! \n Place the rightmost piece on the board! \n (To the place where the piece has not been placed yet)';
            isYourTurn = true;
        } else {
            msg = 'Opponent turn!';
            isYourTurn = false;
        }
        discription.textContent = msg;
        createChat();
    }, 500);
});

socket.on('cuberick_get_info', res => {
    boardInfo = res;
    const order = boardInfo.order;
    if (uniqueId !== order && opponentId !== order) {
        return;
    }

    const discription = COMMON.getElemById('gameDiscription');
    let msg;
    if (order === uniqueId) {
        isYourTurn = true;
        isYourBoardMoveTurn = true;
        msg = 'Your turn! \n Place the rightmost piece on the board! \n (To the place where the piece has not been placed yet)';
    } else {
        msg = 'Opponent turn!';
        isYourTurn = false;
        isYourBoardMoveTurn = false;
    }
    discription.textContent = msg;
    renderBoardInfo();
    craeteOppnentHavePie(boardInfo[opponentId]);
    crateOwnHavePie(boardInfo[uniqueId]);
});

socket.on('cuberick_end', (winClient, clientList) => {
    clientList
});

socket.on('janken_onemore', clientList => {
    const isTarget = clientList.find(key => key === uniqueId);
    if (!isTarget) { return; }
    const msg = COMMON.getElemById('jankenWrapperMsg');
    msg.textContent = 'One more decide the first attack and the second attack.';
    msg.style.color = 'red';
    setTimeout(() => {
        const jankenImgs = document.getElementsByClassName('janken-img');
        for (let i = 0; i < jankenImgs.length; i++) {
            console.log(jankenImgs[i]);
            jankenImgs[i].style.backgroundColor = 'rgb(255 250 208 / 0%)';
        }
    }, 600);
});

socket.on('matchedOpponent', matchingInfo => {
    const onwId = matchingInfo.matchingList.find(key => key === uniqueId);
    if (!onwId) {
        return;
    }
    opponentId = matchingInfo.matchingList.find(key => key !== uniqueId);
    roomId = matchingInfo.roomId;
    COMMON.removeLoading('matching success!');
    setTimeout(() => {
        mainBox.remove();
        setJanken();
    }, 1000);
});

const GameStart = () => {
    COMMON.showLoading(mainBody, 'Searching opponent...');

    uniqueId = socket.id;
    console.log(uniqueId);
    socket.emit('searchingOppenent', uniqueId);
};

const setJanken = () => {
    const jankenWrapper = document.createElement('div');
    jankenWrapper.id = 'jankenWrapper';
    jankenWrapper.style.position = 'absolute';
    jankenWrapper.style.top = '0';
    jankenWrapper.style.left = '0';
    jankenWrapper.style.right = '0';
    jankenWrapper.style.bottom = '0';
    jankenWrapper.style.backgroundColor = '#0000008c';
    mainBody.appendChild(jankenWrapper);

    const msg = document.createElement('div');
    msg.id = 'jankenWrapperMsg';
    msg.textContent = 'Decide the first attack and the second attack.';
    msg.style.position = 'absolute';
    msg.style.top = 'calc(50% - 150px)';
    msg.style.left = '0px';
    msg.style.right = '0px';
    msg.style.textAlign = 'center';
    msg.style.color ='#fff';
    msg.style.fontSize = '20px';
    jankenWrapper.appendChild(msg);

    const jankenContainer = document.createElement('div');
    jankenContainer.style.width = '100%';
    jankenContainer.style.height = '100%';
    jankenContainer.style.display = 'flex';
    jankenContainer.style.alignItems = 'center';
    jankenContainer.style.justifyContent = 'center';
    jankenWrapper.appendChild(jankenContainer);

    const gu = createJankenElem(GU);
    // gu.style.backgroundColor = '#bbbbbb';
    jankenContainer.appendChild(gu);
    
    const choki = createJankenElem(CHOKI);
    // choki.style.backgroundColor = '#ffd2d2';
    jankenContainer.appendChild(choki);

    const pa = createJankenElem(PA);
    // pa.style.backgroundColor = '#fffad0';
    jankenContainer.appendChild(pa);
};

const createJankenElem = (handType) => {
    const jankenImg = document.createElement('img');
    jankenImg.className = 'janken-img';
    jankenImg.src = `../image/${handType}.png`;
    jankenImg.style.width = '200px';
    jankenImg.style.height = '200px';
    jankenImg.style.cursor = 'pointer';
    COMMON.onclick(jankenImg, () => {
        let backColor = '';
        switch (handType) {
            case GU:
                backColor = '#bbbbbb';
                break;
            case CHOKI:
                backColor = '#ffd2d2';
                break;
            case PA:
                backColor = '#fffad0';
                break;
        }
        jankenImg.style.backgroundColor = backColor;
        const jankenInfo = {
            roomId: roomId,
            uniqueId: uniqueId,
            handType: handType
        };
        socket.emit('janken', jankenInfo);
    });
    return jankenImg;
};

const renderBoardInfo = () => {
    removeBoardInfo();
    const boardElem = document.createElement('div');
    boardElem.id = 'board';
    mainBody.appendChild(boardElem);
    boardInfo.boardInfo.forEach((rowInfo, i) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.justifyContent = 'center';
        boardElem.appendChild(row);
        rowInfo.forEach((cellInfo, j) => {
            const cell = document.createElement('div');
            cell.style.width = `${BOARD_SIZE}px`;
            cell.style.height = `${BOARD_SIZE}px`;
            cell.style.border = '1px solid #000';
            cell.style.backgroundColor = '#fdd790';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.cursor = 'pointer';
            cell.setAttribute('row', i);
            cell.setAttribute('col', j);
            COMMON.onclick(cell, () => {
                movePiece(i,j);
                if (!isYourTurn) { return; }
                if (boardInfo.boardInfo[i][j].putColor !== -1) { return; }
                boardInfo.boardInfo[i][j].putColor = nextPieceColor;
                boardInfo.boardInfo[i][j].count++;
                boardInfo.boardInfo[i][j].isMove = false;
                isYourTurn = false;
                boardInfo[uniqueId].havePie.pop();
                if (!isYourBoardMoveTurn) { 
                    socket.emit('boardGameInfo', boardInfo);
                    return;
                }
                createPassButton();
                socket.emit('reflectBoardInfo', boardInfo);

                COMMON.getElemById('gameDiscription').textContent = 'Your turn! \n You can move white pieces or black pieces other than where you currently placed them.';
            });
            row.appendChild(cell);
            if (cellInfo.putColor === -1) { return; }
            const piece = document.createElement('div');
            piece.style.width = `${BOARD_SIZE - 30}px`;
            piece.style.height = `${BOARD_SIZE - 30}px`;
            piece.style.position = 'relative';
            piece.style.cursor = 'pointer';
            piece.style.backgroundColor = cellInfo.putColor === 0 ? '#000' : '#fff';
            const count = document.createElement('div');
            count.style.position = 'absolute';
            count.style.top = '5px';
            count.style.left = '11px';
            count.style.color = cellInfo.putColor === 1 ? '#000' : '#fff';
            count.textContent = cellInfo.count;
            piece.appendChild(count);

            COMMON.onclick(piece, () => {
                const arrows = document.getElementsByClassName('arrow');
                for (let i = arrows.length - 1; 0 <= i; i--) {
                    arrows[i].remove();
                }
                if (isYourTurn) { return; }
                if (!isYourBoardMoveTurn) { return; }
                if (!cellInfo.isMove) { return; }
                console.log(boardInfo.boardInfo);
                isMoveMode = true;
                moveAbleList = [];
                movePreInfo = {'i': i, 'j': j};
                if (i !== 0) {
                    if (boardInfo.boardInfo[i-1][j].count < 2) {
                        showArrow(piece, TOP);
                        moveAbleList.push({'i': i-1, 'j': j});
                    }
                }
                if (i !== 3) {
                    if (boardInfo.boardInfo[i+1][j].count < 2) {
                        showArrow(piece, BOTTOM);
                        moveAbleList.push({'i': i+1, 'j': j});
                    }
                }
                if (j !== 0) {
                    if (boardInfo.boardInfo[i][j-1].count < 2) {
                        showArrow(piece, LEFT);
                        moveAbleList.push({'i': i, 'j': j-1});
                    }
                }
                if (j !== 3) {
                    if (boardInfo.boardInfo[i][j+1].count < 2) {
                        showArrow(piece, RIGHT);
                        moveAbleList.push({'i': i, 'j': j+1});
                    }
                }
            });
            cell.appendChild(piece);
        });
    })
};

const movePiece = (i, j) => {
    if (!isMoveMode) { return; }
    const findMoveInfo = moveAbleList.find(obj => obj.i === i && obj.j === j);
    if (!findMoveInfo) { return; }
    const pre_i = movePreInfo.i;
    const pre_j = movePreInfo.j;
    boardInfo.boardInfo[i][j].putColor = boardInfo.boardInfo[pre_i][pre_j].putColor;
    boardInfo.boardInfo[i][j].count++;
    boardInfo.boardInfo[pre_i][pre_j].putColor = -1;
    boardInfo.boardInfo[pre_i][pre_j].count = 0;
    isMoveMode = false;
    movePreInfo = {};
    COMMON.getElemById('passButton').remove();
    socket.emit('boardGameInfo', boardInfo);
};

const createPassButton = () => {
    if (!isYourBoardMoveTurn) { return; }
    const passButton = document.createElement('button');
    passButton.id = 'passButton';
    passButton.textContent = 'Pass';
    passButton.style.position = 'absolute';
    passButton.style.bottom = '125px';
    COMMON.onclick(passButton, () => {
        socket.emit('boardGameInfo', boardInfo);
        passButton.remove();
    });
    mainBody.appendChild(passButton);
};

const showArrow = (elem, direction) => {
    const arrow = document.createElement('img');
    arrow.src = '../image/arrow.png';
    arrow.className = 'arrow';
    arrow.style.width = '50px';
    arrow.style.height = '50px';
    arrow.style.position = 'absolute';
    arrow.style.zIndex = 2;
    switch(direction)
    {
        case LEFT:
            arrow.style.top = '-2px';
            arrow.style.left = '-30px';
            break;
        case TOP:
            arrow.style.top = '-30px';
            arrow.style.left = '-2px';
            arrow.style.transform = 'rotate(90deg)';
            break;
        case RIGHT:
            arrow.style.top = '-3px';
            arrow.style.left = '25px';
            arrow.style.transform = 'rotate(180deg)';
            break;
        case BOTTOM:
            arrow.style.top = '22px';
            arrow.style.left = '-2px';
            arrow.style.transform = 'rotate(270deg)';
            break;
    }
    elem.appendChild(arrow);
};

const removeBoardInfo = () => {
    const board = COMMON.getElemById('board');
    if (!board) { return; }

    board.remove();
};

const setCuberickGame = (isWin) => {
    const cuberickContaine = document.createElement('div');
    mainBody.appendChild(cuberickContaine);

    const firstOrSecondMsg = document.createElement('div');
    firstOrSecondMsg.textContent = isWin ? 'You are the first player.' : 'You are the second player.';
    firstOrSecondMsg.style.fontSize = '30px';
    cuberickContaine.appendChild(firstOrSecondMsg);


    const discription = document.createElement('div');
    discription.id = 'gameDiscription';
    discription.style.position = 'absolute';
    discription.style.top = `calc(50% - ${BOARD_SIZE*3.5}px)`;
    discription.style.fontSize = '20px';
    discription.style.left = '0';
    discription.style.right = '0';
    discription.style.textAlign = 'center';
    discription.textContent = '';
    cuberickContaine.appendChild(discription);

    const createBoard = () => {
        const boardElem = document.createElement('div');
        boardElem.id = 'board';
        for (let i = 0; i < BOARD_COUNT; i++) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'center';
            for (let j = 0; j < BOARD_COUNT; j++) {
                const cell = document.createElement('div');
                cell.style.width = `${BOARD_SIZE}px`;
                cell.style.height = `${BOARD_SIZE}px`;
                cell.style.border = '1px solid #000';
                cell.style.backgroundColor = '#fdd790';
                cell.style.display = 'flex';
                cell.style.alignItems = 'center';
                cell.style.position = 'relative';
                cell.style.justifyContent = 'center';
                COMMON.onclick(cell, () => {
                    if (!isYourTurn) { return; }

                    const piece = document.createElement('div');
                    piece.style.width = `${BOARD_SIZE - 15}px`;
                    piece.style.height = `${BOARD_SIZE - 15}px`;
                    piece.style.backgroundColor = nextPieceColor === 0 ? '#000' : '#fff';
                    cell.appendChild(piece);
                    isYourTurn = false;
                    if (!isYourBoardMoveTurn) {
                        return;
                    }
                    
                });
                row.appendChild(cell);
            }
            boardElem.appendChild(row);
        }
        mainBody.appendChild(boardElem);
    };

    setTimeout(() => {
        firstOrSecondMsg.remove();
        renderBoardInfo();
    }, 2000);

};

const craeteOppnentHavePie = (opponentInfo) => {
    const _opponentHavePies = COMMON.getElemById('opponentHavePies');
    if (_opponentHavePies) { _opponentHavePies.remove(); }
    if (!opponentInfo) {return;}
    const list = opponentInfo.havePie;
    const opponentHavePies = document.createElement('div');
    opponentHavePies.id = 'opponentHavePies';
    opponentHavePies.style.display = 'flex';
    opponentHavePies.style.alignItems = 'end';
    opponentHavePies.style.justifyContent = 'center';
    opponentHavePies.style.position = 'absolute';
    opponentHavePies.style.top = '20px';
    opponentHavePies.style.height = '80px';

    const discription = document.createElement('div');
    discription.textContent = 'Opponent Piece';
    discription.style.position = 'absolute';
    discription.style.top = '0px';
    opponentHavePies.appendChild(discription);

    list.forEach(colorIndex => {
        const pie = document.createElement('div');
        pie.setAttribute('color', colorIndex);
        pie.style.backgroundColor = colorIndex === 0 ? '#000' : '#fff';
        pie.style.width = `${BOARD_SIZE-10}px`;
        pie.style.height = `${BOARD_SIZE-10}px`;
        pie.style.border = '1px solid darkgray';
        opponentHavePies.appendChild(pie);
    });
    mainBody.appendChild(opponentHavePies);
};

const crateOwnHavePie = (ownInfo) => {
    const _ownHavePies = COMMON.getElemById('ownHavePies');
    if (_ownHavePies) { _ownHavePies.remove(); }

    const list = ownInfo.havePie;
    const ownHavePies = document.createElement('div');
    ownHavePies.id = 'ownHavePies';
    ownHavePies.style.display = 'flex';
    ownHavePies.style.alignItems = 'end';
    ownHavePies.style.justifyContent = 'center';
    ownHavePies.style.position = 'absolute';
    ownHavePies.style.bottom = '20px';
    ownHavePies.style.height = '80px';

    const discription = document.createElement('div');
    discription.textContent = 'My Piece';
    discription.style.position = 'absolute';
    discription.style.top = '0px';
    ownHavePies.appendChild(discription);

    list.forEach((colorIndex, index) => {
        const pie = document.createElement('div');
        pie.setAttribute('color', colorIndex);
        pie.style.backgroundColor = 'rgb(253, 215, 144)';
        if (index === list.length - 1) { 
            pie.style.backgroundColor = colorIndex === 0 ? '#000' : '#fff';
            nextPieceColor = colorIndex;
        }
        pie.style.width = `${BOARD_SIZE-10}px`;
        pie.style.height = `${BOARD_SIZE-10}px`;
        pie.style.border = '1px solid darkgray';
        ownHavePies.appendChild(pie);
    });
    mainBody.appendChild(ownHavePies);
};

const createChat = () => {
    const chatContainer = document.createElement('div');
    chatContainer.style.width = '300px';
    chatContainer.style.height = '350px';
    chatContainer.style.marginRight = '10px';
    chatContainer.style.marginBottom = '10px';
    chatContainer.style.backgroundColor = '#fff';
    chatContainer.style.boxShadow = '0 0 10px darkgrey';
    chatContainer.style.position = 'relative';
    document.body.appendChild(chatContainer);

    const header = document.createElement('div');
    header.style.height = '35px';
    header.style.paddingLeft = '10px';
    header.style.backgroundColor = '#6886bb';
    header.style.color = '#fff';
    header.style.fontSize = '22px';
    header.textContent = 'Chat Opponent';
    chatContainer.appendChild(header);

    const inputContainer = document.createElement('div');
    inputContainer.style.position = 'absolute';
    inputContainer.style.bottom = '5px';
    inputContainer.style.left = '5px';
    chatContainer.appendChild(inputContainer);

    const chatMessageContainer = document.createElement('div');
    chatMessageContainer.id = 'chatMessageContainer';
    chatMessageContainer.style.width = 'calc(100% - 20px)';
    chatMessageContainer.style.height = 'calc(100% - 120px)';
    chatMessageContainer.style.margin = '10px';
    chatMessageContainer.style.overflowY = 'auto';
    chatContainer.appendChild(chatMessageContainer);

    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.style.width = 'calc(100% - 13px)';
    textBox.style.height = '30px';
    textBox.style.marginBottom = '5px';
    textBox.style.boxShadow = '1px 0px 4px #7d7d7d';
    textBox.style.border = 'none';
    inputContainer.appendChild(textBox);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'submit';
    COMMON.onclick(submitButton, () => {
        const sendInfo = {
            message: textBox.value,
            user: uniqueId,
            sendTime: Date.now()
        };
        console.log(messageInfo);
        textBox.value = '';
        messageInfo.messageList.push(sendInfo);
        socket.emit('chatMessage', messageInfo);
    });
    inputContainer.appendChild(submitButton);
};

const renderChatMessage = () => {
    const chatMessageContainer = COMMON.getElemById('chatMessageContainer');
    if (!chatMessageContainer) { return; }

    if (COMMON.getElemById('msgContainer')) {
        COMMON.getElemById('msgContainer').remove();
    }

    const msgContainer = document.createElement('div');
    msgContainer.id = 'msgContainer';
    chatMessageContainer.appendChild(msgContainer);

    messageInfo.messageList.forEach(msgObj => {
        const messageElemContainer = document.createElement('div');
        messageElemContainer.style.textAlign = msgObj.user === uniqueId ? 'right' : 'left';
        messageElemContainer.style.backgroundColor = msgObj.user === uniqueId ? '' : '#cce3ff';
        messageElemContainer.style.padding = '1px 3px';
        messageElemContainer.style.marginBottom = '5px';

        const messageText = document.createElement('div');
        messageText.textContent = msgObj.message;
        messageElemContainer.appendChild(messageText);

        const messageTime = document.createElement('div');
        const timestamp = new Date(msgObj.sendTime);
        messageTime.textContent = `${timestamp.getHours()}:${timestamp.getMinutes()}`;
        messageTime.style.fontSize = '10px';
        messageTime.style.color = '#787878';
        messageElemContainer.appendChild(messageTime);

        msgContainer.appendChild(messageElemContainer);
    });
};

window.addEventListener('load', () => {    
    COMMON.onclick(gameStartBtn, GameStart);
});
