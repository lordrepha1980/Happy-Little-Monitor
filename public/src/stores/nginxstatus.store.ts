import { defineStore, storeToRefs }  from 'pinia'
import { dataService }  from 'src/services/data.service'
import { extend, Loading, QSpinnerGrid}       from 'quasar'
import { mainStore } from './main.store'
import { socketStore }  from './socket.store'
import Global from 'src/helpers/Global.js'
const global = Global({})

export interface ILogStore { 
    selectedId: string,
    coll: string
}

export const nginxStatusStore = defineStore('nginxStatus', {
    state: () => ({
        _data: <any> [],
        _record: <any> {},
        _nginxLogAggCountIP: <any> {},
        _nginxLogAggDayHourCount: <any> {}
    }),
    getters: {
        data: (state) => state._data,
        record: (state) => state._record,
        nginxLogAggCountIP: (state) => state._nginxLogAggCountIP,
        nginxLogAggDayHourCount: (state) => state._nginxLogAggDayHourCount
    },
    actions: {
        async init () {
            const useSocketStore    = socketStore()
            const { io }: any       = storeToRefs(useSocketStore)

            io.value.on('nginxStatus', ( { data }: any ) => {
                this._record = data;
            })

            io.value.on('nginxLogAggCountIP', ( { data }: any ) => {
                this._nginxLogAggCountIP = data;
            })

            io.value.on('nginxLogAggDayHourCount', ( { data }: any ) => {
                this._nginxLogAggDayHourCount = data;
            })
        }
    }
})
