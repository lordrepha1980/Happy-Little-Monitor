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
        let count = 0

        intervallPM2 = setInterval( async () => {
            pm2.connect(async (err) => {
                if (err) {
                    clearInterval(intervallPM2)
                    debug(err);
                    return
                }

                const { db, client } = await mob.db()


                pm2.list(async function(err, list) {
                    if ( count === 1 )
                        count = 0
                    const data = await db.command({ serverStatus: 1 })
                    const ChartData = await mob.get('data/chartdata')
                    for( const item of list) {
                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_memory`, type: "memory", value: item.monit.memory, name: item.name  } } )
                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_cpu`, type: "cpu", value: item.monit.cpu, name: item.name  } } )
                    }
                    const { data: chartpoints } = await ChartData.find( { table: 'chartdata', auth: true, noCheck: true, query: {}, sort: { _id: 1 } } )
                    count++

                    io.emit('process', { data: list, params: {
                        chartpoints,
                        node_version: process.version,
                        node_os: process.platform,
                        mongoDB_connections: data.connections,
                        mongoDB_version: data.version,
                        mongoDB_uptime: moment.duration(data.uptime, 'seconds').humanize(),
                        server_uptime: moment.duration(os.uptime(), 'seconds').humanize(),
                        ip_address: ip.address()
                    } } )
                    pm2.disconnect()
                    client.close()
                });

            });
        }, 1000)

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

