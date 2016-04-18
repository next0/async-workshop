/**
 *
 * @param {Function} fn
 * @returns {Function}
 */
function wrap(fn) {
    /**
     *
     * @param {string} url
     * @returns {Promise}
     */
    return function (url) {
        return new Promise((resolve, reject) => {
            fn(url, (error, result) => {
                return error ? reject(error) : resolve(result);
            });
        });
    }
}

export default {
    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'async function example 0': async function (utils) {
        let log = utils.log;
        let fetch = wrap(utils.fetch);

        try {
            let result1 = await fetch('1');
            log('r1 ->', result1);
            log('done!');
        } catch (error) {
            log('ERROR:', error.message);
        }
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'async function example 1': async function (utils) {
        let log = utils.log;
        let fetch = wrap(utils.fetch);

        try {
            let result1 = await fetch('1');
            log('r1 ->', result1);

            let result2 = await fetch('2');
            log('r2 ->', result2);

            let result3 = await fetch('3');
            log('r3 ->', result3);

            log('done!');
        } catch (error) {
            log('ERROR:', error.message);
        }
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'async function example 2': async function (utils) {
        let log = utils.log;
        let fetch = wrap(utils.fetch);

        try {
            let result = await Promise.all([
                fetch('1'),
                fetch('2'),
                fetch('3')
            ]);

            log('Promise.all([r1, r2, r3]) ->', result);
            log('done!');
        } catch (error) {
            log('ERROR:', error.message);
        }
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'async function example 100500': async function (utils) {
        let log = utils.log;
        let fetch = wrap(utils.fetch);

        let result1 = await fetch('1');
        log('r1 ->', result1);

        let [result2, result3] = await Promise.all([
            fetch('2'),
            fetch('3')
        ]);
        log('Promise.all([r2, r3]) ->', result2, result3);

        try {
            let [result4, result5, result6] = await Promise.all([
                fetch('4'),
                fetch('5-fail'),
                fetch('6')
            ]);
            log('Promise.all([r4, r5, r6]) ->', result4, result5, result6);
        } catch (error) {
            log('error handled -> repair', '(', error.message, ')');

            let result7 = await fetch('7');
            log('r7 ->', result7);
        }

        let result8or9or10 = await Promise.race([
            fetch('8'),
            fetch('9'),
            fetch('10')
        ]);
        log('Promise.race([r8, r9, r10])', result8or9or10);

        let result11 = await fetch('11');
        log('r11 ->', result11);

        try {
            let result12or13or14 = await Promise.race([
                fetch('12-fail'),
                fetch('13-fail'),
                fetch('14')
            ]);
            log('Promise.race([r12, r13, r14]) ->', result12or13or14);

            let result15 = await fetch('15');
            log('r15 ->', result15);
        } catch (error) {
            log('error handled -> repair', '(', error.message, ')');

            let result16 = await fetch('16');
            log('r16 ->', result16);
        }

        log('done!');
    }
}
