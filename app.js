// app.js — Mobile Unboxer (simple demo)
// Autor: Generované pre teba
(() => {
  // nastavenia
  const PHONES_JSON = 'phones.json';
  const START_COINS = 1000;

  // DOM
  const creditsEl = document.querySelector('#credits strong');
  const storeList = document.getElementById('storeList');
  const inventoryList = document.getElementById('inventoryList');
  const unboxStage = document.getElementById('unboxStage');
  const earnBtn = document.getElementById('earnBtn');

  // stav
  let credits = START_COINS;
  let phones = [];       // načítané z phones.json
  let inventory = [];    // kúpené položky {id, prefix, name, unlockedImages: {...}}
  updateCredits();

  earnBtn.addEventListener('click', () => {
    credits += 500;
    flashCredits();
    updateCredits();
  });

  // load phones.json
  fetch(PHONES_JSON).then(res => res.json()).then(data => {
    phones = data;
    renderStore();
  }).catch(err => {
    console.error('Nepodarilo sa načítať phones.json', err);
    storeList.innerHTML = '<div style="color:var(--muted)">Nepodarilo sa načítať telefóny. Nahraj phones.json.</div>';
  });

  function updateCredits(){
    creditsEl.textContent = credits;
  }
  function flashCredits(){
    creditsEl.parentElement.animate([{transform:'scale(1)'},{transform:'scale(1.06)'}],{duration:220, easing:'ease-out'});
  }

  // helper: check if image exists (tries to load)
  function imgExists(src){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src + '?_=' + Date.now(); // prevent aggressive cache while developing
    });
  }

  async function renderStore(){
    storeList.innerHTML = '';
    for(const p of phones){
      // prefer store thumbnail; if missing, fall back to unboxed or box
      const storeName = `${p.prefix}store.png`;
      const unboxedName = `${p.prefix}unboxed.png`;
      const boxName = `${p.prefix}box.png`;

      const hasStore = await imgExists(storeName);
      const imgToShow = hasStore ? storeName : (await imgExists(unboxedName) ? unboxedName : (await imgExists(boxName) ? boxName : null));

      const card = document.createElement('div');
      card.className = 'card';

      const img = document.createElement('img');
      if(imgToShow) img.src = imgToShow;
      else {
        img.alt = 'no image';
        img.style.opacity = 0.4;
        img.style.filter = 'grayscale(0.6)';
        img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'><rect width='100%' height='100%' fill='#0b1220'/><text x='50%' y='50%' fill='#93a5b8' font-size='20' font-family='Arial' text-anchor='middle'>${p.prefix}* missing</text></svg>`);
      }
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = p.name;

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = `${p.price} Coins • ${p.rarity}`;

      const actions = document.createElement('div');
      actions.className = 'actions';

      const buyBtn = document.createElement('button');
      buyBtn.textContent = 'Kúpiť';
      buyBtn.addEventListener('click', () => buyPhone(p));
      actions.appendChild(buyBtn);

      // quick preview button
      const previewBtn = document.createElement('button');
      previewBtn.textContent = 'Preview';
      previewBtn.className = 'secondary';
      previewBtn.addEventListener('click', () => previewPhone(p));
      actions.appendChild(previewBtn);

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(actions);

      storeList.appendChild(card);
    }
  }

  // buy
  async function buyPhone(phone){
    if(credits < phone.price){
      alert('Nemáš dosť coinov. Klikni Zarobiť alebo predaj niečo z inventára.');
      return;
    }
    credits -= phone.price;
    updateCredits();

    // zisti ktoré obrázky existujú a ulož info do inventára
    const prefix = phone.prefix;
    const filesToCheck = [
      'unbox_step1.png','unbox_step2.png','unbox_step3.png','unbox_step4.png','unbox_step5.png',
      'unboxed.png','box.png','specs.png','store.png'
    ];
    const unlocked = {};
    for(const f of filesToCheck){
      const path = prefix + f;
      if(await imgExists(path)) unlocked[f] = path;
    }

    const item = {
      id: phone.id + '_' + Date.now(),
      phoneId: phone.id,
      prefix: prefix,
      name: phone.name,
      pricePaid: phone.price,
      unlockedImages: unlocked
    };
    inventory.push(item);
    renderInventory();
    playBoughtAnimation(phone);
  }

  function playBoughtAnimation(phone){
    unboxStage.innerHTML = '';
    const info = document.createElement('div');
    info.style.textAlign = 'center';
    info.innerHTML = `<div style="font-weight:800;margin-bottom:8px">Kúpené: ${phone.name}</div><div style="color:var(--muted)">Klikni na položku v inventári a potom Unbox.</div>`;
    unboxStage.appendChild(info);
  }

  function previewPhone(phone){
    unboxStage.innerHTML = '';
    const imgEl = document.createElement('img');
    imgEl.alt = phone.name;
    // try show unboxed -> store -> box
    const tryList = [phone.prefix + 'unboxed.png', phone.prefix + 'store.png', phone.prefix + 'box.png'];
    (async () => {
      for(const s of tryList){
        if(await imgExists(s)){
          imgEl.src = s;
          break;
        }
      }
      if(!imgEl.src){
        unboxStage.innerHTML = '<div style="color:var(--muted)">Preview: žiadny obrázok (nahraj PREFIX_unboxed.png alebo PREFIX_store.png).</div>';
      } else {
        unboxStage.appendChild(imgEl);
      }
    })();
  }

  // inventory
  function renderInventory(){
    inventoryList.innerHTML = '';
    for(const item of inventory){
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');

      // prefer box image then unboxed
      const unlocked = item.unlockedImages;
      img.src = unlocked['box.png'] || unlocked['unboxed.png'] || unlocked['store.png'] || ('data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512'><rect width='100%' height='100%' fill='#0b1220'/><text x='50%' y='50%' fill='#93a5b8' font-size='20' font-family='Arial' text-anchor='middle'>no image</text></svg>`));
      const title = document.createElement('div'); title.className='title'; title.textContent = item.name;
      const price = document.createElement('div'); price.className='price'; price.textContent = `Kúpené za ${item.pricePaid} • item id ${item.id.slice(-5)}`;

      const actions = document.createElement('div'); actions.className='actions';
      const unboxBtn = document.createElement('button'); unboxBtn.textContent = 'Unbox';
      unboxBtn.addEventListener('click', () => unboxItem(item));
      actions.appendChild(unboxBtn);

      const sellBtn = document.createElement('button'); sellBtn.textContent = 'Predaj';
      sellBtn.className = 'secondary';
      sellBtn.addEventListener('click', () => sellItem(item));
      actions.appendChild(sellBtn);

      card.appendChild(img); card.appendChild(title); card.appendChild(price); card.appendChild(actions);
      inventoryList.appendChild(card);
    }
  }

  // Unboxing sequence
  async function unboxItem(item){
    unboxStage.innerHTML = '';
    const prefix = item.prefix;
    // collect step images in order
    const steps = [];
    for(let i=1;i<=10;i++){
      const name = `unbox_step${i}.png`;
      const path = prefix + name;
      // break on first non-existing step once we already have some
      if(await imgExists(path)){
        steps.push(path);
      } else {
        // continue: maybe later steps exist (rare). We'll just stop after we don't find a sequence.
        if(steps.length>0) break;
      }
    }

    // if no animated steps, check unboxed final
    if(steps.length===0 && item.unlockedImages['unboxed.png']){
      // just show final
      const final = document.createElement('img'); final.src = item.unlockedImages['unboxed.png'];
      unboxStage.appendChild(final);
      return;
    }

    // otherwise play animation
    if(steps.length>0){
      const img = document.createElement('img');
      unboxStage.appendChild(img);
      for(const s of steps){
        img.src = s;
        await wait(650);
      }
      // finally try to show unboxed
      if(item.unlockedImages['unboxed.png']){
        img.src = item.unlockedImages['unboxed.png'];
      }
      return;
    }

    unboxStage.innerHTML = '<div style="color:var(--muted)">Unboxing neobsahuje žiadne obrázky.</div>';
  }

  function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

  // sell item (simple resale logic)
  function sellItem(item){
    const phoneDef = phones.find(p => p.id === item.phoneId);
    if(!phoneDef){ alert('Unknown phone'); return; }
    const resaleGain = Math.round((phoneDef.price || item.pricePaid) * (phoneDef.resale || 0.5));
    credits += resaleGain;
    // remove one instance
    const idx = inventory.indexOf(item);
    if(idx>=0) inventory.splice(idx,1);
    updateCredits();
    renderInventory();
    // feedback
    unboxStage.innerHTML = `<div style="text-align:center"><div style="font-weight:800">Predané: ${item.name}</div><div style="color:var(--muted)">Získal si ${resaleGain} coinov.</div></div>`;
  }

})();
