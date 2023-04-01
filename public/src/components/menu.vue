<template>
    <div class="row" :class="propClass || 'bg-dark'" style="min-height: 30px">
        <div class="col-12 flex justify-end">
            <template v-for="btn of struct">
                <q-btn    
                    class="q-mx-sm"      
                    v-if="remove(btn)"
                    style="margin-right: 1px"
                    round
                    size="12px"
                    text-color="dark"
                    unelevated
                    :loading="btn.progress ? store[btn.progress] : false"    
                    :key="setId(btn)"
                    :icon="btn.icon"
                    :color="btn.color || 'primary'" 
                    :label="btn.label"
                    @click="onClick(btn)" 
                >
                    <q-menu v-if="btn.childrens">
                        <q-list style="min-width: 100px" class="bg-grey-9">
                            <template v-for="child of btn.childrens" :key="child._id || child.label">
                                <q-item clickable v-close-popup @click="onClick(child)">
                                    <q-item-section avatar style="min-width: 0px">
                                        <q-icon color="white" size="xs" name="navigate_next" />
                                    </q-item-section>
                                    <q-item-section class="text-white">{{ child.label }}</q-item-section>
                                </q-item>
                                <q-separator />
                            </template>
                        </q-list>
                    </q-menu>
                    <template v-slot:loading>
                        <q-spinner-facebook class="q-mr-sm"/> Bitte warten...
                    </template>
                    <q-tooltip v-if="($q.screen.lt[props.breakpoint] || false)" >{{btn.label}}</q-tooltip>
                </q-btn>
            </template>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onBeforeMount, ref, computed }            from 'vue';
import { Screen, uid }                        from 'quasar';
import { defineStore, storeToRefs }                   from 'pinia';
const props = defineProps({
    struct: {
        type: Array
    },
    storeName: {
        type: String
    },
    breakpoint: {
        type: String,
        default: 'xs'
    },
    remove: {
        type: String || Object,
        default: ''
    },
    propClass: {
        type: String,
        default: ''
    }
})
const tooltip       = ref(false)
let store: any      = null
let storeRef            = null

onBeforeMount( () => {
    if ( props.storeName ) {
        const useStore = defineStore(props.storeName, {})
        store = useStore()
        storeRef = storeToRefs(store)
    }
} )

const test = computed( () => {
    let remove = true
    for ( const row of storeRef.data.value ) {
        if ( row.check )
            remove = false
    }

    return remove

} )

function remove ( btn: any ) {

        if ( !btn.remove ) 
            return true

        if ( typeof btn.remove === 'string' ) {
            if ( btn.remove.charAt(0) === '!' )
                return store._record[btn.remove.slice(1, btn.remove.length + 1)] ? false : true

            if ( btn.remove.charAt(0) === '=' )
                return store._record[btn.remove.slice(1, btn.remove.length + 1)] ? true : false
           
            if ( !store[btn.remove] ) {
                if ( !btn.removeWatchAllRows )
                    return store._record[btn.remove] ? true : false
        
                let remove = false
                for ( const row of store._data ) {
                    if ( row[btn.remove] )
                        remove = true
                }
                return remove
            }

            return store[btn.remove]()
            
        }

        if ( typeof btn.remove === 'object' ) {
            const useStore = defineStore(btn.remove.storeName, {})
            let store: any = useStore()
            btn = btn.remove
            if ( btn.remove.charAt(0) === '!' ) {
                return store._record[btn.remove.slice(1, btn.remove.length + 1)] ? false : true
            } else {
                if ( !store[btn.remove] )
                    return store._record[btn.remove] ? true : false
                
                return store[btn.remove]()
            }
        }
        return false
}

function onClick( btn: any ) {
    if ( store && store[btn.action] )
        store[btn.action](btn)
}

function setId ( btn: any ) {
    if ( btn._id )
        return btn._id

    const id = uid()
    btn._id = id
    return id
}

</script>