<template>
    <q-layout view="hHh lpR fFf" class="bg-grey-9">
        <q-header  class="bg-dark elevated border">
            <q-toolbar>
                <q-toolbar-title class="text-primary">
                    <q-avatar>
                        <img src="/logo.png" />
                    </q-avatar>
                    <span v-if="Screen.gt.xs">Happy Little Monitor</span>
                    <span v-else >HLM</span>
                    <toolbar-header />
                </q-toolbar-title>
                <q-icon color="green" v-if="useMainStore._receive && useMainStore._connected" name="blur_on" size="30px"/>
                <q-icon color="green" v-else name="" size="30px"/>
                <q-btn-dropdown icon="supervised_user_circle" non-selectable flat square unelevated label="Account" color="primary">
                    <q-list square>
                        <q-separator class="bg-grey-7" />
                        <q-item class="bg-dark text-white" clickable square flat v-close-popup @click="clickMenu('processes')">
                            <q-item-section avatar>
                                <q-icon name="layers" size="xs"/> 
                            </q-item-section>
                            <q-item-section class="text-right text-bold">
                                <q-item-label>Status</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator class="bg-grey-7" />
                        <q-item class="bg-dark text-white" clickable square flat v-close-popup @click="clickMenu('traffic')">
                            <q-item-section avatar>
                                <q-icon name="swap_horiz" size="xs"/> 
                            </q-item-section>
                            <q-item-section class="text-right text-bold">
                                <q-item-label>Traffic</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator class="bg-grey-7" />
                        <q-item class="bg-dark text-white" clickable square flat v-close-popup @click="clickMenu('settings')">
                            <q-item-section avatar>
                                <q-icon name="settings" size="xs"/> 
                            </q-item-section>
                            <q-item-section class="text-right text-bold">
                                <q-item-label>Settings</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator class="bg-grey-7" />
                        <q-item class="bg-dark text-white" clickable square flat v-close-popup @click="clickMenu('logout')">
                            <q-item-section avatar>
                                <q-icon name="logout" size="xs"/> 
                            </q-item-section>
                            <q-item-section class="text-right text-bold">
                                <q-item-label>Logout</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
            </q-toolbar>
        </q-header>
        <q-page-container class="bg-grey-9" v-if="loading">
            <router-view />
        </q-page-container>
    </q-layout>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, ref, watch }                   from 'vue'
import { mainStore }                            from 'src/stores/main.store'
import { socketStore }                          from 'src/stores/socket.store';
import { accountStore }                         from 'src/stores/account.store';
import { processesStore }                       from 'src/stores/processes.store';
import { storeToRefs }                          from 'pinia'
import debug                                    from 'debug'
import { Screen }                               from 'quasar';
import { useRouter }                            from 'vue-router';
const log                                       = debug('app:MainLayout')

const useMainStore          = mainStore()
const { receive }           = storeToRefs( useMainStore )

const useProcessesStore     = processesStore()

const useAccountStore       = accountStore()

const loading               = ref(false)
const router                = useRouter()

onBeforeMount( async () => {
    try {
        loading.value = false
        const login: any = await useMainStore.relogin()
        if ( login ) {
            const useSocketStore        = socketStore()
            await useSocketStore.init()
            useMainStore.setReceive()
            await useAccountStore.getData()

            loading.value = true
        }
    } catch (error) {
        log(error)
    }
})

function clickMenu( action: string ) {
    switch (action) {
        case 'logout':
            useMainStore.logout()
            break;
        case 'settings':
            router.push('/app/settings')
            break;
        case 'processes':
            router.push('/app/processes')
            break;
        case 'traffic':
            router.push('/app/traffic')
            break;
        default:
            break;
    }
}

</script>
