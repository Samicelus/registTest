const crypto = require('crypto');
const salt = "b31d$Sjqw=w#dsi"
const { SMTPClient } = require('emailjs');
const {email:{USER, PASSWORD, HOST}, DBPATH} = require('./config.js');
const moment = require('moment');
const email = new SMTPClient({
	user: USER,
	password: PASSWORD,
	host: HOST,
	ssl: true,
});
const _ = require('lodash');
const sqlite3 = require('sqlite3');
const {open} = require('sqlite');



class Client {
    constructor(){
        this.db;
        this.dbReady = false;
        this.initDB();
    }

    async initDB(){
        this.db = await open({
            filename: DBPATH,
            driver: sqlite3.Database
        })
        await this.db.exec("CREATE TABLE if not exists user(login VARCHAR(100), password VARCHAR(100), status VARCHAR(10), code VARCHAR(10), activeDate VARCHAR(10))")
        this.dbReady = true;
        console.log('db is ready')
    }

    /**
     * 注册用户
     * @param {*} login 账号名 
     * @param {*} pwd 密码
     */
    async registUser(login, pwd){
        let user = await this.fetchUser(login)
        if(user && user.login == login){
            throw Error('用户名重复！')
        }
    
        if(this.checkPasswordSecurity(pwd)){
            await this.createUser(login, pwd)
        }
    } 
    
    md5(str) {
        return crypto.createHash('md5').update(str, 'utf8').digest('hex');
    }
    
    checkPasswordSecurity(password){
        let lower = /(?=.*[a-z])/;
        let upper = /(?=.*[A-Z])/;
        let num = /(?=.*\d)/;
        let spec = /(?=.*[^A-Za-z0-9\s])/;
        let ten = /(?=^.{10,30}$)/;
    
        let hasLower = lower.test(password);
        let hasUpper = upper.test(password);
        let hasNum = num.test(password);
        let hasSpec = spec.test(password);
        let atLeast8 = ten.test(password);
        let has3Diff = (hasLower && hasUpper && hasNum) || (hasUpper && hasNum && hasSpec) || (hasLower && hasNum && hasSpec) || (hasLower && hasUpper && hasSpec);
    
        if(!atLeast8){
            throw Error("密码长度必须为10~30位!")
        }
        if(!has3Diff){
            throw Error("密码必须包含：大写字母，小写字母，数字，特殊字符中的至少3种!")
        }
    
        return true;
    }
    
    async createUser(login, pwd){
        const code = Math.floor(Math.random()*100000).toString();
    
        const message = await email.sendAsync({
            text: `注册码为：${code}`,
            from: `系统 <${USER}>`,
            to: `someone <${login}>`,
            subject: '用户注册',
        });
    
        await this.db.exec(`INSERT INTO user(login, password, status, code) VALUES ('${login}', '${this.md5(pwd + salt)}', '0', '${code}')`) 
    }
    
    /**
     * 激活账户
     * @param {*} login 用户名
     * @param {*} code 激活码
     */
    async validUserEmail(login, code){
        let user = await this.fetchUser(login);
        if(!user){
            throw Error('用户不存在')
        }
    
        if(user.code != code){
            throw Error('激活码错误')
        }
        
        await this.db.exec(`UPDATE user SET status='1',activeDate='${new moment().format('YYYY-MM-DD')}' WHERE login='${login}'`);
    }
    
    async fetchUser(login){
        return await this.db.get(`SELECT * FROM user WHERE login = '${login}'`);
    }
    
    /**
     * 登录
     * @param {*} login 用户名
     * @param {*} pwd 密码
     * @returns 
     */
    async login(login, pwd){
        let user = await this.fetchUser(login)
        if(!user){
            throw Error('账号名/密码 错误!')
        }
        if(user.password != this.md5(pwd+salt)){
            throw Error('账号名/密码 错误!')
        }
        if(user.status != '1'){
            throw Error('用户未激活')
        }
        return true
    }
    
    /**
     * 修改密码
     * @param {*} login 登录名
     * @param {*} pwd 旧密码
     * @param {*} newPwd 新密码
     * @returns 
     */
    async changePassword(login, pwd, newPwd){
        let user = await this.fetchUser(login)
        if(!user){
            throw Error('账号名/密码 错误!')
        }
        if(user.password != this.md5(pwd+salt)){
            throw Error('账号名/密码 错误!')
        }
        this.checkPasswordSecurity(newPwd);
        await this.db.exec(`UPDATE user SET password='${this.md5(newPwd+salt)}' WHERE login='${login}'`);
        return true;
    }

    /**
     * 统计最近10日注册激活账户数
     * @returns 
     */
    async listRecentReg(){
        let temp = [];
        let fromDate = new moment().subtract(10, 'day').format('YYYY-MM-DD');
        let list = await this.db.all(`SELECT * FROM user WHERE activeDate>'${fromDate}' AND status='1'`);
        let grouped = _.groupBy(list, 'activeDate');
        for(let date in grouped){
            temp.push({
                date,
                count: grouped[date].length
            })
        }
        console.log(temp);
        return temp
    }
}

module.exports = Client