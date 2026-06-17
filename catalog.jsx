/* Catalog page — search results + category browse + filters */

window.CatalogPage = function CatalogPage({ t, lang, query, category, onAdd, onOpen, onCategory, onClearCategory, addedFlash, favorites, onToggleFav, products }) {
  const [sort, setSort] = React.useState("featured");
  const [vendorFilters, setVendorFilters] = React.useState([]);
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [saleOnly, setSaleOnly] = React.useState(false);
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const allProducts = products || window.PRODUCTS || [];
  const catCount = (id) => allProducts.filter(p => p.cat === id).length;

  const filtered = React.useMemo(() => {
    let res = allProducts;
    if (category) res = res.filter(p => p.cat === category);
    if (query) {
      const q = query.toLowerCase();
      res = res.filter(p =>
        p.names[lang].toLowerCase().includes(q) ||
        p.names.en.toLowerCase().includes(q) ||
        p.vendor.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    if (vendorFilters.length) res = res.filter(p => vendorFilters.includes(p.vendor));
    if (inStockOnly) res = res.filter(p => p.stock !== "out");
    if (saleOnly) res = res.filter(p => p.tag === "sale");
    if (priceMin) res = res.filter(p => p.price >= +priceMin);
    if (priceMax) res = res.filter(p => p.price <= +priceMax);

    if (sort === "price-low") res = [...res].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") res = [...res].sort((a, b) => b.price - a.price);
    else if (sort === "new") res = [...res].sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
    else res = [...res].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return res;
  }, [allProducts, category, query, vendorFilters, inStockOnly, saleOnly, priceMin, priceMax, sort, lang]);

  const vendorsInScope = React.useMemo(() => {
    const base = category ? allProducts.filter(p => p.cat === category) : allProducts;
    const counts = {};
    base.forEach(p => { counts[p.vendor] = (counts[p.vendor] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [allProducts, category]);

  const catObj = category && window.CATEGORIES.find(c => c.id === category);
  const title = catObj ? catObj.names[lang] : (query ? `"${query}"` : t("cat.all"));

  const toggleVendor = (v) => {
    setVendorFilters(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  };

  const activeChips = [];
  if (category && catObj) activeChips.push({ k: "cat", label: catObj.names[lang], clear: onClearCategory });
  vendorFilters.forEach(v => activeChips.push({ k: "v-" + v, label: v, clear: () => toggleVendor(v) }));
  if (inStockOnly) activeChips.push({ k: "stock", label: t("cat.filter.instock"), clear: () => setInStockOnly(false) });
  if (saleOnly) activeChips.push({ k: "sale", label: t("p.sale"), clear: () => setSaleOnly(false) });

  return (
    <main className="catalog">
      <div className="container">
        <div className="crumb">
          <a href="#" onClick={(e) => { e.preventDefault(); onClearCategory(); }}>{lang === "am" ? "Գլխավոր" : lang === "ru" ? "Главная" : "Home"}</a>
          <span className="sep">/</span>
          {category && catObj ? (
            <>
              <a href="#" onClick={(e) => e.preventDefault()}>{t("nav.catalog")}</a>
              <span className="sep">/</span>
              <span className="cur">{catObj.names[lang]}</span>
            </>
          ) : (
            <span className="cur">{query ? title : t("nav.catalog")}</span>
          )}
        </div>

        <div className="cat-head">
          <div>
            <h1>{title}</h1>
            <div className="count">{t("cat.results").replace("{n}", filtered.length)}</div>
          </div>
          <div className="cat-head-tools">
            <button
              className="btn btn-outline btn-sm filters-toggle-btn"
              onClick={() => setFiltersOpen(o => !o)}
            >
              <Icon name="filter" size={14}/>
              {filtersOpen ? t("cat.filter.hide") : t("cat.filter.show")}
              {(activeChips.length > 0) && <span style={{background:"var(--primary)",color:"#fff",borderRadius:"var(--r-pill)",fontSize:11,padding:"1px 6px",marginLeft:4}}>{activeChips.length}</span>}
            </button>
            <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">{t("cat.sort.featured")}</option>
              <option value="price-low">{t("cat.sort.price-low")}</option>
              <option value="price-high">{t("cat.sort.price-high")}</option>
              <option value="new">{t("cat.sort.new")}</option>
            </select>
          </div>
        </div>

        <div className={"cat-layout " + (filtersOpen ? "filters-visible" : "")}>
          <aside className={"filters " + (filtersOpen ? "filters-open" : "")}>
            <div className="filter-group">
              <div className="filter-title">{t("cat.filter.avail")}</div>
              <label className="filter-opt">
                <span className="left">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
                  {t("cat.filter.instock")}
                </span>
              </label>
              <label className="filter-opt">
                <span className="left">
                  <input type="checkbox" checked={saleOnly} onChange={(e) => setSaleOnly(e.target.checked)} />
                  {t("cat.filter.sale")}
                </span>
              </label>
            </div>

            <div className="filter-group">
              <div className="filter-title">{t("cat.filter.price")}</div>
              <div className="price-range">
                <input type="number" placeholder={t("cat.filter.from")} value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                <input type="number" placeholder={t("cat.filter.to")} value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
              </div>
            </div>

            <div className="filter-group">
              <div className="filter-title">{t("cat.filter.vendor")}</div>
              {vendorsInScope.slice(0, 10).map(([v, c]) => (
                <label className="filter-opt" key={v}>
                  <span className="left">
                    <input type="checkbox" checked={vendorFilters.includes(v)} onChange={() => toggleVendor(v)} />
                    {v}
                  </span>
                  <span className="cnt">{c}</span>
                </label>
              ))}
            </div>

            {!category && (
              <div className="filter-group">
                <div className="filter-title">{t("nav.catalog")}</div>
                {window.CATEGORIES.slice(0, 8).map(c => (
                  <button key={c.id} className="filter-opt" onClick={() => onCategory(c.id)}
                    style={{background: "transparent", border: 0, width: "100%", textAlign: "left", cursor: "pointer"}}>
                    <span className="left">{c.names[lang]}</span>
                    <span className="cnt">{catCount(c.id)}</span>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div>
            {activeChips.length > 0 && (
              <div className="chip-row" style={{marginBottom: 18}}>
                {activeChips.map(c => (
                  <span key={c.k} className="chip active" onClick={c.clear}>
                    {c.label} <span className="x"><Icon name="x" size={12}/></span>
                  </span>
                ))}
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="no-results">
                <Icon name="search" size={32}/>
                <p style={{marginTop: 16}}>{t("cat.no")}</p>
              </div>
            ) : (
              <div className="product-grid cat-page">
                {filtered.map(p => (
                  <ProductCard key={p.id} p={p} t={t} lang={lang}
                    onAdd={onAdd} onOpen={onOpen} addedFlash={addedFlash}
                    favorites={favorites} onToggleFav={onToggleFav}/>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
