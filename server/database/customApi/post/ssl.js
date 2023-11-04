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
    try {
        const Certs         = mob.get('data/certs')
        const main          = mob.get('custom/main')
        let certs           = {}
        const { stdout }    = await execPromise('certbot certificates')
        const certificates  = stdout.split(/(?=Certificate Name:)/g);

        certificates.forEach((cert) => {
            const nameMatch = cert.match(/Certificate Name:\s([^\n]+)/);
            const expiryMatch = cert.match(/Expiry Date:\s([^\n]+)/);
            const wildcardDomain = cert.match(/Domains: \*/m);
            if (nameMatch && expiryMatch) {
                const name = nameMatch[1];
                const date = `${expiryMatch[1].split(' ')[0]} ${expiryMatch[1].split(' ')[1]}`;
                const valid = `${expiryMatch[1].split(' ')[3]} days`;
                certs[name] = {
                    date,
                    valid,
                    wildcard: wildcardDomain ? true : false
                } 

                //for hetzner server
                if (wildcardDomain && ctx.user.wildcardCertBotHetzner) {
                    exec(`certbot certonly --manual --preferred-challenges=dns --manual-auth-hook /usr/local/bin/certbot-hetzner-auth.sh --manual-cleanup-hook /usr/local/bin/certbot-hetzner-cleanup.sh -d *.${name} -n`, (error, stdout, stderr) => {
                        if (error) {
                        console.error(`Fehler beim Ausführen des Certbot-Befehls: ${error}`);
                        return;
                        }
                        console.log(`Certbot-Befehl erfolgreich ausgeführt: ${stdout}`);
                    })
                }

                if (dayjs().isAfter(dayjs(date).subtract(20, 'day'))) {
                    main.sendMail( { ctx: { auth: true }, body: {
                        email: ctx.user.alarmMail,
                        subject: `HLM - ${nameMatch[1]} - SSL Certificate expires in ${valid}`,
                        text: `SSL Certificate expires in ${valid} \n\n ${cert}`
                    } } )
                }
            }
        });

        Certs.update({ auth: true, noCheck: true, query: {_id: '1'}, body: {_id: '1', certs} })
    } catch (error) {
        console.log('error writeSSLCerts', error)
    }
}


        //======= end custom auth methods =======
        
}

module.exports = ssl