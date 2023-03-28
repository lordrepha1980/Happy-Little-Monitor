<template>
    <q-dialog v-model="showDialog" persistent>
        <q-card  :style="{ 'width': '800px', height: '80vh'}">
            <q-bar>
                <div>Logbuch</div>
                <q-space />
                <q-btn dense flat icon="close" @click="close">
                    <q-tooltip>Schliessen</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section>
                <q-scroll-area style="width: 100%; height: calc(80vh - 70px)">
                    <div v-for="item of data" :key="item._id">
                        <div>{{moment(item.date).format('DD.MM.YYYY HH:mm:ss')}} - {{ item.type }} - {{ item.user.name }}</div>
                        <div v-html="item.diff"></div>
                    </div>
                </q-scroll-area>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted }           from 'vue';
import { logStore }                 from 'src/stores/logbook.store.ts'
import { accountStore }             from 'src/stores/account.store'
import { storeToRefs }              from 'pinia'
import moment                       from 'moment'

const useLogStore                   = logStore()
const { data }                      = storeToRefs(useLogStore)

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])
const showDialog = ref(props.show)

onMounted( async () => {
    await useLogStore.getData()
})

function close () {
    emit('close')
}

</script>
