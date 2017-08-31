import * as RequestPromise from 'request-promise';
import {set, assignIn} from 'lodash';
import {NextFunction, Request, Response} from 'express';
import {ValidationError} from 'express-validation';
import {AuthenticationError, BadRequestError, ForbiddenError, InternalError, NotFoundError, RateLimitError} from '@foundry-ai/api-errors';
import {ApiAuthConfiguration, Factory} from './util/ClientConfigFactory';

export default function (config: ApiAuthConfiguration) {
    const authConfig = Factory(config);
    return function (req: Request, res: Response, next: NextFunction) {
        const requestOptions = assignIn(authConfig.request, {
            method: 'GET',
            uri: authConfig.authEndpoint,
            qs: {
                access_token: req.query.access_token
            }
        });
        RequestPromise(requestOptions)
            .then(data => {
                set(req, 'auth', data);
                next();
            })
            .catch(err => {
                next(toResJson(err.error));
            })

    }
}

export function toResJson(err: InternalError | AuthenticationError | BadRequestError | ForbiddenError | NotFoundError | RateLimitError) {
    return {
        type: err.type,
        status: err.status,
        message: err.message
    };
}