<template>
    <q-dialog :value="value" persistent maximized>
        <q-card class="bg-dark text-white">
            <q-card-section>
                <q-toolbar class="bg-grey-9 text-white">
                    <q-toolbar-title>
                        Server Status
                    </q-toolbar-title>
                    <q-btn flat dense icon="close" @click="useProcessesStore.setShowServerStatusDialog" />
                </q-toolbar>
            </q-card-section>
            <q-card-section class="row items-center logbook">
                <q-scroll-area ref="LogScrollArea" style="width: 100%; height: calc(100vh - 200px);">
                    <q-list>
                        <q-item class="q-px-none" dense v-for="(item, index) in data" :key="index">
                            <q-item-section class="itemBorder"  v-if="item[1] !== 'group'" :style="{'padding-left': `${10*item[2]}px`}">
                                <q-item-label class="text-body2"><span class="text-bold">{{ item[0] }}</span>: {{ item[1] }}</q-item-label>
                            </q-item-section>
                            <q-item-section v-else class="bg-grey-9" :style="{'padding-left': `${10*item[2]}px`}">
                                <q-item-label class="text-body1">{{ item[0] }}</q-item-label> 
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

const useProcessesStore             = processesStore()
const { showServerStatusDialog, timer, selectedLogFile }    = storeToRefs(useProcessesStore)

const useServerStatusStore          = serverstatusStore()
const { data }                    = storeToRefs(useServerStatusStore)

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