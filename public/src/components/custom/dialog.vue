<template>
    <q-dialog v-model="showDialog" persistent>
        <q-card  dark :style="{ 'width': width, 'max-width': maxWidth}">
            <q-bar>
                <div>{{headerText}}</div>
                <q-space />
                <q-btn dense flat icon="close" @click="close">
                    <q-tooltip>close</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section>
                <slot name="content" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    headerText: {
        type: String,
        default: 'Dialog'
    },
    width: {
        type: String,
        default: '500px'
    },
    maxWidth: {
        type: String,
        default: '700px'
    }
})

const emit = defineEmits(['close'])
const showDialog = ref(props.show)

function close () {
    emit('close')
}

</script>
