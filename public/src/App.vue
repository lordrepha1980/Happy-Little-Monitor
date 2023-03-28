<template>
  <router-view :key="link" />
</template>

<script setup lang="ts">
import { useRoute }         from 'vue-router'
import { watch, ref }       from 'vue'
import { mainStore }        from 'src/stores/main.store'
const link                  = ref('')
const route                 = useRoute()
const useMainStore          = mainStore()
watch(route, () => {
    const linkArr = route.path.split('/')
    if (linkArr[1] && linkArr[1] !== link.value) {
        link.value = linkArr[1]
        useMainStore._selectedModule = linkArr[1]
    }

}, { immediate: true })

</script>
