/* Home page — hero, info strip, category tiles, featured products, new arrivals, vendors */

window.HomePage = function HomePage({ t, lang, onAdd, onOpen, onNav, onCategory, addedFlash, favorites, onToggleFav, brands, products }) {
  const prods = products || window.PRODUCTS || [];
  const featured = prods.filter(p => p.featured).slice(0, 8);
  const newArrivals = prods.filter(p => p.new).slice(0, 4);

  // Live product count per category from the database (0 if none).
  const catCount = (id) => prods.filter(p => p.cat === id).length;

  // Partner brands come from the database; fall back to seed list if empty.
  const partnerBrands = (brands && brands.length)
    ? brands
    : (window.VENDORS || []).map(name => ({ name, logo: null }));

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="hero-eyebrow">
              <span className="dot"></span>
              {t("hero.eyebrow")}
            </span>
            <h1>
              {t("hero.title.1")}<br/>
              <span className="accent">{t("hero.title.2")}</span>
            </h1>
            <p className="lede">{t("hero.lede")}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={() => onNav("catalog")}>
                {t("hero.cta.primary")} <Icon name="arrow-right" size={18}/>
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => onNav("b2b")}>
                {t("hero.cta.secondary")}
              </button>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="v">{t("hero.stat.1.v")}</div>
                <div className="l">{t("hero.stat.1.l")}</div>
              </div>
              <div className="hero-stat">
                <div className="v">{t("hero.stat.2.v")}</div>
                <div className="l">{t("hero.stat.2.l")}</div>
              </div>
              <div className="hero-stat">
                <div className="v">{t("hero.stat.3.v")}</div>
                <div className="l">{t("hero.stat.3.l")}</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="tooth-bg"></div>
            <img src="assets/alendent-logo.jpeg" alt="Alendent" />
          </div>
        </div>
      </section>

      {/* Info strip */}
      <div className="container">
        <div className="info-strip">
          {[
            { ico: "truck", k: "info.1" },
            { ico: "shield", k: "info.2" },
            { ico: "credit", k: "info.3" },
            { ico: "headset", k: "info.4" },
          ].map(i => (
            <div className="info-item" key={i.k}>
              <span className="ico"><Icon name={i.ico} size={20}/></span>
              <div>
                <div className="t1">{t(i.k + ".t")}</div>
                <div className="t2">{t(i.k + ".s")}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">{t("sec.cats.t")}</h2>
              <p className="section-sub">{t("sec.cats.s")}</p>
            </div>
          </div>

          <div className="cat-grid">
            {window.CATEGORIES.map(c => (
              <button key={c.id} className="cat-tile" onClick={() => onCategory(c.id)}>
                <span className="ico"><Icon name={c.icon} size={22}/></span>
                <div className="ct-name">{c.names[lang]}</div>
                <div className="ct-count">{catCount(c.id)} {lang === "am" ? "ապրանք" : lang === "ru" ? "товаров" : "items"}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="section" style={{paddingTop: 0}}>
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">{t("sec.featured.t")}</h2>
              <p className="section-sub">{t("sec.featured.s")}</p>
            </div>
            <button className="section-link" onClick={() => onNav("catalog")}>
              {t("sec.featured.link")} <Icon name="arrow-right" size={14}/>
            </button>
          </div>

          <div className="product-grid">
            {featured.map(p => (
              <ProductCard key={p.id} p={p} t={t} lang={lang}
                onAdd={onAdd} onOpen={onOpen} addedFlash={addedFlash}
                favorites={favorites} onToggleFav={onToggleFav}/>
            ))}
          </div>
        </div>
      </section>

      {/* Vendors — auto-scrolling marquee */}
      <section className="vendors">
        <div className="container">
          <div className="vendors-label">{t("sec.vendors.label")}</div>
        </div>
        <div className="vendors-marquee">
          <div className="vendors-track">
            {[...partnerBrands, ...partnerBrands].map((b, i) => (
              <span className="vendor-mark" key={i} aria-hidden={i >= partnerBrands.length}>
                {b.logo
                  ? <img className="vendor-logo" src={b.logo} alt={b.name} title={b.name}/>
                  : b.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <h2 className="section-title">{t("sec.new.t")}</h2>
              <p className="section-sub">{t("sec.new.s")}</p>
            </div>
          </div>
          <div className="product-grid">
            {newArrivals.map(p => (
              <ProductCard key={p.id} p={p} t={t} lang={lang}
                onAdd={onAdd} onOpen={onOpen} addedFlash={addedFlash}
                favorites={favorites} onToggleFav={onToggleFav}/>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
