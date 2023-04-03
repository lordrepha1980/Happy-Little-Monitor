var CronJob         = require('cron').CronJob
const _dirname      = process.cwd()
const ClassRouter   = require( _dirname + '/server/database/classRouter.js')
const debug         = require('debug')('app:server:custom:system:init')
const mob           = new ClassRouter()
const moment        = require('moment')
const pm2           = require('pm2')
const fs            = require('fs')
const ip            = require('ip')
const os            = require('os')
const sys           = require('systeminformation')
const http          = require('http')
const { curly }     = require("node-libcurl");
const uid           = require('uuid')

module.exports  = {
    init: async (io) => {
        let intervallPM2 = null
        let count = 0
        let pm2InstStatus = {}

        const main = await mob.get('custom/main')
        const User = await mob.get('data/user')
        const { data: user} = await User.findOne({ auth: true, noCheck: true, query: {} })

        function readFile (path) {
            if (!path)
                return null

            return new Promise((resolve, reject) => {
                let chunk = ''
                const readStream = fs.createReadStream(path, {
                    start: (fs.statSync(path).size - 2000 >= 0) ? ( fs.statSync(path).size - 2000 ) : 0
                });
    
                readStream.on('data', data => {
                    chunk += data.toString()
                });
    
                readStream.on('end', ( data ) => {
                    resolve(chunk)
                });
            })
        }

        async function sendMail ({name, status, out, error}) {
            let text = 'Everithyng is fine!'
            if ( status !== 'online' ) {
                const outLog = await readFile(out) || ''
                const errorLog = await readFile(error) || ''

                text = `------------ERROR LOG------------\n${errorLog}\n\n------------OUT LOG------------\n${outLog}`
            }

            main.sendMail( { body: {
                email: user.alarmMail,
                subject: `HLM - ${name} - Process ${status.toUpperCase()}`,
                text,
            } } )
        }
                            
        function calcBytes (mem) { 
            const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

            let l = 0
            let n = mem || 0

            while(n >= 1000 && ++l) {
                n = n / 1000;
            }
            
            
            return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
        }

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


        //Network
        const Network = await mob.get('data/network')

        intervallPM2 = setInterval( async () => {
            pm2.connect(async (err) => {
                if (err) {
                    clearInterval(intervallPM2)
                    debug(err);
                    return
                }

                const { db, client } = await mob.db()

                pm2.list(async function(err, list) {
                    const data = await db.command({ serverStatus: 1 })
                    const ChartData = await mob.get('data/chartdata')

                    pm2Procs = []

                    for( const item of list) {
                        pm2Procs.push({
                            show: true,
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

                        if (!pm2InstStatus[item.name])
                            pm2InstStatus[item.name] = {}

                        if ( pm2InstStatus[item.name].status !== item.pm2_env.status ) { 
                            pm2InstStatus[item.name].status = item.pm2_env.status

                            await sendMail({name: item.name, status: item.pm2_env.status, out: item.pm2_env.pm_out_log_path, error: item.pm2_env.pm_err_log_path})
                        }

                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_memory`, type: "memory", value: item.monit.memory, name: item.name  } } )
                        await ChartData.update( { table: 'chartdata', io, auth: true, noCheck: true, body: { _id: `${item.name}_${count}_cpu`, type: "cpu", value: item.monit.cpu, name: item.name  } } )
                    }
                    const { data: chartpoints } = await ChartData.find( { table: 'chartdata', auth: true, noCheck: true, query: {}, sort: { _id: 1 } } )

                    pm2Procs = pm2Procs.sort((a, b) => { return a.name > b.name ? 1 : -1})

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
            system: 'model, manufacturer',
            networkStats: '*'
            //fsSize: 'size, used, available',
        }

        //server status
        sys.observe(valueObject, 1000, async (data) => {

            const {data: oldRes} = await Network.findOne( { table: 'network', auth: true, noCheck: true, query: { _id: moment().format('YYYY-MM')}} )
            
            if ( oldRes && oldRes.rx_sec ) {
                oldRes.rx_sec += data.networkStats[0].rx_sec || 0
                oldRes.rx_human = calcBytes(oldRes.rx_sec)
            }

            if ( oldRes && oldRes.tx_sec ) {
                oldRes.tx_sec += data.networkStats[0].tx_sec || 0
                oldRes.tx_human = calcBytes(oldRes.tx_sec)
            }

            const res = await Network.update( { io, auth: true, noCheck: true, 
                query: { _id: moment().format('YYYY-MM')},
                body: oldRes || {
                    _id: moment().format('YYYY-MM'),
                    rx_sec: data.networkStats[0].rx_sec || 0,
                    tx_sec: data.networkStats[0].tx_sec || 0,
                    tx_human: calcBytes(data.networkStats[0].tx_sec),
                    rx_human: calcBytes(data.networkStats[0].rx_sec),
                } 
            } )

            io.emit('networkStatus', { data: res.data })
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

