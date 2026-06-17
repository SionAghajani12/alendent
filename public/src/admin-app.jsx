/* Admin standalone app — bootstraps AdminPage without the full storefront */

function AdminApp() {
  const [products, setProducts] = React.useState([]);
  const [brands,   setBrands]   = React.useState([]);
  const [toast,    setToast]    = React.useState({ show: false, msg: "" });
  const [loading,  setLoading]  = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      window.api.getProducts(),
      window.api.getBrands(),
    ]).then(([ps, bs]) => {
      setProducts(ps);
      window.PRODUCTS = ps;
      setBrands(bs);
    }).catch(err => {
      showToast("Failed to load data: " + err.message);
    }).finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 2500);
  };

  const saveProduct = async (p) => {
    setProducts(prev => prev.some(x => x.id === p.id)
      ? prev.map(x => x.id === p.id ? p : x)
      : [...prev, p]);
    window.PRODUCTS = products;
    try {
      await window.api.saveProduct(p);
    } catch (err) {
      showToast("Save failed: " + err.message);
    }
  };

  const removeProduct = async (id) => {
    setProducts(prev => prev.filter(x => x.id !== id));
    try {
      await window.api.deleteProduct(id);
    } catch (err) {
      showToast("Delete failed: " + err.message);
    }
  };

  const saveBrand = async (b) => {
    setBrands(prev => prev.some(x => x.name === b.name)
      ? prev.map(x => x.name === b.name ? b : x)
      : [...prev, b]);
    try {
      await window.api.saveBrand(b);
    } catch (err) {
      showToast("Save failed: " + err.message);
    }
  };

  const removeBrand = async (name) => {
    setBrands(prev => prev.filter(x => x.name !== name));
    try {
      await window.api.deleteBrand(name);
    } catch (err) {
      showToast("Delete failed: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/admin/logout", { method: "POST", credentials: "same-origin" });
    } catch {}
    window.location.href = "/admin/login";
  };

  const handleBack = () => {
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
                    minHeight: "100vh", background: "#0f1117", color: "#e8ecf0",
                    fontFamily: "Manrope, system-ui, sans-serif", fontSize: 15 }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <AdminPage
        products={products}
        onSaveProduct={saveProduct}
        onDeleteProduct={removeProduct}
        brands={brands}
        onSaveBrand={saveBrand}
        onDeleteBrand={removeBrand}
        showToast={showToast}
        onBack={handleBack}
        onLogout={handleLogout}
      />
      <Toast show={toast.show} message={toast.msg} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AdminApp />);
