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


class main extends Custom { 
        
            constructor() {
                super();
            }
        

        
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
        const company = await Company.findOne( { ctx, noCheck: true, auth: true, query: {} } )

        ctx.body = company
    }

        
        //======= begin custom auth methods =======
async stopProcess ( {body, ctx} ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
        if ( body.process !== undefined )
            pm2.stop(body.process)
    }
async resetProcess ( {body, ctx} ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
        if ( body.process !== undefined )
            pm2.reset(body.process)
    }
async restartProcess ( {body, ctx} ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
        if ( body.process !== undefined )
            pm2.restart(body.process)
    }
async getLogFilePM2 ( {body, ctx} ) {
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} } 
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
if((!ctx || !ctx.auth) && (!auth || typeof auth !== 'boolean')) { if (ctx) {ctx.body = {error: 'Not Authorized'}} return {error: 'Not Authorized'} }
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


        //======= end custom auth methods =======
        
}

module.exports = main