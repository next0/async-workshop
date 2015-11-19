export default {
    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'callback example 0': function (utils) {
        var log = utils.log;
        var fetch = utils.fetch;

        log('start working...');
        fetch('1', function (error, result1) {
            if (error) {
                return log('ERROR:', error.message);
            }

            log('r1 ->', result1);
            log('done!');
        });
        log('tired...');
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'callback example 1': function (utils) {
        var log = utils.log;
        var fetch = utils.fetch;

        fetch('1', function (error, result1) {
            if (error) {
                return log('ERROR:', error.message);
            }
            log('r1 ->', result1);

            fetch('2', function (error, result2) {
                if (error) {
                    return log('ERROR:', error.message);
                }
                log('r2 ->', result2);

                fetch('3', function (error, result3) {
                    if (error) {
                        return log('ERROR:', error.message);
                    }
                    log('r3 ->', result3);

                    log('done!');
                });
            });
        });
    },

    /**
     *
     * @param {{fetch: Function, log: Function}} utils
     */
    'callback example 2': function (utils) {
        var log = utils.log;
        var fetch = utils.fetch;

        var parallel = function (fn, urls, done) {
            var responses = new Array(urls.length),
                remainingCount = urls.length,
                isResultSend = false;

            urls.forEach(function (url, ind) {
                fn(url, function (error, result) {
                    if (isResultSend) {
                        return;
                    }

                    if (error) {
                        isResultSend = true;
                        done(error);
                        return;
                    }

                    responses[ind] = result;
                    remainingCount--;

                    if (!remainingCount) {
                        done(null, responses);
                    }
                });
            });
        };

        parallel(fetch, ['1', '2', '3'], function (error, result) {
            if (error) {
                return log('ERROR:', error.message);
            }

            log('[r1, r2, r3] ->', result);
            log('done!');
        });
    }
};
