import { Notify }                       from 'quasar';
import { Loading, QSpinnerCube }        from 'quasar'
import _                                from 'lodash';
import moment                           from 'moment';

import debug                            from 'debug';
const log         = debug('app:helpers:Validate');

export default function Global( { } ) {

    const Note = ( { type, message, timeout } ) => {
        let color = 'negative';
        if ( type === 'error' && !message )
            message = 'Fehler beim Speichern';

        if ( type === 'success' && !message )
            message = 'Speichern erfolgreich';

        if ( type === 'warning' && !message )
            message = 'Warnung';

        if ( type === 'error' )
            color = 'negative';

        if ( type === 'success' )
            color = 'green-6';

        if ( type === 'warning' )
            color = 'yellow-6';

        Notify.create({
            actions: [
                { icon: 'close', color: 'white' }
            ],
            message: message || 'Error',
            color: color || 'negative',
            icon: 'warning',
            position: 'top',
            timeout: timeout || 5000,
        })
    }
    function showLoading( { message } ) {
        Loading.show({
            spinner: QSpinnerCube,
            spinnerColor: 'orange-6',
            message,
            messageColor: 'white'
        })
    }

    function hideLoading() {
        Loading.hide()
    }

   return {
        Note,
        showLoading,
        hideLoading
   }
}
