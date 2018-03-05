import {EventEmitter} from 'events';

/**
 *
 * @class MetaData
 */
class MetaData extends EventEmitter {
    /**
     *
     */
    constructor() {
        super();
        this.requests = [];
        this.logs = [];
        this.blueprint = [];
    }

    /**
     *
     * @param {string} name
     * @param {Object} obj
     * @returns {{update: (function(Object))}}
     */
    add(name, obj) {
        let _this = this,
            list = this[name];

        list.push(obj);
        _this.emit('change:' + name, list);

        return {
            /**
             *
             * @param {Object} mod
             */
            update(mod) {
                Object.assign(obj, mod);
                _this.emit('change:' + name, list);
            }
        };
    }
}

const mocks = {
    'api/user': {
        id: 1,
        login: 'Robin Bobin'
    },
    'api/articles?random=1&userid=1': [{
        id: 2, text: 'Article 2'
    }],
    'api/related?articleid=2': [
        {id: 3, text: 'Article 3'},
        {id: 4, text: 'Article 4'}
    ],
    'api/tags?articleid=2': [
        {id: 1, tag: 'tag 1'},
        {id: 2, tag: 'tag 2'}
    ],
    'api/comments?articleid=2': [
        {id: 1, comment: 'Comment 1'},
        {id: 2, comment: 'Comment 2'}
    ]

};

/**
 * @typedef {{meta: MetaData, fetch: function, log: function, renderAvatar: function, renderArticle: function, renderComments: function, renderRelated: function, renderTags: function}} UtilsHelper
 */

/**
 *
 * @returns {UtilsHelper}
 */
export function factory() {
    let meta = new MetaData();

    /**
     *
     * @param {string} url
     * @param {Function} callback
     */
    function fetch(url, callback) {
        let request = meta.add('requests', {
            url: url,
            status: 'in-progress',
            start: new Date(),
            finish: null
        });

        let emit = (error, data) => {
            request.update({
                status: (error) ? 'error' : 'success',
                finish: new Date()
            });

            callback(error, data);
        };

        setTimeout(() => {
            if (url.indexOf('fail=1') !== -1) {
                return emit(new Error('Request failed:' + url));
            }

            if (url.indexOf('fail=0.5') !== -1 && Math.random() > 0.5) {
                return emit(new Error('Request failed:' + url));
            }

            let payload = mocks[url] ? mocks[url] : {};

            return emit(null, payload);
        }, Math.round(Math.random() * 1000) + 300);
    }

    /**
     *
     * @param {*} data
     */
    function log(...args) {
        let data = args.map((arg) => (typeof arg === 'string') ? arg : JSON.stringify(arg, null, 4));

        meta.add('logs', {
            timestamp: new Date(),
            data: data.join(' ')
        });
    }

    /**
     *
     * @param {string} type
     * @param {*} data
     */
    function render(type, data) {
        if (!data) {
            throw new Error('Invalid data');
        }

        log('Render block "' + type + '". Payload: ', data);
        meta.add('blueprint', {
            type,
            data
        })
    }

    function renderAvatar(data) {
        render('avatar', data);
    }

    function renderArticle(data) {
        render('article', data);
    }

    function renderComments(data) {
        render('comments', data);
    }

    function renderRelated(data) {
        render('related', data);
    }

    function renderTags(data) {
        render('tags', data);
    }

    return {
        meta,
        fetch,
        log,

        renderAvatar,
        renderArticle,
        renderComments,
        renderRelated,
        renderTags
    };
}
