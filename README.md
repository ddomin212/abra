1. vygenerujte XML pro všechny produkty ze skladu SKLAD

2. vygenerujte XML pro všechny produkty, ale umožněte zpracovat i milion záznamů a to tak, že budete data načítat po stránkách a XML generovat průběžně. Načtení všeho je problematické z pohledu paměti. Zefektivněte načítání dat tak, že načtete jen potřebná data.

3. přidejte podporu pro inkrementální generování stavu skladu. Načtěte pouze změněné skladové karty (sloupec lastUpdate). Tím, že vygenerujte inkrementální XML, bude vše výrazně rychlejší a efektivnější. Lze tak synchronizovat stav skladu každých 5 minut i když bude skladových karet několik milionů.

4. upravte inkrementální generování stavu skladu tak, aby podporoval sady a komplety (https://demo.flexibee.eu/c/demo/sady-a-komplety.json). Sada znamená, že se produkt “SADA” skládá z 2 ks produktů “A” a 1 ks produktu “B”. Pokud je tedy dostupných 20 ks produktů “A” a 8 produktů “B”, “SADA” lze prodat 8 ks.

---

1. `basic.js`
2. `pagination.js`
3. a 4.  `incremente_pagiante.js`

PS: je potreba vytvorit `.env` soubor s nasledujicimi promennymi:
- AUSERNAME=uzivatelske_jmeno
- APASSWORD=heslo
- AFIRMA=firma
- APORT=port
