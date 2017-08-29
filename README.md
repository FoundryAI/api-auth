Foundry.ai Api Auth
===================

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