const sqlite3 = require('sqlite3');
const {open} = require('sqlite');

async function initDB(){
    let db = await open({
        filename: './user.db',
        driver: sqlite3.Database
    })
    await db.exec("CREATE TABLE if not exists user(login VARCHAR(100), password VARCHAR(100), status VARCHAR(10), code VARCHAR(10), activeDate VARCHAR(10))")
    return db;
}

module.exports = {
    initDB
}