import { defineStore, storeToRefs }  from 'pinia'
import { dataService }  from 'src/services/data.service'
import { extend, Loading, QSpinnerGrid}       from 'quasar'
import { mainStore } from './main.store'
import { socketStore }  from './socket.store'
import Global from 'src/helpers/Global.js'
import { debug } from 'debug'
const global = Global({})
const log = debug('app:process.store')

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
        _loading: <boolean> false,
        _showServerStatusDialog: <boolean> false,
        _datapoints: <any> {}
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
        loading: (state) => state._loading,
        showServerStatusDialog: (state) => state._showServerStatusDialog,
        datapoints: (state) => state._datapoints,
    },
    actions: {
        async init () {
            this._loading = true
            Loading.show({
                spinner: QSpinnerGrid,
                spinnerColor: 'primary',
                spinnerSize: 80
              })
            const useSocketStore    = socketStore()
            const { io }: any       = storeToRefs(useSocketStore)
            const useMainStore      = mainStore()

            io.value.on('process', ( { data, params }: any ) => {
                this._processesOffline = 0
                this._processesOnline = 0

                params.chartpoints.forEach( (point: any) => { 
                    if ( this._datapoints[point.name] === undefined )
                        this._datapoints[point.name] = {}

                    this._datapoints[point.name][point.type] = point.value
                })

                data.forEach( (proc: any) => {
                    log('memory', proc.name, proc.monit.memory)
                    log('cpu', proc.name, proc.monit.cpu)

                    if ( proc.pm2_env.status === 'online' )
                        this._processesOnline += 1
                    else
                        this._processesOffline += 1
                });
                this._data = data
                this._serverParams = params

                useMainStore.setReceive()
                Loading.hide()
                this._loading = false
                //TODO set receive after x seconds to false
            })
        },
        calcMemory (mem: number, returnNumber?: boolean) { 
            const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

            let l = 0, n = mem || 0;

            while(n >= 1024 && ++l) {
                n = n / 1024;
            }
            
            if ( !returnNumber )
                return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
            else
                return parseInt(n.toFixed(n < 10 && l > 0 ? 1 : 0))
        },
        setRecord ({ id, name, errorPath, outPath }: { id: number, name: string, errorPath: string, outPath: string }) {
            this._recordId = id
            this._recordName = name
            this._errorPath = errorPath
            this._outPath = outPath
        },
        setShowServerStatusDialog() {
            this._showServerStatusDialog = !this._showServerStatusDialog
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
