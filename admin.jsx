/* Admin Page — Product & Brand management (backed by the SQLite database) */

window.AdminPage = function AdminPage({
  products, onSaveProduct, onDeleteProduct,
  brands, onSaveBrand, onDeleteBrand,
  showToast, onBack,
}) {
  const [tab, setTab]             = React.useState("products"); // products | brands
  const [search, setSearch]       = React.useState("");
  const [catFilter, setCatFilter] = React.useState("");
  const [modal, setModal]         = React.useState(null);
  const [deleteTarget, setDel]    = React.useState(null);
  const [page, setPage]           = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState([]);
  const PAGE_SIZE = 10;

  const filtered = React.useMemo(() => {
    let res = products;
    if (catFilter) res = res.filter(p => p.cat === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        (p.id || "").toLowerCase().includes(q) ||
        (p.names?.en || "").toLowerCase().includes(q) ||
        (p.names?.am || "").toLowerCase().includes(q) ||
        (p.vendor || "").toLowerCase().includes(q)
      );
    }
    return res;
  }, [products, search, catFilter]);

  React.useEffect(() => { setPage(1); setSelectedIds([]); }, [search, catFilter, tab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Selection (across all filtered results, not just current page) ── */
  const filteredIds  = filtered.map(p => p.id);
  const allSelected  = filtered.length > 0 && filteredIds.every(id => selectedIds.includes(id));
  const someSelected = selectedIds.length > 0 && !allSelected;
  const toggleOne    = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll    = () => setSelectedIds(allSelected ? [] : filteredIds);
  const clearSel     = () => setSelectedIds([]);
  const selectAllRef = React.useRef(null);
  React.useEffect(() => { if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected; }, [someSelected]);

  const bulkDelete = (ids) => {
    ids.forEach(id => onDeleteProduct(id));
    setSelectedIds([]);
    setDel(null);
    showToast(ids.length + " products deleted");
  };

  const stats = React.useMemo(() => ({
    total:    products.length,
    featured: products.filter(p => p.featured).length,
    newArr:   products.filter(p => p.new).length,
    sale:     products.filter(p => p.tag === "sale").length,
    low:      products.filter(p => p.stock === "low").length,
    out:      products.filter(p => p.stock === "out").length,
  }), [products]);

  /* product mutations → persist to DB */
  const toggleBool = (p, field) => onSaveProduct({ ...p, [field]: !p[field] });
  const toggleSale = (p) => {
    const on = p.tag !== "sale";
    onSaveProduct({ ...p, tag: on ? "sale" : null, was: on && !p.was ? Math.round(p.price * 1.25) : p.was });
  };
  const setStock = (p, val) => onSaveProduct({ ...p, stock: val });

  const doDelete = (id) => { onDeleteProduct(id); setDel(null); showToast("Product deleted"); };

  const saveProduct = (data) => {
    onSaveProduct(data);
    showToast(products.some(p => p.id === data.id) ? "Product updated" : "Product added");
    setModal(null);
  };
  const saveBrand = (data, prevName) => {
    if (prevName && prevName !== data.name) onDeleteBrand(prevName); // renamed
    onSaveBrand(data);
    showToast(brands.some(b => b.name === data.name) ? "Brand updated" : "Brand added");
    setModal(null);
  };

  // Create a brand inline (from the product form) without closing the product modal
  const addBrandInline = (b) => { onSaveBrand(b); showToast(`Brand “${b.name}” added`); };

  const brandProductCount = (name) => products.filter(p => p.vendor === name).length;

  const handleBack = () => {
    if (window.location.hash) history.pushState("", "", window.location.pathname);
    onBack();
  };

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="admin-hd">
        <div className="admin-hd-brand">
          <img src="assets/alendent-logo.jpeg" alt="" />
          <span>Alendent <strong>Admin</strong></span>
        </div>
        <button className="btn btn-sm" style={{color:"#c8d3df",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.14)"}} onClick={handleBack}>
          <Icon name="arrow-left" size={14}/> Back to site
        </button>
      </div>

      <div className="admin-body">
        {/* ── Tabs ── */}
        <div className="admin-tabs">
          <button className={"admin-tab " + (tab==="products"?"active":"")} onClick={()=>setTab("products")}>
            Products <span className="admin-tab-count">{products.length}</span>
          </button>
          <button className={"admin-tab " + (tab==="brands"?"active":"")} onClick={()=>setTab("brands")}>
            Brands <span className="admin-tab-count">{brands.length}</span>
          </button>
        </div>

        {tab === "products" && (
          <>
            {/* Stats */}
            <div className="admin-stats">
              {[
                { label: "Total",       value: stats.total },
                { label: "Featured",    value: stats.featured },
                { label: "New arrivals",value: stats.newArr },
                { label: "On sale",     value: stats.sale },
                { label: "Low stock",   value: stats.low,  warn: true },
                { label: "Out of stock",value: stats.out,  danger: true },
              ].map(s => (
                <div key={s.label} className="admin-stat-card">
                  <div className="asc-value" style={{color: s.danger?"var(--danger)":s.warn?"var(--warning)":"var(--text)"}}>{s.value}</div>
                  <div className="asc-label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <div className="search admin-search" style={{height:38}}>
                  <Icon name="search" size={15}/>
                  <input type="text" placeholder="Search by name, SKU, or vendor…" value={search} onChange={e=>setSearch(e.target.value)}/>
                  {search && <button onClick={()=>setSearch("")} style={{background:"transparent",border:0,color:"var(--text-muted)",cursor:"pointer",padding:"0 6px"}}><Icon name="x" size={14}/></button>}
                </div>
                <select className="sort" value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                  <option value="">All categories</option>
                  {window.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.names.en}</option>)}
                </select>
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>setModal({ type:"product", _new:true })}>
                <Icon name="plus" size={14}/> Add product
              </button>
            </div>

            {/* Bulk action bar */}
            {selectedIds.length > 0 && (
              <div className="admin-bulk-bar">
                <span className="admin-bulk-count">{selectedIds.length} selected</span>
                <div className="admin-bulk-actions">
                  <button className="btn btn-outline btn-sm" onClick={clearSel}>Clear</button>
                  <button className="btn btn-sm admin-bulk-del" onClick={()=>setDel({ bulk: selectedIds.slice() })}>
                    <Icon name="trash" size={14}/> Delete selected ({selectedIds.length})
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{width:40, textAlign:"center"}}>
                      <input ref={selectAllRef} type="checkbox" className="admin-check"
                        checked={allSelected} onChange={toggleAll} title="Select all" />
                    </th>
                    <th style={{width:56}}></th>
                    <th style={{width:96}}>SKU</th>
                    <th>Product</th>
                    <th style={{width:140}}>Vendor</th>
                    <th style={{width:130}}>Category</th>
                    <th style={{width:110}}>Price (֏)</th>
                    <th style={{width:120}}>Stock</th>
                    <th style={{width:84}}>Featured</th>
                    <th style={{width:84}}>New</th>
                    <th style={{width:72}}>Sale</th>
                    <th style={{width:96}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => {
                    const cat = window.CATEGORIES.find(c => c.id === p.cat);
                    return (
                      <tr key={p.id} className={"admin-tr" + (selectedIds.includes(p.id) ? " selected" : "")}>
                        <td style={{textAlign:"center"}}>
                          <input type="checkbox" className="admin-check"
                            checked={selectedIds.includes(p.id)} onChange={()=>toggleOne(p.id)} />
                        </td>
                        <td>
                          <div className="admin-thumb">
                            {p.image ? <img src={p.image} alt=""/> : <Icon name="package" size={16}/>}
                          </div>
                        </td>
                        <td><code className="admin-code">{p.id}</code></td>
                        <td>
                          <div className="admin-product-name">{p.names?.en || p.names?.am || "—"}</div>
                          {p.names?.en && p.names?.am && <div className="admin-product-sub">{p.names.am}</div>}
                        </td>
                        <td style={{fontSize:13}}>{p.vendor}</td>
                        <td style={{fontSize:12.5, color:"var(--text-muted)"}}>{cat ? cat.names.en : p.cat}</td>
                        <td>
                          <span className="admin-price">{window.fmt ? window.fmt(p.price) : p.price}</span>
                          {p.was && <div className="admin-was">{window.fmt ? window.fmt(p.was) : p.was}</div>}
                        </td>
                        <td>
                          <select className="admin-stock-sel" value={p.stock || "in"} onChange={e=>setStock(p, e.target.value)}
                            style={{color:{in:"var(--success)",low:"var(--warning)",out:"var(--danger)"}[p.stock||"in"]}}>
                            <option value="in">In stock</option>
                            <option value="low">Low stock</option>
                            <option value="out">Out of stock</option>
                          </select>
                        </td>
                        <td><button className={"admin-flag-btn " + (p.featured?"on":"")} onClick={()=>toggleBool(p,"featured")}>{p.featured?"Yes":"No"}</button></td>
                        <td><button className={"admin-flag-btn " + (p.new?"on":"")} onClick={()=>toggleBool(p,"new")}>{p.new?"Yes":"No"}</button></td>
                        <td><button className={"admin-flag-btn sale " + (p.tag==="sale"?"on":"")} onClick={()=>toggleSale(p)}>{p.tag==="sale"?"Yes":"No"}</button></td>
                        <td>
                          <div className="admin-actions">
                            <button className="admin-act-btn" onClick={()=>setModal({ type:"product", data:p })} title="Edit"><Icon name="edit" size={13}/></button>
                            <button className="admin-act-btn danger" onClick={()=>setDel(p.id)} title="Delete"><Icon name="trash" size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={12} style={{textAlign:"center", padding:"48px 0", color:"var(--text-muted)", fontSize:14}}>No products match your search</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="admin-pagination">
              <span className="admin-pg-info">
                {filtered.length === 0 ? "No products" : `${(page-1)*PAGE_SIZE+1}–${Math.min(page*PAGE_SIZE, filtered.length)} of ${filtered.length} products`}
              </span>
              <div className="admin-pg-controls">
                <button className="admin-pg-btn" onClick={()=>setPage(1)} disabled={page===1} title="First page">«</button>
                <button className="admin-pg-btn" onClick={()=>setPage(p=>p-1)} disabled={page===1}><Icon name="arrow-left" size={14}/></button>
                {Array.from({length: totalPages}, (_,i)=>i+1)
                  .filter(n => n===1 || n===totalPages || Math.abs(n-page)<=1)
                  .reduce((acc,n,idx,arr)=>{ if(idx>0 && n-arr[idx-1]>1) acc.push("…"); acc.push(n); return acc; }, [])
                  .map((n,i)=> n==="…"
                    ? <span key={"e"+i} className="admin-pg-ellipsis">…</span>
                    : <button key={n} className={"admin-pg-btn " + (n===page?"active":"")} onClick={()=>setPage(n)}>{n}</button>)}
                <button className="admin-pg-btn" onClick={()=>setPage(p=>p+1)} disabled={page===totalPages}><Icon name="arrow-right" size={14}/></button>
                <button className="admin-pg-btn" onClick={()=>setPage(totalPages)} disabled={page===totalPages} title="Last page">»</button>
              </div>
            </div>
          </>
        )}

        {tab === "brands" && (
          <>
            <div className="admin-toolbar">
              <div className="admin-toolbar-left">
                <span style={{fontSize:14, color:"var(--text-muted)"}}>{brands.length} brands in the database</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={()=>setModal({ type:"brand", _new:true })}>
                <Icon name="plus" size={14}/> Add brand
              </button>
            </div>

            <div className="admin-brand-grid">
              {brands.map(b => (
                <div key={b.name} className="admin-brand-card">
                  <div className="admin-brand-logo">
                    {b.logo ? <img src={b.logo} alt=""/> : <span>{b.name.charAt(0)}</span>}
                  </div>
                  <div className="admin-brand-info">
                    <div className="admin-brand-name">{b.name}</div>
                    <div className="admin-brand-meta">
                      {b.country ? b.country + " · " : ""}{brandProductCount(b.name)} products
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button className="admin-act-btn" onClick={()=>setModal({ type:"brand", data:b })} title="Edit"><Icon name="edit" size={13}/></button>
                    <button className="admin-act-btn danger" onClick={()=>setDel({ brand:b.name })} title="Delete"><Icon name="trash" size={13}/></button>
                  </div>
                </div>
              ))}
              {brands.length === 0 && (
                <div style={{gridColumn:"1/-1", textAlign:"center", padding:"48px 0", color:"var(--text-muted)"}}>No brands yet</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Product / Brand modal */}
      {modal && modal.type === "product" && (
        <ProductFormModal product={modal._new ? null : modal.data} brands={brands} onAddBrand={addBrandInline} onSave={saveProduct} onClose={()=>setModal(null)}/>
      )}
      {modal && modal.type === "brand" && (
        <BrandFormModal brand={modal._new ? null : modal.data} onSave={saveBrand} onClose={()=>setModal(null)}/>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="modal-scrim" onClick={()=>setDel(null)}>
          <div className="modal-box modal-box--sm" onClick={e=>e.stopPropagation()}>
            <h3>
              {deleteTarget.bulk ? `Delete ${deleteTarget.bulk.length} products?`
                : deleteTarget.brand ? "Delete brand?"
                : "Delete product?"}
            </h3>
            <p style={{marginTop:8, marginBottom:0}}>This cannot be undone.</p>
            <div className="modal-foot" style={{marginTop:20}}>
              <button className="btn btn-outline btn-sm" onClick={()=>setDel(null)}>Cancel</button>
              <button className="btn btn-sm" style={{background:"var(--danger)",color:"#fff",border:0}}
                onClick={() => {
                  if (deleteTarget.bulk) bulkDelete(deleteTarget.bulk);
                  else if (deleteTarget.brand) { onDeleteBrand(deleteTarget.brand); showToast("Brand deleted"); setDel(null); }
                  else doDelete(deleteTarget);
                }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Reusable image uploader (uploads to the server, stores returned URL) ── */
function ImageUpload({ value, onChange, round }) {
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef();

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = window.api ? await window.api.uploadImage(file) : await window.resizeImageFile(file);
      onChange(url);
    } catch (err) {
      alert("Image upload failed: " + err.message);
    }
    setBusy(false);
    e.target.value = "";
  };

  return (
    <div className={"img-upload" + (round ? " round" : "")}>
      {value ? (
        <div className="img-upload-preview">
          <img src={value} alt="preview" />
          <div className="img-upload-actions">
            <button type="button" onClick={()=>inputRef.current.click()}>Replace</button>
            <button type="button" className="danger" onClick={()=>onChange(null)}>Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" className="img-upload-drop" onClick={()=>inputRef.current.click()} disabled={busy}>
          {busy ? <span>Uploading…</span> : <><Icon name="package" size={22}/><span>Click to upload</span></>}
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={pick} hidden/>
    </div>
  );
}

/* ── Add / Edit product ── */
function ProductFormModal({ product, brands, onAddBrand, onSave, onClose }) {
  const isNew = !product;
  const [form, setForm] = React.useState(() => isNew ? {
    id: "", vendor: "", names: { am: "", ru: "", en: "" }, cat: window.CATEGORIES[0].id,
    price: "", was: "", stock: "in", tag: null, featured: false, new: false, image: null,
  } : { ...product, price: product.price || "", was: product.was || "" });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setName = (l, v) => setForm(p => ({ ...p, names: { ...p.names, [l]: v } }));

  // Vendor comes from the brands database; allow creating a new brand inline.
  const brandNames = (brands || []).map(b => b.name);
  const [addingBrand, setAddingBrand] = React.useState(false);
  const [newBrand, setNewBrand] = React.useState("");
  const confirmAddBrand = () => {
    const name = newBrand.trim();
    if (!name) return;
    if (!brandNames.includes(name) && onAddBrand) onAddBrand({ name, country: "", logo: null });
    set("vendor", name);
    setNewBrand("");
    setAddingBrand(false);
  };

  const genId = () => {
    const base = (form.names.en || form.names.am || "prod").toLowerCase()
      .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 22);
    return (base || "prod") + "-" + Math.floor(Math.random() * 900 + 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.names.en && !form.names.am) { alert("Enter a product name"); return; }
    if (!form.price) { alert("Enter a price"); return; }
    const price = parseFloat(form.price);
    const was = form.was ? parseFloat(form.was) : null;
    onSave({ ...form, id: (form.id||"").trim() || genId(), price, was: was || null, tag: was && was > price ? "sale" : form.tag });
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-box modal-box--lg" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isNew ? "Add new product" : "Edit product"}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-section-title">Product image</div>
          <ImageUpload value={form.image} onChange={v=>set("image", v)} />

          <div className="modal-section-title">Product names</div>
          <div className="field-row-3">
            <div className="field"><label>Armenian</label><input value={form.names.am} onChange={e=>setName("am",e.target.value)} placeholder="Հայերեն"/></div>
            <div className="field"><label>Russian</label><input value={form.names.ru} onChange={e=>setName("ru",e.target.value)} placeholder="Русский"/></div>
            <div className="field"><label>English *</label><input value={form.names.en} onChange={e=>setName("en",e.target.value)} placeholder="English name"/></div>
          </div>

          <div className="modal-section-title">Details</div>
          <div className="field-row">
            <div className="field">
              <label>Brand / Vendor</label>
              {addingBrand ? (
                <div className="inline-add">
                  <input autoFocus value={newBrand} onChange={e=>setNewBrand(e.target.value)}
                    placeholder="New brand name"
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); confirmAddBrand(); } }}/>
                  <button type="button" className="btn btn-primary btn-sm" onClick={confirmAddBrand}>Add</button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={()=>{ setAddingBrand(false); setNewBrand(""); }}>Cancel</button>
                </div>
              ) : (
                <select value={brandNames.includes(form.vendor) ? form.vendor : (form.vendor ? form.vendor : "")}
                  onChange={e => { if (e.target.value === "__new__") setAddingBrand(true); else set("vendor", e.target.value); }}>
                  <option value="">Select a brand…</option>
                  {/* keep an unknown legacy vendor selectable */}
                  {form.vendor && !brandNames.includes(form.vendor) && <option value={form.vendor}>{form.vendor}</option>}
                  {brandNames.map(n => <option key={n} value={n}>{n}</option>)}
                  <option value="__new__">＋ Add new brand…</option>
                </select>
              )}
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.cat} onChange={e=>set("cat",e.target.value)}>
                {window.CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.names.en}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-section-title">Pricing &amp; stock</div>
          <div className="field-row-3">
            <div className="field"><label>Price (֏) *</label><input type="number" min="0" value={form.price} onChange={e=>set("price",e.target.value)} placeholder="0" required/></div>
            <div className="field"><label>Original price (֏)</label><input type="number" min="0" value={form.was} onChange={e=>set("was",e.target.value)} placeholder="Leave blank if not on sale"/></div>
            <div className="field">
              <label>Stock status</label>
              <select value={form.stock} onChange={e=>set("stock",e.target.value)}>
                <option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option>
              </select>
            </div>
          </div>

          <div className="modal-section-title">SKU</div>
          <div className="field" style={{maxWidth:300}}>
            <label>Product ID / SKU</label>
            <input value={form.id} onChange={e=>set("id",e.target.value)} placeholder={isNew ? "Auto-generated if left blank" : ""} readOnly={!isNew} style={!isNew ? {background:"var(--surface)",color:"var(--text-muted)"} : {}}/>
          </div>

          <div className="modal-section-title">Labels</div>
          <div className="admin-flags">
            <label className="admin-flag-label"><input type="checkbox" checked={!!form.featured} onChange={e=>set("featured",e.target.checked)}/> Featured</label>
            <label className="admin-flag-label"><input type="checkbox" checked={!!form.new} onChange={e=>set("new",e.target.checked)}/> New arrival</label>
            <label className="admin-flag-label"><input type="checkbox" checked={form.tag==="sale"} onChange={e=>set("tag",e.target.checked?"sale":null)}/> On sale</label>
          </div>

          <div className="modal-foot" style={{marginTop:28}}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">{isNew ? "Add product" : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Add / Edit brand ── */
function BrandFormModal({ brand, onSave, onClose }) {
  const isNew = !brand;
  const [form, setForm] = React.useState(() => isNew
    ? { name: "", country: "", logo: null }
    : { ...brand });
  const prevName = isNew ? null : brand.name;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { alert("Enter a brand name"); return; }
    onSave({ ...form, name: form.name.trim() }, prevName);
  };

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-box" style={{maxWidth:460}} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isNew ? "Add brand" : "Edit brand"}</h3>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-section-title">Logo</div>
          <ImageUpload value={form.logo} onChange={v=>set("logo", v)} round />

          <div className="modal-section-title">Details</div>
          <div className="field"><label>Brand name *</label><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Apexion" required/></div>
          <div className="field" style={{marginTop:14}}><label>Country (optional)</label><input value={form.country} onChange={e=>set("country",e.target.value)} placeholder="e.g. Germany"/></div>

          <div className="modal-foot" style={{marginTop:24}}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">{isNew ? "Add brand" : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
