<template>
    <cust-page v-if="!loading" :noGrid="true" :noMenu="true" :subScrollHeight="Platform.is.platform === 'iphone' ? 90 : 0">
        <template #header>
            <div class="row">
                <div class="col-6 text-subtitle2 text-primary">
                    <q-icon name="layers" />
                    Status
                </div>
                <div class="col-6 text-right">
                    <q-icon name="fas fa-server" color="red-5" size="10px" class="q-pr-xs" /> {{ processesOffline }}
                    <q-icon name="fas fa-server" color="green-5" size="10px" class="q-pl-md q-pr-xs" />{{ processesOnline }}
                </div>
            </div>
        </template>
        <template #content>
            <cust-input :disable="false" :stackLabel="false" label="Search" icon="search" v-model="useProcessesStore._processSearch"/>
            <cust-card class="q-mt-sm" v-if="accountRecord.nginxStatus || accountRecord.serverStatus || accountRecord.mongodbStatus">
                <template #content>
                    <div class="row text-h6 text-white flex items-center">
                        <template v-if="accountRecord.serverStatus">
                            <div class="col-12 text-caption text-primary">
                                Server
                                <q-separator dark />
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-brands fa-hive" size="20px" color="white" class="q-pr-sm"/>{{ serverParams.ip_address }}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-brands fa-node-js" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.node_version }} {{ serverParams.node_os }}
                            </div>
                            <div class="col-6 col-sm-3 ellipsis">
                                <q-icon name="fas fa-clock" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.server_uptime }}
                            </div>
                            <div class="col-6 col-sm-1 flex justify-end">
                                <q-btn color="primary" class="q-mt-sm" unelevated round icon="account_tree"  size="12px" text-color="dark"  @click="useProcessesStore.setShowServerStatusDialog" />
                            </div>
                        </template>
                        <template v-if="accountRecord.mongodbStatus">
                            <div class="col-12 text-caption text-primary q-py-sm">
                                MongoDB
                                <q-separator dark />
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-solid fa-database" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.mongoDB_connections?.current }} / {{ serverParams.mongoDB_connections?.available }}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fas fa-leaf" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.mongoDB_version }}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fas fa-clock" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.mongoDB_uptime }}
                            </div>
                        </template>
                        <template v-if="nginxRecord && !nginxRecord.error && nginxRecord.connections && accountRecord.nginxStatus" >
                            <div class="col-12 text-caption text-primary q-py-sm">
                                Nginx
                                <q-separator dark />
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-solid fa-arrow-right-to-city" size="20px" color="white" class="q-pr-sm"/> {{ nginxRecord.activeConnections }}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-solid fa-eye" size="20px" color="white" class="q-pr-sm"/> {{ nginxRecord.connections.reading}}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-solid fa-pencil" size="20px" color="white" class="q-pr-sm"/> {{ nginxRecord.connections.writing}}
                            </div>
                            <div class="col-6 col-sm-4 ellipsis">
                                <q-icon name="fa-solid fa-clock" size="20px" color="white" class="q-pr-sm"/> {{ nginxRecord.connections.waiting}}
                            </div>
                        </template>
                        <template v-else >
                            <div class="col-12 text-caption text-primary q-py-sm">
                                Nginx
                                <q-separator dark />
                            </div>
                            <div class="col-12  ellipsis">
                                <q-linear-progress dark rounded indeterminate color="primary" class="q-mt-sm" />
                            </div>
                        </template>
                    </div>
                </template>
            </cust-card>
            <q-separator dark class="q-pa-none"/>
            <q-list class="rounded-borders bg-grey-9 text-white">
                <template v-for="proc of processes" :key="proc.pm_id">
                    <q-expansion-item
                        style="flex: auto;"
                        v-if="proc.show"
                        :default-opened="accountRecord[proc.pm_id]"
                        @click="setExpand(proc.pm_id)"
                        icon="fas fa-server"
                        :label="proc.name"
                        :disableHeader="false" 
                        class="bg-dark q-mb-sm processesList"
                        dark
                    >
                        <template v-slot:header>
                            <q-item-section avatar>
                                <q-icon name="fas fa-server" v-if="proc.pm2_env.status !== 'online'" color="red-5" text-color="white" />
                                <q-icon name="fas fa-server" v-else color="green-5" text-color="white" />
                            </q-item-section>
                            <q-item-section class="text-h6 ellipsis">
                                {{ proc.name }}
                            </q-item-section>

                            <q-item-section side>
                                <div class="row items-center" >
                                    <div class="col-12 ellipsis flex items-center" v-if="proc.monit.memory" >
                                        <q-icon name="fas fa-memory" size="18px" class="q-pr-sm"/> {{useProcessesStore.calcMemory(proc.monit.memory)}}
                                    </div>  
                                </div>

                            </q-item-section>
                        
                        </template>
                    
                        <cust-card :menuBottom="true" >
                            <template #content v-if="proc.pm2_env.status === 'online'">
                                <div class="row text-h6 q-pb-md q-pl-xs q-col-gutter-xs">
                                    <div class="col-5 col-sm-4 ellipsis items-center" v-if="proc.monit.memory" >
                                        <q-icon name="fas fa-memory" size="18px" class="q-pr-sm q-pl-xs"/> {{useProcessesStore.calcMemory(proc.monit.memory)}}
                                        <div class="row">
                                            <div class="col-12">
                                                <sparkle-chart type="memory" :name="proc.name"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-4 col-sm-4 ellipsis items-center" v-if="proc.pm2_env.created_at">
                                        <q-icon name="fas fa-microchip" size="18px" class="q-pr-sm" /> <span :class="proc.monit.cpu !== undefined ? cpuColor(Math.round(proc.monit.cpu / 10)) : 0">{{proc.monit.cpu !== undefined ? Math.round(proc.monit.cpu / 10) : 0 }}%</span>
                                        <div class="row">
                                            <div class="col-12">
                                                <sparkle-chart type="cpu" :name="proc.name"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-3 col-sm-4 ellipsis items-center" v-if="proc.pm2_env.created_at">
                                        <q-icon name="refresh" size="20px" class="q-pr-sm"/> {{proc.pm2_env.restart_time}}
                                    </div>
                                </div>
                                <div class="row text-body1 q-pl-xs q-pb-sm">
                                    <div class="col-12 col-sm-6" :class="sshColor(proc.sshExpiry.date)" v-if="proc.pm2_env.created_at">
                                        SSH expired: {{moment(proc.sshExpiry.date).format('YYYY-MM-DD HH:mm')}}
                                    </div>
                                    <div class="col-12 col-sm-6" v-if="proc.pm2_env.created_at">
                                        SSH valid: {{proc.sshExpiry.valid}}
                                    </div>
                                    <div class="col-12 col-sm-6" v-if="proc.pm2_env.created_at">
                                        Created at: {{`${moment(proc.pm2_env.created_at).format('YYYY-MM-DD HH:mm')}` }}
                                    </div>
                                    <div class="col-12 col-sm-6" v-if="proc.pm2_env.created_at">
                                        Uptime: {{`${moment(proc.pm2_env.created_at).fromNow(proc.pm2_env.pm_uptime)}` }}
                                    </div>
                                </div>
                            </template>
                            <template #menuBottom>
                                <cust-menu :struct="menuItems" storeName="processes" @click="useProcessesStore.setRecord({id: proc.pm_id, name: proc.name, errorPath: proc.pm2_env.pm_err_log_path, outPath: proc.pm2_env.pm_out_log_path  })" />
                            </template>
                        </cust-card>
                    </q-expansion-item>
                </template>
            </q-list>
            
            <cust-dialog 
                v-if="showConfirmActionDialog" 
                :show="showConfirmActionDialog" 
                @close="useProcessesStore.setShowConfirmActionDialog"
                :headerText="`${confirmActionDialogType} - ${ recordName }`"
            >
                <template #content>
                    <div class="row q-col-gutter-xs">
                        <div class="col-12">
                            <p>This action can not be reversed. Are you sure you want to do this?</p>
                        </div>
                        <div class="col-6">
                            <cust-button label="Cancel" :click="useProcessesStore.setShowConfirmActionDialog" :val="true" />
                        </div>
                        <div class="col-6">
                            <cust-button label="Confirm" :outline="false" color="red-9" textColor="white" :click="useProcessesStore.confirmedAction" :val="false" />
                        </div>
                    </div>
                </template>
            </cust-dialog>
            <process-log-dialog v-if="openLogProcess" v-model="openLogProcess" />
            <server-status-dialog v-if="showServerStatusDialog" v-model="showServerStatusDialog" />
        </template>
    </cust-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick }              from 'vue'
import { mainStore }        from '../../stores/main.store';
import { storeToRefs }      from 'pinia';
import { useRouter }        from 'vue-router';
import CustButton           from 'src/components/custom/button.vue'
import CustCard             from 'src/components/custom/card.vue'
import CustInput            from 'src/components/custom/input.vue'
import CustMenu             from 'src/components/menu.vue'
import CustPage             from 'src/components/custom/page.vue'
import CustDialog           from 'src/components/custom/dialog.vue'
import { processesStore }   from 'src/stores/processes.store'
import { nginxStatusStore } from 'src/stores/nginxstatus.store'
import ServerStatusDialog   from 'src/components/serverStatusDialog.vue'
import SparkleChart         from 'src/components/sparkleChart.vue'
import { accountStore }     from 'src/stores/account.store'
import moment               from 'moment';
import { Platform }         from 'quasar'
import ProcessLogDialog     from 'src/components/processLogDialog.vue'
const useProcessesStore = processesStore()

const useAccountStore = accountStore()
const { record: accountRecord } = storeToRefs(useAccountStore)

const useNginxStatusStore = nginxStatusStore()
const { record: nginxRecord } = storeToRefs(useNginxStatusStore)
const { 
    data: processes, 
    serverParams,
    recordName,
    showConfirmActionDialog,
    confirmActionDialogType,
    processesOffline,
    processesOnline,
    loading,
    showServerStatusDialog,
    openLogProcess,
    processSearch
} = storeToRefs(useProcessesStore)

watch( processSearch, (val) => {
    useProcessesStore.setProcessSearch(val)
})

async function setExpand(item: string) {
    useAccountStore._record[item] = useAccountStore._record[item] ? false : true
    await useAccountStore.save()
}

function cpuColor ( val: number ) {
    switch( true ) {
        case val > 80:
            return 'text-red-9'
        case val > 50:
            return 'text-primary'
        default:
            return ''
    }
}

function sshColor ( date: string ) {
    switch( true ) {
        case moment().isAfter(moment(date).subtract(10, 'days')):
            return 'text-red-9'
        case moment().isAfter(moment(date).subtract(20, 'days')):
            return 'text-primary'
        default:
            return ''
    }
}

const menuItems = [
    {
        label: '',
        icon: 'fas fa-bolt',
        childrens: [
            {
                label: 'Stop',
                icon: 'fas fa-stop',
                type: 'stop',
                action: 'setShowConfirmActionDialog'
            },
            {
                label: 'Restart',
                icon: 'fas fa-redo',
                type: 'restart',
                action: 'setShowConfirmActionDialog'
            },
            {
                label: 'Reset',
                icon: 'fas fa-redo',
                type: 'reset',
                action: 'setShowConfirmActionDialog'
            },
        ]
    },
    {
        label: '',
        icon: 'fas fa-book',
        childrens: [
            {
                label: 'Error',
                type: 'error',
                action: 'setOpenLogProcess'
            },
            {
                label: 'Out',
                type: 'out',
                action: 'setOpenLogProcess'
            }
        ]
    },

]

onMounted( async () => {
    await useProcessesStore.init()
    await useNginxStatusStore.init()
} )

</script>

<style lang="scss">
    .contentHeight {
        min-height: 100px;
    }

    .logbook {
        white-space: pre;
    }

    .expansionBorder {
        border-bottom: 1px solid $primary;
    }

    body.desktop .q-focus-helper {
        display: none !important;
        background: green;
    }

</style>
