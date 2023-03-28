var CronJob         = require('cron').CronJob
const _dirname      = process.cwd()
const ClassRouter   = require( _dirname + '/server/database/classRouter.js')
const debug         = require('debug')('app:server:custom:system:init')
const mob           = new ClassRouter()
const moment        = require('moment')
const pm2           = require('pm2')
const ip            = require('ip')
const os            = require('os')

module.exports  = {
    init: (io) => {
        const getPM2Data = new CronJob(
            '* * * * * *',
            async function() {
                pm2.connect(function(err) {
                    if (err) {
                        debug(err);
                    }
                    pm2.list(async function(err, list) {
                        const { db, client } = await mob.db()
                        const data = await db.command({ serverStatus: 1 })
                        client.close()
                        io.emit('process', { data: list, params: {
                            node_version: process.version,
                            node_os: process.platform,
                            mongoDB_connections: data.connections,
                            mongoDB_version: data.version,
                            mongoDB_uptime: moment.duration(data.uptime, 'seconds').humanize(),
                            server_uptime: moment.duration(os.uptime(), 'seconds').humanize(),
                            ip_address: ip.address()
                        } } )
                    });
                });
            },
            null,
            true
        );
    }
}

