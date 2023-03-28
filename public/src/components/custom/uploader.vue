<template>
    <my-uploader
        ref="uploader"
        :formData="formData"
        color="primary"
        max-files="1"
        hide-upload-btn
        class="full-width"
        flat
        bordered
        max-file-size="10485760"
        @done="finishUpload"
    />
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeMount }              from 'vue'
import { defineStore, storeToRefs }    from 'pinia'
import MyUploader                       from 'src/components/custom/myUploader.js'
const props = defineProps({
    maxFiles: {
        type: Number,
        default: 1
    },
    factory: {
        type: Function,
        default: null
    },
    storeName: {
        type: String,
        default: ''
    },
    formData: {
        type: Object
    }
})

const uploader              = ref(null)
let store: any              = null
onBeforeMount( () => {
    if ( props.storeName ) {
        const useStore = defineStore(props.storeName, {})
        store = useStore()
    }
} )

onMounted(() => {
    setTimeout(() => {
        if ( props.storeName ) {
            const useUploadStore = defineStore(props.storeName, {})
            store._uploader   = uploader.value
        }
    })
})

const finishUpload = () => {
    if ( props.storeName ) {
        if ( store.finishUpload )
            store.finishUpload()
    }
}

</script>