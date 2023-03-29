var CronJob         = require('cron').CronJob
const _dirname      = process.cwd()
const ClassRouter   = require( _dirname + '/server/database/classRouter.js')
const debug         = require('debug')('app:server:custom:system:init')
const mob           = new ClassRouter()
const moment        = require('moment')
const pm2           = require('pm2')
const ip            = require('ip')
const os            = require('os')
const sys           = require('systeminformation')

module.exports  = {
    init: async (io) => {
        let intervallPM2 = null

        pm2.connect(async (err) => {
            if (err) {
                clearInterval(intervallPM2)
                debug(err);
                return
            }

            const { db, client } = await mob.db()

            intervallPM2 = setInterval( async () => {

                pm2.list(async function(err, list) {
                    const data = await db.command({ serverStatus: 1 })
      
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
            }, 1000)
        });

        const valueObject = {
            mem: 'free, used, total',
            currentLoad: 'avgLoad, currentLoad, cpus',
            cpu: '*',
            osInfo: 'platform, release',
            system: 'model, manufacturer'
            //fsSize: 'size, used, available',
        }

        sys.observe(valueObject, 2000, (data) => {
            io.emit('serverStatus', { data })
        })

    }
}

