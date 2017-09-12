import { get, defaultsDeep } from 'lodash';
import * as http from 'http';
import * as joi from 'joi';
const version = require('../../package.json').version;


export interface ApiAuthConfiguration {
    authEndpoint: string;
    request?: object;
}

export const Schema = {
    authEndpoint: joi.string().uri(),
    request: joi.object({
        strictSSL: joi.boolean()
    })
};

export function Factory (config: ApiAuthConfiguration): ApiAuthConfiguration {
    const validation = joi.validate(config, Schema);
    if (validation.error) throw new Error(validation.error.annotate());
    return defaultsDeep(config, {
        request: {
            // By default, require API SSL cert to be valid
            strictSSL: true,
            // Use an agent with keep-alive enabled to avoid performing SSL handshake per connection
            agentClass: http.Agent,
            agentOptions: {
                keepAlive: true
            },
            // Encode requests as JSON. Encode the response as well if JSON is returned.
            json: true,
            // Do not encode the response as a string, since the response could be a file. return Buffers instead.
            encoding: null,
            // A redirect is usually information we want to handle, so don't automatically follow
            followRedirect: false,
            // By default, we attach a version-specific user-agent string to SDK requests
            headers: {
                'User-Agent': `Foundry.ai API Auth v${version}`
            },
            timeout: 10000

        }
    });
}