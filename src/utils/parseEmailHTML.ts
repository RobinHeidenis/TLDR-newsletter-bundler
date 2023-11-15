import {load} from "cheerio";

export const parseEmailHTML = (emailHTML: string) => {
  const $ = load(emailHTML);
  const selectedElements = $('td.container[style="padding: 15px 15px;"]')
  return selectedElements.map((_, element) => {
    const textBlock = $(element).find('.text-block');
    const outerSpanElement = textBlock.children('span');

    if (outerSpanElement.length > 0) {
      const linkElement = outerSpanElement.children('a').first();
      const innerSpanElement = outerSpanElement.children('span')
      if (linkElement.length === 0) {
        console.error(
          'No link element found',
          {
            linkText: outerSpanElement.text(),
            textBlockHTML: textBlock.html()
          }
        );
        return;
      }
      const originalLink = linkElement.attr('href');
      if (!originalLink) {
        console.error('Found link element does not have an href attribute', linkElement);
        return;
      }
      const title = linkElement.text();
      const description = innerSpanElement.text();
      const parts = originalLink.split('/');
      const cleanUrlIndex = parts.indexOf('CL0') + 1;
      const link = new URL(decodeURIComponent(parts[cleanUrlIndex] ?? ''));
      link.searchParams.delete('utm_source');
      if(title.toLowerCase().includes('(sponsor')) return;
      return {
        link: link.toString(),
        title,
        description,
      }
    }
  }).get().filter(Boolean);
}