/* Main App — state + routing */

const { useState, useEffect } = React;

function App() {
  // Products & brands now live in the backend database (server.js / SQLite).
  // We keep a local copy in state for rendering; mutations persist via window.api.
  const [products, setProducts] = useState(() => window.PRODUCTS || []);
  const [brands, setBrands] = useState([]);

  // Load from the database on first mount (fall back to data.js seed if offline).
  useEffect(() => {
    if (!window.api) return;
    window.api.getProducts()
      .then(ps => {
        setProducts(ps);
        window.PRODUCTS = ps;
        const ids = new Set(ps.map(p => p.id));
        setCart(prev => prev.filter(c => ids.has(c.id)));
      })
      .catch(() => { /* keep data.js seed already in window.PRODUCTS */ });
    window.api.getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  // Keep window.PRODUCTS in sync for components that read it directly.
  useEffect(() => { window.PRODUCTS = products; }, [products]);

  // --- Product DB mutations (optimistic local update + persist to server) ---
  const saveProduct = (p) => {
    setProducts(prev => prev.some(x => x.id === p.id)
      ? prev.map(x => x.id === p.id ? p : x)
      : [...prev, p]);
    if (window.api) window.api.saveProduct(p).catch(() => showToast("Save failed — is the server running?"));
  };
  const removeProduct = (id) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    if (window.api) window.api.deleteProduct(id).catch(() => showToast("Delete failed"));
  };

  // --- Brand DB mutations ---
  const saveBrand = (b) => {
    setBrands(prev => prev.some(x => x.name === b.name)
      ? prev.map(x => x.name === b.name ? b : x)
      : [...prev, b]);
    if (window.api) window.api.saveBrand(b).catch(() => showToast("Save failed"));
  };
  const removeBrand = (name) => {
    setBrands(prev => prev.filter(x => x.name !== name));
    if (window.api) window.api.deleteBrand(name).catch(() => showToast("Delete failed"));
  };

  const [lang, setLang] = useState(() => localStorage.getItem("alendent.lang") || "am");
  const [route, setRoute] = useState("home"); // home | catalog | pdp | checkout | confirm
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [product, setProduct] = useState(null);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("alendent.cart") || "[]"); } catch { return []; }
  });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("alendent.fav") || "[]"); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [addedFlash, setAddedFlash] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [orderId, setOrderId] = useState("");
  const [activeNav, setActiveNav] = useState("");

  // Tweaks panel state (density)
  const tweakDefaults = /*EDITMODE-BEGIN*/{
    "density": "comfortable"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = window.useTweaks ? window.useTweaks(tweakDefaults) : [tweakDefaults, () => {}];

  useEffect(() => {
    document.documentElement.setAttribute("data-density", tweaks.density);
  }, [tweaks.density]);

  useEffect(() => {
    localStorage.setItem("alendent.lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("alendent.cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("alendent.fav", JSON.stringify(favorites));
  }, [favorites]);


  // Translator
  const t = (key) => {
    const dict = window.I18N[lang] || window.I18N.en;
    return dict[key] || key;
  };

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2000);
  };

  // Cart actions
  const addToCart = (p, q = 1) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === p.id);
      if (existing) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + q } : c);
      return [...prev, { id: p.id, qty: q }];
    });
    setAddedFlash(p.id);
    setTimeout(() => setAddedFlash(null), 1400);
    showToast(t("toast.added"));
  };

  const changeQty = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(c => c.id === id ? { ...c, qty } : c));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id));

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  // Favorites actions
  const toggleFavorite = (id) => {
    const isFav = favorites.includes(id);
    setFavorites(prev => isFav ? prev.filter(f => f !== id) : [...prev, id]);
    showToast(t(isFav ? "toast.fav.off" : "toast.fav.on"));
  };

  const favCount = favorites.length;

  // Navigation
  const goHome = () => {
    setRoute("home"); setQuery(""); setCategory(null); setProduct(null); setActiveNav("");
    if (window.location.hash) history.pushState("", "", window.location.pathname);
    window.scrollTo({ top: 0 });
  };
  const goCatalog = () => {
    setRoute("catalog"); setProduct(null);
    window.scrollTo({ top: 0 });
  };
  const onNav = (id) => {
    setActiveNav(id);
    setCategory(null);
    setQuery("");
    setProduct(null);
    if (id === "catalog") {
      setRoute("catalog");
    } else if (id === "deals") {
      setRoute("deals");
    } else if (id === "brands") {
      setRoute("brands");
    } else if (id === "about") {
      setRoute("about");
    } else if (id === "contact" || id === "b2b") {
      setActiveNav("contact");
      setRoute("contact");
    } else if (id === "admin") {
      window.location.href = "/admin";
      return;
    } else {
      goCatalog();
    }
    window.scrollTo({ top: 0 });
  };
  const submitSearch = () => {
    setRoute("catalog"); setCategory(null); setProduct(null);
    window.scrollTo({ top: 0 });
  };
  const openCategory = (catId) => {
    setCategory(catId); setQuery(""); setRoute("catalog"); setProduct(null);
    window.scrollTo({ top: 0 });
  };
  const clearCategory = () => { setCategory(null); setQuery(""); };
  const openProduct = (p) => {
    setProduct(p); setRoute("pdp");
    window.scrollTo({ top: 0 });
  };
  const goCheckout = () => {
    if (cart.length === 0) return;
    setCartOpen(false); setRoute("checkout");
    window.scrollTo({ top: 0 });
  };
  const buyNow = (p, qty) => {
    addToCart(p, qty);
    setTimeout(() => { setRoute("checkout"); window.scrollTo({ top: 0 }); }, 100);
  };
  const placeOrder = ({ form, delivery, payment, total, items }) => {
    const id = "AL" + Math.floor(Math.random() * 900000 + 100000).toString();
    setOrderId(id);
    setCart([]);
    setRoute("confirm");
    window.scrollTo({ top: 0 });
  };

  // Render current screen
  let screen;
  if (route === "home") {
    screen = <HomePage t={t} lang={lang} onAdd={addToCart} onOpen={openProduct}
              onNav={onNav} onCategory={openCategory} addedFlash={addedFlash}
              favorites={favorites} onToggleFav={toggleFavorite} brands={brands} products={products}/>;
  } else if (route === "catalog") {
    screen = <CatalogPage t={t} lang={lang} query={query} category={category}
              onAdd={addToCart} onOpen={openProduct} onCategory={openCategory}
              onClearCategory={clearCategory} addedFlash={addedFlash}
              favorites={favorites} onToggleFav={toggleFavorite} products={products}/>;
  } else if (route === "deals") {
    screen = <DealsPage t={t} lang={lang} onAdd={addToCart} onOpen={openProduct}
              addedFlash={addedFlash} favorites={favorites} onToggleFav={toggleFavorite} products={products}/>;
  } else if (route === "brands") {
    screen = <BrandsPage t={t} lang={lang} brands={brands} products={products}
              onBrandSelect={(brandName) => {
                setRoute("catalog");
                setCategory(null);
                setQuery(brandName);
                setActiveNav("catalog");
              }}/>;
  } else if (route === "about") {
    screen = <AboutPage t={t} lang={lang}/>;
  } else if (route === "contact") {
    screen = <ContactPage t={t} lang={lang}/>;
  } else if (route === "pdp" && product) {
    screen = <PdpPage t={t} lang={lang} product={product}
              onAdd={addToCart} onOpen={openProduct} onBack={goCatalog}
              onBuyNow={buyNow} addedFlash={addedFlash}
              favorites={favorites} onToggleFav={toggleFavorite} products={products}/>;
  } else if (route === "checkout") {
    screen = <CheckoutPage t={t} lang={lang} cart={cart} products={products}
              onPlaceOrder={placeOrder} onBack={() => setRoute("catalog")}/>;
  } else if (route === "confirm") {
    screen = <OrderConfirmPage t={t} lang={lang} orderId={orderId} onBack={goHome}/>;
  }

  const showHeader = route !== "confirm";
  const showFooter = route !== "checkout" && route !== "confirm";

  return (
    <div className="app">
      {showHeader && (
        <Header t={t} lang={lang} setLang={setLang}
          cartCount={cartCount}
          favCount={favCount}
          query={query} setQuery={setQuery} onSubmitSearch={submitSearch}
          onNav={onNav} activeNav={activeNav}
          onLogo={goHome} onCart={() => setCartOpen(true)}
          onFav={() => setFavOpen(true)}/>
      )}

      {screen}

      {showFooter && <Footer t={t} lang={lang}/>}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        products={products}
        lang={lang}
        t={t}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onCheckout={goCheckout}
        onContinue={goCatalog}
      />

      <FavoritesDrawer
        open={favOpen}
        onClose={() => setFavOpen(false)}
        favorites={favorites}
        products={products}
        lang={lang}
        t={t}
        onToggleFav={toggleFavorite}
        onAdd={addToCart}
        onOpen={(p) => { setFavOpen(false); openProduct(p); }}
      />

      <Toast show={toast.show} message={toast.msg}/>

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="Layout">
            <window.TweakRadio
              label="Card density"
              value={tweaks.density}
              onChange={v => setTweak("density", v)}
              options={[
                { value: "comfortable", label: "Comfortable" },
                { value: "compact", label: "Compact" },
              ]}
            />
          </window.TweakSection>
          <window.TweakSection title="Language">
            <window.TweakRadio
              label="Site language"
              value={lang}
              onChange={setLang}
              options={[
                { value: "am", label: "ՀԱՅ" },
                { value: "ru", label: "РУС" },
                { value: "en", label: "ENG" },
              ]}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
