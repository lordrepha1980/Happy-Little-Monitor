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
const util          = require('util');
const { exec }      = require('child_process');
const execPromise   = util.promisify(exec);


module.exports  = {
    init: async (io) => {
        let intervallPM2    = null
        let count           = 0
        const nginxPath     = '/var/log/nginx/access.log'
        const main          = await mob.get('custom/main')
        const User          = await mob.get('data/user')
        const Certs         = await mob.get('data/certs')
        const Nginx         = await mob.get('data/nginxLog')
        const { data: user} = await User.findOne({ auth: true, noCheck: true, query: {} })

        function parseNginxLog(entry) {
            console.log(entry)
            const [remoteAddr, remoteUser, time, request, status, bodyBytesSent, referer, userAgent] = entry.split(' ');
            const [method, path, httpVersion] = request.split(' ');

            return {
                remote_addr: remoteAddr,
                remote_user: remoteUser,
                time: new Date(time + ' UTC'),
                method,
                path,
                http_version: httpVersion,
                status,
                body_bytes_sent: bodyBytesSent,
                referer,
                user_agent: userAgent
            };
        }
        if ( user.nginxPath && user.nginxLogfiles ) {
            const logFiles = user.nginxLogfiles.trim().split(',')
            
            logFiles.forEach((file) => {
                const nginxPath = user.nginxPath + file
                if ( fs.existsSync(nginxPath) )
                    fs.watchFile( nginxPath, () => {
                        const lastLine = fs.readFileSync(nginxPath, 'utf8').split('\n').filter(Boolean).pop();
                        console.log(parseNginxLog(lastLine))
                    } )
            })
        }
        const getCerts = new CronJob(
            '00 00 00 * * *',
            async function() {
                
                let certs = {}
                const { stdout } = await execPromise('certbot certificates')
                const certificates = stdout.split(/(?=Certificate Name:)/g);
                    
                certificates.forEach((cert) => {
                    const nameMatch = cert.match(/Certificate Name:\s([^\n]+)/);
                    const expiryMatch = cert.match(/Expiry Date:\s([^\n]+)/);
                    if (nameMatch && expiryMatch) {
                        const name = nameMatch[1];
                        const date = `${expiryMatch[1].split(' ')[0]} ${expiryMatch[1].split(' ')[1]}`;
                        const valid = `${expiryMatch[1].split(' ')[3]} days`;
                        certs[name] = {
                            date,
                            valid
                        } 

                        if (moment().isAfter(moment(date).subtract(20, 'days'))) {
                            main.sendMail( { body: {
                                email: user.alarmMail,
                                subject: `HLM - ${nameMatch[1]} - SSL Certificate expires in ${valid}`,
                                text: `SSL Certificate expires in ${valid} \n\n ${cert}`
                            } } )
                        }
                    }
                });

                Certs.update({ auth: true, noCheck: true, query: {_id: '1'}, body: {_id: '1', certs} })
            },
            null,
            true,
            null,
            null,
            !process.env.DEV
        );

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
            let text = 'Everithing is fine!'
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
                        let { data: certs }     = await Certs.findOne({ auth: true, noCheck: true, query: { _id: '1' } })
                        let sslExpiry = { 
                            date: 'N/A',
                            valid: 'N/A'
                        }

                        if ( certs?.certs )
                            sslExpiry = certs.certs[item.name]

                        pm2Procs.push({
                            sslExpiry,
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

                        const Proc = await mob.get('data/nodeStatusProc')
                        let { data: proc }      = await Proc.findOne({ auth: true, noCheck: true, query: { _id: item.name } })

                        if (!proc)
                            proc = {
                                _id: item.name,
                            }

                        if ( proc.status !== item.pm2_env.status ) { 
                            proc.status = item.pm2_env.status
                            await Proc.update( {  auth: true, noCheck: true, body: proc } )

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

            let {data: oldResMonth} = await Network.findOne( { table: 'network', auth: true, noCheck: true, query: { _id: moment().format('YYYY-MM')}} )
            
            if ( oldResMonth && oldResMonth.rx_sec !== undefined ) {
                oldResMonth.rx_sec += data.networkStats[0].rx_sec || 0
                oldResMonth.rx_human = calcBytes(oldResMonth.rx_sec)
            }

            if ( oldResMonth && oldResMonth.tx_sec !== undefined ) {
                oldResMonth.tx_sec += data.networkStats[0].tx_sec || 0
                oldResMonth.tx_human = calcBytes(oldResMonth.tx_sec)
            }

            if ( !oldResMonth ) 
                oldResMonth = {
                    _id: moment().format('YYYY-MM'),
                    rx_sec: data.networkStats[0].rx_sec || 0,
                    tx_sec: data.networkStats[0].tx_sec || 0,
                    tx_human: calcBytes(data.networkStats[0].tx_sec),
                    rx_human: calcBytes(data.networkStats[0].rx_sec),
                    month: moment().format('YYYY-MM'),
                    days: []
                } 

            let oldResDay = oldResMonth.days.find(( dayItem ) => {
                
                return moment().format('YYYY-MM-DD') === dayItem._id
            })



            if ( !oldResDay ) {
                oldResDay = {
                    _id: moment().format('YYYY-MM-DD'),
                    rx_sec: data.networkStats[0].rx_sec || 0,
                    tx_sec: data.networkStats[0].tx_sec || 0,
                    tx_human: calcBytes(data.networkStats[0].tx_sec),
                    rx_human: calcBytes(data.networkStats[0].rx_sec)
                }

                oldResMonth.days.push(oldResDay)
            }

            
            if ( oldResDay && oldResDay.rx_sec !== undefined ) {
                oldResDay.rx_sec += data.networkStats[0].rx_sec || 0
                oldResDay.rx_human = calcBytes(oldResDay.rx_sec)
            }

            if ( oldResDay && oldResDay.tx_sec !== undefined ) {
                oldResDay.tx_sec += data.networkStats[0].tx_sec || 0
                oldResDay.tx_human = calcBytes(oldResDay.tx_sec)
            }

            const resMonth = await Network.update( { io, auth: true, noCheck: true, 
                query: { _id: moment().format('YYYY-MM')},
                body: oldResMonth
            } )

            io.emit('networkStatus', { data: resMonth.data })
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

