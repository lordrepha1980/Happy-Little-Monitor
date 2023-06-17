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
const http          = require('http')
const uid           = require('uuid')


module.exports  = {
    init: async (io) => {
        let intervallPM2    = null
        let count           = 0
        const main          = await mob.get('custom/main')
        const User          = await mob.get('data/user')
        const Certs         = await mob.get('data/certs')
        const Ssl           = await mob.get('custom/ssl')
        const Nginx         = await mob.get('custom/nginx')
        const { data: user} = await User.findOne({ auth: true, noCheck: true, query: {} })

        //start nginxWriteLog
        Nginx.nginxWriteLog({io, ctx: {auth: true}})
        //sudo certbot certonly --manual --preferred-challenges=dns --email freelancer@christoph-duengel.de --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d *.lordrepha.de
        // start cronjob for ssl certs
        const getCerts = new CronJob(
            '00 00 00 * * *',
            async function() {
                Ssl.writeSSLCerts({ ctx: { auth: true } })
            },
            null,
            true,
            null,
            null,
            !process.env.DEV
        );
        
        //read log and error files for mail
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

            main.sendMail( { ctx: {auth: true}, body: {
                email: user.alarmMail,
                subject: `HLM - ${name} - Process ${status.toUpperCase()}`,
                text,
            } } )
        }

        //PM2 Status
        intervallPM2 = setInterval( async () => {
            pm2.connect(async (err) => {
                if (err) {
                    clearInterval(intervallPM2)
                    debug(err);
                    return
                }
                pm2.list(async function(err, list) {
                    const { db, client } = await mob.db()
                    const data = await db.command({ serverStatus: 1 })
                    const ChartData = await mob.get('data/chartdata')
                    await client.close()
                    // console.log('client close')
                    pm2Procs = []

                    for( const item of list) {
                        let { data: certs }     = await Certs.findOne({ auth: true, noCheck: true, query: { _id: '1' } })
                        let sslExpiry = { 
                            date: 'N/A',
                            valid: 'N/A'
                        }
                        //renew sudo certbot certonly --manual --preferred-challenges=dns --email freelancer@christoph-duengel.de --server https://acme-v02.api.letsencrypt.org/directory --agree-tos -d *.lordrepha.de
                        if ( certs?.certs ) {
                            let sslCert = certs.certs[item.name]

                            if (!sslCert) {
                                const parts = item.name.split('.'); // Trennen der Domain nach Punkten
                                const mainDomain = parts.slice(-2).join('.'); // Zusammenführen der letzten beiden Teile
                                sslCert = certs.certs[mainDomain]
                            }

                            sslExpiry = sslCert
                        }

                        pm2Procs.push({
                            sslExpiry,
                            show: true,
                            name: item.name,
                            pm_id: item.pm_id,
                            monit: item.monit,
                            pm2_env: {
                                created_at: item.pm2_env.pm_uptime,
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
                        chartpoints: chartpoints || [],
                        node_version: process.version,
                        node_os: process.platform,
                        mongoDB_connections: data.connections,
                        mongoDB_version: data.version,
                        mongoDB_uptime: moment.duration(data.uptime, 'seconds').humanize(),
                        server_uptime: moment.duration(os.uptime(), 'seconds').humanize(),
                        ip_address: ip.address()
                    } } )
                    pm2.disconnect()
                });

            });
        }, 1000)

        //systeminformation
        const Systeminformation = await mob.get('custom/systeminformation')
        Systeminformation.sysStatus({ io, ctx: {auth: true} })
        
        //nginx status
        Nginx.nginxStatus({ io, ctx: {auth: true} })

    }
}

