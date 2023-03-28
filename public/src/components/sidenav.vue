<template>
    <q-list class="rounded-borders">
        <q-expansion-item
            v-for="item in struct"
            :key="item._id"
            expand-separator
            header-class="bg-primary text-white text-bold"
            default-opened
            disable
            dense
            expand-icon-class="text-white"
        >
            <template v-slot:header>
                <q-item-section avatar>
                    <q-avatar :icon="item.icon" text-color="white"/>
                </q-item-section>

                <q-item-section>
                    {{ item.label }}
                </q-item-section>
            </template> 
            <template v-for="child of  item.children" :key="child._id" >
                <q-item 
                    dense 
                    class="q-pl-xl text-grey-8" 
                    clickable 
                    @click="clickSideNav(child.path)"
                    :class="{ 'bg-blue-grey-2': route.fullPath === child.path  }"
                >
                   
                    <q-item-section avatar>
                        <q-icon color="grey-7" size="16px" name="chevron_right" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{child.label}}</q-item-label>
                        <q-badge v-if="child.errors" class="q-mr-sm" style="margin-top: 12px" color="red-9" text-color="white" :label="child.errors" rounded floating/>
                    </q-item-section>
                </q-item>
                <q-separator/>
            </template>

        </q-expansion-item>
    </q-list>
</template>
<script setup lang="ts">
import { useRouter, useRoute }  from 'vue-router'
import { mainStore }            from 'src/stores/main.store'
import { watch }                from 'vue';
import { modulesStore, IModuleInterface }         from 'src/stores/modules.store';   
import { storeToRefs }          from 'pinia';

const router    = useRouter()
const route     = useRoute()

function clickSideNav (path: string) {
    router.push(path)
}

defineProps<{
    struct: {
        type: Array<Record<any, any>>,
        required: true
    }
}>()

</script>

<style scoped lang="scss">
.item {
    min-height: 40px !important;
}
</style>