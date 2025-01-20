'use client';

// * dompurify
import { sanitize } from 'isomorphic-dompurify';

// * hooks
import { useHtmlContext } from '@/context/HtmlContextProvider';

// * helpers
import wrapHtml from '@/helpers/wrapHtml';

// * data
const sanitizer_config = { ALLOWED_TAGS: ['div', 'style', 'img'] };

const Iframe = () => {
  const { html } = useHtmlContext();
  const sanitizedHtml = wrapHtml(sanitize(`<body>${html}</body>`, sanitizer_config));

  const iframeContent = `
    <div style="position: relative; height: 100%;">
      <!-- Image stays fixed at the bottom and has the highest z-index -->
      <img src="/chakra.png" alt="Centered Image" 
        style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 400px; height: 300px; z-index: 9999;" />
      <!-- Sanitize HTML content above the image -->
      <div style="padding-bottom: 300px; z-index: 1;">${sanitizedHtml}</div>
    </div>
  `;

  return (
    <iframe
      srcDoc={iframeContent}
      className='output w-full h-full bg-white pointer-events-none'
    />
  );
};

export default Iframe;
