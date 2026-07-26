import type { MetadataRoute } from 'next';
import { SITE, SERVICES } from '@/lib/site';
import { GUIDES } from '@/lib/guides';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    ...SERVICES.map((service) => `/${service.slug}`),
    '/guides',
    '/about',
    '/contact',
    '/tools/safari-manifest-checker',
    '/privacy',
    ...GUIDES.map((guide) => guide.slug.replace(/\/$/, '')),
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route}/`,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
