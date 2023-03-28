"use strict";

const _dirname      = process.cwd();
const Custom        = require(_dirname + '/server/database/Custom.js');
const sentry        = require(_dirname + '/server/database/sentry.js');
const debug         = require('debug')('app:server:Custom');   

const Auth          = require( _dirname + '/server/app/checkAuth.js');
const auth          = new Auth();

const ClassRouter   = require( _dirname + '/server/database/classRouter.js');
const mob           = new ClassRouter();

const uuid          = require('uuid');
const config        = require(_dirname + '/config');

const Sentry        = new sentry();



class afkCompany extends Custom { 
        
            constructor() {
                super();
            }
        

        
    async get( {body, ctx} ) {
        const Company = mob.get('data/afkCompany')


        if ( body )
            body.rootId = true

        const { data: company } = await Company.findOne( { ctx, table: 'afkCompany', noCheck: true, auth: true, query: {}, body: { rootId: true } } )
        ctx.body = { data: company }
    }

}

module.exports = afkCompany;