const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

function getClientEnvironment() {
    const raw = Object.keys(process.env).reduce(
        (env, key) => {
            env[key] = process.env[key];
            return env;
        },
        {
            NODE_ENV: process.env.NODE_ENV || 'development'
        }
    );
    
    const stringified = {
        'process.env': Object.keys(raw).reduce((env, key) => {
            env[key] = JSON.stringify(raw[key]);
            return env;
        }, {}),
    };

    return {raw, stringified};
}

const env = getClientEnvironment();

switch (process.env.NODE_ENV) {
    case 'production':
        module.exports = {
            mode: "production",
            entry: [
                path.resolve(__dirname, "..", "src", "index.tsx"),
            ],
            output: {
                path: path.join(__dirname, "../dist"),
                filename: "[name].js",
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
                fallback: {
                    fs: false,
                    "path": require.resolve("path-browserify")
                }
            },
            module: {
                noParse: /\.wasm$/,
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: "ts-loader",
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.wasm$/,
                        loader: "base64-loader",
                        type: "javascript/auto",
                    }
                ],
            },
            optimization: {
                minimize: true
            },
            plugins: [
                new CopyPlugin({
                    patterns: [{from: ".", to: ".", context: "static"}]
                }),
            ]
        }
        break;
    case 'development':
        module.exports = {
            mode: "development",
            devtool: "source-map",
            entry: [
                path.resolve(__dirname, "..", "src", "index.tsx"),
            ],
            output: {
                sourceMapFilename: "./[name].js.map",
                pathinfo: true,
                path: path.join(__dirname, "../build"),
                filename: "[name].js",
            },
            resolve: {
                extensions: [".tsx", ".ts", ".js"],
                fallback: {
                    fs: false,
                    "path": require.resolve("path-browserify")
                }
            },
            module: {
                noParse: /\.wasm$/,
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: "ts-loader",
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.wasm$/,
                        loader: "base64-loader",
                        type: "javascript/auto",
                    }
                ],
            },
            optimization: {
                minimize: false
            },
            plugins: [
                new CopyPlugin({
                    patterns: [{from: ".", to: ".", context: "static"}]
                }),
                new webpack.DefinePlugin(env.stringified)
            ]
        }
        break;
}