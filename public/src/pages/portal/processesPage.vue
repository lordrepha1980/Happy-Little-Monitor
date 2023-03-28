<template>
    <cust-page :noGrid="true" :subScrollHeight="100">
        <template #header>
            Processes
        </template>
        <template #menu>
            <cust-menu :struct="menuItems" storeName="processes" />
            <cust-card class="q-mt-sm">
                <template #content>
                    <div class="row text-h6 text-white flex items-center">
                        <div class="col-6 col-sm-4 ellipsis">
                            <q-icon name="fa-brands fa-hive" size="20px" color="white" class="q-pr-sm"/>{{ serverParams.ip_address }}
                        </div>
                        <div class="col-6 col-sm-4 ellipsis">
                            <q-icon name="fa-brands fa-node-js" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.node_version }} {{ serverParams.node_os }}
                        </div>
                        <div class="col-12 col-sm-4 ellipsis">
                            <q-icon name="fas fa-clock" size="20px" color="white" class="q-pr-sm"/> {{ serverParams.server_uptime }}
                        </div>
                    </div>
                </template>
            </cust-card>
            <q-separator dark class="q-pa-none"/>
        </template>
        <template #content>
            <cust-card :selected="recordId === proc.pm_id" @click="useProcessesStore.setRecord({id: proc.pm_id, name: proc.name, errorPath: proc.pm2_env.pm_err_log_path, outPath: proc.pm2_env.pm_out_log_path  })" :disableHeader="false" v-for="proc of processes" :key="proc.pm_id">
                <template #header>
                    <div class="row q-pl-xs flex ">
                        <div class="col-3 col-sm-1 text-h6 text-bold text-primary flex items-center">
                            <q-icon name="fas fa-server" size="14px" color="grey-7" class="q-pr-sm"/> {{proc.pm_id}}
                        </div>
                        <div class="col-8 col-sm-10 text-h6 text-primary ellipsis">
                            {{proc.name}}
                        </div>
                        <div class="col-1 text-h6 text-primary ellipsis">
                            <q-icon name="cloud_off" color="red-9" v-if="proc.pm2_env.status !== 'online'" />
                            <q-icon name="cloud" color="green" v-else />
                        </div>
                    </div>
                    
                </template>
                <template #content v-if="proc.pm2_env.status === 'online'">
                    <div class="row text-h6 q-pb-md q-pl-xs q-col-gutter-xs">
                        <div class="col-6 col-sm-4 ellipsis flex items-center" v-if="proc.monit.memory" >
                           <q-icon name="fas fa-memory" size="18px" class="q-pr-sm"/> {{(proc.monit.memory / 1000 / 1024).toFixed(2)}} MiB
                        </div>
                        <div class="col-6 col-sm-4 ellipsis flex items-center" v-if="proc.pm2_env.created_at">
                            <q-icon name="fas fa-microchip" size="18px" class="q-pr-sm"/> {{proc.monit.cpu}}
                        </div>
                        <div class="col-12 col-sm-4 ellipsis flex items-center" v-if="proc.pm2_env.created_at">
                            <q-icon name="refresh" size="20px" class="q-pr-sm"/> {{proc.pm2_env.restart_time}}
                        </div>
                    </div>
                    <div class="row text-body1 q-pl-xs">
                        <div class="col-12 col-sm-4" v-if="proc.pm2_env.created_at">
                            Created at: {{`${moment(proc.pm2_env.created_at).format('YYYY-MM-DD HH:mm')}` }}
                        </div>
                        <div class="col-12 col-sm-4" v-if="proc.pm2_env.created_at">
                            Uptime: {{`${moment(proc.pm2_env.pm_uptime).fromNow(proc.pm2_env.created_at)}` }}
                        </div>
                    </div>
                </template>
            </cust-card>
            <q-dialog v-model="openLogProcess" persistent maximized>
                <q-card class="bg-dark text-white">
                    <q-card-section>
                        <q-toolbar class="bg-grey-9 text-white">
                            <q-toolbar-title>
                                Log ({{ recordName }})
                            </q-toolbar-title>
                            <q-circular-progress
                                @click="useProcessesStore.logProcess"
                                show-value
                                class="text-white q-mr-xl"
                                :value="timer * 10"
                                size="40px"
                                :thickness="0.2"
                                color="primary"
                                center-color="grey-8"
                                track-color="transparent"
                            >
                                <span class="text-body2">{{ 10 - timer }}s</span>
                            </q-circular-progress>
                            <q-btn flat dense icon="close" @click="useProcessesStore.setOpenLogProcess" />
                        </q-toolbar>
                    </q-card-section>
                    <q-card-section class="row items-center logbook">
                        <q-scroll-area ref="LogScrollArea" style="width: 100%; height: calc(100vh - 120px);">
                            <span class="q-ml-sm" v-text="selectedLogFile"></span>
                        </q-scroll-area>
                    </q-card-section>
                </q-card>
            </q-dialog>
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
import CustMenu             from 'src/components/menu.vue'
import CustPage             from 'src/components/custom/page.vue'
import CustDialog           from 'src/components/custom/dialog.vue'
import { processesStore }   from 'src/stores/processes.store'
import moment               from 'moment';

const useMainStore                  = mainStore()

const useProcessesStore = processesStore()
const { 
    data: processes, 
    recordId, 
    serverParams, 
    openLogProcess, 
    selectedLogFile, 
    timer, 
    recordName,
    showConfirmActionDialog,
    confirmActionDialogType
} = storeToRefs(useProcessesStore)

const router = useRouter()
const LogScrollArea = ref(null)

const menuItems = [
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
        label: 'Log',
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
    }
]

onMounted( async () => {
    useProcessesStore.init()
} )

watch( selectedLogFile, async () => {
    await nextTick()
    if (LogScrollArea.value && LogScrollArea.value.getScrollPosition('vertical').top === 0) {
      const scrollTarget = LogScrollArea.value.getScrollTarget();
      LogScrollArea.value.setScrollPosition('vertical', scrollTarget.scrollHeight);
      console.log(LogScrollArea.value.getScrollPosition('vertical'))
    }

} )

</script>

<style scoped lang="scss">
    .contentHeight {
        min-height: 100px;
    }

    .logbook {
        white-space: pre;
    }
</style>
