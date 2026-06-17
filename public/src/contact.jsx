/* Contact page */
window.ContactPage = function ContactPage({ t, lang }) {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name:"", phone:"", email:"", msg:"" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const L = {
    am:{title:"Կապ",name:"Անուն",phone:"Հեռախոս",email:"Էլ. փոստ",msg:"Հաղորդագրություն",send:"Ուղարկել",thanks:"Շնորհակալություն! Կպատասխանենք 1 ժամում։"},
    ru:{title:"Контакты",name:"Имя",phone:"Телефон",email:"Email",msg:"Сообщение",send:"Отправить",thanks:"Спасибо! Ответим в течение 1 часа."},
    en:{title:"Contact",name:"Name",phone:"Phone",email:"Email",msg:"Message",send:"Send message",thanks:"Thank you! We'll get back to you within 1 hour."},
  }[lang] || {title:"Contact",name:"Name",phone:"Phone",email:"Email",msg:"Message",send:"Send",thanks:"Thank you!"};

  return (
    <main style={{padding:"48px 0 80px",background:"var(--surface)",minHeight:"60vh"}}>
      <div className="container" style={{maxWidth:960}}>
        <h1 style={{fontSize:36,fontWeight:800,letterSpacing:"-0.02em",marginBottom:36}}>{L.title}</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:36,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {[
              {ico:"pin",  label:lang==="am"?"Հասցե":lang==="ru"?"Адрес":"Address",    val:lang==="am"?"Բաղրամյան 24/3, Երևան":lang==="ru"?"Баграмяна 24/3, Ереван":"Baghramyan 24/3, Yerevan"},
              {ico:"phone",label:lang==="am"?"Հեռախոս":lang==="ru"?"Телефон":"Phone", val:"+374 (10) 50-50-50"},
              {ico:"mail", label:"Email",                                               val:"hello@alendent.am"},
              {ico:"clock",label:lang==="am"?"Ժամեր":lang==="ru"?"Часы":"Hours",      val:lang==="am"?"Երկ–Շբթ, 9:00–19:00":lang==="ru"?"Пн–Сб, 9:00–19:00":"Mon–Sat, 9:00–19:00"},
            ].map(row => (
              <div key={row.ico} style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"var(--r-md)",padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
                <span style={{width:40,height:40,flexShrink:0,background:"var(--primary-softer)",color:"var(--primary)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon name={row.ico} size={18}/>
                </span>
                <div>
                  <div style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--text-muted)",marginBottom:2}}>{row.label}</div>
                  <div style={{fontSize:14,fontWeight:600}}>{row.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"#fff",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:28}}>
            {sent ? (
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{width:64,height:64,background:"var(--success)",color:"#fff",borderRadius:"50%",margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Icon name="check" size={28}/>
                </div>
                <p style={{fontSize:16,fontWeight:600}}>{L.thanks}</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
                <div className="field-row">
                  <div className="field"><label>{L.name}</label><input required value={form.name} onChange={e=>set("name",e.target.value)}/></div>
                  <div className="field"><label>{L.phone}</label><input type="tel" value={form.phone} onChange={e=>set("phone",e.target.value)}/></div>
                </div>
                <div className="field"><label>{L.email}</label><input type="email" value={form.email} onChange={e=>set("email",e.target.value)}/></div>
                <div className="field"><label>{L.msg}</label><textarea rows={4} required value={form.msg} onChange={e=>set("msg",e.target.value)}></textarea></div>
                <button type="submit" className="btn btn-primary btn-block" style={{marginTop:8}}>
                  <Icon name="mail" size={16}/> {L.send}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
