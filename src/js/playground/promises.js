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
        return new Promise(function (resolve, reject) {
            fn(url, function (error, result) {
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
    'promise example 0': function (utils) {
        var log = utils.log;
        var fetch = wrap(utils.fetch);

        fetch('1')
            .then(function (result1) {
                log('r1 ->', result1);
                log('done!');
            })
            .catch(function (error) {
                log('ERROR:', error.message);
            });
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'promise example 1': function (utils) {
        var log = utils.log;
        var fetch = wrap(utils.fetch);

        fetch('1')
            .then(function (result1) {
                log('r1 ->', result1);
                return fetch('2');
            })
            .then(function (result2) {
                log('r2 ->', result2);
                return fetch('3');
            })
            .then(function (result3) {
                log('r3 ->', result3);
                log('done!');
            })
            .catch(function (error) {
                log('ERROR:', error.message);
            });
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'promise example 2': function (utils) {
        var log = utils.log;
        var fetch = wrap(utils.fetch);

        Promise.all([
            fetch('1'),
            fetch('2'),
            fetch('3')
        ])
            .then(function (result) {
                log('[r1, r2, r3] ->', result);
                log('done!');
            })
            .catch(function (error) {
                log('ERROR:', error.message);
            });
    }
};
