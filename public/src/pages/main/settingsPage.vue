<template>
    <cust-page v-if="!loading" :noGrid="true" :subScrollHeight="Platform.is.platform === 'iphone' ? 90 : 0">
        <template #header>
            <div class="row">
                <div class="col-6 text-subtitle2 text-primary">
                    <q-icon name="layers" />
                    Settings
                </div>
            </div>
        </template>
        <template #menu>
            <cust-menu :struct="menu" :propClass="'bg-grey-9'" storeName="account" class="q-mt-sm" />
        </template>
        <template #content>
            <cust-form stateName="account">
                <template #content>
                    <div class="row">
                        <div class="col-12 text-h6 text-white q-mt-sm q-ml-sm">
                            Serverdata
                        </div>
                        <div class="col-12">
                            <cust-toggle label="Show Server" v-model="form.serverStatus" />
                        </div>
                        <div class="col-12">
                            <cust-toggle label="Show MongoDB" v-model="form.mongodbStatus" />
                        </div>
                        <div class="col-12">
                            <cust-toggle label="Show Nginx" v-model="form.nginxStatus" />
                        </div>
                    </div>
                </template>
            </cust-form>
        </template>
    </cust-page>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, nextTick }              from 'vue'
import { mainStore }        from '../../stores/main.store';
import { storeToRefs }      from 'pinia';
import { useRouter }        from 'vue-router';
import CustButton           from 'src/components/custom/button.vue'
import CustCard             from 'src/components/custom/card.vue'
import CustMenu             from 'src/components/menu.vue'
import CustPage             from 'src/components/custom/page.vue'
import CustForm             from 'src/components/custom/form.vue'
import CustDialog           from 'src/components/custom/dialog.vue'
import CustToggle           from 'src/components/custom/toggle.vue'
import { Platform }         from 'quasar'
import { accountStore }     from 'src/stores/account.store'

const useAccountStore       = accountStore()
const { record: form }    = storeToRefs( useAccountStore )

const menu = ref([
    {
        label: '',
        icon: 'save',
        action: 'save',
    }
])

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
