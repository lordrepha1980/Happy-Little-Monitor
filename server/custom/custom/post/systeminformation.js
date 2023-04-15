{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const sys           = require('systeminformation')
{% endblock %}

{% block methodFunctionAuth %}
async sysStatus ( { ctx, io } ) {
    function calcBytes (mem) { 
        const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

        let l = 0
        let n = mem || 0

        while(n >= 1000 && ++l) {
            n = n / 1000;
        }
        
        
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    }
    
    const valueObject = {
        mem: 'free, used, total',
        currentLoad: 'avgLoad, currentLoad, cpus',
        cpu: '*',
        osInfo: 'platform, release',
        system: 'model, manufacturer',
        networkStats: '*'
        //fsSize: 'size, used, available',
    }

    const Network = mob.get('data/network')
    sys.observe(valueObject, 1000, async (data) => {

        let {data: oldResMonth} = await Network.findOne( { auth: true, noCheck: true, query: { _id: dayjs().format('YYYY-MM')}} )
        
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
                _id: dayjs().format('YYYY-MM'),
                rx_sec: data.networkStats[0].rx_sec || 0,
                tx_sec: data.networkStats[0].tx_sec || 0,
                tx_human: calcBytes(data.networkStats[0].tx_sec),
                rx_human: calcBytes(data.networkStats[0].rx_sec),
                month: dayjs().format('YYYY-MM'),
                days: []
            } 

        let oldResDay = oldResMonth.days.find(( dayItem ) => {
            
            return dayjs().format('YYYY-MM-DD') === dayItem._id
        })



        if ( !oldResDay ) {
            oldResDay = {
                _id: dayjs().format('YYYY-MM-DD'),
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
            query: { _id: dayjs().format('YYYY-MM')},
            body: oldResMonth
        } )

        io.emit('networkStatus', { data: resMonth.data })
        io.emit('serverStatus', { data })
    })

}

{% endblock %}