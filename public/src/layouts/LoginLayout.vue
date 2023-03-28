
<template>
    <q-layout :view="'hHh lpR fFf'" class="bg-grey-10">
        
        <q-header  class="bg-dark elevated border">
            <q-toolbar elevated>
                <q-toolbar-title class="text-yellow-4 bg-dark">
                    <q-avatar class="q-mr-lg">
                        <img src="/logo.png" />
                    </q-avatar>
                    Happy Little Monitor
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-page-container>
            <router-view/>
        </q-page-container>

    </q-layout>
</template>

<script setup lang="ts">
import { ref, onBeforeMount }               from 'vue'
import { mainStore }                        from 'src/stores/main.store'

const useMainStore          = mainStore()

onBeforeMount( async () => {
    //await useMainStore.relogin()
})

</script>

<style scoped lang="scss">
    .border{
        border-bottom: 1px solid $grey-9;
    }
</style>
