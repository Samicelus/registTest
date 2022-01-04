const {initDB} = require('../db.js')
const Client = require('../index.js')
async function run(){
    try{
        let db = await initDB();
        let client = new Client(db);
        await client.listRecentReg();
    }catch(e){
        console.error(e);
    }
}

run()