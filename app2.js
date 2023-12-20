
document.addEventListener('DOMContentLoaded', function() {
    fetchAndFormatData();
});


async function fetchAndFormatData() {
    try {
        const dateSperantaViata = await fetchDataEurostat('demo_mlexpec?sex=T&age=Y1');
        // console.log(dateSperantaViata);

        const datePopulatie = await fetchDataEurostat('demo_pjan?sex=T&age=TOTAL');

        const datePIB = await fetchDataEurostat('sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB');


        console.log('Datele au fost formatate și salvate cu succes în media/dateEuroStat.json');
    } catch (error) {
        console.error('Eroare la preluarea sau formatarea datelor:', error);
    }
}

async function fetchDataEurostat(setDate) { // functie in care imi construiesc apelul API si lansez cererea, apoi returnez datele
    const urlBaza = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
    const tari = ['RO'];
    const format = '?format=JSON';
    const urlFinal = `${urlBaza}${setDate}&geo=${tari.join('&geo=')}&sinceTimePeriod=2007&untilTimePeriod=2021`;

    const response = await fetch(urlFinal);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    const dateRaw = JSON.parse(text);   
    console.log(dateRaw); // Adăugați această linie pentru a examina conținutul obiectului dateRaw

    return proceseazaDatele(dateRaw, setDate);
}

function proceseazaDatele(dateRaw, setDate) {
    const result = [];
    var indicator = ""
    switch (setDate) {
        case "demo_mlexpec?sex=T&age=Y1":
            indicator = "SV";
            break;
        case "demo_pjan?sex=T&age=TOTAL":
            indicator = "POP";
            break;
        case "sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB":
            indicator = "PIB";
            break;
    }

    if (dateRaw.dimension && dateRaw.dimension.geo && dateRaw.dimension.time) {
        const countries = Object.keys(dateRaw.dimension.geo.category.index);
        const years = Object.keys(dateRaw.dimension.time.category.label);
        const values = dateRaw.value;

        for (let countryIndex = 0; countryIndex < countries.length; countryIndex++) {
            const country = countries[countryIndex];
            const startIndex = countryIndex * years.length; // Indexul de la care incep valorile pentru tara curenta

            for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
                const year = years[yearIndex];
                const value = values[startIndex + yearIndex];

                // if (value !== undefined) {
                    const entry = {
                        tara: country,
                        an: year,
                        indicator: indicator,
                        valoare: value,
                    };
                    result.push(entry);
                // }
            }
        }
    }

    // if (dateRaw.value && dateRaw.dimension && dateRaw.dimension.geo && dateRaw.dimension.time) {
    //     const countries = Object.keys(dateRaw.dimension.geo.category.index);
    //     const years = Object.keys(dateRaw.dimension.time.category.index);

    //     for (const countryIndex in countries) {
    //         for (const yearIndex in years) {
    //             const country = countries[countryIndex];
    //             const year = years[yearIndex];
    //             const value = dateRaw.value[year];

    //             if (value) {
    //                 const entry = {
    //                     tara: country,
    //                     an: year,
    //                     indicator: indicator,
    //                     valoare: value
    //                 };
    //                 result.push(entry);
    //             }
    //         }
    //     }
    // }
    
    // for(const year of years) {
    //     let nrAni = 0
    //     let indexTara = 0
    //     if(nrAni<=15){
    //         nrAni+=1;
    //     }
    //     else {
    //         nrAni=0;
    //         indexTara+=1;
    //     }
    //     const an = 2007+nrAni;
    //         const value = dateRaw.value[year];
    //         const entry = {
    //             tara: countries[indexTara],
    //             an: an,
    //             indicator: indicator,
    //             value: value
    //         };
    //         result.push(entry);
    // }

    // // Iterați prin țări și ani pentru a extrage valorile dorite
    // for (const country of countries) {
    //     for (const year of years) {
    //         // Obțineți valoarea corespunzătoare din vectorul "values"
    //         const value = dateRaw.value[year];

    //         // Verificați dacă există valoare (poate fi absentă pentru unele combinații țară-an)
    //         if (value && value[country]) {
    //             // Construiți obiectul dorit și adăugați-l la rezultat
    //             const entry = {
    //                 tara: country,
    //                 an: year,
    //                 indicator: indicator,
    //                 valoare: value[country]
    //             };
    //             result.push(entry);
    //         }
    //     }
    // }


    console.log(result);
    return result;
}
