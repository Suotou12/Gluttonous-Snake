"use strict"
let game

window.onload = function () {
    localforage.getItem("name").then(function (name) {
        if (name) {
            fadeIn(document.getElementById("home"), 400);
            document.getElementById("loginInfo").innerHTML = "欢迎回来，" + name;
            document.getElementById("logoutBnt").style.display = "block";
        } else {
            fadeIn(document.getElementById("login"), 400)
        }
    });
}

function loginOK() {
    Promise.all([fadeOut(document.getElementById("login"), 400), fadeOut(document.getElementById("reg"), 400)]).then(() => {
        fadeIn(document.getElementById("home"), 400);
    });
}

function logout() {
    localforage.setItem("name", "");
    localforage.setItem("pass", "");
    document.getElementById("loginInfo").innerHTML = "";
    document.getElementById("logoutBnt").style.display = "none";
    Promise.all([fadeOut(document.getElementById("home"), 400), fadeOut(document.getElementById("login"), 400), fadeOut(document.getElementById("reg"), 400)]).then(() => {
        fadeIn(document.getElementById("login"), 400);
    });
}

let app = new Vue({
    el: '#app',
    data: {
    }
})

function startGame() {
    fadeOut(document.getElementById("home"), 400).then(() => {
        game = new Game(document.getElementById("container"), 15, 15);
        fadeIn(document.getElementById("container"), 400);
    });
    document.getElementById("logoutBnt").style.display = "none";
}

function uploadScore(score) {
    Promise.all([localforage.getItem("name"), localforage.getItem("pass")]).then(function (res) {
        fetch("/api/uploadScore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: res[0],
                score: score,
                pass: res[1]
            })
        }).then(function (res) {
            return res.json();
        }
        ).then(function (data) {
            if
                (data.status == "success") {
                app.$notify({
                    title: '成绩上传成功',
                    message: data.msg + "，您的得分为：" + score,
                    type: 'success'
                });
                localforage.getItem("name").then(function (name) {
                    document.getElementById("gameover-username").innerHTML = name;
                });
                document.getElementById("gameover-highest").innerHTML = data.highest
                fadeIn(document.getElementById("gameoverNotify"), 400);

            } else {
                app.$notify({
                    title: '成绩上传失败',
                    message: data.msg,
                    type: 'error'
                });
            }
        }
        )
    })
}

function getRankList() {
    fetch("/api/getRankList").then(function (res) {
        return res.json();
    }
    ).then(function (data) {
        if (data.status == "success") {
            let rankList = data.data;
            document.getElementById("rankList").innerHTML = "<tr><td>头像</td><td>用户名</td><td>最高分数</td></tr>";
            rankList.sort(function (a, b) {
                return b.highest - a.highest;
            });
            rankList.forEach((p, index) => {
                let line = document.createElement("tr");
                line.className = "rankListLine";
                if (p.avatar == "unset") {
                    line.innerHTML = `<td><img src='https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'></td>`;

                } else {
                    line.innerHTML = `<td><img src='${p.avatar}'></td>`;
                }

                line.innerHTML += `<td>${p.name}</td><td>${p.highest}</td>`;
                if (index % 2 == 0) {
                    line.className += " even";
                } else {
                    line.className += " odd";
                }

                document.getElementById("rankList").appendChild(line);
            })

        } else {
            app.$notify({
                title: '获取排行榜失败',
                message: data.msg,
                type: 'error'
            });
        }
    }
    ).catch(function (err) {
        alert("获取排行榜失败，请稍后再试");
    }
    );
}

function getProfile() {
    Promise.all([localforage.getItem("name"), localforage.getItem("pass")]).then(function (res) {
        fetch("/api/getProfile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: res[0],
                pass: res[1]
            })
        }).then(function (res) {
            return res.json();
        }
        ).then(function (data) {
            if (data.status == "success") {
                let profile = data.data;
                document.getElementById("profile-username").innerHTML = profile.name;
                document.getElementById("profile-highest").innerHTML = profile.highest;
                if (profile.avatar == "unset") {
                    document.getElementById("profile-avatar").src = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
                } else {
                    document.getElementById("profile-avatar").src = profile.avatar;

                }
            } else {
                app.$notify({
                    title: '获取个人信息失败',
                    message: data.msg,
                    type: 'error'
                });
            }
        })
    })
}

function uploadAvatar() {
    let file = document.getElementById("profile-avatar-file").files[0];
    //base64
    let canvas = document.getElementById("profile-avatar-canvas")
    let ctx = canvas.getContext("2d")
    let inputImg = document.createElement("img");

    inputImg.src = window.URL.createObjectURL(file);
    inputImg.onerror = function () {
        app.$notify({
            title: '上传失败',
            message: "请选择正确的图片格式",
            type: 'error'
        });
    }
    inputImg.onload = function () {
        ctx.drawImage(inputImg, 0, 0, canvas.width, canvas.height)
        let img = canvas.toDataURL("image/jpeg", 0.5);
        Promise.all([localforage.getItem("name"), localforage.getItem("pass")]).then(function (res) {
            fetch("/api/uploadAvatar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: res[0],
                    pass: res[1],
                    avatar: img
                })
            }).then(function (res) {
                return res.json();
            }
            ).then(function (data) {
                if (data.status == "success") {
                    app.$notify({
                        title: '上传头像成功',
                        message: data.msg,
                        type: 'success'
                    });
                    getProfile();
                } else {
                    app.$notify({
                        title: '上传头像失败',
                        message: data.msg,
                        type: 'error'
                    });
                }
            })
        })
    }


}