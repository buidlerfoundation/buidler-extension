export const getMetadata = () => {
  const getSize = (el) => {
    return (el.sizes[0] && parseInt(el.sizes[0], 10)) || 0;
  };
  const title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector('meta[property="twitter:title"]')?.content ||
    document.title;
  const card =
    document.querySelector('meta[property="twitter:card"]')?.content || null;
  const site_name =
    document.querySelector('meta[property="og:site_name"]')?.content || null;
  const description = document.querySelectorAll(
    'meta[property*="description"]'
  )?.[0]?.content;
  const icon = [...document.querySelectorAll('link[rel*="icon"]')].sort(
    (a, b) => getSize(b) - getSize(a)
  )?.[0]?.href;
  let cover =
    document.querySelector('meta[property="og:image"]')?.content ||
    document.querySelector('meta[property="twitter:image"]')?.content;
  if (cover && !cover.includes('http')) {
    cover = `${window.location.origin}${cover}`;
  }
  return {
    title,
    description,
    icon,
    cover,
    image: cover || null,
    site_name,
    card,
    logo: icon,
  };
};
