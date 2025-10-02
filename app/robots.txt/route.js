export async function GET() {
  const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://tamilyouth.ch/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin areas
Disallow: /admin/
Disallow: /api/

# Allow important pages
Allow: /kaufen
Allow: /kontakt
Allow: /bestellungen`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
