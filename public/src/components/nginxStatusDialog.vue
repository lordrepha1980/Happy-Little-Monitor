<template>
    <q-dialog :value="value" persistent maximized>
        <q-card class="bg-dark text-white">
            <q-card-section>
                <q-toolbar class="bg-grey-9 text-white">
                    <q-toolbar-title>
                        Nginx Status
                    </q-toolbar-title>
                    <q-btn flat dense icon="close" @click="useProcessesStore.setShowNginxStatusDialog" />
                </q-toolbar>
            </q-card-section>
            <q-card-section class="row logbook">
                <div class="q-pr-sm" style="overflow-x: hidden; overflow-y: auto; width: calc(100vw - 10px); height: calc(100vh - 200px);">
                    <div class="row">
                        <div class="col-12 text-body1 bg-grey-9 text-bold q-mb-sm ">
                            Requests per hour last 10 days
                        </div>
                        <div class="col-12" v-for="data of nginxLogAggDayHourCount" :key="data._id">
                            <bar-chart :value="data" />
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-12 text-body1 bg-grey-9 text-bold q-mb-sm ">
                            Top 30 Errors
                        </div>
                        <div class="col-12">
                            <div class="row itemBorder" v-for="(item, index) in nginxLogAggErrorStatus" :key="index">
                                <div class="col-3 text-body2 text-bold ellipsis q-pl-sm">
                                    {{ item._id.status }}
                                </div>
                                <div class="col-7 text-bold ellipsis">
                                    {{ item._id.uri }}
                                </div>
                                <div class="col-2 text-right ellipsis">
                                    {{ item.count }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 text-body1 bg-grey-9 text-bold q-mb-sm ">
                            Top 10 IP's
                        </div>
                        <div class="col-12">
                            <q-list>
                                <q-item class="q-px-none" dense v-for="(item, index) in nginxLogAggCountIP" :key="index">
                                    <q-item-section class="itemBorder">
                                        <div class="row">
                                            <div class="col-6 col-sm-2 text-body2 text-bold q-pl-sm">
                                                {{ item._id }} :
                                            </div>
                                            <div class="col-6 col-sm-10 text-right">
                                                {{ item.count }}
                                            </div>
                                        </div>
                                        
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts" setup>
import { processesStore }       from 'src/stores/processes.store'
import { storeToRefs }          from 'pinia';
import { serverstatusStore }    from 'src/stores/serverstatus.store'
import { onMounted }            from 'vue'
import { nginxStatusStore }     from 'src/stores/nginxstatus.store';
import BarChart                 from 'src/components/custom/barChart.vue'

const useNginxStatusStore           = nginxStatusStore()
const { nginxLogAggCountIP, nginxLogAggDayHourCount, nginxLogAggErrorStatus } = storeToRefs(useNginxStatusStore)

const useProcessesStore             = processesStore()
const { showServerStatusDialog, timer, selectedLogFile } = storeToRefs(useProcessesStore)

const useServerStatusStore          = serverstatusStore()
const { data }                      = storeToRefs(useServerStatusStore)

const props = defineProps<{
    value: boolean
}>()

onMounted( async () => {
    await useServerStatusStore.init()
})

</script>

<style lang="scss" scoped>
    .itemBorder {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>