<template>
    <div>
        <ag-grid-vue
            class="ag-theme-balham"
            :style="{height: fixHeight ? `${fixHeight}px` : `calc(100vh - ${subHeight}px)`}"
            :columnDefs="columns"
            :rowData="data"
            :defaultColDef="defaultColDef"
            :localeText="localeText"
            rowSelection="single"
            animateRows="true"
            @grid-ready="onGridReady"
            @row-clicked="onRowClicked"
            @cell-clicked="onCellClicked"
            @row-double-clicked="onRowDblClicked"
            :getRowNodeId="getRowNodeId"
            :rowClassRules="rowClassRules"
        />
        <cust-dialog 
            v-if="showDialog" 
            :show="showDialog" 
            @close="showDialog = false"
            headerText="Löschen"
        >
            <template #content>
                <div class="row q-col-gutter-xs">
                    <div class="col-12">
                        <p>Möchten Sie den Datensatz wirklich löschen?</p>
                        <p class="text-red-9 text-bold">Dieser Vorgang kann nicht Rückgängig gemacht werden!</p>
                    </div>
                    <div class="col-6">
                        <cust-button label="Löschen" :timer="true" :click="clickDelete" :val="true" />
                    </div>
                    <div class="col-6">
                        <cust-button label="Vorgang abbrechen" :outline="false" color="red-9" textColor="white" :click="clickDelete" :val="false" />
                    </div>
                </div>
            </template>
        </cust-dialog>
    </div>
</template>
<script lang="ts" setup>
import { onBeforeMount, onMounted, onBeforeUnmount, ref }               from 'vue'
import { AgGridVue }                        from 'ag-grid-vue3'
import { defineStore, storeToRefs, getActivePinia }         from 'pinia'
import CustDialog                           from 'src/components/custom/dialog.vue'
import CustButton                           from 'src/components/custom/button.vue'
import { socketStore }                      from 'src/stores/socket.store'
import { extend }                           from 'quasar'
import { mainStore }                        from 'src/stores/main.store'
import { dataService }                      from 'src/services/data.service'
import Global                               from 'src/helpers/Global'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.min.css'
import debug                                from 'debug';
const log                                   = debug('app:componentes:aggrid');

const props = defineProps({
    columns: {
        type: Object
    },
    storeName: {
        type: String
    },
    subHeight: {
        type: Number,
        default: 0
    },
    fixHeight: {
        type: Number,
        default: 0
    },
    rowClassRules: {
        type: Object
    },
    loadData: {
        type: Boolean,
        default: true
    },
    filter : {
        type: Object
    },
})

const global = Global({})

const useMainStore          = mainStore()
const { user }              = storeToRefs(useMainStore)
const showDialog            = ref(false)
const deleteQuery:any       = ref(null)

const defaultColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    floatingFilter: true,
    suppressMenu: true,
    floatingFilterComponentParams: { 
        suppressFilterButton: true 
    },
};

let store: any = null
let data: any = []

onBeforeMount( async () => {
    if ( props.storeName ) {
        const useStore = defineStore(props.storeName, {})
        store = useStore()
        const refs = storeToRefs(store)
        data = refs.data
        log('render grid', refs.data)
        if ( store.init )
            await store.init()
    }
} )

onBeforeUnmount( () => {
    if ( props.storeName ) {
        const useStore = defineStore(props.storeName, {})
        store = useStore()
        store._record = {}
        store._data = []
        store._grid = null
        const pinia     = getActivePinia()
        const stores    = getActivePinia()._s

        stores.forEach ( (store: any) => {
            if (props.storeName === store.$id ) {
                store.$dispose()
                delete pinia.state.value[store.$id]
            }
        } )
    }
} )

const onGridReady = async (params: any) => {
    if (store) {
        store._grid = params

        store._grid.updateItem = async ({ record }: {record: Record<string, any>}) => {

            const index = store._data.findIndex(( data: any ) => {
                return data._id === record._id
            })

            let filterOk = true
            
            if ( props.filter ) {
                for (const [key, value] of Object.entries(props.filter)) {
                    if (value.$exists === true) {
                         if ( !record[key] )
                            filterOk = false
                    }

                    if (value.$exists === false) {
                         if ( record[key] )
                            filterOk = false
                    }
                }
            }

            if ( filterOk )
                if ( index > -1 ) {
                    store._data.splice(index, 1, record)
                    //TODO: check if this is needed
                    store._data = extend( true, [], store._data )
                } else
                    store._data.push(record)

            setTimeout(() => {
                const rowNode = store._grid.api.getRowNode(record._id)
                if ( rowNode )
                    rowNode.setData(record)

                store._grid.api.forEachNode( (node: any) => {
                    if ( node.data._id === store._record._id ) {
                        node.setSelected(true)
                    }
                } )
            })
        }

        store._grid.deleteItem = async ({ record }: {record: Record<string, any>}) => {
            
            const index = store._data.findIndex(( data: any ) => {
                return data._id === record._id
            })
            if ( index > -1 )
                store._data.splice(index, 1)
    
            store._grid.api.setRowData(store._data)

            if ( store._record._id === record._id ) {
                store._record = {}
            }

            setTimeout(() => {
                store._grid.api.forEachNode( (node: any) => {
                    if ( node.data._id === store._record._id ) {
                        node.setSelected(true)
                    }
                } )
            })

            if( store._form )
                store._form.methods.reset()
        }
        
        //init socket
        const useSocketStore = socketStore();

        useSocketStore.io.on(`update:${store._stateName}`, async (data: any) => {
            log(`update:${store._stateName}`, data)
            let result = true

            if (store.beforeUpdate)
                result = await store.beforeUpdate(data)

            if (result)
                store._grid.afterUpdate(data)
        })
        useSocketStore.io.on(`delete:${store._stateName}`, (data: any) => {
            log(`delete:${store._stateName}`, data)
            store._grid.afterDelete(data)
        })

        //lade daten
        if ( props.loadData )
            await store.getData({ filter: props.filter || null })

        store._grid.api.setRowData(extend(true, [], store._data))

        store._grid.afterUpdate = ( data: any ) => {
            store._grid.updateItem({record: data})
        }

        store._grid.afterDelete = async ( data: any ) => {
            store._grid.deleteItem({record: data})
        }

        store._grid.newRecord = ( data: any ) => {
            data.rootId = user.value.rootId
            store._data.unshift(data)
            store._grid.api.setRowData(store._data)
            setTimeout(() => {
                store._grid.api.selectIndex(0)
                if( store._form )
                    store._form.methods.reset()
            })
            store._record = data
        }

        store._grid.saveRecord = async ( { type, query  }: { record: any, type?: string, query: any } ) => {
            const validForm = store._form ? await store._form.methods.validate() : true

            if (!store._record._id) {
                global.Note({
                    type: 'error',
                    message: 'Wählen Sie einen Datensatz aus', 
                    timeout: null
                } )
                return false
            }

            if ( validForm && user.value.rootId ) {
                if ( !query.data.body.rootId)
                    query.data.body.rootId = user.value.rootId

                const result = await dataService.dataSave( query )
                if ( result?.data ) {
                    store._grid.updateItem({record: result.data})
                    return true
                }
            }
        }

        store._grid.deleteRecord = async ( { query }: { query: any } ) => {
            
            if ( query?.data?.query?._id ) {
                deleteQuery.value   = query
                showDialog.value    = true
            }else
                global.Note({
                    type: 'error',
                    message: 'Wählen Sie einen Datensatz den Sie löschen möchten',
                    timeout: null 
                } )
        }
    }
};
async function clickDelete ( props: any, val: any ) {
    showDialog.value = false

    if ( val ) {
        const result = await dataService.dataDelete( deleteQuery.value )
        store._grid.afterDelete(result.query)
        deleteQuery.value = null
    }
}

const getRowNodeId = (data: any) => {
    return data._id;
};

const onRowClicked = (params: any) => {
    if (store) {
        store._record = extend(true, {}, params.data )
    }
    
    if (store?.onRowClicked) {
        store.onRowClicked(params)
    }

    setTimeout(() => {
        if( store._form )
            store._form.methods.reset()
    })
};

const onCellClicked = (params: any) => {
    if (store?.onCellClicked) {
        store.onCellClicked(params)
    }
};

const onRowDblClicked = (params: any) => {
    if (store?.onRowDblClicked) {
        store.onRowDblClicked(params)
    }
};

const localeText    =  {
    // for filter panel
    page:           'Seite',
    more:           'mehr ...',
    to:             'bis',
    of:             'von',
    next:           'Nächster',
    last:           'Letzter',
    first:          'Erster',
    previous:       'Vorheriger',
    loadingOoo:     'Daten werden geladen ...',

    // for set filter
    selectAll:      'Alle auswählen',
    searchOoo:      'Suche ...',
    blanks:         'Leer',

    // for number filter and text filter
    filterOoo:      'Filter',
    applyFilter:    'Filter anwenden',

    // for number filter
    equals:         'Gleich ...',
    notEqual:       'Nicht gleich ...',
    notEquals:      'Nicht gleich ...',
    lessThan:       'Kleiner als ...',
    lessThanOrEqual: 'Kleiner oder gleich als ...',
    greaterThanOrEqual: 'Größer oder gleich als ...',
    greaterThan:    'Größer als ...',

    // for text filter
    contains:       'Kommt vor ...',
    startsWith:     'Beginnt mit ...',
    endsWith:       'Endet mit ...',
    notContains:    'Kommt nicht vor ...',

    // the header of the default group column
    group:          'Gruppe',

    // tool panel
    columns:        'Spalte',
    rowGroupColumns: 'Pivot Gruppe',
    rowGroupColumnsEmptyMessage: 'Spalten hier hin ziehen.',
    valueColumns:   'Spaltenwerte',
    valueColumnsEmptyMessage: 'Bitte Spalten hier hin ziehen.',

    // other
    noRowsToShow:   'Keine Daten',

    andCondition: 'UND',
    orCondition: 'ODER',

    // enterprise menu
    toolPanel:      'Toolpanel',
    pinColumn:      'Spalte fixieren',
    valueAggregation: 'Aggregationswert',
    autosizeThiscolumn: 'Automatische Breite (diese Spalte)',
    autosizeAllColumns: 'Automatische Breite (alle Spalten)',
    groupBy:        'Gruppiert nach:',
    ungroupBy:      'Gruppierung auflösen',
    resetColumns:   'Spalten zurücksetzen',
    expandAll:      'Alle öffnen',
    collapseAll:    'Alle schließen',

    // enterprise menu pinning
    pinLeft:        'Links fixieren <<',
    pinRight:       'Rechts fixieren >>',
    noPin:          'Fixierung aufheben <>',

    // enterprise menu aggregation and status panel
    sum:            'Summe',
    min:            'Min',
    max:            'Max',
    none:           'Nichts',
    count:          'Anzahl',
    average:        'Durchschnitt',

    // standard menu
    copy:           'Kopieren',
    ctrlC:          'ctrl n C',
    paste:          'Einfügen',
    ctrlV:          'ctrl n V'
};

</script>
