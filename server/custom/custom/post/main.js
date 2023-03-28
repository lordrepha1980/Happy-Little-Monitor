{% extends _dirname + '/server/database/customTemplate.js' %}

{% block main %}
const nodemailer        = require("nodemailer")
const moment            = require('moment')
const busboy            = require('koa-busboy')
const mongodb           = require("mongodb")
const fs                = require('fs')
const fsPromises        = fs.promises
const GridFSBucket      = mongodb.GridFSBucket
const bcryptSalt        = config.bcrypt.saltRounds;
const bcrypt            = require('bcrypt');
const jsonDiff          = require('jsondiffpatch')
const pm2               = require('pm2')
const send              = require('koa-send')
{% endblock %}

{% block methodFunction %}
    hostPath() {
        if (process.env.DEV)
            return `http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
        else
            return `https://${process.env.SERVER_HOST}`
    }

    clientPath() {
        if (process.env.DEV)
            return `http://${process.env.SERVER_HOST}:${process.env.CLIENT_PORT}`
        else
            return `https://${process.env.SERVER_HOST}`
    }


    async getCompany( {body, ctx} ) {
        const Company = mob.get('data/company')
        const company = await Company.findOne( { ctx, table: 'company', noCheck: true, auth: true, query: {} } )

        ctx.body = { data: company }
    }

    async sendConfirmMail( {to, body, ctx, user, confirmId} ) {
        const link = `${ this.clientPath() }/confirm/${confirmId}`
        this.sendMail( { body: {
            email: to,
            subject: 'Bitte bestätigen Sie Ihre E-Mail Adresse',
            text: `Um Ihre E-Mail Adresse zu bestätigen klicken Sie bitte auf den folgenden Link: ${link}`
        }, ctx: ctx } )
    }

    async stopProcess( {body, ctx} ) {
        if ( body.process !== undefined )
            pm2.stop(body.process)
    }

    async restartProcess( {body, ctx} ) {
        if ( body.process !== undefined )
            pm2.restart(body.process)
    }

    async getLogFilePM2( {body, ctx} ) { 
        const path = body.path

        function readFile () {
            return new Promise((resolve, reject) => {
                let chunk = ''
                const readStream = fs.createReadStream(path, {
                    start: (fs.statSync(path).size - 1000000 >= 0) ? ( fs.statSync(path).size - 1000000 ) : 0
                });
    
                readStream.on('data', data => {
                    chunk += data.toString()
                });
    
                readStream.on('end', ( data ) => {
                    resolve(chunk)
                });
            })
        }
        
        let data = await readFile()

        ctx.body = { data: { data: data } }
        
    }

    async sendMail ( { body, ctx } ) {
        try {
            const email = config.email;
            const options = {
                "host": process.env.MAIL_HOST,
                "port": process.env.MAIL_PORT,
                "auth": {
                    "user": email,
                    "pass": process.env.MAIL_PASSWORD
                }
            }

            debug('Mail send')

            let transporter = nodemailer.createTransport(options);

            const mailOptions = {
                from:           email,
                to:             body.email,
                subject:        body.subject,
                text:           body.text,
                attachments:    body.attachments
            };

            const info = await transporter.sendMail(mailOptions);

            if ( ctx )
                if ( info.messageId )
                    ctx.body = { data: 'ok' }
                else
                    ctx.body = { error: 'ok' }
           

        } catch (error) {
            debug('custom sendMail error: ' + error)
            if (ctx)
                ctx.body = {error: '' + error}
        }
    }
{% endblock %} 