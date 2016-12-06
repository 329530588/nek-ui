module.exports = {
    output: {
        filename: 'nek-ui.js',
        library: 'NEKUI',
        libraryTarget: 'umd'
    },
    externals: {
        'regularjs': {
            root: "Regular",
            amd: "Regular",
            commonjs: "regularjs",
            commonjs2: "regularjs"
        }
    },
    module: {
        loaders: [
            {test: /\.html$/, loader: 'text-loader'}
        ]
    },
    resolve: {
        alias: {
            'regular-ui-base': __dirname + '/node_modules/regular-ui-base',
            'bowser': __dirname + '/node_modules/bowser'
        }
    }
}