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
        const log = utils.log;

        function fetch(url) {
            return new Promise((resolve, reject) => {
                utils.fetch(url, (error, payload) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(payload);
                });
            });
        }

        const start = Date.now();

        try {
            const user = await fetch('api/user');
            utils.renderAvatar(user);

            const articles = await fetch('api/articles?random=1&userid=' + encodeURIComponent(user.id));
            utils.renderArticle(articles[0]);

            const id = articles[0].id;

            const promises = [
                fetch('api/comments?articleid=' + encodeURIComponent(id)),
                fetch('api/related?articleid=' + encodeURIComponent(id)),
                fetch('api/tags?articleid=' + encodeURIComponent(id))
            ];

            const results = await Promise.all(promises);

            const comments = results[0];
            const related = results[1];
            const tags = results[2];

            utils.renderComments(comments);
            utils.renderRelated(related);
            utils.renderTags(tags);

            const duration = Date.now() - start;

            log('work time:', duration);

            try {
                await fetch('api/log/time?fail=1&duration=' + encodeURIComponent(duration));
            } catch (error) {
                await fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration));
            }

            log('Done!');
        } catch (error) {
            await fetch('api/log/error');
        }
    },

    /**
     * @param {UtilsHelper} utils
     */
    'promises': function (utils) {
        const log = utils.log;

        function fetch(url) {
            return new Promise((resolve, reject) => {
                utils.fetch(url, (error, payload) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(payload);
                });
            });
        }

        const start = Date.now();

        fetch('api/user')
            .then((user) => {
                utils.renderAvatar(user);
                return fetch('api/articles?random=1&userid=' + encodeURIComponent(user.id));
            })
            .then((articles) => {
                utils.renderArticle(articles[0]);

                const id = articles[0].id;

                const promises = [
                    fetch('api/comments?articleid=' + encodeURIComponent(id)),
                    fetch('api/related?articleid=' + encodeURIComponent(id)),
                    fetch('api/tags?articleid=' + encodeURIComponent(id))
                ];

                return Promise.all(promises);
            })
            .then((results) => {
                const comments = results[0];
                const related = results[1];
                const tags = results[2];

                utils.renderComments(comments);
                utils.renderRelated(related);
                utils.renderTags(tags);

                const duration = Date.now() - start;

                log('work time:', duration);

                return fetch('api/log/time?fail=1&duration=' + encodeURIComponent(duration))
                    .catch((error) => {
                        return fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration));
                    });
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
        const log = utils.log;
        const fetch = utils.fetch;

        const start = Date.now();

        function parallel(fetch, urls, done) {
            let results = Array(urls.length);
            let count = urls.length;

            urls.forEach((url, ind) => {
                fetch(url, (error, payload) => {
                    if (error) {
                        done(error);
                        return;
                    }

                    results[ind] = payload;
                    count--;

                    if (!count) {
                        done(null, results);
                    }
                });
            });
        }

        fetch('api/user', (error, userResult) => {
            if (error) {
                fetch('api/log/error');
                return;
            }

            utils.renderAvatar(userResult);

            fetch('api/articles?random=1&userid=' + encodeURIComponent(userResult.id), (error, articles) => {
                if (error) {
                    fetch('api/log/error');
                    return;
                }

                utils.renderArticle(articles[0]);

                const id = articles[0].id;

                parallel(fetch, [
                    'api/comments?articleid=' + encodeURIComponent(id),
                    'api/related?articleid=' + encodeURIComponent(id),
                    'api/tags?articleid=' + encodeURIComponent(id)
                ], (error, result) => {
                    if (error) {
                        fetch('api/log/error');
                        return;
                    }

                    const comments = result[0];
                    const related = result[1];
                    const tags = result[2];

                    utils.renderComments(comments);
                    utils.renderRelated(related);
                    utils.renderTags(tags);

                    const duration = Date.now() - start;

                    log('work time:', duration);

                    fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration), (error, time) => {
                        if (error) {
                            fetch('api/log/time?fail=0.5&duration=' + encodeURIComponent(duration), (error, time) => {
                                if (error) {
                                    fetch('api/log/error');
                                    return;
                                }

                                log('Done!');
                            });

                            return;
                        }

                        log('Done!');
                    });
                });
            });
        });
    }
};
