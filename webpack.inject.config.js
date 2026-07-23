import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import autoprefixer from 'autoprefixer';
import sass from 'sass';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom Babel plugin to automatically add .js extensions to relative imports
const addJsExtensionPlugin = () => {
  // List of known file extensions to skip
  const knownExtensions = ['.js', '.jsx', '.json', '.css', '.scss', '.sass', '.svg', '.mjs', '.cjs', '.ts', '.tsx', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
  
  const hasExtension = (source) => {
    // Check if source ends with any known extension (optionally followed by ?query)
    return knownExtensions.some(ext => {
      return source.endsWith(ext) || source.includes(`${ext}?`) || source.includes(`${ext}#`);
    });
  };
  
  return {
    visitor: {
      ImportDeclaration(babelPath) {
        const source = babelPath.node.source.value;
        // Only process relative imports (starting with . or ..)
        // Skip if already has any extension or is a node_modules import
        if (
          (source.startsWith('./') || source.startsWith('../')) &&
          !hasExtension(source) &&
          !source.includes('node_modules') &&
          !source.endsWith('/') // Skip directory imports
        ) {
          babelPath.node.source.value = `${source}.js`;
        }
      },
      CallExpression(babelPath) {
        // Handle dynamic imports: import('./module')
        if (
          babelPath.node.callee.type === 'Import' &&
          babelPath.node.arguments.length > 0 &&
          babelPath.node.arguments[0].type === 'StringLiteral'
        ) {
          const source = babelPath.node.arguments[0].value;
          if (
            (source.startsWith('./') || source.startsWith('../')) &&
            !hasExtension(source) &&
            !source.includes('node_modules') &&
            !source.endsWith('/') // Skip directory imports
          ) {
            babelPath.node.arguments[0].value = `${source}.js`;
          }
        }
      }
    }
  };
};

export default {
    context: path.join(__dirname, 'src'),
    resolve: {
        extensions: ['.js', '.jsx', '.json', '.mjs', '.cjs'],
        mainFields: ['main', 'module', 'browser'],
        fullySpecified: false,
        alias: {
            'react-confetti': path.resolve(__dirname, 'node_modules/react-confetti/dist/react-confetti.cjs'),
            // Match vite.config.js alias for antd v6 ES modules
            'antd/lib': 'antd/es',
            'antd/reset': path.resolve(__dirname, 'node_modules/antd/dist/reset.css'),
        }
    },
    devServer: {
        static: './src/injectScript',
        historyApiFallback: true,
        allowedHosts: "all",
        client: {
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: false,
            },
        },
    },
    devtool: 'eval-cheap-module-source-map',
    entry: [
        path.resolve(__dirname, 'src/injectScript/injectScript.js')
    ],
    target: 'web',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'src/injectScript'),
        publicPath: '/',
        filename: 'injectScript.bundle.js',
        hashFunction: "sha256"
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.(js|jsx|mjs|cjs)$/,
                include: [
                    /.*?livedemo-components\/components.*?/,
                    /node_modules\/@georgi.apostolov\//,
                    /node_modules\/parse5\//,
                    /node_modules\/react-confetti\//,
                    /src/
                ],
                resolve: {
                    fullySpecified: false
                },
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-react'
                        ],
                        plugins: [
                            '@babel/plugin-proposal-class-properties',
                            '@babel/plugin-syntax-dynamic-import',
                            addJsExtensionPlugin // Automatically add .js extensions to relative imports
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer
                                ]
                            },
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /(\.scss|\.sass)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true
                        }
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    autoprefixer
                                ]
                            },
                            sourceMap: true
                        }
                    }, {
                        loader: 'sass-loader',
                        options: {
                            implementation: sass,
                            includePaths: [path.resolve(__dirname, 'src')],
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/inline',
                parser: {
                    dataUrlCondition: {
                        maxSize: 10000
                    }
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/inline'
            },
            {
                test: /\.(jpe?g|png|gif|ico)(\?v=\d+\.\d+\.\d+)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'injectScript/assets/[name].[ext]'
                }
            },
        ]
    },
}

