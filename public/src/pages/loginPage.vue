<template>
    <q-page class="row items-center justify-evenly">
        <div class="col-10 col-md-6 col-sm-8">
            <cust-card :disableHeader="false">
                <template #header>
                    <div class="row">
                        <div class="col-3">
                            <img src="/logo.png" height="80">
                        </div>
                        <div class="col-9 flex justify-end items-center text-h5 text-primary">Happy Little Monitor</div>
                    </div>
                    
                </template>
                <template #content>
                    <cust-form @refForm="setLoginForm" :dontDisable="true">
                        <template #content>
                            <div class="row q-col-gutter-xs">
                                <div class="col-12">
                                    <cust-input :required="true" :rules="[(val: string) => validate.isEmailValid(val)]" v-model="data.username" label="E-Mail" type="email" />
                                </div>
                                <div class="col-12">
                                    <cust-input :required="true" v-model="data.password" label="Passwort" type="password" />
                                </div>
                                <div class="col-12 q-mt-md">
                                    <cust-button label="Login" @click="clickLogin" />
                                </div>
                            </div>
                            <div class="row q-mt-md text-center">
                                <div class="col-12" v-if="company">
                                    {{company.name}}, {{company.street}}, {{company.zip}} {{company.city}}
                                </div>
                            </div>
                        </template>
                    </cust-form>
                </template>
            </cust-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">

import { ref, onMounted }              from 'vue'
import CustCard             from '../components/custom/card.vue'
import CustInput            from '../components/custom/input.vue'
import CustButton           from '../components/custom/button.vue'
import CustForm             from '../components/custom/form.vue'
import CustDialog           from '../components/custom/dialog.vue'
import CustSelect           from '../components/custom/select.vue'
import CustCheckbox         from '../components/custom/checkbox.vue'
import Validate             from '../helpers/Validate'
import { ILoginData, IUserData, mainStore }        from '../stores/main.store'

import { storeToRefs }      from 'pinia'

const validate              = Validate({})
const useMainStore          = mainStore()
const { company }        = storeToRefs(useMainStore)

const showDialog            = ref(false)
const showRecoverPassword   = ref(false)

const loginForm: any        = ref({})
const registerForm: any     = ref({})
const recoverForm: any      = ref({})
const data                  = ref<ILoginData>({
    username: process.env.DEV ? process.env.register.username : '',
    password: process.env.DEV ? process.env.register.password : '',
})

async function clickLogin() {
    const result = await loginForm.value.methods.validate()

    if ( result ) {
        useMainStore.login(data.value)
    }
}

function setLoginForm (data: any) {
    loginForm.value = data;
}

onMounted( async () => {
    await useMainStore.getCompany()
} )

</script>
