/**
   * vezmi cenik pro polozku a vykradni z nej sady a komplety a jejich skladove karty (spolu s dostupnosti)
   * @param  {String} cenik_ref  adresa pro prislusny cenik kde lze najit sady a komplety
   * @param  {String} auth  autorizacni udaje pro API
   * @return {Object[]}     seznam objektu pro sady a komplety
*/
function fetchKomplety(cenik_ref, auth) {
    const headers = {
      'Authorization': auth
    };

    return fetch(`https://demo.flexibee.eu:5434${cenik_ref}?detail=custom:kod,nazev,sady-a-komplety(cenik(kod,nazev,skladKarty(stavMJ)))&includes=/cenik/sady-a-komplety/sady-a-komplety/cenik/,/cenik/skladKarty/skladova-karta/&relations=sklad-karty`, { headers })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        return response.json();
      })
      .then(data => {
        const sadyAKomplety = data['winstrom']['cenik'][0]['sady-a-komplety'];
        if (!sadyAKomplety || !Array.isArray(sadyAKomplety)) {
          throw new Error('"skladova-karta" field is missing or not an array');
        }
        return sadyAKomplety
      })
      .catch(error => {
        throw new Error('Error:', error.message);
      });
  }

/**
   * projed vsechny sady a komplety do urovne dostupnosti, uloz to do pole a vrat minimalni dostupnost
   * @param  {Object[]} data  seznam objektu pro sady a komplety
   * @return {number}     minimalni dostupnost pro vsechny produkty ve stejne sade nebo kompletu
*/
function dostupnostForKomplety(data) {
    let all_stav_MJ = [];
    for (sada_idx in data) {
      let sada = data[sada_idx];
      for (cenik_idx in sada.cenik) {
        let cenik = sada.cenik[cenik_idx];
        for (skladKarta_idx in cenik.skladKarty) {
          //console.log("SKLAD KARTA: ", cenik.skladKarty[skladKarta_idx]);
          all_stav_MJ.push(Number(cenik.skladKarty[skladKarta_idx].stavMJ));
        }
      }
    }
    //console.log("ALL STAV MJ MIN: ", Math.min(...all_stav_MJ));
    return Math.min(...all_stav_MJ);
}

/**
   * Da ti datetime ve formatu kterej potrebujes.
   * @param  {String} str_date  podporvane datetime ve stringu
   * @return {String}     pretvorene datetime ve stringu
*/
function getDateTime(str_date) {
    const now = new Date(str_date);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

module.exports = {fetchKomplety, getDateTime, dostupnostForKomplety};