// You’d use a DB or KV here in real use case
const urlMap = {}; // TEMP store (won't persist across reloads)

export async function getServerSideProps({ params, res }) {
  const slug = params.slug;
  const destination = urlMap[slug];

  if (destination) {
    res.writeHead(302, { Location: destination });
    res.end();
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Short URL not found.');
  }

  return { props: {} };
}

export default function RedirectPage() {
  return null; // No need to render anything
}
