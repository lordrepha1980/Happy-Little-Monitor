<template>
    <q-field
        ref="toggle"
        :model-value="modelValue" 
        :rules="getRules()"
        :disable="disable"
        hide-bottom-space
        :true-value="true"
        :false-value="false"
        borderless
        dense
      >
        <template v-slot:control>
          <q-checkbox
            :model-value="modelValue" 
            @update:model-value="update"
            :label="label"
          >
          </q-checkbox>
        </template>
      </q-field>
    
</template>

<script setup lang="ts">
import { ref }        from 'vue'
import Validate                                 from '../../helpers/Validate'
import Vue                                     from 'vue'

const validate                                  = Validate({})
const props = defineProps({
    label: {
        type: String,
        default: ''
    },
    modelValue: {
        default: false
    },
    type: {
        type: String,
        default: 'text'
    },
    required: {
        type: Boolean,
        default: false
    },
    rules: {
        type: Array,
        default: undefined
    },
    disable: {
        type: Boolean,
        default: false
    }

})

const emit = defineEmits(['update:model-value'])

function getRules () {
    if ( !props.rules && props.required)
        return [(val: any) => validate.isRequired(val)]

    if ( props.rules )
        return props.rules

    return []
}

function update( val: any ) {
    emit('update:model-value', val)
}

</script>