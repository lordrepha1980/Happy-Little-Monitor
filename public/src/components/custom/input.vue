<template>
    <q-input 
        :model-value="props.value" 
        @update:model-value="update"
        :stack-label="stackLabel"
        :disable="disable !== undefined ? disable :  ( (store && store._record && store._record._id ) || instance?.parent?.parent?.props?.dontDisable  ? false : true )"
        :type="isPwd ? 'text' : type"
        dense
        dark
        :icon="icon"
        filled
        :size="size"
        :autogrow="autogrow"
        :require="required || false"
        :label="label" 
        hide-bottom-space
        :rules="getRules()"
    >
        <template v-slot:append v-if="type === 'password'">
            <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
            />
        </template>
        <template v-slot:prepend v-if="icon">
            <q-icon
                :name="icon"
                class="cursor-pointer"
            />
        </template>
    </q-input>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, getCurrentInstance }               from 'vue'
import Validate                             from '../../helpers/Validate'
import { defineStore }                      from 'pinia'
const instance                                  = getCurrentInstance();  

const validate                                  = Validate({})
const props = defineProps({
    label: {
        type: String,
        default: 'Label'
    },
    value: {
        default: undefined
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
        default: undefined
    },
    stackLabel: {
        type: Boolean,
        default: true
    },
    autogrow: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'md'
    },
    icon: {
        type: String,
        default: undefined
    }
})

let store: any = null

onBeforeMount( () => {
    if ( instance?.parent?.parent?.props?.storeName ) {
        const useStore = defineStore(instance?.parent?.parent?.props?.storeName, {})
        store = useStore()
    }
} )

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

const vmodel = ref(props.value)
const isPwd = ref(false)

</script>