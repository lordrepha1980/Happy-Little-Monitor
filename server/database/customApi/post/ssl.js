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


const util          = require('util');
const { exec }      = require('child_process');
const execPromise   = util.promisify(exec);


class ssl extends Custom { 
        
            constructor() {
                super();
            }
        

        
            
        
        
        //======= begin custom auth methods =======
async writeSSLCerts ( { ctx } ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
    const Certs         = mob.get('data/certs')
    let certs           = {}
    const { stdout }    = await execPromise('certbot certificates')
    const certificates  = stdout.split(/(?=Certificate Name:)/g);
        
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

            if (dayjs().isAfter(dayjs(date).subtract(20, 'day'))) {
                main.sendMail( { ctx: { auth: true }, body: {
                    email: user.alarmMail,
                    subject: `HLM - ${nameMatch[1]} - SSL Certificate expires in ${valid}`,
                    text: `SSL Certificate expires in ${valid} \n\n ${cert}`
                } } )
            }
        }
    });

    Certs.update({ auth: true, noCheck: true, query: {_id: '1'}, body: {_id: '1', certs} })
}


        //======= end custom auth methods =======
        
}

module.exports = ssl