import { defineStore, storeToRefs }  from 'pinia'
import { dataService }  from 'src/services/data.service'
import { extend }       from 'quasar'
import { mainStore } from './main.store'
import { socketStore }  from './socket.store'
import Global from 'src/helpers/Global.js'
const global = Global({})

export interface ILogStore { 
    selectedId: string,
    coll: string
}

export const processesStore = defineStore('processes', {
    state: () => ({
        _data: <any> [],
        _record: <any> {},
        _monit: <any> {},
        _recordId: <number | null> null,
        _serverParams: <any> {},
        _openLogProcess: <boolean> false,
        _selectedLogFile: <string> '',
        _recordName: <string> '',
        _errorPath: <string> '',
        _outPath: <string> '',
        _interVal: <any> null,
        _logTimer: <any> null,
        _timer: <number> 0,
        _showConfirmActionDialog: <boolean> false,
        _confirmActionDialogType: <string> '',
        _processesOnline: <number> 0,
        _processesOffline: <number> 0,
    }),
    getters: {
        data: (state) => state._data,
        record: (state) => state._record,
        monit: (state) => state._monit,
        recordId: (state) => state._recordId,
        serverParams: (state) => state._serverParams,
        openLogProcess: (state) => state._openLogProcess,
        selectedLogFile: (state) => state._selectedLogFile,
        recordName: (state) => state._recordName,
        errorPath: (state) => state._errorPath,
        outPath: (state) => state._outPath,
        logTimer: (state) => state._logTimer,
        timer: (state) => state._timer,
        showConfirmActionDialog: (state) => state._showConfirmActionDialog,
        confirmActionDialogType: (state) => state._confirmActionDialogType,
        processesOnline: (state) => state._processesOnline,
        processesOffline: (state) => state._processesOffline,
    },
    actions: {
        async init () {
            const useSocketStore    = socketStore()
            const { io }: any       = storeToRefs(useSocketStore)
            const useMainStore      = mainStore()

            io.value.on('process', ( { data, params }: any ) => {
                this._processesOffline = 0
                this._processesOnline = 0
                data.forEach( (proc: any) => {
                    if ( proc.pm2_env.status === 'online' )
                        this._processesOnline += 1
                    else
                        this._processesOffline += 1
                });
                this._data = data
                this._serverParams = params
                useMainStore.setReceive()
                //TODO set receive after x seconds to false
            })
        },
        setRecord ({ id, name, errorPath, outPath }: { id: number, name: string, errorPath: string, outPath: string }) {
            this._recordId = id
            this._recordName = name
            this._errorPath = errorPath
            this._outPath = outPath
        },
        setShowConfirmActionDialog(btn?: any) {
            if (this._recordId === null) {
                global.Note({
                    type: 'error',
                    message: 'No process selected',
                    timeout: 3000
                })
                return
            }
            this._showConfirmActionDialog = !this._showConfirmActionDialog

            if ( this._showConfirmActionDialog && btn )
                this._confirmActionDialogType = btn.type
            else
                this._confirmActionDialogType = ''
        },
        confirmedAction() {
            switch (this._confirmActionDialogType) {
                case 'restart':
                    this.restartProcess()
                    break
                case 'stop':
                    this.stopProcess()
                    break
                case 'reset':
                    this.resetProcess()
                    break
            }
        },
        async stopProcess() {
            const result = await dataService.customApi( { endpoint: 'main', action: 'stopProcess', body: { process: this._recordId }  } )
            this.setShowConfirmActionDialog()
        },
        async restartProcess() {
            const result = await dataService.customApi( { endpoint: 'main', action: 'restartProcess', body: { process: this._recordId } } )
            this.setShowConfirmActionDialog()
        },
        async resetProcess() {
            const result = await dataService.customApi( { endpoint: 'main', action: 'resetProcess', body: { process: this._recordId } } )
            this.setShowConfirmActionDialog()
        },
        async logProcess(type: string) {
            this._timer = 0
            const path = type === 'out' ? this._outPath : this._errorPath
            const result = await dataService.customApi( { endpoint: 'main', action: 'getLogFilePM2', body: { path } } )

            if ( result.data ) 
                this._selectedLogFile = result.data
        },
        setOpenLogProcess(btn: any) { 
            if (this._recordId === null) {
                global.Note({
                    type: 'error',
                    message: 'No process selected',
                    timeout: 3000
                })
                return
            }

            this._openLogProcess = !this._openLogProcess
            if ( !this._openLogProcess ) {
                clearInterval(this._interVal)
                clearInterval(this._logTimer)
                this._selectedLogFile = ''
            }

            if ( this._openLogProcess ) {
                this.logProcess(btn.type)
                this._interVal = setInterval(() => {
                    this.logProcess(btn.type)
                }, 10000)

                this._logTimer = setInterval(() => {
                    this._timer = this._timer + 1
                }, 1000)
            }

        }
    }
})
