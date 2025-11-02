# Mobile Unboxer — simple demo

Jednoduchá webová hra / demo: pridáš obrázky telefónov do rovnakého priečinka a hra ich načíta podľa názvu.

## Ako pridať telefón (bez priečinkov)
1. Do repozitára pridaj obrázky s prefixom, napr. `s25ultra_...png`.
2. Skontroluj `phones.json` — pre každý telefón tam musí byť záznam s `prefix` a `price`.
3. Otvor `index.html` (alebo nasad na GitHub Pages).

## Konvencia pomenovania
- `PREFIX_store.png` — thumbnail do obchodu (recommended 512×512)
- `PREFIX_unboxed.png` — finálny obrázok
- `PREFIX_unbox_step1.png` ... `PREFIX_unbox_step5.png` — kroky unboxingu (animácia)
- `PREFIX_box.png` — obrázok krabice
- `PREFIX_specs.png` — špecifikácie

## Poznámky
- Hra pri načítaní overí, ktoré súbory existujú — môžeš pridať len niektoré obrázky a systém to zvládne.
- Ak pridáš nový telefón, pridaj záznam do `phones.json`.

