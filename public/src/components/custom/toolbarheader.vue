<template>
    <span class="q-pl-sm">
        {{afkName}} <span class="text-orange-6 text-weight-medium" v-if="moduleName"> - {{moduleName}}</span>
    </span>
</template>

<script lang="ts" setup>
import { mainStore }            from 'src/stores/main.store'
import { storeToRefs }          from 'pinia'

const useMainStore              = mainStore()
const { afkName }               = storeToRefs(useMainStore)

defineProps({
    moduleName: {
        type: String,
        default: ''
    }
})
</script>