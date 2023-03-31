<template>
    <q-toggle
        class="text-white"
        :model-value="modelValue" 
        @update:model-value="update"
        :val="val"
        :label="label"
        :disable="disable"
        text-color="white"
        dark
    >
    </q-toggle>
    
</template>

<script setup lang="ts">
import { ref }                      from 'vue'
import Validate                     from '../../helpers/Validate'
import Vue                          from 'vue'

const validate                                  = Validate({})
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
        default: false
    },
    disable: {
        type: Boolean,
        default: false
    }

})

const emit = defineEmits(['update:model-value'])

function update( val: any ) {
    emit('update:model-value', val)
}

</script>