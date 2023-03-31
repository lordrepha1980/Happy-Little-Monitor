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
const http          = require('http')
const { curly }      = require("node-libcurl");

module.exports  = {
    init: async (io) => {
        let intervallPM2 = null
        let count = 0

        function nginxStat (body) {
            const nginxStatus = {};

            // parse the number of active connections
            const activeConnections = body.match(/Active connections: (\d+)/)[1];
            nginxStatus.activeConnections = parseInt(activeConnections);

            // parse the server metrics
            const serverMetrics = body.match(/server accepts handled requests\n\s*(\d+)\s+(\d+)\s+(\d+)/);
            nginxStatus.server = {
                accepts: parseInt(serverMetrics[1]),
                handled: parseInt(serverMetrics[2]),
                requests: parseInt(serverMetrics[3])
            };

            // parse the connection states
            const connectionStates = body.match(/Reading: (\d+) Writing: (\d+) Waiting: (\d+)/);
            nginxStatus.connections = {
                reading: parseInt(connectionStates[1]),
                writing: parseInt(connectionStates[2]),
                waiting: parseInt(connectionStates[3])
            };

            return nginxStatus;
        }

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

                    pm2Procs = []

                    for( const item of list) {
                        pm2Procs.push({
                            name: item.name,
                            pm_id: item.pm_id,
                            monit: item.monit,
                            pm2_env: {
                                created_at: item.pm2_env.created_at,
                                pm_out_log_path: item.pm2_env.pm_out_log_path,
                                pm_err_log_path: item.pm2_env.pm_err_log_path,
                                restart_time: item.pm2_env.restart_time,
                                unique_id: item.pm2_env.unique_id,
                                status: item.pm2_env.status,
                            }
                        })
                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_memory`, type: "memory", value: item.monit.memory, name: item.name  } } )
                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_cpu`, type: "cpu", value: item.monit.cpu, name: item.name  } } )
                    }
                    const { data: chartpoints } = await ChartData.find( { table: 'chartdata', auth: true, noCheck: true, query: {}, sort: { _id: 1 } } )
                    count++

                    io.emit('process', { data: pm2Procs, params: {
                        nginxLog: {error: true},
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

        //server status
        sys.observe(valueObject, 2000, (data) => {
            io.emit('serverStatus', { data })
        })

        //nginx status
        let nginxLog = {
            activeConnections: 7,
            server: { accepts: 2777, handled: 2777, requests: 6707 },
            connections: { reading: 0, writing: 3, waiting: 4 }
        } 

        let intervallNginx = null

        try{
            intervallNginx = setInterval( async () => {
                try{
                    const { data: nginxRawLog } = await curly.get('http://127.0.0.1/nginx_status');
                    nginxLog = nginxStat(nginxRawLog)
                    io.emit('nginxStatus', { data: nginxLog })
                } catch (error) {
                    //nginxLog.error = error.message
                    io.emit('nginxStatus', { data: nginxLog })
                }
            }, 5000)
        } catch (error) {
            clearInterval(intervallNginx)
        }
    }
}

