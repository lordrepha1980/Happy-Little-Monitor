<template>
    <cust-page :noGrid="true" :subScrollHeight="40">
        <template #header>
            Stammdaten
        </template>
        <template #menu>
            <Menu :struct="menuStruct" storeName="account" />
        </template>
        <template #content>
            <cust-form @refForm="setForm" storeName="account">
                <template #content>
                    <div class="row q-col-gutter-sm">
                        <div class="col-12 col-md-6">
                            <div class="row q-col-gutter-xs ">
                                <div class="col-12">
                                    <cust-input v-model="form.zulassungsNummer" label="Zulassungsnummer" />
                                </div>
                                <div class="col-6">
                                    <cust-input :disable="true" v-model="form.username" label="E-Mail" type="email" />
                                </div>
                                <div class="col-6">
                                    <cust-select v-model="form.status" options="main/getCompanyStatus" label="Status" />
                                </div>
                                <div class="col-12">
                                    <cust-input :required="true" v-model="form.name" label="Firmenname" />
                                </div>
                                <div class="col-6">
                                    <cust-input :required="true" v-model="form.firstname" label="Vorname" />
                                </div>
                                <div class="col-6">
                                    <cust-input :required="true" v-model="form.lastname" label="Nachname" />
                                </div>
                                <div class="col-12">
                                    <cust-select :required="true" v-model="form.country" label="Land" options="main/getCountrys" />
                                </div>
                                <div class="col-12">
                                    <cust-input :required="true" v-model="form.street" label="Straße + Hausnummer" />
                                </div>
                                <div class="col-4">
                                    <cust-input :required="true" v-model="form.zip" label="PLZ" />
                                </div>
                                <div class="col-8">
                                    <cust-input :required="true" v-model="form.city" label="Stadt" />
                                </div>
                                <div class="col-12">
                                    <cust-input :required="true" v-model="form.tel" label="Telefon" />
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-md-6">
                            <div class="row q-col-gutter-xs ">
                                <div class="col-12 text-caption text-primary">
                                    Neues Passwort vergeben
                                    <q-separator class="q-mb-xs" />
                                </div>
                                <div class="col-12">
                                    <cust-input v-model="form.oldPassword" :required="form.password ? true : false" label="Altes Passwort"/>
                                </div>
                                <div class="col-12">
                                    <cust-input v-model="form.password" label="Neues Passwort" :required="form.oldPassword ? true : false"
                                        :rules="[
                                            (val: any) => validate.passwordRule(val)
                                        ]"
                                    />
                                </div>
                                <div class="col-12">
                                    <cust-input v-model="form.passwordConfirm" label="Neues Passwort wiederholen" :required="form.oldPassword ? true : false"
                                        :rules="[
                                            () => validate.isPasswordConfirm(form)
                                        ]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </cust-form>
        </template>
    </cust-page>
</template>

<script setup lang="ts">

import { ref, onMounted, onBeforeMount }              from 'vue'
import CustCard             from '../../components/custom/card.vue'
import CustInput            from '../../components/custom/input.vue'
import CustButton           from '../../components/custom/button.vue'
import CustForm             from '../../components/custom/form.vue'
import CustDialog           from '../../components/custom/dialog.vue'
import CustSelect           from '../../components/custom/select.vue'
import CustPage             from '../../components/custom/page.vue'
import Menu                 from '../../components/menu.vue'
import Validate             from '../../helpers/Validate'
import { IUserData }        from '../../stores/main.store'
import { accountStore }     from '../../stores/account.store'  

import { storeToRefs }      from 'pinia'

const validate              = Validate({})
const useAccountStore       = accountStore()
const { record: form }        = storeToRefs(useAccountStore)

const showDialog            = ref(false)
const formRef               = ref(null)

function setForm( form: any ) {
    formRef.value = form
}
//TODO: new password
onBeforeMount( async () => {
    //socket listener init
    await useAccountStore.init()
    await useAccountStore.getData()
})

const menuStruct = [
    {
        label: 'Speichern',
        icon: 'save',
        action: 'save'
    }
]

</script>
