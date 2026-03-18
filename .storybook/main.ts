import type {StorybookConfig} from '@storybook/react-webpack5'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-webpack5-compiler-swc', '@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-webpack5',
  webpackFinal: async config => {
    if (!config.module) config.module = {rules: []}

    config.module.rules!.push(
      {
        test: /\.module\.(scss|sass)$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]'
              },
              importLoaders: 1
            }
          },
          'sass-loader'
        ]
      },

      {
        test: /\.(scss|sass)$/i,
        exclude: /\.module\.(scss|sass)$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    )

    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src')
    }

    return config
  }
}

export default config
