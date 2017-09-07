import * as RequestPromise from 'request-promise';
import { set, assignIn } from 'lodash';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { AuthenticationError } from '@foundry-ai/api-errors';

import { Config, validate, applyDefaults } from './util/config';
import { tokenFromReq } from './util/tokens';

export default function (config: Config) {
    validate(config);
    const authConfig = applyDefaults(config);

    const requestOptions = (token) => assignIn(authConfig.request, {
        method: 'GET',
        uri: authConfig.authEndpoint,
        qs: { access_token: token }
    });

    // Return actual middleware function
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(tokenFromReq(req))
        .then((token) => {
            if (!token) {
                if (authConfig.errorOnMiss)
                    throw new AuthenticationError('Missing authentication token');

                return next();
            }

            RequestPromise(requestOptions(token))
                .then((data) => {
                    set(req, 'auth', data);
                    next();
                });
        })
        .catch(err => next({
            type: err.type,
            status: err.status,
            message: err.message
        }));
    }
}
