{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const util          = require('util');
const { exec }      = require('child_process');
const execPromise   = util.promisify(exec);
{% endblock %}

{% block methodFunctionAuth %}
async writeSSLCerts ( { ctx } ) {
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

{% endblock %}