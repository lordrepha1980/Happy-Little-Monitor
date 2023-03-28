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
                    pm2.list(function(err, list) {
                        io.emit('process', { data: list, params: {
                            node_version: process.version,
                            node_os: process.platform,
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

