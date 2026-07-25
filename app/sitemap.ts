import type { MetadataRoute } from 'next';
import { SITE, SERVICES } from '@/lib/site';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    ...SERVICES.map((service) => `/${service.slug}`),
    '/poc-to-production',
    '/about',
    '/contact',
    '/safari-extensions/convert-chrome-extension-to-safari',
    '/safari-extensions/webrequest-alternative',
    '/safari-extensions/converter-not-working',
    '/safari-extensions/app-store-rejection',
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route}/`,
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
