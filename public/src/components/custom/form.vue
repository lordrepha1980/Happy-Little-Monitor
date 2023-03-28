<template>
    <q-form greedy ref="form">
        <slot name="content" />
    </q-form>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, onUnmounted }             from 'vue'
import Global                                                   from 'src/helpers/Global'
import { defineStore }                                          from 'pinia';

const global = Global({})
const props = defineProps({
    refForm: {
        type: Object
    },
    storeName: {
        type: String,
    },
    dontDisable: {
        type: Boolean,
        default: false
    },
    dontClearRecord: {
        type: Boolean,
        default: false
    }
})
const emit = defineEmits(['refForm'])

const form                                      = ref<Record<string, any>>({})
const methods: Record<string, any>         = {}
let store: any                                  = null
onBeforeMount( () => {
    if ( props.storeName ) {
        const useStore = defineStore(props.storeName, {})
        store = useStore()
    }
} )

onMounted(() => {
    emit('refForm', { methods, form: form.value })
    if ( store )
        store._form = { methods, form: form.value }
})

onUnmounted( () => {
    if ( store && store._record && !props.dontClearRecord )
        store._record = {}
} )

methods.validate = () => { 
    return new Promise ((resolve, reject) => {
        const formular = form.value || store._form.form
        formular.validate().then((valid: boolean) => {
            if ( valid )
                resolve(true)
            else {
                global.Note({
                    type: 'negatve',
                    message: 'Formular ungültig'
                })
                resolve(false)
            }
        })
    })
}

methods.reset = () => {
    if (store)
        store._form.form.resetValidation()
}

</script>