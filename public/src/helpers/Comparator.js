import { Notify }                       from 'quasar';

import _                                from 'lodash';
import moment                           from 'moment';
import numeral                          from 'numeral';
import de                               from 'numeral/locales/de';

import debug                            from 'debug';
const log                               = debug('app:helpers:Comparator');
numeral.locale('de');
export default function Comparator({}) {

    function boolean (valueA, valueB, nodeA, nodeB, isDescending) {
        return (valueA) ? 0 : (valueB) ? 1 : -1;
    }

    return {
        boolean
    };
}
