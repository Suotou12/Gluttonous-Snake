"use strict";
let regApp = new Vue({
    el: "#reg",
    data() {
        var checkName = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('用户名不能为空'));
            } else {
                callback();
            }
        };
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
            } else {
                if (this.ruleForm.checkPass !== '') {
                    this.$refs.ruleForm.validateField('checkPass');
                }
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.ruleForm.pass) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            ruleForm: {
                pass: '',
                checkPass: '',
                name: ''
            },
            rules: {
                pass: [
                    { validator: validatePass, trigger: 'blur' }
                ],
                checkPass: [
                    { validator: validatePass2, trigger: 'blur' }
                ],
                name: [
                    { validator: checkName, trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    fetch("/api/reg", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(this.ruleForm)
                    }).then(res => {
                        return res.json();
                    }).then(res => {
                        if (res.status == "success") {
                            this.$notify({
                                title: '成功',
                                message: '注册成功',
                                type: 'success',
                                duration: 2000
                            });
                            document.getElementById("loginInfo").innerHTML = "欢迎加入，" + this.ruleForm.name;
                            document.getElementById("logoutBnt").style.display = "block";
                            localforage.setItem("name", this.ruleForm.name);
                            localforage.setItem("pass", this.ruleForm.pass);
                            loginOK()
                        } else {
                            this.$notify({
                                title: '失败',
                                message: res.msg,
                                type: 'error',
                                duration: 2000
                            });
                        }
                    });
                    
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },

    }
}
)
let loginApp = new Vue({
    el: "#login",
    data() {
        var checkName = (rule, value, callback) => {
            if (!value) {
                return callback(new Error('用户名不能为空'));
            } else {
                callback();
            }
        };
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
            } else {
                if (this.ruleForm.checkPass !== '') {
                    this.$refs.ruleForm.validateField('checkPass');
                }
                callback();
            }
        };
        return {
            ruleForm: {
                pass: '',
                checkPass: '',
                name: ''
            },
            rules: {
                pass: [
                    { validator: validatePass, trigger: 'blur' }
                ],
                name: [
                    { validator: checkName, trigger: 'blur' }
                ]
            }
        };
    },
    methods: {
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    fetch("/api/login", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(this.ruleForm)
                    }).then(res => {
                        return res.json();
                    }).then(res => {
                        if (res.status == "success") {
                            this.$notify({
                                title: '成功',
                                message: '登录成功',
                                type: 'success',
                                duration: 2000
                            });
                            document.getElementById("loginInfo").innerHTML = "欢迎回来，" + this.ruleForm.name;
                            document.getElementById("logoutBnt").style.display = "block";
                            localforage.setItem("name", this.ruleForm.name);
                            localforage.setItem("pass", this.ruleForm.pass);
                            loginOK()
                        } else {
                            this.$notify({
                                title: '失败',
                                message: res.msg,
                                type: 'error',
                                duration: 2000
                            });
                            localforage.setItem("name", "");
                            localforage.setItem("pass", "");

                        }
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
    }
}
)
function sw2reg() {
    fadeOut(document.getElementById("login"),400).then(() => {
        fadeIn(document.getElementById("reg"));
    });
}
function sw2login() {
    fadeOut(document.getElementById("reg"),400).then(() => {
        fadeIn(document.getElementById("login"));
    });
}
