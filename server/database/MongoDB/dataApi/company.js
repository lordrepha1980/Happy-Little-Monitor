"use strict";

const _dirname      = process.cwd();
const Data          = require(_dirname + '/server/database/MongoDB/Data.js');
const GlobalHooks   = require(_dirname + '/server/custom/system/globalHooks.js');
const DataClass     = new Data();
const debug         = require('debug')('app:server:database:MongoDB:mainTemplate');
const moment        = require('moment');
const ClassRouter   = require( _dirname + '/server/database/classRouter.js');
const mob           = new ClassRouter();
const globalHooks   = GlobalHooks();



class company extends Data { 

    
        constructor() {
            super();
        }
    
    
    
        async update( request ) {
            try {
                
                if ( globalHooks.updateBefore )
                    await globalHooks.updateBefore( { 
                        io: request.io, 
                        body: request.body, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        auth: request.auth, 
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx
                    } )

                const result = await super.update( request )
                
                if ( globalHooks.updateAfter )
                    await globalHooks.updateAfter( { 
                        io: request.io, 
                        body: request.body, 
                        user: request.ctx?.user,
                        actions: request.actions,
                        auth: request.auth, 
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx,
                        result
                    } )

                return result
            }
            catch (error) { 
                debug(error)
                return { error }
            }
            
        }
    

    
        async findOne( request ) {
            try {
                
                if ( globalHooks.findOneBefore )
                    await globalHooks.findOneBefore( { 
                        io: request.io, 
                        body: request.body, 
                        user: request.ctx?.user,
                        actions: request.actions,
                        auth: request.auth, 
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx,
                    } )


                const result = await super.findOne( request )

                
                if ( globalHooks.findOneAfter )
                    await globalHooks.findOneAfter( { 
                        io: request.io, 
                        body: request.body, 
                        auth: request.auth, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx,
                        result
                    } )
                return result
            }
            catch (error) { 
                debug(error)
                return { error }
            }
        }
    

    
        async find( request ) {
            try {
                
                if ( globalHooks.findBefore )
                    await globalHooks.findBefore( { 
                        io: request.io, 
                        body: request.body, 
                        auth: request.auth, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx
                    } )

                const result = await super.find( request )

                
                if ( globalHooks.findAfter )
                    await globalHooks.findAfter( { 
                        io: request.io, 
                        body: request.body, 
                        auth: request.auth, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx,
                        result
                    } )
                return result
            }
            catch (error) { 
                debug(error)
                return { error }
            }
        }
    

    
        async delete( request ) {
            try {
                
                if ( globalHooks.deleteBefore )
                    await globalHooks.deleteBefore( { 
                        io: request.io, 
                        body: request.body, 
                        auth: request.auth, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx
                    } )

                const result = await super.delete( request )

                
                if ( globalHooks.deleteAfter )
                    await globalHooks.deleteAfter( { 
                        io: request.io, 
                        body: request.body, 
                        auth: request.auth, 
                        actions: request.actions,
                        user: request.ctx?.user,
                        noCheck: request.noCheck, 
                        table: request.table,
                        query: request.query,
                        ctx: request.ctx,
                        result
                    } )
                return result
            }
            catch (error) { 
                debug(error)
                return { error } 
            }
        }
    

    
        async count( request ) {
            try {
                

                const result = await super.count( request )

                
                return result
            }
            catch (error) { 
                debug(error)
                return { error }
            }
        }
    

}

module.exports = company;