Foundry.ai Api Auth
===================
This module exposes connect middleware for Foundry.ai APIs to authenticate requests.
```
npm install --save @foundry.ai/api-auth
```

Basic Usage
-----------

```js
const apiAuth = require('@foundry.ai/api-auth');
const app = require('express');

app.use(apiAuth({
  authEndpoint: 'https://auth.myapp.com/v1/oauth2/authorize'
}));
```

### Access Data
If authorization is successful any data returned from your auth endpoint will be attached to the request and made available via `req.auth`
```js
app.use(apiAuth({
  authEndpoint: 'https://auth.myapp.com/v1/oauth2/authorize'
}));

app.get('/test', (req, res, next) => {
  console.log(req.auth)
  // { 
  //   userId: 'dfce809c-9245-551d-9312-ed3551e6bebb', 
  //   scope: '*' 
  // }
})
```