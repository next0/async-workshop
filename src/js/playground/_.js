/**
 * 'api/user'
 * 'api/articles?random=1&userid='
 * 'api/comments?articleid='
 * 'api/related?articleid='
 * 'api/tags?articleid='
 * 'api/log/time?fail=0.5&duration='
 * 'api/log/error'
 */
export default {
    /**
     * @param {UtilsHelper} utils
     */
    'async await': async function (utils) {
        let log = utils.log;

        function fetch(url) {
            return new Promise((resolve, reject) => {
                utils.fetch(url, (error, payload) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(payload);
                    }
                });
            });
        }

        let start = Date.now();

        try {
            let user = await fetch('api/user');
            utils.renderAvatar(user);

            let article = await fetch('api/articles?random=1&userid=' + encodeURIComponent(user.id));
            utils.renderArticle(article);

            let id = article[0].id;

            let result = await Promise.all([
                fetch('api/comments?articleid=' + encodeURIComponent(id)),
                fetch('api/related?articleid=' + encodeURIComponent(id)),
                fetch('api/tags?articleid=' + encodeURIComponent(id))
            ]);

            utils.renderComments(result[0]);
            utils.renderRelated(result[1]);
            utils.renderTags(result[2]);

            let duration = Date.now() - start;

            log('Total time:', duration);

            try {
                await fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration));
            } catch (error) {
                await fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration));
            }

            log('Done');
        } catch (error) {
            fetch('api/log/error');
        }
    },

    /**
     * @param {UtilsHelper} utils
     */
    'promises': function (utils) {
        let log = utils.log;

        function fetch(url) {
            return new Promise((resolve, reject) => {
                utils.fetch(url, (error, payload) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(payload);
                    }
                });
            });
        }

        let start = Date.now();

        fetch('api/user')
            .then((user) => {
                utils.renderAvatar(user);
                return fetch('api/articles?random=1&userid=' + encodeURIComponent(user.id));
            })
            .then((article) => {
                utils.renderArticle(article);

                let id = article[0].id;

                return Promise.all([
                    fetch('api/comments?articleid=' + encodeURIComponent(id)),
                    fetch('api/related?articleid=' + encodeURIComponent(id)),
                    fetch('api/tags?articleid=' + encodeURIComponent(id))
                ]);
            })
            .then((result) => {
                utils.renderComments(result[0]);
                utils.renderRelated(result[1]);
                utils.renderTags(result[2]);

                let duration = Date.now() - start;

                log('Total time:', duration);

                return fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration))
                    .catch(() => {
                        return fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration));
                    });
            })
            .then(() => {
                log('Done');
            })
            .catch((error) => {
                fetch('api/log/error');
                throw error;
            });
    },

    /**
     * @param {UtilsHelper} utils
     */
    'callback hell': function (utils) {
        let log = utils.log;
        let fetch = utils.fetch;

        let start = Date.now();

        function parallel(fn, urls, done) {
            let res = urls.map(() => null);
            let count = urls.length;

            urls.forEach((url, ind) => {
                fn(url, (error, payload) => {
                    if (error) {
                        done(error, null);
                    }

                    res[ind] = payload;
                    count--;

                    if (!count) {
                        done(null, res);
                    }
                });
            });
        }

        fetch('api/user', (error, avatarResult) => {
            if (error) {
                fetch('api/log/error');
                return;
            }

            utils.renderAvatar(avatarResult);

            fetch('api/articles?random=1&userid=' + encodeURIComponent(avatarResult.id), (error, articleResult) => {
                if (error) {
                    fetch('api/log/error');
                    return;
                }

                utils.renderArticle(articleResult);

                let id = articleResult[0].id;

                parallel(fetch, [
                    'api/comments?articleid=' + encodeURIComponent(id),
                    'api/related?articleid=' + encodeURIComponent(id),
                    'api/tags?articleid=' + encodeURIComponent(id)
                ], (error, result) => {
                    if (error) {
                        fetch('api/log/error');
                        return;
                    }

                    utils.renderComments(result[0]);
                    utils.renderRelated(result[1]);
                    utils.renderTags(result[2]);

                    let duration = Date.now() - start;
                    log('Total time:', Date.now() - start);

                    fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration), (error, timeResult) => {
                        if (error) {
                            fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration), (error, timeResult) => {
                                if (error) {
                                    fetch('api/log/error');
                                    return;
                                }

                                log('Done');
                            });
                        } else {
                            log('Done');
                        }
                    })
                });
            });
        });
    }
};
