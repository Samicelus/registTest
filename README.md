# Install dependencies

```
npm install
```

# Use

init db

```
const {initDB} = require('../db.js');
let db = await initDB();
``

init client

```
const Client = require('../index.js');
let client = new Client(db);
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
