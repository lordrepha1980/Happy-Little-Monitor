<template>
    <cust-page v-if="!loading" :noGrid="true" :noMenu="true" :subScrollHeight="Platform.is.platform === 'iphone' ? 90 : 0">
        <template #header>
            <div class="row">
                <div class="col-6 text-subtitle2 text-primary">
                    <q-icon name="layers" />
                    Traffic
                </div>
            </div>
        </template>
        <template #content>
            <div class="row text-white text-body1" v-for="(item) in data" :key="item._id">
<!-- {{ data[index+1] && (data[index]._id.substring(0,4) !== data[index+1]._id.substring(0,4)) }}
                <div class="row" v-if="data[index-1] && (data[index]._id.substring(0,4) !== data[index-1]._id.substring(0,4))">
                    <div class="col-12">
                        test
                        <q-separator dark/>
                    </div>
                </div> -->
                <div class="col-4 col-sm-2 text-bold">
                    {{item._id}}
                </div>
                <div class="col-4 flex col-sm-2 items-center">
                    <q-icon name="east" color="green" class="q-mr-sm" /> {{item.rx_human}}
                </div>
                <div class="col-4 flex col-sm-2 items-center">
                    <q-icon name="west" color="red-9" class="q-mr-sm" /> {{item.tx_human}}
                </div>
                <div class="col-12">
                    <q-separator dark/>
                </div>
            </div>
        </template>
    </cust-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick, onBeforeMount }              from 'vue'
import { mainStore }        from '../../stores/main.store';
import { storeToRefs }      from 'pinia';
import { useRouter }        from 'vue-router';
import CustCard             from 'src/components/custom/card.vue'
import CustMenu             from 'src/components/menu.vue'
import CustPage             from 'src/components/custom/page.vue'
import { Platform }         from 'quasar'
import { networkStatusStore } from 'src/stores/networkstatus.store';

const useNetworkStatusStore = networkStatusStore()
const { record, data }            = storeToRefs(useNetworkStatusStore)
const loading               = ref( false )

onBeforeMount( async () => {
    await useNetworkStatusStore.getData()
    await useNetworkStatusStore.init()
})

</script>

<style lang="scss">
    .contentHeight {
        min-height: 100px;
    }

    .logbook {
        white-space: pre;
    }

    .expansionBorder {
        border-bottom: 1px solid $primary;
    }

    body.desktop .q-focus-helper {
        display: none !important;
        background: green;
    }

</style>
