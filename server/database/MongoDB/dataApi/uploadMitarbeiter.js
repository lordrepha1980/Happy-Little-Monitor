"use strict";

const _dirname      = process.cwd();
const Data          = require(_dirname + '/server/database/MongoDB/Data.js');
const GlobalHooks   = require(_dirname + '/server/custom/system/globalHooks.js');
const DataClass     = new Data();
const debug         = require('debug')('app:server:database:MongoDB:mainTemplate');
const dayjs         = require('dayjs');
const dayjsIsBetween     = require('dayjs/plugin/isBetween')

const ClassRouter   = require( _dirname + '/server/database/classRouter.js');
const mob           = new ClassRouter();
const globalHooks   = GlobalHooks();
const defaultCollection = 'uploadMitarbeiter';
dayjs.extend(dayjsIsBetween)



function sortData ( data ) {
    const sortData = data.sort(({name: a}, {name: b}) => {
        return a.localeCompare(b)
    })

    return sortData
}

async function getMitarbeiterName( result, request ) {
    const Mitarbeiter = await mob.get('data/mitarbeiter')

    if ( !result.data || !result.data.length  ) {
        const {data: mitarbeiter} = await Mitarbeiter.findOne( { auth: request.auth, noCheck: true, query: { _id: result.data.mitarbeiterId }, ctx: request.ctx } )
        
        if (!result.data)
            result.data = {}

        if ( mitarbeiter ) {
            result.data.name       = mitarbeiter.name
            result.data.surname    = mitarbeiter.surname
        }

        return
    }

    if ( result.data ) {
        for( let item of result.data ) {
            const {data: mitarbeiter} = await Mitarbeiter.findOne( { ctx: request.ctx, auth: request.auth, noCheck: true, query: { _id: item.mitarbeiterId } } )

            if ( mitarbeiter ) {
                item.name       = mitarbeiter.name
                item.surname    = mitarbeiter.surname
            }

            if ( item.reminderDays && item.reminderDate ) {
                const a         = dayjs(item.reminderDate)
                const b         = dayjs()
                item.days       = a.diff(b, 'days')
            }
        }

        result.data = sortData(result.data)
    }
}


class uploadMitarbeiter extends Data { 

    
        constructor() {
            super();
        }
    
    
    
        async update( request ) {
            try {
                if ( !request.auth )
                    throw('No authorization')

                if ( request && !request.table )
                    request.table = defaultCollection

                
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
                
//socket emit client
if ( request.user?.rootId ){
    request.io.to(`room:${request.user.rootId}`).emit('update:upload', result.data)
    await getMitarbeiterName(result, request)
    
    const { db, client } = await mob.db()
    const res = await db.collection('uploadMitarbeiter.files').findOne({'metadata.uploadId': result.data._id})
    client.close()
    result.data.file = null
    if ( res ) {
        result.data.file = res.metadata
        result.data.file.fileId = res._id
    }

    request.io.to(`room:${request.user.rootId}`).emit('update:uebersicht', result.data)
    request.io.to(`room:${request.user.rootId}`).emit('sideNavCount')
}

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
                if ( request && !request.table )
                    request.table = defaultCollection

                
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

                
if ( request.actions === 'fileExists' ) {
    const { db, client } = await mob.db()
    const res = await db.collection('uploadMitarbeiter.files').findOne({'metadata.uploadId': request.query._id})
    result.data.file = null
    if ( res ) {
        result.data.file = res.metadata
        result.data.file.fileId = res._id
    }
    client.close()
}

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
            if ( request && !request.table )
                request.table = defaultCollection

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

                
if ( request.actions === 'username' ) {
    await getMitarbeiterName(result, request)
}

if ( request.actions === 'fileExists' ) {
    const { db, client } = await mob.db()

    if ( result.data )
        for( let item of result.data ) {
            const res = await db.collection('uploadMitarbeiter.files').findOne({'metadata.uploadId': item._id})

            if ( res ) {
                item.file = res.metadata
                item.file.fileId = res._id
            }
        }
    client.close()

    
}

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
                if ( request && !request.table )
                    request.table = defaultCollection

                
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

                
//socket emit client
if ( request.user.rootId ){
    request.io.to(`room:${request.user.rootId}`).emit('delete:upload', request.query)
    request.io.to(`room:${request.user.rootId}`).emit('delete:uebersicht', request.query)
    request.io.to(`room:${request.user.rootId}`).emit('sideNavCount')
}

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
    

    
        async deleteMany( request ) {
            try {
                if ( request && !request.table )
                    request.table = defaultCollection

                
                if ( globalHooks.deleteManyBefore )
                    await globalHooks.deleteManyBefore( { 
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

                const result = await super.deleteMany( request )

                
                if ( globalHooks.deleteManyAfter )
                    await globalHooks.deleteManyAfter( { 
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
    

}

module.exports = uploadMitarbeiter;