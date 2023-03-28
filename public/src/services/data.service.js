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
                message: error.message || 'Fehler beim speichern',
                type: 'error',
            })
            return null
        }
    },
    confirmRegister: async (_id) => {
        try {
            const result = await api({
                method: 'POST',
                url: '/custom/main/confirmRegister',
                data: { _id }
            })

            return result.data?.data || null
        } catch (error) {
            global.Note({
                message: `Fehler ${error}`,
                type: 'error',
            })
        }
    },
    register: async (body) => {
        try {
            const result = await api({
                method: 'POST',
                url: '/auth/register',
                data: { body},
            })

            if ( result.error ) {
                global.Note({
                    message: result.error,
                    type: 'error',
                })

                return null
            }else
                global.Note({
                    message: 'Registrierung erfolgreich, bitte bestätigen Sie Ihre E-Mail Adresse',
                    type: 'success',
                })

            return result.data.data
        } catch (error) {
            global.Note({
                message: 'E-Mail Adresse wurde bereits registriert',
                type: 'error',
            })
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
    downloadFile: async ( {endpoint, action, body, suffix} ) => {
        const result = await api({
            method: 'POST',
            url: `/custom/${endpoint}/${action}`,
            data: body,
            responseType: 'arraybuffer'
        })

        if ( result.error ) {
            global.Note({
                message: result.data?.error || 'Error no data',
                type: 'error',
            })

            return null
        }else {
            const type      =  `application/${suffix || 'pdf'}`

            if ( !suffix ) {
                const status = exportFile(
                    body.filename || `${uid()}.pdf`,
                    result.data,
                    'text/pdf'
                  )
            }

            if ( suffix === 'csv' ) {
                const status = exportFile(
                    body.filename,
                    result.data,
                    'text/csv'
                  )
            }
        }
    },
    sendMail: async (body) => {
        const result = await api({
            method: 'POST',
            url: '/custom/main/sendMail',
            data: body,
        })

        if ( result.data?.error ) {
            global.Note({
                message: result.data?.error || 'Error send mail',
                type: 'error',
            })

            return false
        } else {
            global.Note({
                message: 'EMail erfolgreich gesendet',
                type: 'success',
            })
            return true
        }
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
                throw ('Login failed')

        } catch (error) {
            global.Note({
                message: error.response.data.error || 'Fehler beim Login',
                type: 'error',
            })
            log('Fehler beim Login', error)
            return { error }
        }
    },
    checkAuth : async (token) => {
        try {
            const result = await api({
                method: 'POST',
                url: '/auth/check'
            })

            return result
        } catch (error) {
            return { error }
        }
    },
    // downloadInvoice: async (filename) => { 
    //     const result = await api({
    //         method: 'POST',
    //         url: '/custom/pdf/downloadInvoice',
    //         data: { filename },
    //         responseType: 'arraybuffer'
    //     })

    //     if ( result.status === 201 ) {
    //         global.Note({
    //             message: result.data?.error || 'Error',
    //             type: 'error'
    //         })

    //         return null
    //     }else {
    //         const url = window.URL.createObjectURL(new Blob([result.data], {type: 'application/pdf'}))
    //         window.open(url);
    //     }
    // },
    dataSave: async ({ endpoint, data }) => {
        try {
            const result = await api({
                method: 'POST',
                url: `/data/${endpoint}/update`,
                data
            })

            if ( !result.error )
                global.Note({
                    message: 'Daten erfolgreich gespeichert',
                    type: 'success',
                })
            else
                global.Note({
                    message: 'Fehler beim speichern',
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
    },
    uploadFile: async ({body}) => {
        const result = await api({
            method: 'POST',
            url: '/custom/main/uploadFile',
            data: body
        })

        if ( !result.data.error ) {
            global.Note({
                message: 'Datei erfolgreich hochgeladen',
                type: 'success',
            })
            return result.data.data
        } else {
            global.Note({
                type: 'error',
                message: result.data.error || 'Fehler beim hochladen der Datei'
            })
            return null
        }
    },

    deleteFile: async (data) => {
        const result = await api({
            method: 'POST',
            url: '/custom/main/deleteFile',
            data
        })

        if ( !result.data.error ) {
            global.Note({
                message: 'Datei erfolgreich gelöscht',
                type: 'success',
            })
            return result.data.data
        } else {
            global.Note({
                type: 'error',
                message: result.data.error || 'Fehler beim löschen der Datei'
            })
            return null
        }
    }
        
}