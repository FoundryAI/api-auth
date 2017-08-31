process.env.NODE_ENV = 'test';

import * as express from 'express';
import {Express} from 'express';
import * as _ from 'lodash';
import * as nock from 'nock';
import * as Chance from 'chance';
import * as supertest from 'supertest';
import {suite, test} from 'mocha-typescript';
import {expect} from 'chai';
import ApiAuth from '../lib';

const chance = new Chance();
const authInfo = {
    userId: chance.guid(),
    scope: '*'
};
const accessToken = chance.guid();

@suite
class ApiAuthSpec {

    private app: Express;

    before() {
        nock('https://api.foundry.ai')
            .get(`/v1/auth/oauth2/authorize`)
            .query({
                access_token: accessToken
            })
            .reply(200, authInfo);

        nock('https://api.foundry.ai')
            .get('/v1/auth/oauth2/authorize')
            .replyWithError({ type: 'authentication_error', status: 401, message: 'Unauthorized' });

        this.app = express();
    }

    @test
    use() {
        const config = {
            authEndpoint: 'https://api.foundry.ai/v1/auth/oauth2/authorize'
        };
        const middleware = ApiAuth(config);
        expect(middleware).to.be.a('function');
        this.app.use('/', middleware);
        this.app.get('/test', (req, res, next) => {
            if (_.isEqual(req['auth'], authInfo)) res.sendStatus(200);
            else res.sendStatus(500);
        });

        const request = supertest.agent(this.app);
        return request.get(`/test?access_token=${accessToken}`)
        .expect(200);
    }

    @test
    error() {
        const config = {
            authEndpoint: 'https://api.foundry.ai/v1/auth/oauth2/authorize'
        };
        const middleware = ApiAuth(config);
        expect(middleware).to.be.a('function');
        this.app.use('/', middleware);
        this.app.get('/test', (req, res, next) => {
            if (_.isEqual(req['auth'], authInfo)) res.sendStatus(200);
            else res.sendStatus(500);
        });

        const request = supertest.agent(this.app);
        return request.get(`/test`)
            .expect(401);
    }
}