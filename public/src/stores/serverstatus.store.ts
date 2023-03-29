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

export const serverstatusStore = defineStore('serverStatus', {
    state: () => ({
        _data: <any> [],
        _record: <any> {},
        _loading: false,
    }),
    getters: {
        data: (state) => state._data,
        record: (state) => state._record,
        loading: (state) => state._loading,
    },
    actions: {
        async init () {
            this._loading = true
        
            const useSocketStore    = socketStore()
            const { io }: any       = storeToRefs(useSocketStore)
            const useMainStore      = mainStore()
            const betterName        = (name: any) => { return (name.charAt(0).toUpperCase() + name.slice(1)).split(/(?=[A-Z])/).join(' ') }

            io.value.on('serverStatus', ( { data, params }: any ) => {
                this._record = data;
                this._data = []
                const that = this
                let count = 0
                function objectEntries(obj: any, count: number) {
                    count++
                    if (obj) {
                        const data = Object.entries(obj);
                        data.forEach((item: any) => {
                            
                            if (typeof item[1] === 'object') {
                                that._data.push([betterName(item[0]), 'group', count]);
                                objectEntries(item[1], count);
                            } else {
                                item.push(count)
                                item[0] = betterName(item[0])
                                that._data.push(item);
                                
                            }
                        })
                    }
                }

                objectEntries(data, count);

            })
        }
    }
})
