import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://unilink-taiwan.example.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/school-portal/', '/student-portal/', '/portal/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
