/* Checkout flow */

window.CheckoutPage = function CheckoutPage({ t, lang, cart, products, onPlaceOrder, onBack }) {
  const [delivery, setDelivery] = React.useState("pickup");
  const [payment, setPayment] = React.useState("card");
  const [coupon, setCoupon] = React.useState("");
  const [applied, setApplied] = React.useState(null);

  const [form, setForm] = React.useState({
    firstname: "", lastname: "", phone: "", email: "", org: "",
    address: "", city: lang === "am" ? "Երևան" : lang === "ru" ? "Ереван" : "Yerevan", region: "", postcode: "", note: "",
    cardnum: "", cardexp: "", cardcvv: "", cardname: "",
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const lines = cart.map(c => ({ ...c, p: products.find(p => p.id === c.id) })).filter(c => c.p);
  const subtotal = lines.reduce((s, c) => s + c.p.price * c.qty, 0);
  const deliveryCost = delivery === "pickup" ? 0
    : delivery === "yerevan" ? (subtotal >= 25000 ? 0 : 1500)
    : delivery === "regions" ? 2500
    : delivery === "express" ? 4000 : 0;
  const discount = applied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal + deliveryCost - discount;

  const tryApply = () => {
    if (coupon.trim().toUpperCase() === "DENT10") setApplied("DENT10");
    else if (coupon.trim()) setApplied("INVALID");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.firstname || !form.phone) return;
    onPlaceOrder({ form, delivery, payment, total, items: lines });
  };

  return (
    <main className="checkout">
      <div className="container">
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24}}>
          <h1 style={{fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: 0}}>{t("co.title")}</h1>
          <button className="btn btn-ghost" onClick={onBack}>
            <Icon name="arrow-left" size={16}/> {t("co.back")}
          </button>
        </div>

        <div className="checkout-steps">
          {[1,2,3,4].map((n, i) => (
            <React.Fragment key={n}>
              <div className={"checkout-step " + (n === 4 ? "" : "done")}>
                <span className="num">{n === 4 ? n : <Icon name="check" size={13}/>}</span>
                {t("co.step." + n)}
              </div>
              {i < 3 && <span className="bar"></span>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={submit}>
          <div className="checkout-grid">
            <div>
              {/* Contact */}
              <div className="checkout-card">
                <h2><span className="step-num">1</span>{t("co.contact")}</h2>
                <div className="field-row">
                  <div className="field">
                    <label>{t("co.firstname")}</label>
                    <input required value={form.firstname} onChange={e => set("firstname", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>{t("co.lastname")}</label>
                    <input value={form.lastname} onChange={e => set("lastname", e.target.value)} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>{t("co.phone")}</label>
                    <input required type="tel" placeholder="+374 ..." value={form.phone} onChange={e => set("phone", e.target.value)} />
                  </div>
                  <div className="field">
                    <label>{t("co.email")}</label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label>{t("co.org")}</label>
                  <input placeholder={t("co.org.placeholder")} value={form.org} onChange={e => set("org", e.target.value)} />
                </div>
              </div>

              {/* Delivery */}
              <div className="checkout-card">
                <h2><span className="step-num">2</span>{t("co.delivery")}</h2>
                {[
                  { id: "pickup", k: "co.dlv.pickup", price: 0 },
                  { id: "yerevan", k: "co.dlv.yerevan", price: subtotal >= 25000 ? 0 : 1500 },
                  { id: "regions", k: "co.dlv.regions", price: 2500 },
                  { id: "express", k: "co.dlv.express", price: 4000 },
                ].map(opt => (
                  <div key={opt.id} className={"radio-card " + (delivery === opt.id ? "selected" : "")} onClick={() => setDelivery(opt.id)}>
                    <span className="rc-dot"></span>
                    <div style={{flex: 1}}>
                      <div className="rc-title">{t(opt.k + ".t")}</div>
                      <div className="rc-sub">{t(opt.k + ".s")}</div>
                    </div>
                    <div className="rc-price">{opt.price === 0 ? (opt.id === "pickup" ? "" : t("cart.shipping.free")) : fmt(opt.price) + " " + t("cur")}</div>
                  </div>
                ))}

                {delivery !== "pickup" && (
                  <div style={{marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)"}}>
                    <div className="field">
                      <label>{t("co.address")}</label>
                      <input required={delivery !== "pickup"} placeholder={lang === "am" ? "Փողոց, շենք, բնակարան" : lang === "ru" ? "Улица, дом, квартира" : "Street, building, apartment"}
                        value={form.address} onChange={e => set("address", e.target.value)} />
                    </div>
                    <div className="field-row-3">
                      <div className="field">
                        <label>{t("co.city")}</label>
                        <input value={form.city} onChange={e => set("city", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>{t("co.region")}</label>
                        <select value={form.region} onChange={e => set("region", e.target.value)}>
                          <option value="">—</option>
                          {(lang === "am"
                            ? ["Երևան","Արագածոտն","Արարատ","Արմավիր","Գեղարքունիք","Կոտայք","Լոռի","Շիրակ","Սյունիք","Տավուշ","Վայոց ձոր"]
                            : lang === "ru"
                            ? ["Ереван","Арагацотн","Арарат","Армавир","Гегаркуник","Котайк","Лори","Ширак","Сюник","Тавуш","Вайоц-Дзор"]
                            : ["Yerevan","Aragatsotn","Ararat","Armavir","Gegharkunik","Kotayk","Lori","Shirak","Syunik","Tavush","Vayots Dzor"]
                          ).map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div className="field">
                        <label>{t("co.postcode")}</label>
                        <input value={form.postcode} onChange={e => set("postcode", e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="field" style={{marginBottom: 0, marginTop: 10}}>
                  <label>{t("co.note")}</label>
                  <textarea rows={2} placeholder={t("co.note.placeholder")} value={form.note} onChange={e => set("note", e.target.value)}></textarea>
                </div>
              </div>

              {/* Payment */}
              <div className="checkout-card">
                <h2><span className="step-num">3</span>{t("co.payment")}</h2>
                {[
                  { id: "card", k: "co.pay.card", icon: "credit" },
                  { id: "cod", k: "co.pay.cod", icon: "package" },
                  { id: "invoice", k: "co.pay.invoice", icon: "info" },
                ].map(opt => (
                  <div key={opt.id} className={"radio-card " + (payment === opt.id ? "selected" : "")} onClick={() => setPayment(opt.id)}>
                    <span className="rc-dot"></span>
                    <div style={{flex: 1}}>
                      <div className="rc-title" style={{display: "flex", alignItems: "center", gap: 8}}>
                        <Icon name={opt.icon} size={16}/>
                        {t(opt.k + ".t")}
                      </div>
                      <div className="rc-sub">{t(opt.k + ".s")}</div>
                    </div>
                  </div>
                ))}

                {payment === "card" && (
                  <div style={{marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)"}}>
                    <div className="field">
                      <label>{t("co.card.number")}</label>
                      <input placeholder="•••• •••• •••• ••••" value={form.cardnum} onChange={e => set("cardnum", e.target.value)} />
                    </div>
                    <div className="field-row">
                      <div className="field">
                        <label>{t("co.card.exp")}</label>
                        <input placeholder="MM/YY" value={form.cardexp} onChange={e => set("cardexp", e.target.value)} />
                      </div>
                      <div className="field">
                        <label>{t("co.card.cvv")}</label>
                        <input type="password" placeholder="•••" maxLength={4} value={form.cardcvv} onChange={e => set("cardcvv", e.target.value)} />
                      </div>
                    </div>
                    <div className="field" style={{marginBottom: 0}}>
                      <label>{t("co.card.name")}</label>
                      <input value={form.cardname} onChange={e => set("cardname", e.target.value)} />
                    </div>
                    <div style={{display: "flex", alignItems: "center", gap: 8, marginTop: 14, color: "var(--text-muted)", fontSize: 12}}>
                      <Icon name="lock" size={14}/>
                      {lang === "am" ? "SSL գաղտնագրմամբ վճարում" : lang === "ru" ? "Защищённая оплата SSL" : "Secure SSL-encrypted payment"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <aside className="order-summary">
              <h2 style={{margin: "0 0 18px", fontSize: 17, fontWeight: 800}}>{t("co.summary")}</h2>
              {lines.map(({ p, qty }) => (
                <div className="os-line" key={p.id}>
                  <div className="os-thumb"><span className="b">{qty}</span></div>
                  <div>
                    <div className="os-vendor">{p.vendor}</div>
                    <div className="os-name">{p.names[lang]}</div>
                  </div>
                  <div className="os-price">{fmt(p.price * qty)} {t("cur")}</div>
                </div>
              ))}

              <div className="os-coupon">
                <input className="" placeholder={t("co.coupon")} value={coupon} onChange={e => setCoupon(e.target.value)}
                  style={{background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 12px", fontSize: 13, outline: "none"}}/>
                <button type="button" className="btn btn-outline btn-sm" onClick={tryApply}>{lang === "am" ? "Կիրառել" : lang === "ru" ? "Применить" : "Apply"}</button>
              </div>
              {applied === "DENT10" && (
                <div style={{fontSize: 12.5, color: "var(--success)", marginTop: -6, marginBottom: 10, fontWeight: 600}}>
                  ✓ DENT10 — −10%
                </div>
              )}
              {applied === "INVALID" && (
                <div style={{fontSize: 12.5, color: "var(--danger)", marginTop: -6, marginBottom: 10}}>
                  {lang === "am" ? "Անվավեր կուպոն" : lang === "ru" ? "Промокод недействителен" : "Invalid promo code"}
                </div>
              )}

              <div className="totals" style={{borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 4}}>
                <div className="row"><span>{t("cart.subtotal")}</span><span>{fmt(subtotal)} {t("cur")}</span></div>
                {discount > 0 && <div className="row"><span style={{color: "var(--success)"}}>{lang === "am" ? "Զեղչ" : lang === "ru" ? "Скидка" : "Discount"}</span><span style={{color: "var(--success)"}}>−{fmt(discount)} {t("cur")}</span></div>}
                <div className="row">
                  <span>{t("cart.shipping")}</span>
                  <span style={{color: deliveryCost === 0 ? "var(--success)" : "inherit", fontWeight: deliveryCost === 0 ? 700 : 400}}>
                    {deliveryCost === 0 ? (delivery === "pickup" ? "—" : t("cart.shipping.free")) : fmt(deliveryCost) + " " + t("cur")}
                  </span>
                </div>
                <div className="row grand"><span>{t("cart.total")}</span><span>{fmt(total)} {t("cur")}</span></div>
                <div style={{textAlign: "right", fontSize: 11, color: "var(--text-muted)"}}>{t("cart.vat")}</div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" style={{marginTop: 16}}>
                <Icon name="lock" size={16}/> {t("co.place")}
              </button>
              <div style={{fontSize: 11.5, color: "var(--text-muted)", textAlign: "center", marginTop: 10}}>
                {t("co.tos")}
              </div>
            </aside>
          </div>
        </form>
      </div>
    </main>
  );
};

window.OrderConfirmPage = function OrderConfirmPage({ t, lang, orderId, onBack }) {
  return (
    <main>
      <div className="confirm">
        <span className="check"><Icon name="check" size={44} stroke={2.2}/></span>
        <h1>{t("ok.title")}</h1>
        <p>{t("ok.sub")}</p>
        <div className="order-id">{t("ok.id")}{orderId}</div>
        <div>
          <button className="btn btn-primary btn-lg" onClick={onBack}>
            <Icon name="arrow-left" size={16}/> {t("ok.cta")}
          </button>
        </div>
      </div>
    </main>
  );
};
