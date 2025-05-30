import type { CollectionConfig } from 'payload'

export const Regions: CollectionConfig = {
  slug: 'regions',
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        if ((operation === 'create' || operation === 'update') && data?.name) {
          data.id = data.name
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .toLowerCase()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
    {
      name: 'determiner',
      type: 'select',
      required: true,
      localized: true,
      options: [
        {
          label: 'Le',
          value: 'le',
        },
        {
          label: 'La',
          value: 'la',
        },
        {
          label: 'Les',
          value: 'les',
        },
      ],
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
  ],
}
