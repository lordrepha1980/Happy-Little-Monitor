<template>
    <q-btn 
        unelevated
        square
        :outline="outline === undefined ? !hover : outline"
        :loading="progress"  
        @mouseover="hover = true"
        @mouseleave="hover = false"
        class="full-width"
        v-model="vmodel" 
        :disable="disable"
        :label="label" 
        :dense="dense"
        :color="color"
        :text-color="!hover ? textColor : 'dark'"
        @click="onClick()"
    >
        <template v-slot:loading>
            <q-spinner-facebook class="q-mr-sm"/> Bitte warten...
        </template>
    </q-btn>
</template>

<script setup lang="ts">
import { ref, watch }              from 'vue'
const props = defineProps({
    label: {
        type: String,
        default: 'Label'
    },
    color: {
        type: String,
        default: 'primary'
    },
    textColor: {
        type: String,
        default: 'primary'
    },
    click: {
        type: Function,
        default: undefined
    },
    disable: {
        type: Boolean,
        default: false
    },
    dense: {
        type: Boolean,
        default: false
    },
    progress: {
        type: Boolean,
        default: false
    },
    outline: {
        type: Boolean,
        default: undefined
    },
    timer: {
        type: Boolean,
        default: false
    },
    val: {
        type: undefined
    },

})

const vmodel = ref(props.value)
const hover = ref(false)
const label = ref(props.label)
let intervall: any = null;
const timercount = 2
const intervallCount = ref(timercount)

function onClick() {
    if ( props.click && ( !props.timer || intervallCount.value === 0 ) )
        props.click(props, props.val)
}

watch(hover, ( newVal ) => {
    clearInterval(intervall)
    if ( newVal && props.timer ) {
        label.value  = `${props.label} ${intervallCount.value ? '(' + intervallCount.value + ')' : ''}` 
        intervall = setInterval(() => {
            intervallCount.value = intervallCount.value - 1
            label.value  = `${props.label} ${intervallCount.value ? '(' + intervallCount.value + ')' : ''}` 

            if ( intervallCount.value === 0 ) {
                clearInterval(intervall)
                label.value  = props.label
            }
        }, 1000)
        return
    }
    label.value  = props.label
    intervallCount.value = timercount

})

</script>