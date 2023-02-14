const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const npm_package_json = require('../package.json');

const JsonReplacer = (key, value) => {
    if (value instanceof Map) {
        return {
            dataType: 'Map',
            value: Array.from(value.entries()),
        };
    } else {
        return value;
    }
}

switch (process.env.NODE_ENV) {
    case 'production':
        module.exports = {
            mode: "production",
            entry: {
                main: path.resolve(__dirname, "..", "src", "index.tsx"),
                background: path.resolve(__dirname, "..", "src", "background.ts")
            },
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
                    patterns: [
                        {from: "./icons/*", to: ".", context: "static"},
                        {from: "index.html", to: "index.html", context: "static"},
                        {
                            from: "manifest.json", 
                            to: "manifest.json", 
                            context: "static",
                            transform(content, absoluteFrom) {
                                let manifest = JSON.parse(content);
                                manifest.version = npm_package_json.version;
                                return JSON.stringify(manifest, null, 4);
                            }
                        }
                    ]
                }),
                new webpack.DefinePlugin({
                    __VERSION__: JSON.stringify(npm_package_json.version),
                    __IN_DEBUG__: JSON.stringify(false)
                }),
            ]
        }
        break;
    case 'development':
        module.exports = {
            mode: "development",
            devtool: "source-map",
            entry: {
                main: path.resolve(__dirname, "..", "src", "index.tsx"),
                background: path.resolve(__dirname, "..", "src", "background.ts")
            },
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
                    patterns: [
                        {from: "./icons/*", to: ".", context: "static"},
                        {from: "index.html", to: "index.html", context: "static"},
                        {
                            from: "manifest.json", 
                            to: "manifest.json", 
                            context: "static",
                            transform(content, absoluteFrom) {
                                let manifest = JSON.parse(content);
                                manifest.version = npm_package_json.version;
                                return JSON.stringify(manifest, null, 4);
                            }
                        }
                    ]
                }),
                new webpack.DefinePlugin({
                    __VERSION__: JSON.stringify(npm_package_json.version),
                    __IN_DEBUG__: JSON.stringify(true),
                    __DEBUG_LIST__: JSON.stringify(fs.readFileSync(path.join(__dirname, "..", "debug", "debug_list.json"), "utf-8")),
                }),
            ]
        }
        break;
}