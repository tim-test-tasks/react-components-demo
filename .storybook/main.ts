import type {StorybookConfig} from '@storybook/react-webpack5'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: '@storybook/react-webpack5',
  webpackFinal: async config => {
    if (!config.module) config.module = {rules: []}

    config.module.rules!.push({
      test: /\.s[ac]ss$/i,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            sourceMap: true
          }
        },
        'sass-loader'
      ],
      exclude: /node_modules/
    })

    return config
  }
}
export default config
