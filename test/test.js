const Client = require('../index.js')
try{
    let client = new Client();
    setTimeout(async ()=>{
        await client.registUser('samicelus@hotmail.com', '09876yuiop;lkjh')
    },1000)
}catch(e){
    console.error(e);
}