import {LEDGER_TX_HASH_SIGN_MIN_VERSION} from './constants';

export function isLedgerVersionForSigningUsingHash(version: string) : boolean {
    let i, diff;
    const regExStrip0 = /(\.0+)+$/;
    const segmentsA = version.replace(regExStrip0, '').split('.');
    const segmentsB = LEDGER_TX_HASH_SIGN_MIN_VERSION.replace(regExStrip0, '').split('.');
    const l = Math.min(segmentsA.length, segmentsB.length);

    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
        if (diff < 0) {
            return false;
        } else if ( diff > 0 ) {
            return true;
        }
    }

    return segmentsA.length >= segmentsB.length;
}
