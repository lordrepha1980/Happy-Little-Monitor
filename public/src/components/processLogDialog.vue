<template>
    <q-dialog :value="value" persistent maximized>
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
                <q-scroll-area ref="LogScrollArea" style="width: 100%; height: calc(100vh - 200px);">
                    <span class="q-ml-sm" v-text="selectedLogFile"></span>
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
const { openLogProcess, recordName, timer, selectedLogFile }    = storeToRefs(useProcessesStore)

const props = defineProps<{
    value: boolean
}>()

</script>

<style lang="scss" scoped>
    .itemBorder {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
</style>