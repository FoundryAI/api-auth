import * as express from 'express';
import * as _ from 'lodash';
import * as nock from 'nock';
import * as Chance from 'chance';
import * as supertest from 'supertest';
import { suite, test } from 'mocha-typescript';
import { expect } from 'chai';
import ApiAuth from '../lib';

const chance = new Chance();
const authInfo = {
    userId: chance.guid(),
    scope: '*'
};
const accessToken = chance.guid();

@suite
class ApiAuthSpec {

    private app: express.Express;
    private authServer: String;
    private authEndpoint: String;
    private mockServer: supertest.Agent;
    private apiAuth;

    before() {
        this.authServer = 'https://api.foundry.ai';
        this.authEndpoint = '/v1/auth/oauth2/authorization';

        nock(this.authServer)
            .get(this.authEndpoint)
            .query({ access_token: accessToken })
            .reply(200, authInfo);

        nock(this.authServer)
            .get(this.authEndpoint)
            .replyWithError({ type: 'authentication_error', status: 401, message: 'Unauthorized' });

        this.app = express();

        this.apiAuth = ApiAuth({
            authEndpoint: `${this.authServer}${this.authEndpoint}`
        });
        this.app.use(this.apiAuth);
        this.app.get('/test', (req, res, next) => {
            if (_.isEqual(req['auth'], authInfo)) res.sendStatus(200);
            else res.sendStatus(401);
        });

        this.mockServer = supertest.agent(this.app);
    }

    @test
    use() {
        expect(this.apiAuth).to.be.a('function');
    }

    @test
    queryParam() {
        return this.mockServer.get(`/test?access_token=${accessToken}`)
            .expect(200);
    }

    @test
    header() {
        return this.mockServer.get('/test')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    }

    @test
    noToken() {
        return this.mockServer.get(`/test`)
            .expect(401);
    }

    @test
    multipleTokens() {
        return this.mockServer.get(`/test?access_token=${accessToken}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(400);
    }}
