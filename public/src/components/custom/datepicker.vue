<template>
    <q-input 
        :model-value="formatDate()" 
        @update:model-value="$event => updateDate($event)"
        stack-label
        :disable="disable || ( (store && store._record && store._record._id ) || instance?.parent?.parent?.props?.dontDisable  ? false : true )"
        dense
        mask="##-##-####"
        filled
        :require="required || false"
        :label="label" 
        hide-bottom-space
        :rules="getRules()"
    >
        <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date :model-value="formatDate()" @update:model-value="$event => updateDate($event)" mask="DD-MM-YYYY" :today-btn="true">
                        <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Schliessen" color="primary" flat />
                        </div>
                    </q-date>
                </q-popup-proxy>
            </q-icon>
        </template>
        <template v-slot:hint>
            <div class="text-primary">
                {{hint || 'Format: DD-MM-YYYY'}}
            </div>
        </template>
    </q-input>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, onBeforeMount }                           from 'vue'
import Validate                                 from '../../helpers/Validate'
import { defineStore }                          from 'pinia'
import moment                                   from 'moment';
import debug                                    from 'debug'
const log                                       = debug('app:datepicker')
const instance                                  = getCurrentInstance();  

const validate                                  = Validate({})
const props = defineProps({
    label: {
        type: String,
        default: 'Label'
    },
    modelValue: {
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
        default: false
    },
    hint: {
        type: String,
        default: undefined
    },
    birthday: {
        type: Boolean,
        default: false
    },
    noDisable: {
        type: Boolean,
        default: false
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
const date = ref(props.value)

watch( date, (val: any) => {
    emit('update:model-value', val)
})

function getRules () {
    let rules = props.rules || []
    if ( !props.rules && props.required)
        rules.push((val: any) => validate.isDateRequired(val))

    rules.push((val: any) => validate.isDateValid(val))

    if ( props.birthday )
        rules.push((val: any) => validate.isDateBeforeToday(val))

    log('rules', rules)
    return rules
}

function update( val: any ) {
    emit('update:model-value', val)
}

function formatDate () {
    if ( !props.modelValue )
        return null

    if ( props.modelValue.length < 10 || moment(props.modelValue, 'DD-MM-YYYY').format('YYYY-MM-DD') === 'Invalid date' )
        return props.modelValue

    return moment(props.modelValue, 'YYYY-MM-DD').format('DD-MM-YYYY')
}

function updateDate ( val: string ) {
    if ( val.length < 10 ) {
        update(val)
        return val
    }

    if (moment(val, 'DD-MM-YYYY').format('YYYY-MM-DD') === 'Invalid date') {
        update(val)
        return 
    }

    update(moment(val, 'DD-MM-YYYY').format('YYYY-MM-DD'))
}

const vmodel = ref(props.value)
const isPwd = ref(false)

</script>