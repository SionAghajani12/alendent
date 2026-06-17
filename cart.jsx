/* Cart drawer */

window.CartDrawer = function CartDrawer({ open, onClose, cart, products, lang, t, onChangeQty, onRemove, onCheckout, onContinue }) {
  const lines = cart.map(c => ({ ...c, p: products.find(p => p.id === c.id) })).filter(c => c.p);
  const subtotal = lines.reduce((s, c) => s + c.p.price * c.qty, 0);
  const freeShip = subtotal >= 25000 || subtotal === 0;
  const shipping = freeShip ? 0 : 1500;
  const total = subtotal + shipping;

  return (
    <>
      <div className={"scrim " + (open ? "open" : "")} onClick={onClose}></div>
      <aside className={"drawer " + (open ? "open" : "")} role="dialog" aria-label={t("cart.title")}>
        <div className="drawer-head">
          <h2>{t("cart.title")} {cart.length > 0 && <span style={{color: "var(--text-muted)", fontWeight: 600, fontSize: 14}}>({cart.reduce((s, c) => s + c.qty, 0)})</span>}</h2>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={22}/></button>
        </div>

        {lines.length === 0 ? (
          <div className="drawer-body">
            <div className="empty-cart">
              <span className="ico"><Icon name="cart" size={28}/></span>
              <h3>{t("cart.empty.t")}</h3>
              <p>{t("cart.empty.s")}</p>
              <button className="btn btn-primary" style={{marginTop: 20}} onClick={() => { onClose(); onContinue(); }}>
                {t("cart.empty.cta")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              {lines.map(({ p, qty }) => (
                <div className="cart-line" key={p.id}>
                  <div className="thumb">{p.image && <img src={p.image} alt="" />}</div>
                  <div>
                    <div className="cl-vendor">{p.vendor}</div>
                    <div className="cl-name">{p.names[lang]}</div>
                    <div className="cl-row">
                      <div className="cl-qty">
                        <button onClick={() => onChangeQty(p.id, qty - 1)}><Icon name="minus" size={12}/></button>
                        <span>{qty}</span>
                        <button onClick={() => onChangeQty(p.id, qty + 1)}><Icon name="plus" size={12}/></button>
                      </div>
                      <button className="cl-remove" onClick={() => onRemove(p.id)}>{t("cart.remove")}</button>
                    </div>
                  </div>
                  <div className="cl-price">{fmt(p.price * qty)} {t("cur")}</div>
                </div>
              ))}
            </div>

            <div className="drawer-foot">
              <div className="totals">
                <div className="row">
                  <span>{t("cart.subtotal")}</span>
                  <span>{fmt(subtotal)} {t("cur")}</span>
                </div>
                <div className="row">
                  <span>{t("cart.shipping")}</span>
                  <span style={{color: freeShip ? "var(--success)" : "inherit", fontWeight: freeShip ? 700 : 400}}>
                    {freeShip ? t("cart.shipping.free") : fmt(shipping) + " " + t("cur")}
                  </span>
                </div>
                <div className="row grand">
                  <span>{t("cart.total")}</span>
                  <span>{fmt(total)} {t("cur")}</span>
                </div>
                <div style={{textAlign: "right", fontSize: 11, color: "var(--text-muted)", marginTop: 2}}>{t("cart.vat")}</div>
              </div>
              <button className="btn btn-primary btn-lg btn-block" onClick={onCheckout}>
                {t("cart.checkout")} <Icon name="arrow-right" size={18}/>
              </button>
              <button className="btn btn-ghost btn-block" style={{marginTop: 6}} onClick={onClose}>{t("cart.continue")}</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
};
