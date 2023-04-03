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
            <q-expansion-item
                dense
                v-for="(item) in data" :key="item._id"
            >
                
                <template v-slot:header>
                    <q-item-section>
                        <div class="row text-white text-body1" style="height: 24px;">
                            <div class="col-4 flex items-center col-sm-2 text-bold">
                                {{moment(item._id).format('YYYY-MMMM')}}
                            </div>
                            <div class="col-4 flex col-sm-2 items-center q-pl-md">
                                <q-icon name="east" color="green" class="q-mr-sm" /> {{item.rx_human}}
                            </div>
                            <div class="col-4 flex col-sm-2 items-center q-pl-lg">
                                <q-icon name="west" color="red-9" class="q-mr-sm" /> {{item.tx_human}}
                            </div>
                            <div class="col-12">
                                <q-separator dark/>
                            </div>
                        </div>
                    </q-item-section>
                </template>
                <q-card class="my-card bg-grey-9">
                    <div class="row text-white text-body1 q-pl-lg" v-for="(day) in item.days" :key="day._id">
                        <div class="col-4 flex items-center col-sm-2 text-bold">
                            <span>{{day._id}}</span>
                        </div>
                        <div class="col-4 flex col-sm-2 items-center">
                            <q-icon name="east" color="green" class="q-mr-sm" /> {{day.rx_human}}
                        </div>
                        <div class="col-4 flex col-sm-2 items-center">
                            <q-icon name="west" color="red-9" class="q-mr-sm" /> {{day.tx_human}}
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                    </div>
                </q-card>
            </q-expansion-item>
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
import moment               from 'moment'

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
