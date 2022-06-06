//此为后端代码

import { createServer } from 'https';
//创建服务器
import { readFileSync } from 'fs';
import { readFile } from 'fs/promises';
//文件操作
import { createConnection } from "mysql"
//连接数据库
import { exec } from 'child_process';
//执行cmd命令，用于打开浏览器
import { v4 as uuidv4 } from 'uuid';
//生成随机token
const server = createServer({
    //创建https服务器
    cert: readFileSync(process.argv[1].slice(0, process.argv[1].length - 10) + 'server.crt'),
    key: readFileSync(process.argv[1].slice(0, process.argv[1].length - 10) + 'server.key'),
    port: 9454,
});

let tokens = [];//初始化token
let sql
function createConnection_() {
    let sql_ = createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: '',
        database: 'xianYu'
    });
    return sql_
}

function sqlConnect() {
    sql = createConnection_()
    sql.connect(function (err) {
        if (err) {
            console.error('Cannot connect to MySQL server.');
            setTimeout(() => {
                sqlConnect()
            }, 1000);
        }
        console.log('Connected MySQL server as threadId ' + sql.threadId);
    });
}

sqlConnect()
sql.on('error', function (err) {
    console.log(err);
    setTimeout(() => {
        sqlConnect()
    }, 1000);
});
//连接mysql，并自动在断线后重连


server.on('request', (req, res) => {//监听请求主函数
    let query
    let url = new URL(req.url, `http://${req.headers.host}`)
    console.log("Received request:", url.pathname, url.searchParams.toString());
    if (url.pathname.indexOf('/api/login') == 0) {
        req.on('data', (data) => {
            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            sql.query(`SELECT * FROM users WHERE username='${dataObj.name}' AND password='${dataObj.pass}'`, (err, result) => {
                if (err) throw err;
                if (result.length == 0) {
                    res.end(JSON.stringify({
                        status: 'error',
                        msg: '用户名或密码错误'
                    }));
                } else {
                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '登录成功'
                    }));
                }
            }
            )
        })
    }
    else if (url.pathname.indexOf('/api/reg') == 0) {
        req.on('data', (data) => {
            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            sql.query(`SELECT * FROM users WHERE username='${dataObj.name}'`, (err, result) => {
                if (err) throw err;
                if (result.length != 0) {
                    res.end(JSON.stringify({
                        status: 'error',
                        msg: '用户名已存在'
                    }));
                } else {
                    sql.query(`INSERT INTO users (username, password) VALUES ('${dataObj.name}', '${dataObj.pass}')`, (err, result) => {
                        if (err) throw err;
                        res.end(JSON.stringify({
                            status: 'success',
                            msg: '注册成功'
                        }));
                    })
                }
            })
        })
    }
    else if (url.pathname.indexOf('/api/uploadScore') == 0) {
        req.on('data', (data) => {
            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            sql.query(`SELECT * FROM users WHERE username='${dataObj.name}'`, (err, result) => {
                if (err) throw err;
                if (result.length == 0) {
                    res.end(JSON.stringify({
                        status: 'error',
                        msg: '用户不存在'
                    }));
                } else {
                    if (dataObj.pass == result[0].password) {
                        if (dataObj.score > result[0].highest) {
                            sql.query(`UPDATE users SET highest=${dataObj.score} WHERE username='${dataObj.name}'`, (err, result) => {
                                if (err) throw err;
                                res.end(JSON.stringify({
                                    status: 'success',
                                    msg: '上传成功，新纪录',
                                    highest: dataObj.score
                                }));
                            })
                        } else {
                            res.end(JSON.stringify({
                                status: 'success',
                                msg: '上传成功',
                                highest: result[0].highest

                            }));
                        }
                    } else {
                        res.end(JSON.stringify({
                            status: 'error',
                            msg: '密码错误'
                        }));
                    }
                }
            })
        })
    } else if (url.pathname.indexOf('/api/getRankList') == 0) {
        sql.query(`SELECT * FROM users`, (err, result) => {
            if (err) throw err;
            let rank = []
            result.forEach(item => {
                rank.push({
                    name: item.username,
                    highest: item.highest,
                    avatar: item.avatar ? item.avatar : 'unset'
                })
            })
            res.end(JSON.stringify({
                status: 'success',
                msg: '获取成功',
                data: rank
            }));
        })

    } else if (url.pathname.indexOf('/api/getProfile') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            sql.query(`SELECT * FROM users WHERE username='${dataObj.name}'`, (err, result) => {
                if (err) throw err;
                if (result.length == 0) {
                    res.end(JSON.stringify({
                        status: 'error',
                        msg: '用户不存在'
                    }));
                } else {
                    let data = {}
                    data.name = result[0].username
                    data.highest = result[0].highest
                    data.avatar = result[0].avatar ? result[0].avatar : 'unset'

                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '获取成功',
                        data: data
                    }));
                }
            })
        })
    } else if (url.pathname.indexOf('/api/admin/getUserInfo') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            if(dataObj.name=='admin'&&dataObj.pass=='admin'){
                sql.query(`SELECT * FROM users`, (err, result) => {
                    if (err) throw err;
                    let data=[]
                    result.forEach(item=>{
                        data.push({
                            name:item.username,
                            highest:item.highest,
                            avatar:item.avatar?item.avatar:'unset',
                            pass:item.password
                        })
                    })
                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '获取成功',
                        data: data
                    }));
                })
            }
            
        })
    }else if (url.pathname.indexOf('/api/admin/edit') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            if(dataObj.name=='admin'&&dataObj.pass=='admin'){
                sql.query(`UPDATE users SET password='${dataObj.data.pass}',avatar='${dataObj.data.avatar}',highest=${dataObj.data.highest} WHERE username='${dataObj.data.name}'`, (err, result) => {
                    if (err) throw err;
                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '修改成功'
                    }));
                }
                )
            }else{
                res.end(JSON.stringify({
                    status: 'error',
                    msg: '密码错误'
                }));
            }
            
        })
    }else if (url.pathname.indexOf('/api/admin/del') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            if(dataObj.name=='admin'&&dataObj.pass=='admin'){
                sql.query(`DELETE FROM users WHERE username='${dataObj.data.name}'`, (err, result) => {
                    if (err) throw err;
                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '删除成功'
                    }));
                }
                )
            }else{
                res.end(JSON.stringify({
                    status: 'error',
                    msg: '密码错误'
                }));
            }
            
        })
    }else if (url.pathname.indexOf('/api/admin/add') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            if(dataObj.name=='admin'&&dataObj.pass=='admin'){
                sql.query(`INSERT INTO users (username,password,highest,avatar) VALUES ('${dataObj.data.name}','${dataObj.data.pass}','${dataObj.data.highest}',"${dataObj.data.avatar}")`, (err, result) => {
                    if (err) throw err;
                    res.end(JSON.stringify({
                        status: 'success',
                        msg: '添加成功'
                    }));
                }
                )
            }else{
                res.end(JSON.stringify({
                    status: 'error',
                    msg: '密码错误'
                }));
            }
            
        })
    } else if (url.pathname.indexOf('/api/uploadAvatar') == 0) {
        req.on('data', (data) => {

            let dataStr = data.toString();
            let dataObj = JSON.parse(dataStr);
            sql.query(`UPDATE users SET avatar='${dataObj.avatar}' WHERE username='${dataObj.name}'`, (err, result) => {
                if (err) throw err;
                res.end(JSON.stringify({
                    status: 'success',
                    msg: '上传成功'
                }));
            }
            )
        })
    }
    else {
        //判断是否为文件夹

        readFile(`${process.argv[1].slice(0, process.argv[1].length - 10)}${url.pathname}`).then((data) => {
            if (url.pathname.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            } else if (url.pathname.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            } else if (url.pathname.endsWith('.html')) {
                res.setHeader('Content-Type', 'text/html');
            } else if (url.pathname.endsWith('.png')) {
                res.setHeader('Content-Type', 'image/png');
            } else if (url.pathname.endsWith('.jpg')) {
                res.setHeader('Content-Type', 'image/jpg');
            } else if (url.pathname.endsWith('.ico')) {
                res.setHeader('Content-Type', 'image/ico');
            } else if (url.pathname.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
            } else {
                res.setHeader('Content-Type', 'text/plain');
            }
            res.end(data)
        })
            .catch((err) => {
                let url_
                if(url.pathname.endsWith('/')){
                    url_=`${process.argv[1].slice(0, process.argv[1].length - 10)}${url.pathname}index.html`
                }else{
                    url_=`${process.argv[1].slice(0, process.argv[1].length - 10)}${url.pathname}/index.html`
                }
                readFile(url_).then((data) => {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(data)
                }).catch((err) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(`<h1>404 Not Found</h1>`);
                })
            })
    }
});

function getCookie(cname, cookieStr) {
    var name = cname + "=";
    var ca = cookieStr.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

server.listen(9454, () => {
    console.log('server is running at https://localhost:9454');
});
//启动浏览器
let cmd = "start https://127.0.0.1:9454"
exec(cmd, function (error, stdout, stderr) {
});

//统计启动耗时
console.log(`Server started in ${performance.now()}ms`);