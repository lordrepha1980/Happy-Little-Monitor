import { defineStore, storeToRefs }  from 'pinia'
import { dataService }  from 'src/services/data.service'
import { extend }       from 'quasar'
import { IUserData, mainStore } from './main.store'
import { socketStore }  from './socket.store'

export interface ILogStore { 
    selectedId: string,
    coll: string
}

export const accountStore = defineStore('account', {
    state: () => ({
        _data: <IUserData> {},
        _record: <IUserData> {},
        _form: null,
        _logStore: <ILogStore | null> null,
    }),
    getters: {
        data: (state) => state._data,
        record: (state) => state._record,
        logStore: (state) => state._logStore
    },
    actions: {
        async init () {
            const useSocketStore    = socketStore()
            const { io }: any   = storeToRefs(useSocketStore)

            io.value.on('update:user', ( user: IUserData ) => {
                this._data = user;
                this._record = user;
            })
        },
        async getData() {
            const useMainstore = mainStore()
            const username = await useMainstore.getCookie({ key: 'username' }) || ''
            const result = await dataService.dataApi( { endpoint: 'user', action: 'findOne', data: { query: { username  }, table: 'user' } })

            if ( result?.data ) {
                if ( result.data.nginxStatus === undefined )
                    result.data.nginxStatus = true
                    
                this._data = result.data
                this._record = extend(true, {}, result.data)
            }

        },
        async save() {
            const validForm = await this._form.methods.validate()

            if ( validForm )
                await dataService.dataSave( { endpoint: 'user', data: { body: this._record, table: 'user' } })
        },
        setLogStore(store?: ILogStore | null) {     
            this._logStore = store || null
        }
    }
})
