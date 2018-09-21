import * as RequestPromise from 'request-promise';
import {set, assignIn} from 'lodash';
import {NextFunction, Request, Response} from 'express';
import {ValidationError} from 'express-validation';
import {AuthenticationError, BadRequestError, ForbiddenError, InternalError, NotFoundError, RateLimitError} from '@foundry-ai/api-errors';
import {ApiAuthConfiguration, Factory} from './util/ClientConfigFactory';

export default function (config: ApiAuthConfiguration) {
    const authConfig = Factory(config);
    return function (req: Request, res: Response, next: NextFunction) {
        Promise.resolve(tokenFromReq(req))
        .then(token => {
            if (!token) throw new AuthenticationError('Missing authentication token');
            const requestOptions = assignIn(authConfig.request, {
                method: 'GET',
                uri: authConfig.authEndpoint,
                qs: {
                    access_token: token
                }
            });
            RequestPromise(requestOptions)
                .then(data => {
                    set(req, 'auth', data);
                    next();
                })
                .catch(err => {
                    if (err.error && err.error.type && err.error.status && err.error.message) next(toResJson(err.error));
                    else {
                        switch (err.statusCode) {
                            case 400:
                                next(new BadRequestError());
                                break;
                            case 401:
                                next(new AuthenticationError());
                                break;
                            case 403:
                                next(new ForbiddenError());
                                break;
                            case 429:
                                next(new RateLimitError());
                                break;
                            default:
                                next(err);
                        }
                    }
                })
        })
        .catch(err => next(err));

    }
}

export function tokenFromReq(req: Request): string {
    let token = '';
    if (req.headers && req.headers.authorization) {
        const authorization = <string>req.headers.authorization;
        const parts = authorization.split(' ');
        if (parts.length == 2) {
            const [scheme, credentials] = parts;

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            throw new BadRequestError('Invalid authentication scheme');
        }
    }

    if (req.body && req.body.access_token) {
        if (token) {
            throw new BadRequestError('Multiple access tokens attached to request');
        }
        token = req.body.access_token;
    }

    if (req.query && req.query.access_token) {
        if (token) {
            throw new BadRequestError('Multiple access tokens attached to request');
        }
        token = req.query.access_token;
    }
    return token;
}

export function toResJson(err: InternalError | AuthenticationError | BadRequestError | ForbiddenError | NotFoundError | RateLimitError) {
    return {
        type: err.type,
        status: err.status,
        message: err.message
    };
}

declare global {
    namespace Express {
        interface Request {
            auth: { userId: string, scope: string, role: string }
        }
    }
}
