import type { CollectionConfig } from 'payload'

export const PanoramicFlights: CollectionConfig = {
  slug: 'panoramic-flights',
  admin: {
    useAsTitle: 'hero',
    defaultColumns: ['hero', 'routes'],
  },
  fields: [
    {
      name: 'hero',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Hero Image',
    },
    {
      name: 'start',
      type: 'relationship',
      relationTo: 'destinations',
      required: true,
      admin: {
        description: 'Select start location',
      },
    },
    {
      name: 'routes',
      type: 'array',
      label: 'Routes',
      required: true,
      fields: [
        {
          name: 'end',
          type: 'array',
          label: 'End Destinations',
          required: true,
          fields: [
            {
              name: 'point_of_interest',
              type: 'group',
              label: 'Point of Interest',
              fields: [
                {
                  name: 'stops',
                  type: 'relationship',
                  relationTo: 'destinations',
                  hasMany: true,
                  required: false,
                  admin: {
                    description: 'Select stops on the way',
                  },
                },
                {
                  name: 'destination',
                  type: 'relationship',
                  relationTo: 'destinations',
                  required: true,
                  admin: {
                    description: 'Select final destination',
                  },
                },
                {
                  name: 'flight_duration',
                  type: 'number',
                  required: true,
                  label: 'Flight Duration (minutes)',
                  min: 1,
                },
                {
                  name: 'fleets',
                  type: 'array',
                  label: 'Available Fleets',
                  required: true,
                  fields: [
                    {
                      name: 'fleet',
                      type: 'group',
                      label: 'Fleet',
                      fields: [
                        {
                          name: 'helicopter',
                          type: 'relationship',
                          relationTo: 'Fleet',
                          required: true,
                          hasMany: false,
                          admin: {
                            description: 'Select helicopter',
                          },
                        },
                        {
                          name: 'price',
                          type: 'number',
                          required: false,
                          min: 0,
                        },
                        {
                          name: 'price_on_demand',
                          type: 'checkbox',
                          required: false,
                          defaultValue: false,
                          label: 'Price on demand',
                        },
                        {
                          name: 'type',
                          type: 'select',
                          required: true,
                          options: [
                            {
                              label: 'Private',
                              value: 'private',
                            },
                            {
                              label: 'Public',
                              value: 'public',
                            },
                          ],
                          defaultValue: 'public',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: false,
      label: 'Additional Image',
    },
  ],
}
