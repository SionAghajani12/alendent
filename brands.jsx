/* Brands page — reads brands from the database (with logos) */
window.BrandsPage = function BrandsPage({ t, lang, brands, products, onBrandSelect }) {
  const prods = products || window.PRODUCTS || [];

  // Build the brand list from the DB; fall back to vendors derived from products.
  const list = React.useMemo(() => {
    const count = (name) => prods.filter(p => p.vendor === name).length;
    if (brands && brands.length) {
      return brands.map(b => ({ ...b, count: count(b.name) }))
                   .sort((a, b) => b.count - a.count);
    }
    const m = {};
    prods.forEach(p => { m[p.vendor] = (m[p.vendor] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1])
                 .map(([name, c]) => ({ name, count: c, logo: null, country: "" }));
  }, [brands, prods]);

  return (
    <main style={{padding:"40px 0 80px"}}>
      <div className="container">
        <h1 style={{fontSize:32, fontWeight:800, letterSpacing:"-0.02em", marginBottom:8}}>{t("nav.brands")}</h1>
        <p style={{color:"var(--text-muted)", marginBottom:36, fontSize:15}}>
          {lang==="am" ? "Աշխատում ենք "+list.length+"+ արտադրողների հետ"
           : lang==="ru" ? "Работаем с "+list.length+"+ брендами"
           : "We work with "+list.length+"+ brands"}
        </p>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:14}}>
          {list.map(b => (
            <button
              key={b.name}
              onClick={() => onBrandSelect(b.name)}
              className="brand-tile"
            >
              <div className="brand-tile-logo">
                {b.logo ? <img src={b.logo} alt={b.name}/> : <span>{b.name.charAt(0)}</span>}
              </div>
              <span className="brand-tile-name">{b.name}</span>
              <span className="brand-tile-meta">
                {b.country ? b.country + " · " : ""}{b.count} {lang==="am" ? "ապրանք" : lang==="ru" ? "товаров" : "products"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};
