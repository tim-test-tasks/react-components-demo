import type {Meta, StoryObj} from '@storybook/react-webpack5'

import AgesSlider from './AgesSlider'

const meta = {
  title: 'Components/AgesSlider',
  component: AgesSlider,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof AgesSlider>

type Story = StoryObj<typeof meta>

export const Primary: Story = {}

export default meta
