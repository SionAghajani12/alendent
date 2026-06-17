/* About page */
window.AboutPage = function AboutPage({ t, lang }) {
  const content = {
    am: { title:"Մեր մասին", sub:"Alendent-ը հիմնադրվել է 2014 թ.՝ Հայաստանի ստոմատոլոգներին բարձրորակ նյութեր մատակարարելու նպատակով։",
      blocks:[
        {title:"Մեր առաքելությունը",text:"Ապահովել հայ ստոմատոլոգներին՝ ուղղակիորեն արտադրողներից ստացված սերտիֆիկացված, բարձրորակ ապրանքներով՝ մրցունակ գներով։"},
        {title:"Ինչու Alendent",text:"3 200+ ապրանք, 65+ արտադրող, 12 տարվա փորձ, անձնական մոտեցում յուրաքանչյուր կլինիկային։ Բոլոր ապրանքները CE ու ISO 13485 սերտիֆիկատներով։"},
        {title:"Առաքում",text:"Երևանում՝ հաջորդ աշխատանքային օրը։ Մարզերում՝ 2-3 օրում։ 25 000֏-ից բարձր պատվերները Երևանում անվճար։"},
      ]},
    ru: { title:"О нас", sub:"Alendent основан в 2014 году для поставки стоматологических материалов высшего качества по Армении.",
      blocks:[
        {title:"Наша миссия",text:"Обеспечивать армянских стоматологов сертифицированными оригинальными товарами напрямую от производителей по конкурентным ценам."},
        {title:"Почему Alendent",text:"3 200+ товаров, 65+ брендов, 12 лет опыта, индивидуальный подход к каждой клинике. Вся продукция с сертификатами CE и ISO 13485."},
        {title:"Доставка",text:"По Еревану — на следующий день. По регионам — 2–3 дня. Заказы от 25 000 ֏ по Еревану — бесплатно."},
      ]},
    en: { title:"About us", sub:"Alendent was founded in 2014 to supply Armenian dentists with top-quality dental materials.",
      blocks:[
        {title:"Our mission",text:"Provide Armenian dental professionals with certified, authentic products sourced directly from manufacturers at competitive prices."},
        {title:"Why Alendent",text:"3,200+ products, 65+ brands, 12 years of experience, personal approach to every clinic. All products carry CE and ISO 13485 certification."},
        {title:"Delivery",text:"Yerevan: next business day. Regions: 2–3 days. Orders over 25,000 ֏ ship free in Yerevan."},
      ]},
  };
  const c = content[lang] || content.en;
  return (
    <main style={{padding:"48px 0 80px"}}>
      <div className="container" style={{maxWidth:840}}>
        <h1 style={{fontSize:36,fontWeight:800,letterSpacing:"-0.02em",marginBottom:10}}>{c.title}</h1>
        <p style={{fontSize:17,color:"var(--text-2)",lineHeight:1.6,marginBottom:48}}>{c.sub}</p>
        <div style={{display:"grid",gap:24}}>
          {c.blocks.map((b,i) => (
            <div key={i} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r-lg)",padding:"24px 28px",display:"flex",gap:20,alignItems:"flex-start"}}>
              <div style={{width:42,height:42,flexShrink:0,background:"var(--primary-soft)",color:"var(--primary)",borderRadius:"var(--r-md)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:18}}>{i+1}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16,marginBottom:6}}>{b.title}</div>
                <div style={{fontSize:14.5,color:"var(--text-2)",lineHeight:1.6}}>{b.text}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:40,background:"var(--primary)",color:"#fff",borderRadius:"var(--r-lg)",padding:"28px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontWeight:800,fontSize:18,marginBottom:4}}>{lang==="am"?"Կապ հաստատել":lang==="ru"?"Связаться":"Get in touch"}</div>
            <div style={{opacity:0.85,fontSize:14}}>+374 (10) 50-50-50 · hello@alendent.am</div>
          </div>
          <div style={{display:"flex",gap:16,fontSize:14,flexWrap:"wrap"}}>
            <span><Icon name="pin" size={14} style={{marginRight:6,verticalAlign:"middle"}}/>{lang==="am"?"Բաղրամյան 24/3":lang==="ru"?"Баграмяна 24/3":"Baghramyan 24/3"}</span>
            <span><Icon name="clock" size={14} style={{marginRight:6,verticalAlign:"middle"}}/>{lang==="am"?"Երկ–Շբթ 9–19":lang==="ru"?"Пн–Сб 9–19":"Mon–Sat 9–19"}</span>
          </div>
        </div>
      </div>
    </main>
  );
};
