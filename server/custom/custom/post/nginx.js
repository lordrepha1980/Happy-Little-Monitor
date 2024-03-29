{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const fs            = require('fs')
const { curly }     = require("node-libcurl");
{% endblock %}

{% block methodFunctionAuth %}
// async nginxLogAggCountIP ( { ctx, io, user } ) {
//     const { client, db }        = await mob.db()
//     let nin = []

//     if ( user.nginxIpFilter ) {
//         nin = user.nginxIpFilter.split(',')
//         nin = nin.map( ip => ip.trim() )
//     }

//     try {
//         db.collection('nginxLog').aggregate([
//             { $match: { address: { $exists: true, $nin: nin } } },
//             { $group: { _id: "$address", count: { $sum: 1 } } },
//             { $sort: { count: -1 } },
//             { $limit: 10 }
//         ]).toArray( (err, result) => {
//             if (err) throw err;
//             io.emit('nginxLogAggCountIP', { data: result })
//             client.close();
//         });
//     } catch (error) {
//         client.close()
//         return []
//     }
// }

async nginxLogAggDayHourCount ( { ctx, io, user } ) {
    const { client, db }        = await mob.db()
    const time    = dayjs().subtract(9, 'day').valueOf() / 1000
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset()
    let nin = []
    if ( user.nginxIpFilter ) {
        nin = user.nginxIpFilter.split(',')
        nin = nin.map( ip => ip.trim() )
    }
    try {
        db.collection('nginxLog').aggregate([
            { $match: { time: { $gt: time, $exists: true }, address: {$exists: true} } },
            {
                $addFields: {
                    date: {
                        $toDate: {
                            $subtract: [
                                {$toLong: {$multiply: ['$time', 1000]}},
                                {$multiply: [3600000, {$toInt: {$divide: [timezoneOffset, 60]}}]}
                            ]
                        }
                    }
                }
            },
            { 
                $group: { 
                    _id: { 
                        day: { $dayOfMonth: "$date"  },
                        hour: { $hour: "$date" },
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    count: { $sum: 1 } 
                } 
            },
            { $sort: { '_id.month': -1, '_id.day': -1, '_id.hour': 1 } },
            {
                $group: {
                    _id: {
                        year: '$_id.year',
                        month: '$_id.month',
                        day: '$_id.day'
                    },
                    data: {
                        $push: {
                            hour: '$_id.hour',
                            count: '$count'
                        }
                    }
                }
            },
            { $sort: { '_id': -1 } },
        ]).toArray( (err, result) => {
            if (err) throw err;
            io.emit('nginxLogAggDayHourCount', { data: result })
            client.close();
        });
    } catch (error) {
        client.close()
        return []
    }
}


async nginxWriteLog ( { ctx, io } ) {
    const defaultPath       = '/var/log/nginx/'
    const User              = await mob.get('data/user')
    const { data: user}     = await User.findOne({ auth: true, noCheck: true, query: {} })
    const NginxLog          = await mob.get('data/nginxLog')
    const { client, db }    = await mob.db() 
    const NginxColl         = db.collection('nginxLog')

    if ( user && user.nginxLogfiles ) {
        const logFiles      = user.nginxLogfiles.split(',')
        const deleteTime    = dayjs().subtract(user.saveDays || 60, 'days').valueOf() / 1000
        await NginxColl.deleteMany({ time: {$lt: deleteTime} })

        for ( const file of logFiles ) {
            const nginxPath = (user.nginxPath || defaultPath) + file.trim()
            if ( fs.existsSync(nginxPath) )
                fs.watch( nginxPath, async () => {
                    const lastLine = fs.readFileSync(nginxPath, 'utf8').split('\n').filter(Boolean).pop();
                    try {
                        const body = JSON.parse(lastLine)
                        await NginxLog.update( {  io, auth: true, noCheck: true, body } )
                    } catch (error) {
                        console.log(error)
                    }
                } )
        }
    }
}

async nginxStat ({ ctx, body }) {
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

async nginxStatus ({ io, ctx }) {

    //nginx status
    let nginxLog = {
        activeConnections: 7,
        server: { accepts: 2777, handled: 2777, requests: 6707 },
        connections: { reading: 0, writing: 3, waiting: 4 }
    } 

    let intervallNginx = null

    try{
        intervallNginx = setInterval( async () => {
            try {
                const User              = await mob.get('data/user')
                const { data: user}     = await User.findOne({ auth: true, noCheck: true, query: {} })

                //await this.nginxLogAggCountIP({ ctx: { auth: true }, io, user })
                await this.nginxLogAggDayHourCount({ ctx: { auth: true }, io, user })

                const { data: nginxRawLog } = await curly.get('http://127.0.0.1/nginx_status');
                nginxLog = await this.nginxStat({body: nginxRawLog, ctx: { auth: true }})
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
{% endblock %}