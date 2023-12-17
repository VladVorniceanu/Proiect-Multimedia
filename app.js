
document.addEventListener('DOMContentLoaded', function() {
    fetchAndFormatData();
});

async function fetchAndFormatData() {
    try {

        const dateSperantaViata = await fetchDataEurostat('demo_mlexpec?sex=T&age=Y1');

        const datePopulatie = await fetchDataEurostat('demo_pjan?sex=T&age=TOTAL');

        const datePIB = await fetchDataEurostat('sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB');

        // const toateDatele = [...dateSperantaViata, ...datePopulatie, ...datePIB];

        // toateDatele.sort((a,b) => {
        //     if(a.indicator > b.indicator) return -1;
        //     if(a.indicator < b.indicator) return 1;

        //     if(a.tara>b.tara)return 1;
        //     if(a.tara<b.tara)return -1;
        //     return 0;
        // })

        // // salvez datele intr-un fisier JSON
        // const jsonData = JSON.stringify(toateDatele,null,2);
        // const blob = new Blob ([jsonData], {type: 'application/json' });

        // const a = document.createElement('a');
        // a.href = URL.createObjectURL(blob);
        // a.download = 'dateEuroStat.json';

        // // Creăm un eveniment de click pentru elementul a
        // const clickEvent = new MouseEvent('click', {
        //     bubbles: true,
        //     cancelable: true,
        //     view: window
        // });

        // // Simulăm un click pe elementul a pentru a declanșa descărcarea
        // a.dispatchEvent(clickEvent);

        console.log('Datele au fost formatate și salvate cu succes în media/dateEuroStat.json');
    } catch (error) {
        console.error('Eroare la preluarea sau formatarea datelor:', error);
    }
}

async function fetchDataEurostat(setDate) { // functie in care imi construiesc apelul API si lansez cererea, apoi returnez datele
    const urlBaza = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
    const tari = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE'];

    const urlFinal = `${urlBaza}${setDate}&geo=${tari.join('&geo=')}`; //construiesc URL-ul concatenand datele memorate in variabilele scrise intre {}. La countries, clauza join imi separa valoarile din vector cu string-ul dintre paranteze

    const raspuns = await fetch(urlFinal);
    const dateRaw = await raspuns;

    console.log(dateRaw);

    return proceseazaDatele(dateRaw, setDate);
}

function proceseazaDatele(dateRaw, dataSet) {
    const processedData = [];

    
    
    return processedData;
}
