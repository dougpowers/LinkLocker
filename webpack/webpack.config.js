const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

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
                new webpack.DefinePlugin({
                    __IN_DEBUG__: JSON.stringify(false)
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
                new webpack.DefinePlugin({
                    __IN_DEBUG__: JSON.stringify(true),
                    __DEBUG_LIST__: JSON.stringify(
                        [{"guid":"41648719-197b-4523-8bc9-f7aa4f8b7967","href":"https://www.wikipedia.org/","title":"Wikipedia","timestamp":1674962750216,"keywords":""},{"guid":"c3bdfec6-7844-440d-8977-16d83721e548","href":"https://www.wikipedia.org/","title":"Wikipedia","timestamp":1674962751015,"keywords":""},{"guid":"ba0e31e6-f196-4484-b19b-7a5b1b505294","href":"https://www.wikipedia.org/","title":"Wikipedia","timestamp":1674962751287,"keywords":""},{"guid":"b66b4a1a-9f94-4a7f-ac81-8f4ccd158b2e","href":"https://www.wikipedia.org/","title":"Wikipedia","timestamp":1674962751599,"keywords":""}]
                    ),
                }),
            ]
        }
        break;
}