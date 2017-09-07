import { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@foundry-ai/api-errors';

const extractHeaderToken = (headers) => {
    if (!headers || !headers.authorization) return null;

    const matches = headers.authorization.match(/^Bearer ([\w,-]+)$/i)

    return matches && matches[1];
}

export function tokenFromReq(req: Request): string {
    const headerToken = extractHeaderToken(req.headers);
    const queryToken = req.query && req.query.access_token;

    if (headerToken && queryToken)
        throw new BadRequestError('multiple access_tokens used');

    return headerToken || queryToken;
}
