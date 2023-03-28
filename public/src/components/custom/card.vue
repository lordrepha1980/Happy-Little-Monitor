<template>
    <q-card dark class="myCard q-ma-none q-mb-sm" :class="{'yBorder': selected}">
        <q-card-section class="q-pa-sm" v-if="!disableHeader">
            <slot name="header" />
        </q-card-section>
        <q-seperator v-if="!disableHeader"/>
        <q-card-section class="q-pa-sm">
            <slot name="content" />
        </q-card-section>
        <q-card-section class="q-pa-sm" v-if="menuBottom">
            <slot name="menuBottom"  />
        </q-card-section>
    </q-card>
</template>

<script setup lang="ts">

const props = defineProps({
    disableHeader: {
        type: Boolean,
        default: true
    },
    selected: {
        type: Boolean,
        default: false
    },
    menuBottom: {
        type: Boolean,
        default: false
    },
})

</script>
<style lang="scss" scoped>
    .yBorder {
        border: 2px solid $yellow-4;
    }
    
</style>