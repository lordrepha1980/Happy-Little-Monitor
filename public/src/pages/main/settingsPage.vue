<template>
    <cust-page v-if="!loading" :noGrid="true" :noMenu="true" :subScrollHeight="Platform.is.platform === 'iphone' ? 90 : 0">
        <template #header>
            <div class="row">
                <div class="col-6 text-subtitle2 text-primary">
                    <q-icon name="layers" />
                    Settings
                </div>
            </div>
        </template>
        <template #content>
            <cust-form stateName="account">
                <template #content>
                    <div class="row text-white text-body1">
                        <div class="col-12 text-h6 text-white q-mt-sm q-pl-sm">
                            Serverdata
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                        <div class="col-6 flex items-center q-pl-md">
                            Show Server
                        </div>
                        <div class="col-6 flex justify-end">
                            <cust-toggle label="" @update:model-value="saveForm" v-model="form.serverStatus" />
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                        <div class="col-6 flex items-center q-pl-md">
                            Show MongoDB
                        </div>
                        <div class="col-6 flex justify-end">
                            <cust-toggle label="" @update:model-value="saveForm" v-model="form.mongodbStatus" />
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                        <div class="col-6 flex items-center q-pl-md">
                            Show Nginx
                        </div>
                        <div class="col-6 flex justify-end">
                            <cust-toggle label="" @update:model-value="saveForm" v-model="form.nginxStatus" />
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                        <div class="col-12 text-h6 text-white q-mt-lg q-pl-sm">
                            Alarm
                        </div>
                        <div class="col-12">
                            <q-separator dark/>
                        </div>
                        <div class="col-12 q-mt-md">
                            <cust-input label="E-Mail" @blur="saveForm" :disable="false" v-model="form.alarmMail"  />
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
import CustInput            from 'src/components/custom/input.vue'
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

async function saveForm () {
    await useAccountStore.save()
}

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
