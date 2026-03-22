import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SakuRaya',
    short_name: 'SakuRaya',
    description: 'Minimalist Duit Raya & Gifting Planner',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/saku-raya-icon.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
