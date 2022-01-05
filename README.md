# Install dependencies

```
npm install
```

# Use

config

```
//./config.js
module.exports = {
    email:{
        USER: '50893818@qq.com',        //set system email sender
        PASSWORD: '***********',        //config authorization from server
        HOST: 'smtp.qq.com'             //smtp address
    },
    DBPATH: './user.db'                 //db file path
}
```

init client

```
const Client = require('../index.js');
let client = new Client(db);
//wait util db is ready
setTimeout(async ()=>{
    //Custom your code here
},1000)
```

regist new user

```
await client.registUser('your email here', 'password'); //you'll receive a active code by email
```

active account

```
await client.validUserEmail('your email here', 'active code');
```

login

```
await client.login('your email here', 'password');
```

change password

```
await client.changePassword('your email here', 'password', 'new password');
```

list regist&active user count in recent 10 days

```
await client.listRecentReg();
```
