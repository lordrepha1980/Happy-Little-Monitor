const _dirname  = process.cwd()
const Router    = require('@koa/router');
const fs        = require('fs');
const debug     = require('debug')('app:routes:custom');

const router    = new Router({
    prefix: '/custom'
});

let io;

router.init  = function( socket ) {
    io      = socket;
};

router
    .post("/:class/:action", async (ctx, next) => {
        let result          = {data: null};

        if(!fs.existsSync(`${_dirname}/server/database/customApi/post/${ctx.params.class}.js`)) {
            const error = `Missing endpoint!. Called endpoint: ${ctx.params.class}`
            debug( error )
            result = { error }
            ctx.status  = 400;
            ctx.body    = result;
            return;
        }

        const Custom        = require(`${_dirname}/server/database/customApi/post/${ctx.params.class}.js`);
        const custom        = new Custom();

        if ( !custom[ctx.params.action] ) {
            const error = `Missing action!. Called action: ${ctx.params.action}`
            debug( error )
            result = { error }
            ctx.status  = 400;
            ctx.body    = result;
            return;
        }

        result = await custom[ctx.params.action]( { body: ctx.request.body, ctx, io } )
        ctx.status  = result?.error ? 400 : 200;
    })

router
    .get("/:class/:action", async (ctx, next) => {
        let result          = {data: null};

        if(!fs.existsSync(`${_dirname}/server/database/customApi/get/${ctx.params.class}.js`)) {
            const error = `Missing endpoint!. Called endpoint: ${ctx.params.class}`
            debug( error )
            result = { error }
            ctx.status  = 400;
            ctx.body    = result;
            return;
        }

        const Custom        = require(`${_dirname}/server/database/customApi/get/${ctx.params.class}.js`);
        const custom        = new Custom();

        if ( !custom[ctx.params.action] ) {
            const error = `Missing action!. Called action: ${ctx.params.action}`
            debug( error )
            result = { error }
            ctx.status  = 400;
            ctx.body    = result;
            return;
        }

        result = await custom[ctx.params.action]( { body: ctx.request.body, ctx, io } )

        ctx.status  = result?.error ? 400 : 200;
    })

module.exports = router;
