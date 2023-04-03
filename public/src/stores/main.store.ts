import { defineStore }          from 'pinia'
import { dataService }          from 'src/services/data.service'
import { LocalStorage }         from 'quasar'
import { useRouter, useRoute }  from 'vue-router'
import { socketStore }          from './socket.store'
import moment                   from 'moment'
import Global                   from 'src/helpers/Global'
import { time } from 'console'

export interface ICompany {
    _id: string
    name: string
    city: string
    zip: string
    street: string
}

export interface ILoginData {
    username: string
    password: string
}

export interface IUserData {
    _id: string,
    username?: string,
    password?: string
}

export const mainStore = defineStore('main', {
    state: () => ({
        _company: <ICompany | null> null,
        _token: <string | null> null,
        _user: <IUserData> {},
        _receive: <boolean> false,
        _connected: <boolean> false,
    }),
    getters: {
        company: (state) => state._company,
        token: (state) => state._token,
        user: (state) => state._user,
        receive: (state) => state._receive,

    },
    actions: {
        setReceive() {
            setInterval(() => {
                this._receive = !this._receive  
            }, 1000)
        },
        async getCompany() {
            const data = await dataService.customApi({ endpoint: 'main', action: 'getCompany' })
            this._company = data
        },
        async relogin() {
            const token = await this.getCookie({ key: 'token' })
            const date = await this.getCookie({ key: 'date' })
            this._token = token
            this.setAxiosHeader()
            if ( token && date && ( date > moment().format('YYYY-MM-DD HH:mm:ss') ) ) {
                const valid = await dataService.relogin({ token })

                if ( valid ) {
                    const username = await this.getCookie({ key: 'username' }) || ''
                    await this.getUser({ username })
                    return true
                }
            } 
            this.removeCookie({ key: 'token' })
            this.removeCookie({ key: 'username' })
            this.removeCookie({ key: 'date' })
            
            this.router.push('/')
            return false
        },
        async login( {username, password}: ILoginData ) {
            const router    = useRouter()
            const token     = await dataService.login({username, password})

            if ( !token.error ) {
                this._token     = token

                await this.setCookie({ key: 'token', value: token})
                await this.setCookie({ key: 'username', value: username})
                await this.setCookie({ key: 'date', value: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')})
                await this.setAxiosHeader()
                await this.getUser({ username })
            } else {
                this._token     = ''
            }

            if ( this._token )
                this.router.push('/app/processes')
        },
        async logout() {
            this.removeCookie({ key: 'token' })
            this.removeCookie({ key: 'username' })
            this.removeCookie({ key: 'date' })
            this._token     = ''
            this._user      = {}
            this.setAxiosHeader()
            this.router.push('/')
        },
        async setAxiosHeader() {
            await dataService.setAxoisHeader( this._token )
        },
        async setCookie( { key, value, options }: { key: string, value: string, options?: any } ) {
            if (!options)
                options = { maxAge: 24 * 60 * 60 * 1000 }
                LocalStorage.set(key, value)
        },
        async getCookie( { key }: { key: string } ) {
            return LocalStorage.getItem(key)
        },
        async removeCookie( { key }: { key: string } ) {
            return LocalStorage.remove(key)
        },
        async getUser( { username, readCookie }: { username?: string, readCookie?: boolean } ) {
            if ( readCookie )
                username = await this.getCookie({ key: 'username' }) || ''

            const user = await dataService.dataApi( { 
                endpoint: 'user', 
                action: 'findOne', 
                data: { 
                    query: { username },
                    table: 'user'
                } 
            })
        }
    }
})
