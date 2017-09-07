# Foundry.ai API Auth

This module exposes connect middleware to attach a auth verification response to
`req.auth`.

```bash
npm install --save @foundry-ai/api-auth
```

## Basic Usage

```js
const apiAuth = require('@foundry-ai/api-auth');
const express = require('express');

const app = express();

app.use(apiAuth({
  authEndpoint: 'https://auth.example.com/oauth2/authorization'
}));
```

### Access Data

If authorization is successful any data returned from your auth endpoint will be attached to the request and made available via `req.auth`

```js
const apiAuth = require('@foundry-ai/api-auth');
const express = require('express');

router = express.Router();

router.use(apiAuth({
  authEndpoint: 'https://auth.example.com/oauth2/authorization'
}));

router.get('/test', (req, res, next) => {
  console.log(req.auth)
  // {
  //   userId: 'dfce809c-9245-551d-9312-ed3551e6bebb',
  //   scope: '*'
  // }

  let userId = req.auth.userId;

  if (req.params.userId) {
    if (req.auth.scope.includes('admin')) {
      userId = req.params.userId;
    } else if (req.params.userId != userId) {
      throw PermissionError('cannot access data');
    }
  }

  return getData(userId);
});
```

## Options

| Param | Description |
|-------|-------------|
| `authEndpoint`* | What endpoint should the middlewhere validate the token against e.g. `https://auth.example.com/oauth2/authorization` |
| `request`       | Options passed to the [`request`][request-link] library e.g. `{ timeout: 30000 }` |
| `errorOnMiss`   | Should the middleware throw an `AuthenticationError` when an invalid/no token is given |

NOTE: `*` Indicates required field

## Details

This middleware will check the request's `Authorization` header for a `Bearer`
token and the query params for an `access_token` that it then validates against
the specified endpoint.

NOTE: invalid tokens do not cause errors, but if multiple tokens are detected a
`BadRequestError` will be raised.

[request-link]: https://github.com/request/request#requestoptions-callback
