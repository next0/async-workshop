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

/**
 *
 * @returns {{meta: MetaData, fetch: fetch, log: log}}
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
            if (url.indexOf('-fail') !== -1) {
                return emit(new Error('Request failed:' + url));
            }

            return emit(null, url);
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

    return {meta, fetch, log};
}
