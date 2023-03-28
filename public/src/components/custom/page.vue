<template>
    <q-page class="q-pa-sm">
        <div class="row">
            <div class="col text-subtitle2 text-primary">
                <q-icon name="layers" />
                <slot name="header" ></slot>
                <q-separator class="q-mb-xs  bg-primary" />
            </div>
        </div>
        <q-card class="q-mb-xs" flat square  v-if="!noMenu">
            <q-card-section class="q-pb-xs q-pt-none q-px-none bg-grey-9" style="min-height: 39px">
                <slot name="menu"></slot>
                
            </q-card-section>
        </q-card>
        <q-scroll-area :style="{width: 'calc(100%)', height: `calc(100vh - 100px - ${subScrollHeight}px - env(safe-area-inset-bottom) - env(safe-area-inset-top))`}">
            <q-card v-if="!noGrid" flat square>
                <q-card-section class="q-pa-xs">
                    <slot name="grid"></slot>
                </q-card-section>
            </q-card>
            <q-card  v-if="!noContent" flat square id="content">
                <q-card-section class="bg-grey-9">
                    <slot name="content"></slot>
                </q-card-section>
            </q-card>
        </q-scroll-area>
    </q-page>
</template>
<script lang="ts" setup>

defineProps({
    noGrid: {
        type: Boolean,
        default: false
    },
    noMenu: {
        type: Boolean,
        default: false
    },
    noContent: {
        type: Boolean,
        default: false
    },
    subScrollHeight: {
        type: Number,
        default: 0
    },
})
</script>
<style scoped>
#content .q-card__section--vert {
        padding: 0px !important;
    }
</style>