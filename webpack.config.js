const BUILD_NUMBER = process.env.build_number;
const TELEMETRY_VER = process.env.telemetry_version_number;

// Required dependency files
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const expose = require('expose-loader');
const glob = require('glob-all');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const fs = require('fs');
var WebpackOnBuildPlugin = require('on-build-webpack');


const BUILD_FOLDER_NAME = 'telemetry-dist';

const BASE_PATH = './'

const TELEMETRY = [
    './libs/ajv.min.js',
    './libs/detectClient.js',
    './libs/fingerprint2.min.js',
    './libs/md5.js',
    './core/telemetryV3Interface.js',
    './core/telemetrySyncManager.js'
];

// removing the duplicate files
const SCRIPTS = [...new Set([...TELEMETRY])];


if (!BUILD_NUMBER && !TELEMETRY_VER) {
    console.error('Error!!! Cannot find telemetry_version_number and build_number env variables');
    return process.exit(1)
}
const VERSION = TELEMETRY_VER + '.' + BUILD_NUMBER;

module.exports = (env, argv) => {
    return {
        entry: {
            'script': SCRIPTS,
        },
        output: {
            filename: `[name].min.${VERSION}.js`,
            path: path.resolve(__dirname, BUILD_FOLDER_NAME)
        },
        resolve: {
            alias: {
                'Fingerprint2': path.resolve(`${FOLDER_PATHS.jsLibs}telemetry-lib/fingerprint2.min.js`),
                'ajv': require.resolve(`${FOLDER_PATHS.basePath}node_modules/ajv/dist/ajv.min.js`)
            }
        },
        module: {
            rules: [{
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.basePath}public/libs/jquery.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: '$'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.jsLibs}build/telemetry.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'EkTelemetry'
                    }]
                },
                {
                    test: require.resolve(`${FOLDER_PATHS.jsLibs}telemetry-lib/fingerprint2.min.js`),
                    use: [{
                        loader: 'expose-loader',
                        options: 'Fingerprint2'
                    }]
                },
                {
                    test: require.resolve('../js-libs/telemetry-lib/md5.js'),
                    use: [{
                        loader: 'expose-loader',
                        options: 'CryptoJS'
                    }]
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin([path.resolve(__dirname, BUILD_FOLDER_NAME)]),
            new webpack.ProvidePlugin({
                "window.$": "jquery",
                "window._": 'underscore',
                $: 'jquery',
                jQuery: 'jquery',
                _: 'underscore',
                async: "async",
                Fingerprint2: 'Fingerprint2',
            }),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.optimize\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    safe: true,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        ],
        optimization: {
            splitChunks: {
                chunks: 'async',
                minSize: 30000,
                minChunks: 1,
                maxAsyncRequests: 5,
                maxInitialRequests: 3,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    styles: {
                        name: 'style',
                        test: /\.css$/,
                        chunks: 'all',
                        enforce: false
                    }
                },
            }

        }
    }
};