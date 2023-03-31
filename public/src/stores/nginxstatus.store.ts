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

            io.value.on('nginxStatus', ( { data }: any ) => {
                this._record = data;
            })
        }
    }
})
