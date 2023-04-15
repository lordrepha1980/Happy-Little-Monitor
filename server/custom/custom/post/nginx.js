{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const fs            = require('fs')
const { curly }     = require("node-libcurl");
{% endblock %}

{% block methodFunctionAuth %}
async nginxLogAggCountIP ( { ctx } ) {
    const { client, db }        = mob.db()
    DB.collection('nginxLog').aggregate([
        { $group: { _id: "$remote_addr", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]).toArray( (err, result) => {
        if (err) throw err;
        console.log(result);
        client.close();
    });

}
async nginxWriteLog ( { ctx } ) {
    const defaultPath = '/var/log/nginx/'
    const User          = await mob.get('data/user')
    const { data: user} = await User.findOne({ auth: true, noCheck: true, query: {} })
    if ( user.nginxLogfiles ) {
        const logFiles = user.nginxLogfiles.split(',')
        
        for ( const file of logFiles ) {
            const nginxPath = (user.nginxPath || defaultPath) + file.trim()
            if ( fs.existsSync(nginxPath) )
                fs.watch( nginxPath, async () => {
                    const lastLine = fs.readFileSync(nginxPath, 'utf8').split('\n').filter(Boolean).pop();
                    await NginxLog.update( { table: 'nginxLog', io, auth: true, noCheck: true, body: JSON.parse(lastLine) } )
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
                const { data: nginxRawLog } = await curly.get('http://127.0.0.1/nginx_status');
                nginxLog = this.nginxStat({body: nginxRawLog, ctx: { auth: true }})
                io.emit('nginxStatus', { data: nginxLog })
                this.nginxLogAggCountIP({ ctx: { auth: true } })
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