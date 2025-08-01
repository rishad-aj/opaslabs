import { getUrl } from '../../lib/urlStore';

export async function getServerSideProps({ params, res }) {
  const slug = params.slug;
  const longUrl = getUrl(slug);

  if (longUrl) {
    res.writeHead(302, { Location: longUrl });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Short URL not found.');
  }

  return { props: {} };
}

export default function RedirectPage() {
  return null;
}
