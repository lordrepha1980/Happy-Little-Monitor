// MyUploader.js
import { createUploaderComponent }  from 'quasar'
import { computed, ref }            from 'vue'
import { dataService }              from 'src/services/data.service'
import debug                        from 'debug'
const log                           = debug('app:MyUploader')

// export a Vue component
export default createUploaderComponent({
  // defining the QUploader plugin here

  name: 'MyUploader', // your component's name

  props: {
    // ...your custom props
    formData: {
        type: Object,
        default: () => ({})
    }
  },

  emits: [
    'done'  
  ],

  injectPlugin ({ props, emit, helpers }) {
    // can call any other composables here
    // as this function will run in the component's setup()

    const uploadingInProgress = ref(false)

    // [ REQUIRED! ]
    // We're working on uploading files
    const isUploading = computed(() => {
      // return <Boolean>
      return uploadingInProgress.value
    })

    // [ optional ]
    // Shows overlay on top of the
    // uploader signaling it's waiting
    // on something (blocks all controls)
    // const isBusy = computed(() => {
    //   // return <Boolean>

    // })

    // [ REQUIRED! ]
    // Abort and clean up any process
    // that is in progress
    function abort () {
      // ...
    }

    // [ REQUIRED! ]
    // Start the uploading process
    async function upload ( data ) {
        const uploadedFiles = []
        for ( const file of helpers.queuedFiles.value ) {
            props.formData.append( 'filename', file.name )
            props.formData.append( 'file', file)
            helpers.updateFileStatus(
                file,
                'uploading',
                file.size / 2
            );
            helpers.uploadedSize.value += file.size / 2;

            try {
                await dataService.uploadFile({body: props.formData});

                helpers.updateFileStatus(
                    file,
                    'uploaded',
                    file.size
                );

                helpers.uploadedSize.value += file.size / 2;
                emit('done');

            } catch (error) {
                log(error);

                helpers.updateFileStatus(
                    file,
                    'failed',
                    0
                );
            }
  
        }
        
    }

    return {
      isUploading,
      abort,
      upload
    }
  }
})