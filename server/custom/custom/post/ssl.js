{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const util          = require('util');
const { exec }      = require('child_process');
const execPromise   = util.promisify(exec);
{% endblock %}

{% block methodFunctionAuth %}
async writeSSLCerts ( { ctx } ) {
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

{% endblock %}