<template>
    <q-select 
        ref="select"
        :model-value="modelValue"
        @update:model-value="update"
        :options="optionsData" 
        :option-value="optionsId || '_id'"
        :option-label="optionsLabel || 'name'"
        :label="label" 
        filled 
        :require="required || false"
        stack-label
        dense
        :use-input="mode === 'add-unique' ? true : false"
        filter
        input-debounce="0"
        :new-value-mode="mode"
        :use-chips="mode === 'add-unique' ? true : false"
        @blur="createValue"
        @focus="focus"
        @input-value="val => selectInput = val"
        @filter="filterFn"
        hide-bottom-space
        :disable="disable || ( (store && store._record && store._record._id ) || instance?.parent?.parent?.props?.dontDisable  ? false : true )"
        bottom-slots
        emit-value
        map-options
        :multiple="multiple"
        :rules="getRules()"
    >
        <template v-slot:hint v-if="hint">
            <div class="text-primary" >
                {{hint}}
            </div>
        </template>
    </q-select>
</template>
<script setup lang="ts">
import { ref, onBeforeMount, getCurrentInstance }                   from 'vue'
import { dataService }                          from 'src/services/data.service';
import Validate                                 from 'src/helpers/Validate'
import { defineStore, storeToRefs }             from 'pinia';
import debug                                    from 'debug'
const log                                       = debug('app:select')
const instance                                  = getCurrentInstance()
const validate                                  = Validate({})
const select                                    = ref(null);
const selectInput                              = ref(null);
const emit = defineEmits(['update:model-value', 'getOptions'])

const props = defineProps({
    label: {
        type: String,
        default: 'Label'
    },
    value: {
        default: undefined
    },
    options: {
        type: Array || String,
        default: undefined
    },
    multiple: {
        type: Boolean,
        default: false
    },
    required: {
        type: Boolean,
        default: false
    },
    rules: {
        type: Array,
    },
    state: {
        type: String,
        default: ''
    },
    optionsLabel: {
        type: String,
        default: 'name'
    },
    optionsId: {
        type: String,
        default: '_id'
    },
    hint: {
        type: String,
        default: ''
    },
    mode: {
        type: String,
        default: 'single'
    },
    disable: {
        type: Boolean,
        default: false
    },
    rootId: {
        type: Boolean,
        default: false
    }
})

const optionsData = ref([])
const rootOptions = ref([])
let store: any = null

onBeforeMount( () => {
    if ( instance?.parent?.parent?.props?.storeName ) {
        const useStore = defineStore(instance?.parent?.parent?.props?.storeName, {})
        store = useStore()
    }
} )

function update (val: any) {
    selectInput.value = val
    emit('update:model-value', val)
}

async function getOptions () {
    if ( typeof props.options === 'string' ) {
        const opt       = props.options.split('/')

        let result      = []

        if ( opt[0] === 'data' ) {
            result    = await dataService.dataApi({ endpoint: opt[1], action: opt[2], data: {query: {}, body: {rootId: props.rootId}} })
            optionsData.value = result?.data || []
        }else {
            result    = await dataService.customApi({ endpoint: opt[0], action: opt[1], body: {rootId: props.rootId} })
            optionsData.value = result || []
        }
        
    }

    if ( typeof props.options === 'object' &&  props.options.length > 0 ) {
        optionsData.value = props.options
    }

    if ( props.state ) {
       
        const store = defineStore(props.state, {})
        const useStore = store()
        
        const refs = storeToRefs(useStore)

        optionsData.value = refs.data.value
    }

    rootOptions.value = optionsData.value

    emit('getOptions', optionsData.value)

}

function getRules () {
    let rules = props.rules || []
    if ( !props.rules && props.required)
        rules.push((val: any) => validate.isRequired(val))
    log('rules', rules)
    return rules
}

async function focus () {
    if ( props.mode === 'add-unique' )
        await getOptions()
}

function filterFn (val: any, update: any) {
    if ( props.mode !== 'add-unique' || !val ) {
        update(() => {
            optionsData.value = rootOptions.value
        })
        return
    }
    //get data if add an entry
    update(async () => {
        //await getOptions()
        const needle = val.toLowerCase()
        optionsData.value = rootOptions.value.filter(v => v.toLowerCase().indexOf(needle) > -1)
    })
}

function createValue (val: any) {
    if ( props.mode === 'add-unique' && selectInput.value ) {
        select.value.add(selectInput.value)
        setTimeout(async () => {
            await getOptions()
        })
    }
}

onBeforeMount(() => {
    getOptions()
})

</script>