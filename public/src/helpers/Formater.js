import { Notify }                       from 'quasar';

import _                                from 'lodash';
import moment                           from 'moment';
import numeral                          from 'numeral';
import de                               from 'numeral/locales/de';

import debug                            from 'debug';
const log                               = debug('app:helpers:Formater');
numeral.locale('de');
export default function Formater({}) {

    function priceView( value ) {
        return `${numeral(value).format('0,0.00')} €`;
    }

    function price( params ) {
        let value = getValue(params);
        return `${numeral(value).format('0,0.00')} €`;
    }

    function date( params ) {
        let value = getValue(params);
        if (value)
            return moment(value).format('DD.MM.YYYY');
        else
            return '';
    }

    function getValue (params) {
        if ( !params.colDef )
            return '';

        const str = params.colDef.field;

        let value = params.data;
        let result = value[str];

        for(const next of str.split('.')) {
            if ( !value[next] )
                break;
            result = value[next]
        }

        return result
    }

    const dateFilterParams = {
        comparator: (filterLocalDateAtMidnight, cellValue) => {
          let dateAsString = cellValue;
          
          if (dateAsString == null) 
            return -1;

          let dateParts = dateAsString.split('.');
          let cellDate = new Date(
            Number(dateParts[2]),
            Number(dateParts[1]) - 1,
            Number(dateParts[0])
          );

          if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
          }
          if (cellDate < filterLocalDateAtMidnight) {
            return -1;
          }
          if (cellDate > filterLocalDateAtMidnight) {
            return 1;
          }
        },
        browserDatePicker: true,
      };

    return {
        date,
        price,
        getValue,
        priceView,
        dateFilterParams
    };
}
