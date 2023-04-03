import { defineStore, storeToRefs }  from 'pinia'
import { dataService }  from 'src/services/data.service'
import { extend, Loading, QSpinnerGrid}       from 'quasar'
import { mainStore } from './main.store'
import { socketStore }  from './socket.store'
import moment from 'moment'

import Global from 'src/helpers/Global.js'
const global = Global({})

export interface ILogStore { 
    selectedId: string,
    coll: string
}

export const networkStatusStore = defineStore('networkStatus', {
    state: () => ({
        _data: <any> [],
        _record: <any> {}
    }),
    getters: {
        data: (state) => state._data,
        record: (state) => state._record
    },
    actions: {
        async init () {
            const useSocketStore    = socketStore()
            const { io }: any       = storeToRefs(useSocketStore)

            io.value.on('networkStatus', ( { data }: any ) => {
                this._record = data;

                if ( this._data.length > 0 )
                    this._data[0] = data;
            })
        },
        async getData () {
            const result = await dataService.dataApi( { endpoint: 'network', action: 'find', data: { query: {month: {$gte: moment().subtract(6, 'months').format('YYYY-MM')} }, sort: { _id: -1 } } })

            if ( result.data )
                this._data = result.data
        }
    }
})
