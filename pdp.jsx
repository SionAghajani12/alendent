/* Product Detail Page */

window.PdpPage = function PdpPage({ t, lang, product, onAdd, onOpen, onBack, onBuyNow, addedFlash, favorites, onToggleFav, products }) {
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState("desc");
  const [thumb, setThumb] = React.useState(0);
  const [variant, setVariant] = React.useState(0);

  const related = (products || window.PRODUCTS || [])
    .filter(p => p.cat === product.cat && p.id !== product.id)
    .slice(0, 4);

  const variantOptions = (product.cat === "anesthesia" || product.cat === "restorative")
    ? ["A1", "A2", "A3", "B2"]
    : (product.cat === "hygiene" ? ["S", "M", "L", "XL"] : null);

  React.useEffect(() => {
    setQty(1); setTab("desc"); setThumb(0); setVariant(0);
    window.scrollTo(0, 0);
  }, [product.id]);

  const stockClass = product.stock === "low" ? "low" : "";
  const stockLabel = product.stock === "low" ? t("p.lowstock") : t("p.stock");

  return (
    <main className="pdp">
      <div className="container">
        <div className="crumb">
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>{lang === "am" ? "Գլխավոր" : lang === "ru" ? "Главная" : "Home"}</a>
          <span className="sep">/</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>{t("nav.catalog")}</a>
          <span className="sep">/</span>
          <span className="cur">{product.names[lang]}</span>
        </div>

        <div className="pdp-grid">
          <div className="pdp-gallery">
            <div className="pdp-main-img">
              {product.image
                ? <img className="pdp-photo" src={product.image} alt={product.names[lang]} />
                : <span className="ph-label">{product.vendor} · {product.id.toUpperCase()}</span>}
            </div>
            <div className="pdp-thumbs">
              {[0,1,2,3].map(i => (
                <div key={i} className={"pdp-thumb " + (thumb === i ? "active" : "")} onClick={() => setThumb(i)}>
                  {product.image && i === 0 && <img src={product.image} alt="" />}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="pdp-vendor">{product.vendor}</div>
            <h1>{product.names[lang]}</h1>
            <div className="pdp-meta">
              <span className="pdp-stars">★★★★★</span>
              <span>4.8 · 124 {lang === "am" ? "կարծիք" : lang === "ru" ? "отзывов" : "reviews"}</span>
              <span style={{color: "var(--text-faint)"}}>·</span>
              <span>SKU: {product.id.toUpperCase()}</span>
              <span style={{color: "var(--text-faint)"}}>·</span>
              <span className={"pcard-stock " + stockClass}><span className="dot"></span>{stockLabel}</span>
            </div>

            <div className="pdp-price-row">
              <span className="pdp-price">{fmt(product.price * qty)} {t("cur")}</span>
              {product.was && <span className="pdp-price-was">{fmt(product.was * qty)} {t("cur")}</span>}
              <span className="pdp-vat">{t("cart.vat")}</span>
            </div>

            {variantOptions && (
              <div className="pdp-options">
                <div className="opt-label">{lang === "am" ? "Տարբերակ" : lang === "ru" ? "Вариант" : "Option"}</div>
                <div className="opt-pills">
                  {variantOptions.map((v, i) => (
                    <button key={v} className={"opt-pill " + (variant === i ? "active" : "")} onClick={() => setVariant(i)}>{v}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-options">
              <div className="opt-label">{t("pdp.qty")}</div>
              <div className="qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}><Icon name="minus" size={16}/></button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}><Icon name="plus" size={16}/></button>
              </div>
            </div>

            <div className="pdp-actions">
              <button className="btn btn-primary btn-lg" style={{flex: 1}}
                onClick={() => onAdd(product, qty)}>
                <Icon name="cart" size={18}/>
                {addedFlash === product.id ? t("p.added") : t("pdp.addcart")}
              </button>
              <button className="btn btn-outline btn-lg" style={{flex: 1}}
                onClick={() => onBuyNow(product, qty)}>
                {t("pdp.buy")}
              </button>
            </div>

            <div className="pdp-feats">
              {[1,2,3,4].map(i => (
                <div className="pdp-feat" key={i}>
                  <span className="ico">
                    <Icon name={["truck","shield","package","headset"][i-1]} size={18}/>
                  </span>
                  <div>
                    <div className="t1">{t("pdp.feat." + i + ".t")}</div>
                    <div className="t2">{t("pdp.feat." + i + ".s")}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pdp-tabs">
          <div className="tab-head">
            {["desc","spec","ship"].map(k => (
              <button key={k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>
                {t("pdp.tab." + k)}
              </button>
            ))}
          </div>
          <div className="tab-body">
            {tab === "desc" && <PdpDesc product={product} lang={lang}/>}
            {tab === "spec" && <PdpSpec product={product} lang={lang} t={t}/>}
            {tab === "ship" && <PdpShip lang={lang} t={t}/>}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="section" style={{paddingBottom: 0}}>
            <div className="section-head">
              <h2 className="section-title">{t("pdp.related")}</h2>
            </div>
            <div className="product-grid">
              {related.map(p => (
                <ProductCard key={p.id} p={p} t={t} lang={lang}
                  onAdd={onAdd} onOpen={onOpen} addedFlash={addedFlash}
                  favorites={favorites} onToggleFav={onToggleFav}/>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

function PdpDesc({ product, lang }) {
  const desc = {
    am: `${product.names.am} արտադրված է ${product.vendor} ընկերության կողմից։ Համապատասխանում է միջազգային ստոմատոլոգիական ստանդարտներին (ISO 13485, CE)։ Ապահովում է բարձր որակ և երկարատև արդյունք։ Ապրանքը ուղղակիորեն ներմուծվում է արտադրողից՝ առանց միջնորդների։`,
    ru: `${product.names.ru} производства ${product.vendor}. Соответствует международным стандартам ISO 13485 и CE. Обеспечивает высокое качество и долговечность результата. Поставляется напрямую от производителя без посредников.`,
    en: `${product.names.en} manufactured by ${product.vendor}. Complies with international dental standards (ISO 13485, CE). Delivers reliable, lasting clinical results. Sourced directly from the manufacturer without intermediaries.`,
  };
  return (
    <>
      <p>{desc[lang]}</p>
      <p style={{color: "var(--text-muted)", fontSize: 13.5}}>
        {lang === "am"
          ? "Ապրանքը նախատեսված է բացառապես մասնագիտական օգտագործման համար։ Պահպանման պայմանները՝ չոր, սենյակային ջերմաստիճան, ուղիղ արևի ճառագայթներից հեռու։"
          : lang === "ru"
          ? "Изделие предназначено исключительно для профессионального использования. Условия хранения: сухое место, комнатная температура, без прямого солнечного света."
          : "For professional use only. Storage: dry, room temperature, away from direct sunlight."}
      </p>
    </>
  );
}

function PdpSpec({ product, lang, t }) {
  const cat = window.CATEGORIES.find(c => c.id === product.cat);
  const rows = [
    [lang === "am" ? "Արտադրող" : lang === "ru" ? "Производитель" : "Manufacturer", product.vendor],
    [lang === "am" ? "Արտադրման երկիր" : lang === "ru" ? "Страна" : "Country of origin", lang === "am" ? "Գերմանիա" : lang === "ru" ? "Германия" : "Germany"],
    [lang === "am" ? "Կատեգորիա" : lang === "ru" ? "Категория" : "Category", cat ? cat.names[lang] : ""],
    [lang === "am" ? "Կոդ" : lang === "ru" ? "Артикул" : "SKU", product.id.toUpperCase()],
    [lang === "am" ? "Տուփում" : lang === "ru" ? "Упаковка" : "Packaging", lang === "am" ? "Անհատական" : lang === "ru" ? "Индивидуальная" : "Individual"],
    [lang === "am" ? "Սերտիֆիկատ" : lang === "ru" ? "Сертификация" : "Certification", "CE · ISO 13485"],
    [lang === "am" ? "Պահպանման ժամկետ" : lang === "ru" ? "Срок хранения" : "Shelf life", lang === "am" ? "36 ամիս" : lang === "ru" ? "36 мес." : "36 months"],
  ];
  return (
    <table className="spec-table">
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={i}><td>{k}</td><td>{v}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function PdpShip({ lang, t }) {
  return (
    <>
      <p>
        {lang === "am"
          ? "Երևանում առաքումը հաջորդ աշխատանքային օրը։ 25 000 ֏-ից վերև պատվերները՝ անվճար։ Մարզային առաքում 2-3 աշխատանքային օրում։ Հնարավոր է էքսպրես առաքում 3 ժամում, օրվա կեսից առաջ կատարված պատվերների համար։"
          : lang === "ru"
          ? "Доставка по Еревану — на следующий рабочий день. Заказы от 25 000 ֏ — бесплатно. Доставка в регионы — 2–3 рабочих дня. Возможна экспресс-доставка за 3 часа для заказов до полудня."
          : "Yerevan delivery — next business day. Orders over 25,000 ֏ ship free. Regional delivery — 2–3 business days. Express 3-hour delivery for orders placed before noon."}
      </p>
      <p>
        {lang === "am"
          ? "Կլինիկաների համար հնարավոր է կանխիկ առանց վճարման՝ ամսական հաշվարկով։ Մանրամասների համար գրանցեք ձեր կլինիկան։"
          : lang === "ru"
          ? "Для клиник доступна постоплата с ежемесячным расчётом. Зарегистрируйте клинику для подробностей."
          : "Clinics can apply for monthly net terms. Register your practice for details."}
      </p>
    </>
  );
}
