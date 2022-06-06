"use strict"
function fadeOut(el, time) {
    return new Promise(function (resolve, reject) {
        if(!time){time=400}
        el.style.transition = 'opacity ' + time + 'ms';
        el.style.opacity = 0;
        setTimeout(function () {
            el.style.display = 'none';
            setTimeout(() => {
                resolve();
            }, 10);
        }, time);
    });
}
function fadeIn(el, time) {
    return new Promise(function (resolve, reject) {
        if(!time){time=400}

        el.style.transition = 'opacity ' + time + 'ms';
        el.style.display = 'block';
        setTimeout(function () {
            el.style.opacity = 1;
            setTimeout(() => {
                resolve();
            }, time);
        }, 10);
    });
}

function sw2(from, to) {
    fadeOut(document.querySelector(from), 400).then(() => {
        fadeIn(document.querySelector(to));
    });
}