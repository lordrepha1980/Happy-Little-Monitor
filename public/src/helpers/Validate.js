import { Notify }                       from 'quasar';

import _                                from 'lodash';
import moment                           from 'moment';

import debug                            from 'debug';
const log         = debug('app:helpers:Validate');

export default function Validate( { } ) {

    const errorMsg = {
        isDateValid:    'Datum ungültig',
        isDateBeforeToday:    'Das Geburtsdatum muss vor dem heutigen Datum liegen',
        isRequired:     'Pflichfeld',
        isTimeValid:    'Uhrzeit ungültig',
        isPwConfirm:    'Passwörter stimmen nicht überein',
        isEmailValid:   'Email ungültig'
    }

    function typeNormalizeDate( cloneForm, field ) {

        if ( cloneForm && field && cloneForm[field]  ) {
            let chars = cloneForm[field].split('-').length;

            let pattern = 'YYYY-MM-DD';

            if (chars == 1 && cloneForm[field].length == 10) {
                pattern = 'DD.MM.YYYY'
            }

            if (chars == 1 && cloneForm[field].length == 8) {
                pattern = 'DDMMYYYY'
            }

            if (chars == 1 && cloneForm[field].length == 6) {
                pattern = 'DDMMYY'
            }

            cloneForm[field] = moment( cloneForm[field], pattern ).format( 'YYYY-MM-DD' );
        }
    }

    function isDateValid(val) {
        let valid = moment( val, 'DD-MM-YYYY' ).isValid();
        if ( (val && val.length > 0 && val.length < 10) || ( val && !valid ) ) {
            return errorMsg.isDateValid;
        }
        
        return true;
    }

    function isEmailValid(val) {
        const regex = /^\w+([.+-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
        if (regex.exec(val)) 
            return true;
        else
            return errorMsg.isEmailValid;
    }

    function isDateBeforeToday(val) {
        let valid = moment( val, 'DD-MM-YYYY' ).isBefore();

        if ( val && !valid ) {
            return errorMsg.isDateBeforeToday;
        }
        return true;
    }

    function isTimeValid(val) {
        let valid = moment( val, 'HH:mm' ).isValid();
        if ( (val && val.length !== 0 && val.length < 5) || ( val && !valid )  ) {
            return errorMsg.isTimeValid;
        }
        
        return true;
    }

    function isPasswordConfirm( form ) {
        if ( form.password && form.passwordConfirm && form.password !== form.passwordConfirm ) {
            return errorMsg.isPwConfirm;
        }
        return true;
    }

    function passwordRule( val ) {
        //length min 10 chars, 1 number, 1 upper, 1 lower, 1 special
        if ( val ) {
            let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?])(?=.{10,})/
            return regex.test(val) ? true : 'Passwort muss mindestens 10 Zeichen lang sein, eine Zahl, einen Klein- und Großbuchstaben enthalten sowie ein Sonderzeichen (!@#$%^&*?)'
        }
        return true;
    }

    function isRequired(val) {
        if ( val === undefined || val.length === 0 ) {
            log('errorMsg', errorMsg.isRequired)
            return errorMsg.isRequired;
        }
        
        return true;
    }

    function isDateRequired(val) {
        if ( !val || val.length < 10 ) {
            log('errorMsg', errorMsg.isRequired)
            return errorMsg.isRequired;
        }
        
        return true;
    }

    const validColor = ( params ) => {
        if ( params.data.inactive )
            return ''
        if ( ( params.data.reminderDate &&  moment().isBetween(moment(params.data.reminderDate).subtract(params.data.reminderDays, 'days').format('YYYY-MM-DD'), params.data.reminderDate) ) || params.data.reminderDate === moment().format('YYYY-MM-DD') )
            return 'yellowRow'
        else if ( params.data.reminderDate && moment(params.data.reminderDate).subtract(params.data.reminderDays, 'days').format('YYYY-MM-DD') < moment().format('YYYY-MM-DD') )
            return 'redRow'
        else
            return 'greenRow'
    }

    return {
        typeNormalizeDate,
        isDateValid,
        isTimeValid,
        isRequired,
        isPasswordConfirm,
        errorMsg,
        validColor,
        passwordRule, 
        isDateBeforeToday,
        isDateRequired,
        isEmailValid
    };
}
