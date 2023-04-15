"use strict";

const _dirname      = process.cwd();
const Custom        = require(_dirname + '/server/database/Custom.js')
const sentry        = require(_dirname + '/server/database/sentry.js')
const debug         = require('debug')('app:server:Custom')
const dayjs         = require('dayjs')
const dayjsIsBetween     = require('dayjs/plugin/isBetween')

const Auth          = require( _dirname + '/server/app/checkAuth.js')
const auth      = new Auth();

const ClassRouter   = require( _dirname + '/server/database/classRouter.js')
const mob           = new ClassRouter();

const uuid          = require('uuid');
const config        = require(_dirname + '/config');

const Sentry        = new sentry();
dayjs.extend(dayjsIsBetween)


const sys           = require('systeminformation')


class systeminformation extends Custom { 
        
            constructor() {
                super();
            }
        

        
            
        
        
        //======= begin custom auth methods =======
async sysStatus ( { ctx, io } ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
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


        //======= end custom auth methods =======
        
}

module.exports = systeminformation