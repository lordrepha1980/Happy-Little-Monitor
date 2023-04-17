import { api }                  from 'src/boot/axios'
import Global                   from 'src/helpers/Global'
import { uid, exportFile }      from 'quasar'
import moment                   from 'moment'
import debug                    from 'debug'
const log                       = debug('app:data.service')
const global                    = Global({})
export const dataService = {
    async setAxoisHeader( token ) { 
        if ( token )
            api.defaults.headers.common.Authorization = `Bearer ${token}` 
        else
            api.defaults.headers.common.Authorization = ''
    },
    dataApi: async ( { endpoint, action, data } ) => {
        try {
          
            const result = await api({
                method: 'POST',
                url: `/data/${endpoint}/${action}`,
                data
            })

            if ( result.data?.error ) {
                global.Note({
                    message: result.data?.error || 'Error no data',
                    type: 'error'
                })

                return null
            }

            return result.data
        } catch (error) {
       
            global.Note({
                message: error.message || 'Error saving',
                type: 'error',
            })
            return null
        }
    },
    customApi: async ( {endpoint, action, body} ) => {
        log(body)
        const result = await api({
            method: 'POST',
            url: `/custom/${endpoint}/${action}`,
            data: body,
        })

        if ( result.data?.error ) {
            global.Note({
                message: result.data?.error || 'Error no data',
                type: 'error',
            })

            return null
        }

        return result.data.data
    },
    relogin: async (body) => {
        try {
            const result = await api({
                method: 'POST',
                url: '/auth/check',
                headers: { Authorization: `Bearer ${body.token || null}` }
            })

            return result?.data || null

        } catch (error) {
            log('Relogin error', error)
        }
    },
    login: async (body) => {
        try {
            const result = await api({
                method: 'POST',
                url: '/auth/signin',
                data: {
                    body
                },
            })
            if ( !result.data.error ) {
                global.Note({
                    message: 'Login successful',
                    type: 'success',
                })

                return result?.data?.data?.token || null
            }else
                throw ('Error logging')

        } catch (error) {
            global.Note({
                message: error.response.data.error || 'Error logging',
                type: 'error',
            })
            log('Error logging', error)
            return { error }
        }
    },
    dataSave: async ({ endpoint, data }) => {
        try {
            const result = await api({
                method: 'POST',
                url: `/data/${endpoint}/update`,
                data
            })

            if ( result.error )
                global.Note({
                    message: 'Error while saving',
                    type: 'error',
                })

            return result.data
        } catch (error) {
            global.Note({
                message: error.response.data.error || 'Fehler beim speichern',
                type: 'error',
            })
        }
    },
    dataDelete: async ({ endpoint, data }) => {
        try{
            const result = await api({
                method: 'POST',
                url: `/data/${endpoint}/delete`,
                data
            })

            if ( !result.data.data.error )
                global.Note({
                    message: 'Daten erfolgreich gelöscht',
                    type: 'success',
                })
            else
                global.Note({
                    message: result.data.data.error || 'Fehler beim löschen',
                    type: 'error',
                })

            return result.data.data
        } catch (error) {
            global.Note({
                message: error,
                type: 'error',
            })
        }
    }
}