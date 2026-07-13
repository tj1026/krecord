export default async function AccessPage({ searchParams }) {
  const params = await searchParams;
  const next = typeof params?.next === 'string' && params.next.startsWith('/') ? params.next : '/index.html';
  const invalid = params?.error === '1';

  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#111110', color: '#fffdf8', fontFamily: 'Arial, sans-serif' }}>
    <form action="/api/site-access" method="post" style={{ width: 'min(420px, 100%)', border: '2px solid #fffdf8', padding: 28, boxShadow: '8px 8px 0 #b31226' }}>
      <input type="hidden" name="next" value={next} />
      <p style={{ margin: 0, color: '#e8b54a', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>Private preview</p>
      <h1 style={{ margin: '10px 0 22px', fontSize: 38, lineHeight: 1, textTransform: 'uppercase' }}>The Kiley Record</h1>
      <label htmlFor="site-password" style={{ display: 'block', marginBottom: 8, fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Site password</label>
      <input id="site-password" name="password" type="password" autoComplete="current-password" autoFocus required style={{ width: '100%', padding: 12, border: 0, fontSize: 16 }} />
      {invalid && <p role="alert" style={{ color: '#ffb3bd', margin: '12px 0 0' }}>That password isn’t correct.</p>}
      <button type="submit" style={{ marginTop: 18, width: '100%', border: 0, padding: 13, background: '#b31226', color: '#fffdf8', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase' }}>Open site</button>
    </form>
  </main>;
}
