import { COMMON } from './common.js';

const socket = io();
const roomId = COMMON.getUrlParam('room_id');
const uniqueKey = COMMON.getUrlParam('uniue_key');
const opponentKey = COMMON.getUrlParam('opponent_key');
const JANKEN_OPPONENT = `${roomId}_${opponentKey}_janken`;
const JANKEN_OWN = `${roomId}_${uniqueKey}_janken`;

const setJanken = () => {
    const body = document.body;
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.overflow = 'hidden';

    const jankenWrapper = document.createElement('div');
    jankenWrapper.style.position = 'absolute';
    jankenWrapper.style.top = '0';
    jankenWrapper.style.left = '0';
    jankenWrapper.style.right = '0';
    jankenWrapper.style.bottom = '0';
    jankenWrapper.style.backgroundColor = '#0000008c';
    body.appendChild(jankenWrapper);

    const msg = document.createElement('div');
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
    gu.style.backgroundColor = '#bbbbbb';
    jankenContainer.appendChild(gu);
    
    const choki = createJankenElem(CHOKI);
    choki.style.backgroundColor = '#ffd2d2';
    jankenContainer.appendChild(choki);

    const pa = createJankenElem(PA);
    pa.style.backgroundColor = '#fffad0';
    jankenContainer.appendChild(pa);
};

const createJankenElem = (handType) => {
    const jankenImg = document.createElement('img');
    jankenImg.src = `../image/${handType}.png`;
    jankenImg.style.width = '200px';
    jankenImg.style.height = '200px';
    jankenImg.style.cursor = 'pointer';
    jankenImg.addEventListener('click', () => {
        console.log('server send');
        socket.emit('message', 'aaaaaaa');
        socket.emit(JANKEN_OWN, handType);
    });
    return jankenImg;
};


window.addEventListener('load', () => {
    setJanken();
});
