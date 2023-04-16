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
            <q-card-section class="row items-center logbook">
                <q-scroll-area ref="LogScrollArea" style="width: 100%; height: calc(100vh - 200px);">
                    <div class="row">
                        <div class="col-12 text-body1 bg-grey-9 text-bold q-mb-sm ">
                            Top 10 IP's
                        </div>
                    </div>
                    <q-list>
                        <q-item class="q-px-none" dense v-for="(item, index) in nginxLogAggCountIP" :key="index">
                            <q-item-section class="itemBorder q-mx-sm">
                                <div class="row">
                                    <div class="col-6 col-sm-2 text-body2 text-bold">
                                        {{ item._id }}:
                                    </div>
                                    <div class="col-6 col-sm-10 text-right">
                                        {{ item.count }}
                                    </div>
                                </div>
                                
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div class="row">
                        <div class="col-12 text-body1 bg-grey-9 text-bold q-mb-sm ">
                            Top 30 Errors
                        </div>
                    </div>
                    <q-list>
                        <q-item class="q-px-none" dense v-for="(item, index) in nginxLogAggErrorStatus" :key="index">
                            <q-item-section class="itemBorder q-mx-sm">
                                <div class="row">
                                    <div class="col-2 col-sm-2 text-body2 text-bold">
                                        {{ item._id.status }}
                                    </div>
                                    <div class="col-8 text-body2 text-bold ellipsis">
                                        {{ item._id.uri }}
                                    </div>
                                    <div class="col-2 text-right">
                                        {{ item.count }}
                                    </div>
                                </div>
                                
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-scroll-area>
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