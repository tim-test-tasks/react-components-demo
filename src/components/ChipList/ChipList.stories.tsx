import type {Meta, StoryObj} from '@storybook/react'
import {Chip} from './Chip'
import {ChipList} from './ChipList'
import React from 'react'

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    selected: {
      control: 'boolean',
      description: 'Выбран ли чипс'
    },
    disabled: {
      control: 'boolean',
      description: 'Отключен ли чипс'
    },
    label: {
      control: 'text',
      description: 'Текст чипса'
    },
    onDelete: {
      action: 'deleted',
      description: 'Обработчик удаления'
    },
    onClick: {
      action: 'clicked',
      description: 'Обработчик клика'
    }
  }
}

export default meta
type Story = StoryObj<typeof Chip>

// Базовый чипс
export const Default: Story = {
  args: {
    id: '1',
    label: 'Chip Label',
    selected: false,
    disabled: false,
    onDelete: undefined
  }
}

// Выбранный чипс
export const Selected: Story = {
  args: {
    id: '1',
    label: 'Selected Chip',
    selected: true,
    onDelete: undefined
  }
}

// Чипс с иконкой
export const WithIcon: Story = {
  args: {
    id: '1',
    label: 'Chip with Icon',
    icon: <span>🌟</span>,
    onDelete: undefined
  }
}

// Чипс с удалением
export const WithDelete: Story = {
  args: {
    id: '1',
    label: 'Deletable Chip',
    onDelete: id => console.log('Delete', id)
  }
}

// Отключенный чипс
export const Disabled: Story = {
  args: {
    id: '1',
    label: 'Disabled Chip',
    disabled: true,
    onDelete: undefined
  }
}

// История для ChipList
const chipListMeta: Meta<typeof ChipList> = {
  title: 'Components/ChipList',
  component: ChipList,
  parameters: {
    layout: 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: {
      control: 'boolean',
      description: 'Режим множественного выбора'
    },
    maxWidth: {
      control: 'text',
      description: 'Максимальная ширина контейнера'
    }
  }
}

export const ChipListStory: StoryObj<typeof ChipList> = {
  name: 'ChipList',
  render: args => {
    const items = [
      {id: 1, label: 'React'},
      {id: 2, label: 'TypeScript'},
      {id: 3, label: 'JavaScript'},
      {id: 4, label: 'HTML/CSS'},
      {id: 5, label: 'Node.js'},
      {id: 6, label: 'Express'},
      {id: 7, label: 'MongoDB'},
      {id: 8, label: 'PostgreSQL'},
      {id: 9, label: 'GraphQL'},
      {id: 10, label: 'REST API'}
    ]

    return (
      <div style={{padding: '20px', width: '100%'}}>
        <ChipList
          items={items}
          multiple={args.multiple}
          maxWidth={args.maxWidth}
          onChange={selected => console.log('Selected:', selected)}
        />
      </div>
    )
  },
  args: {
    multiple: false,
    maxWidth: '600px'
  },
  parameters: {
    docs: {
      description: {
        story: 'ChipList автоматически скрывает не помещающиеся элементы в попап'
      }
    }
  }
}

// Демонстрация с разными размерами экрана
export const ResponsiveChipList: StoryObj<typeof ChipList> = {
  render: () => {
    const items = [
      {id: 1, label: 'React'},
      {id: 2, label: 'TypeScript'},
      {id: 3, label: 'JavaScript'},
      {id: 4, label: 'HTML/CSS'},
      {id: 5, label: 'Node.js'},
      {id: 6, label: 'Express'}
    ]

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        <div>
          <h3>Ширина 300px</h3>
          <ChipList items={items} maxWidth='300px' />
        </div>
        <div>
          <h3>Ширина 500px</h3>
          <ChipList items={items} maxWidth='500px' />
        </div>
        <div>
          <h3>Ширина 800px</h3>
          <ChipList items={items} maxWidth='800px' />
        </div>
      </div>
    )
  }
}

// Множественный выбор
export const MultipleSelection: StoryObj<typeof ChipList> = {
  render: () => {
    const items = [
      {id: 1, label: 'React'},
      {id: 2, label: 'TypeScript'},
      {id: 3, label: 'JavaScript'},
      {id: 4, label: 'HTML/CSS'}
    ]

    const [selected, setSelected] = React.useState<(string | number)[]>([1, 3])

    return (
      <div>
        <ChipList items={items} multiple selectedIds={selected} onChange={setSelected} />
        <div style={{marginTop: '20px'}}>Выбрано: {selected.join(', ')}</div>
      </div>
    )
  }
}
