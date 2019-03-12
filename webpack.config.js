const path = require('path');
const autoprefixer = require('autoprefixer');

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ROOT_PATH = path.join(__dirname, '/');
const DEVELOPMENT_MODE = !process.argv.some(function (arg) {
    return arg === '--production'
});

// console.log('Webpack running in ' + (DEVELOPMENT_MODE ? 'DEV' : 'PROD') + ' mode');

module.exports = {
    entry: {
        polyfill: 'babel-polyfill',
        main: ROOT_PATH + '/src/js/index.js',
        styles: ROOT_PATH + '/src/css/main.css'
    },

    watch: DEVELOPMENT_MODE,
    debug: DEVELOPMENT_MODE,
    devtool: DEVELOPMENT_MODE ? '#inline-source-map' : false,

    output: {
        filename: '[name].bundle.js',
        path: ROOT_PATH + '/dist/assets',
        publicPath: '/assets'
    },

    module: {
        loaders: [
            {
                test: /\.(svg|png|jpg|gif)$/,
                loader: 'file',
                query: {
                    name: 'images/[name]-[hash].[ext]'
                }
            },
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract([
                    'css?' + (DEVELOPMENT_MODE ? 'sourceMap' : 'minimize&-svgo'),
                    'postcss-loader'
                ])
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
                query: {
                    presets: ['es2015'],
                    plugins: ['transform-async-to-generator'],
                    cacheDirectory: true
                }
            }
        ]
    },

    postcss: function () {
        return [
            autoprefixer({
                browsers: ['last 2 versions']
            })
        ];
    },

    plugins: (function () {
        let plugings = [
            new ExtractTextPlugin('[name].bundle.css')
        ];

        if (!DEVELOPMENT_MODE) {
            plugings = plugings.concat([
                new webpack.optimize.DedupePlugin(),
                new webpack.optimize.UglifyJsPlugin({
                    compressor: {
                        warnings: false
                    }
                }),
                new webpack.optimize.AggressiveMergingPlugin()
            ]);
        }

        return plugings;
    })()
};
