/* Shared UI: Header, Footer, ProductCard, ProductImagePlaceholder, FavoritesDrawer */

const { useState, useEffect, useRef, useMemo } = React;

/* Format AMD price with thin spaces as thousand separators */
window.fmt = function fmt(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

/* Product image: shows the uploaded photo if present, else a labeled placeholder */
window.PhPlaceholder = function PhPlaceholder({ label, image, alt }) {
  return (
    <div className="pcard-image">
      {image
        ? <img className="pcard-photo" src={image} alt={alt || label} loading="lazy" />
        : <span className="ph-label">{label}</span>}
    </div>
  );
};

window.UtilityBar = function UtilityBar({ t, lang, setLang }) {
  return (
    <div className="utility-bar">
      <div className="container">
        <div className="ub-left">
          <span className="ub-item"><Icon name="truck" size={14}/> {t("ub.delivery")}</span>
          <span className="ub-item ub-hours"><Icon name="clock" size={14}/> {t("ub.hours")}</span>
        </div>
        <div className="ub-right">
          <span className="ub-item ub-phone"><Icon name="phone" size={14}/> {t("ub.hotline")}</span>
          <div className="lang-switch">
            {["am", "ru", "en"].map(l => (
              <button key={l} className={lang === l ? "active" : ""} onClick={() => setLang(l)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Header = function Header({ t, lang, setLang, cartCount, favCount, query, setQuery, onSubmitSearch, onNav, activeNav, onLogo, onCart, onFav }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <UtilityBar t={t} lang={lang} setLang={setLang} />
      <header className="header">
        <div className="container header-inner">
          <div className="brand" onClick={onLogo}>
            <img src="/assets/alendent-logo.jpeg" alt="Alendent" />
            <div className="b-text">
              <span className="b-name">Alendent</span>
              <span className="b-tag">{lang === "am" ? "Ստոմատոլոգիա" : lang === "ru" ? "Стоматология" : "Dental Supply"}</span>
            </div>
          </div>

          <form className="search" onSubmit={(e) => { e.preventDefault(); onSubmitSearch(); }}>
            <Icon name="search" size={18}/>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
            />
            <button type="submit" className="search-btn">{t("search.btn")}</button>
          </form>

          <div className="header-actions">
            <button className="icon-btn hide-mobile" title={t("header.account")}>
              <Icon name="user" size={20}/>
            </button>
            <button className="icon-btn" title={t("header.fav")} onClick={onFav}>
              <Icon name="heart" size={20}/>
              {favCount > 0 && <span className="badge">{favCount}</span>}
            </button>
            <button className="icon-btn" title={t("header.cart")} onClick={onCart}>
              <Icon name="cart" size={20}/>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </button>
            <button className="icon-btn mobile-menu-btn" onClick={() => setMobileNavOpen(o => !o)} aria-label="Menu">
              <Icon name={mobileNavOpen ? "x" : "menu"} size={22}/>
            </button>
          </div>
        </div>

        <nav className="nav">
          <div className="container nav-inner">
            <button className="nav-item cat-all" onClick={() => { onNav("catalog"); setMobileNavOpen(false); }}>
              <Icon name="grid" size={15}/> {t("nav.catalog")}
            </button>
            {[
              { id: "deals", k: "nav.deals" },
              { id: "brands", k: "nav.brands" },
              { id: "about", k: "nav.about" },
              { id: "contact", k: "nav.contact" },
            ].map(item => (
              <button
                key={item.id}
                className={"nav-item " + (activeNav === item.id ? "active" : "")}
                onClick={() => { onNav(item.id); setMobileNavOpen(false); }}
              >
                {t(item.k)}
              </button>
            ))}
          </div>
        </nav>

        {/* Mobile expanded nav */}
        {mobileNavOpen && (
          <div className="mobile-nav-panel">
            <div className="container">
              <button className="mobile-nav-item" onClick={() => { onNav("catalog"); setMobileNavOpen(false); }}>
                <Icon name="grid" size={15}/> {t("nav.catalog")}
              </button>
              {[
                { id: "deals", k: "nav.deals" },
                { id: "brands", k: "nav.brands" },
                { id: "about", k: "nav.about" },
                { id: "contact", k: "nav.contact" },
              ].map(item => (
                <button
                  key={item.id}
                  className={"mobile-nav-item " + (activeNav === item.id ? "active" : "")}
                  onClick={() => { onNav(item.id); setMobileNavOpen(false); }}
                >
                  {t(item.k)}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

window.Footer = function Footer({ t, lang }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="f-brand">
              <img src="/assets/alendent-logo.jpeg" alt="Alendent" />
              <span className="n">Alendent</span>
            </div>
            <p className="f-about">{t("f.about")}</p>
          </div>
          <div>
            <h4>{t("f.shop")}</h4>
            <ul>
              <li>{lang === "am" ? "Բուժական նյութեր" : lang === "ru" ? "Реставрация" : "Restorative"}</li>
              <li>{lang === "am" ? "Էնդոդոնտիա" : lang === "ru" ? "Эндодонтия" : "Endodontics"}</li>
              <li>{lang === "am" ? "Իմպլանտներ" : lang === "ru" ? "Имплантация" : "Implants"}</li>
              <li>{lang === "am" ? "Գործիքներ" : lang === "ru" ? "Инструменты" : "Instruments"}</li>
              <li>{t("nav.deals")}</li>
            </ul>
          </div>
          <div>
            <h4>{t("f.help")}</h4>
            <ul>
              <li>{lang === "am" ? "Առաքում և վերադարձ" : lang === "ru" ? "Доставка и возврат" : "Shipping & returns"}</li>
              <li>{lang === "am" ? "Վճարման եղանակներ" : lang === "ru" ? "Способы оплаты" : "Payment methods"}</li>
              <li>{lang === "am" ? "Հաճախ տրվող հարցեր" : lang === "ru" ? "FAQ" : "FAQ"}</li>
              <li>{lang === "am" ? "Կլինիկաների ծրագիր" : lang === "ru" ? "Программа клиник" : "Clinic program"}</li>
            </ul>
          </div>
          <div>
            <h4>{t("f.contact.t")}</h4>
            <ul>
              <li><Icon name="pin" size={14} style={{marginRight: 6, verticalAlign: "middle"}}/> {lang === "am" ? "Բաղրամյան 24/3, Երևան" : lang === "ru" ? "Баграмяна 24/3, Ереван" : "Baghramyan 24/3, Yerevan"}</li>
              <li><Icon name="phone" size={14} style={{marginRight: 6, verticalAlign: "middle"}}/> +374 (10) 50-50-50</li>
              <li><Icon name="mail" size={14} style={{marginRight: 6, verticalAlign: "middle"}}/> hello@alendent.am</li>
              <li><Icon name="clock" size={14} style={{marginRight: 6, verticalAlign: "middle"}}/> {t("ub.hours")}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t("f.copy")}</span>
          <span>Visa · Mastercard · ArCa · Idram</span>
        </div>
      </div>
    </footer>
  );
};

window.ProductCard = function ProductCard({ p, t, lang, onAdd, onOpen, addedFlash, favorites, onToggleFav }) {
  const added = addedFlash === p.id;
  const isFav = favorites && favorites.includes(p.id);
  const stockClass = p.stock === "low" ? "low" : "";
  const stockLabel = p.stock === "low" ? t("p.lowstock") : t("p.stock");

  return (
    <article className="pcard" onClick={() => onOpen(p)}>
      <PhPlaceholder label={p.vendor} image={p.image} alt={p.names[lang]} />
      {p.tag === "sale" && <span className="pcard-tag sale">{t("p.sale")}</span>}
      {!p.tag && p.new && <span className="pcard-tag new">{t("p.new")}</span>}
      <button
        className={"pcard-wish " + (isFav ? "active" : "")}
        onClick={(e) => { e.stopPropagation(); if (onToggleFav) onToggleFav(p.id); }}
        title={t("header.fav")}
      >
        <Icon name="heart" size={16}/>
      </button>
      <div className="pcard-body">
        <span className="pcard-vendor">{p.vendor}</span>
        <h3 className="pcard-name">{p.names[lang]}</h3>
        <span className={"pcard-stock " + stockClass}><span className="dot"></span>{stockLabel}</span>
        <div className="pcard-foot">
          <div className="pcard-price">
            <span className="p-amount">{fmt(p.price)} {t("cur")}</span>
            {p.was && <span className="p-was">{fmt(p.was)} {t("cur")}</span>}
          </div>
          <button
            className={"pcard-add " + (added ? "added" : "")}
            onClick={(e) => { e.stopPropagation(); onAdd(p); }}
            title={t("p.add")}
          >
            <Icon name={added ? "check" : "plus"} size={18}/>
          </button>
        </div>
      </div>
    </article>
  );
};

window.FavoritesDrawer = function FavoritesDrawer({ open, onClose, favorites, products, lang, t, onToggleFav, onAdd, onOpen }) {
  const favProducts = (favorites || []).map(id => products.find(p => p.id === id)).filter(Boolean);

  return (
    <>
      <div className={"scrim " + (open ? "open" : "")} onClick={onClose}/>
      <div className={"drawer " + (open ? "open" : "")}>
        <div className="drawer-head">
          <h2>
            {t("header.fav")}
            {favProducts.length > 0 && (
              <span style={{fontSize: 14, fontWeight: 600, color: "var(--text-muted)", marginLeft: 8}}>
                ({favProducts.length})
              </span>
            )}
          </h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={20}/></button>
        </div>
        <div className="drawer-body">
          {favProducts.length === 0 ? (
            <div className="empty-cart">
              <span className="ico" style={{color: "var(--danger)"}}>
                <Icon name="heart" size={28}/>
              </span>
              <h3>{t("fav.empty.t")}</h3>
              <p style={{fontSize: 13.5, marginTop: 6}}>{t("fav.empty.s")}</p>
            </div>
          ) : (
            favProducts.map(p => (
              <div key={p.id} className="cart-line" style={{cursor: "pointer"}} onClick={() => { onClose(); onOpen(p); }}>
                <div className="thumb">{p.image && <img src={p.image} alt="" />}</div>
                <div>
                  <div className="cl-vendor">{p.vendor}</div>
                  <div className="cl-name">{p.names[lang]}</div>
                  <div className="cl-row">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => { e.stopPropagation(); onAdd(p); }}
                    >
                      <Icon name="cart" size={14}/> {t("p.add")}
                    </button>
                    <button
                      className="cl-remove"
                      onClick={(e) => { e.stopPropagation(); onToggleFav(p.id); }}
                    >
                      {t("fav.remove")}
                    </button>
                  </div>
                </div>
                <div className="cl-price">{fmt(p.price)} {t("cur")}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

window.Toast = function Toast({ show, message }) {
  return (
    <div className={"toast " + (show ? "show" : "")}>
      <span className="ico"><Icon name="check" size={14}/></span>
      <span>{message}</span>
    </div>
  );
};
