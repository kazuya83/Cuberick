const LOADING_WRAPPER_ID = 'LOADING_WRAPPER';
const LOADING_WRAPPER_MESSAGE_ID = 'LOADING_WRAPPER_MESSAGE';
const DIGITS = 1000;

export const COMMON = {
    onclick: (elem, func) => {
        elem.addEventListener('click', func);
    },
    getElemById: (id) => {
        return document.getElementById(id);
    },
    getElemByClass: (className) => {
        const elems = document.getElementsByClassName(className);
        if (elems.length === 0) { return null; }

        return elems[0];
    },
    showLoading: (containerElem, msg) => {
        const wrapper = document.createElement('div');
        wrapper.id = LOADING_WRAPPER_ID;
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.bottom = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.backgroundColor = '#0000008c';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';

        const msgElem = document.createElement('div');
        msgElem.id = LOADING_WRAPPER_MESSAGE_ID;
        msgElem.textContent = msg;
        msgElem.style.color = '#fff';
        msgElem.style.fontSize = '25px';
        wrapper.appendChild(msgElem);
        containerElem.appendChild(wrapper);
    },
    removeLoading: (msg) => {
        const warpper = COMMON.getElemById(LOADING_WRAPPER_ID);
        const msgElem = COMMON.getElemById(LOADING_WRAPPER_MESSAGE_ID);
        msgElem.textContent = msg;
        msgElem.style.color = 'red';
        setTimeout(() => {
            warpper.remove();
        }, 1000);
    },
    getUniqueId :() => {
        return Date.now().toString(16) + Math.floor(DIGITS * Math.random()).toString(16);
    },
    getUrlParam: (name) => {
        const url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
};