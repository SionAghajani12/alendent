/* Deals page */
window.DealsPage = function DealsPage({ t, lang, onAdd, onOpen, addedFlash, favorites, onToggleFav, products }) {
  const deals = (products || window.PRODUCTS || []).filter(p => p.tag === "sale");
  return (
    <main className="catalog">
      <div className="container">
        <div className="cat-head" style={{marginTop:8}}>
          <div>
            <h1 style={{fontSize:32}}>{t("nav.deals")}</h1>
            <div className="count">{t("cat.results").replace("{n}", deals.length)}</div>
          </div>
        </div>
        {deals.length === 0 ? (
          <div className="no-results">
            <Icon name="sparkle" size={32}/>
            <p style={{marginTop:16}}>
              {lang==="am"?"Ակցիաներ չկան":lang==="ru"?"Акций нет":"No deals right now"}
            </p>
          </div>
        ) : (
          <div className="product-grid cat-page">
            {deals.map(p => (
              <ProductCard key={p.id} p={p} t={t} lang={lang}
                onAdd={onAdd} onOpen={onOpen} addedFlash={addedFlash}
                favorites={favorites} onToggleFav={onToggleFav}/>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};
