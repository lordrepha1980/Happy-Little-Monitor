"use strict";
const _dirname  = process.cwd()
const config    = require( _dirname + "/config");
const debug     = require('debug')('app:server:database:MongoDB:connection');

module.exports = class Connection { 
        
        constructor(  ) {
            
        }

        async init() {
            const { MongoClient }   = require('mongodb');
            let url               = `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`;

            if ( config.database.credentials && config.database.credentials.username && config.database.credentials.password )
                url               = `mongodb://${config.database.credentials.username}:${config.database.credentials.password}@${config.database.host}:${config.database.port}/${config.database.name}`;

            config.debug.extend && debug('MongoDB Connect: ', url );
            const client            = new MongoClient(url);

            // Database Name
            const dbName            = config.database.name || 'defaultDb';

            await client.connect();
            const db                = client.db(dbName);
            
            return { db, client }
        }
        
}