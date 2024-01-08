
document.addEventListener('DOMContentLoaded', function() { //Functie care se foloseste de evenimentul 'DOMContentLoaded' atasat documentului HTML. La declansarea evenimentului, se executa functia atasata drept al doilea parametru
    baseFunction(); //in functia atasata drept parametru se apeleaza functia ce sta la baza aplicatiei
});
//Evenimentul 'DOMContentLoaded' se executa doar cand intregul document HTML a fost incarcat in memoria browserului

async function baseFunction() { //functia de baza ce se apeleaza cand se incarca pagina
    try {

        //la incarcarea paginii imi preiau din baza de date Eurostat date referitoare la Speranta de Viata, Populatia si PIB-ul a 27 de tari din UE, din 2007 in 2021
        dateSperantaViata = await fetchDataEurostat('demo_mlexpec?sex=T&age=Y1'); //declar o variabila in care voi memora datele despre Speranta de Viata, in urma unui Fetch prin care primim date raspuns de la Eurostat
        datePopulatie = await fetchDataEurostat('demo_pjan?sex=T&age=TOTAL'); ////declar o variabila in care voi memora datele despre Populatie, in urma unui Fetch prin care primim date raspuns de la Eurostat
        datePIB = await fetchDataEurostat('sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB');//declar o variabila in care voi memora datele despre PIB, in urma unui Fetch prin care primim date raspuns de la Eurostat
    
        //In urmatoarele linii de cod populez un selector dropdown cu tarile disponibile pentru afisarea datelor despre populatie
        const tari = ['Selecteaza o tara...','AT', 'BE', 'BG', 'CZ', 'CY', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
        const countrySelector = document.getElementById('country-selector'); //Am selectat elementul corespunzator selectorului de tara, din documentul HTML
        tari.forEach(tara => {
            const option = document.createElement('option');
            option.value = tara;
            option.textContent = tara;
            countrySelector.appendChild(option);
        });// Pentru fiecare tara declarata in array-ul 'tari' creez o optiune ce sa reprezinte tara. Atat valoarea cat si textul reprezentativ va fi egal cu string-ul tarii, declarat in array. Dupa creearea optiunii, atasez optiunea la selectorul HTML
        
        //Similar cu precedentele linii de cod, populez un selector dropdown cu valorile anilor ce pot fi alesi pentru afisarea datelor referitoare la PIB-ul fiecarei tari din setul de date.
        const ani = ['Selecteaza un an...', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        const yearSelector = document.getElementById('year-selector');
        ani.forEach(an => {
            const optiune = document.createElement('option');
            optiune.value = an;
            optiune.textContent = an;
            yearSelector.appendChild(optiune);
        });
    
    } catch (error) {
        console.error('A avut loc o eroare: ', error); //Bloc catch care ne va transmite in consola ca a avut loc o eroare, si mai multe detalii despre aceasta.
    }
}
async function fetchDataEurostat(setDate) { //functia prin care facem Fetch datelor printr-un API al Eurostat
    const urlBaza = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'; //declar ca un String URL-ul de baza al API-ului folosit pentru fetch data
    const tari = ['AT', 'BE', 'BG', 'CZ', 'CY', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK']; //array de string-uri in care am pus in ordine alfabetica tarile pentru care se doresc datele
    
    const urlFinal = `${urlBaza}${setDate}&geo=${tari.join('&geo=')}&sinceTimePeriod=2007&untilTimePeriod=2021`; //Variabila de tip string in care construim URL-ul final ce il folosim pentru a prelua datele din EUROSTAT
    // Pentru construirea URL-ului final concatenam: url-ul de baza 'urlBaza', string-ul 'setDate' care este primit ca parametru cand este apelata functia (acesta spune API-ului ce set de date este dorit).
    // In continuare concatenam filtrele pentru cautarea in baza de date: fiecare tara din array-ul de tari, apoi anul de la care sa se faca cautarea si anul la care sa se opreasca cautarea

    const response = await fetch(urlFinal); //in variabila response astept raspunsul de la apelul lansat prin fetch(urlFinal). UrlFinal este URL-ul catre care se face cererea, iar fetch returneaza promisiunea care se rezolva cu Response la finalizarea cererii, obiect ce este atribuit la variabila 'response'

    if (!response.ok) {
        throw new Error(`Eroare HTTP! Status: ${response.status}`);
    } // se verifica daca statusul raspunsului este ok. Daca este indicata o eroare, se arunca o exceptie cu un mesaj specific erorii

    const text = await response.text(); //Extrag textul din raspunsul HTTP. Folosesc await pentru a astepta completarea actiunii. (Fetch este o operatiune de retea asincrona)
    const dateRaw = JSON.parse(text); //Textul extras il transform intr-un obiect JSON, denumit dateRaw
    return proceseazaDatele(dateRaw, setDate); //Functia returneaza un apel al functiei 'proceseazaDatele' care este lansat cu parametrii: obiectul JSON cu datele primite de la Eurostat si denumirea setului de date, primit ca parametru in antetul functiei curente
}

function proceseazaDatele(dateRaw, setDate) { // functie in care procesez datele primite ca sa fie memorate intr-un anumit format, intr-un JSON Array de obiecte. Functia primeste ca parametrii un obiect JSON cu toate datele primite in urma apelului HTTP, si denumirea setului de date extras
    const result = []; //Initializez o variabila ca un array gol in care voi stoca rezultatul procesarii datelor
    var indicator = "" //Sir string null, in care voi stoca denumirea setului de date
    switch (setDate) { //bloc switch in care verific ce set de date se proceseaza, pentru a putea pune indicatorul potrivit fiecarei inregistrari
        case "demo_mlexpec?sex=T&age=Y1":
            indicator = "SV";
            break;
        case "demo_pjan?sex=T&age=TOTAL":
            indicator = "POP";
            break;
        case "sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB":
            indicator = "PIB";
            break;
    }// pe linia fiecarui 'case' verific daca valoarea din 'setDate' este identica cu cea din dreptul respectivului case. Daca da, valorea variabilei 'indicator' va lua o anumita valoare

    if (dateRaw.dimension && dateRaw.dimension.geo && dateRaw.dimension.time) { //verific daca obiectul 'dateRaw' contine proprietatile dimension, dimension.go si dimention.time
        const countries = Object.keys(dateRaw.dimension.geo.category.index); //extrag din obiectul primit ca raspuns tarile incluse si le memorez in variabila 'countries'
        const years = Object.keys(dateRaw.dimension.time.category.label); //extrag din obiectul primit anii si ii retin in variabila 'years'
        const values = dateRaw.value;//extrag valorile primite ca raspuns la fetch si le memorez in vectorul 'values'

        for (let countryIndex = 0; countryIndex < countries.length; countryIndex++) { //cliclu for in care pentru fiecare tara memorata formatez toate inregistrarile, pentru fiecare an, sa apara intr-un anumit format de obiect JSON
            const country = countries[countryIndex]; //extrag tara curenta la care sunt in ciclu, din array-ul de tari 'countries'
            const startIndex = countryIndex * years.length; //calculez care este primul index pentru valorile respectivei tari in vectorul 'values'
            for (let yearIndex = 0; yearIndex < years.length; yearIndex++) { //initializez un alt ciclu 'for' in care iterez prin anii din variabila 'years'
                const year = years[yearIndex]; //preiau din 'years' anul curent din ciclu
                const value = values[startIndex + yearIndex]; //preiau din vectorul 'values' valoarea corecta pentru anul curent din ciclu, in functie de valoarea indexului la care incep datele pentru tara respectiva, si indexul anului curent din ciclu

                if (value !== undefined) { //verific ca valoarea indicatorului sa nu fie undefined
                    const entry = { //initializez un obiect de tip entry, cu proprietati pentru: tara, an, indicator si valoare. Fiecare proprietate va lua valoarea corespunzatoare
                        tara: country,
                        an: year,
                        indicator: indicator,
                        valoare: value,
                    };
                    result.push(entry); //obiectul entry este adaugat la array-ul 'result'
                }
            }
        }
    }

    console.log(result); //afisez in consola array-ul rezultat
    return result; //returnez array-ul rezultat. 
}

function updateGrafic() { //functie in care incarc graficul SVG. Functia este apelata la fiecare schimbare a valorii curente din elementul 'country-selector'
    const countrySelector = document.getElementById('country-selector'); //retin optiunea curenta selectata in meniul dropdown cu id-ul 'country-selector'
    const selectedCountry = countrySelector.value; //retin valoarea optiunii curente selectate din dropdown

    const populatieTara = datePopulatie.filter(entry => entry.tara === selectedCountry);// filtrez datele despre populatie astfel incat sa le am doar pe cele in care tara este cea selectata in dropdown

    const svg = document.getElementById('chart-svg'); // obtin elementul HTML in care voi desena graficul SVG
    svg.innerHTML = ''; // Sterg continutul graficului, pentru a ma asigura ca nu suprascriu


    const margin = { top: 30, right: 0, bottom: 30, left: 0 }; 
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    //Am setat parametrii pentru dimensiunile graficului

    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chart.setAttribute('width', width + margin.left + margin.right);
    chart.setAttribute('height', height + margin.top + margin.bottom);
    //Am definit atributele graficului SVG si am stocat detaliile in bariabila 'chart'

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); //Am creat un element de grup SVG stocat in variabila g
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`); //adaug un atribut 'transform' grupului 'g' pentru a muta graficul in interiorul SVG-ului, tinand cont de margini, astfel incat sa fie centrat

    svg.appendChild(chart); //elementul 'chart' este adaugat derpt copil la elementul HTML 'svg', pentru a il putea afisa in cadrul aplicatiei
    chart.appendChild(g); //adaug grupul 'g' astfel incat sa fie subelement al svg-ului 'chart', iar orice element deseenat in cadrul grupului va fi afectat de transformarea de translatie definita pentru grup

    const years = populatieTara.map(d => d.an); //obtin un array cu anii din datele filtrate
    const x = document.createElementNS('http://www.w3.org/2000/svg', 'g'); //creez un element SVG de tip grup 'g' in care sa afisez anii
    
    x.setAttribute('class', 'x-axis'); //setez un atribut pentru elemntul x, si ii aplic clasa 'x-axis'
    years.forEach((year, index) => { //parcurg fiecare element din vectorul 'years'
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'g'); //creez un element SVG de grup
        tick.setAttribute('class', 'tick'); //setez atributul class la 'tick'
        tick.setAttribute('transform', `translate(${index * (width / years.length)},0)`); //setez pentru 'tick' atribute de pozitionare (transform-trasnlate). Translatarea o realizez pe axa X, iar valoarea depinde de indexul el in array si latimea toatala a graficului
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text'); //creez un element de tip text SVG
        text.setAttribute('x', (width / years.length) / 2); 
        text.setAttribute('y', height + 50);
        text.setAttribute('text-anchor', 'middle');
        // am setat atributele 'x' si 'y' pentru pozitionarea textului in interiorul elementului text si alinierea lui pe centru
        text.textContent = year; //setez continutul textului sa aiba valoarea anului curent din forEach
        tick.appendChild(text); //adaug elementul 'text' ca subelement al 'tick'. Tick functioneaza ca un placeholder pentru 'text'
        x.appendChild(tick); //adaug elemntul tick pe axa x, reprezentata de varabila x
    });
    

    chart.appendChild(x); //adaug axa x la graficul svg

    const maxValoare = Math.max(...populatieTara.map(entry => +entry.valoare));  //calculez valoarea maxima a indicatorului din toti anii interogati

    populatieTara.forEach((entry, index) => { // functie in care adaug barele graficului in functie de valorile pentru tara selectata, pentru fiecare an. Fiecare bara este scalata in functie de valoarea maxima si valoarea curenta, raportate la inaltimea graficului
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); //initializez o variabila de tip rectangle, care sa reprezinte o bara verticala
        bar.setAttribute('class', 'bar'); //atribui variabilei clasa'bar'
        bar.setAttribute('x', index * (width / years.length)); //setez punctul pe axa x unde sa fie afisat
        bar.setAttribute('y', height - (entry.valoare / maxValoare) * height); //setez punctul pe axa y unde sa fie afisat 
        bar.setAttribute('width', width / years.length-1); //setez latimea
        bar.setAttribute('height', (entry.valoare / maxValoare) * height); //setez inaltimea
        bar.setAttribute('fill', 'green'); //setez culoarea barelor la 'verde'
        g.appendChild(bar); //adaug elementul 'bar' la grupul 'g' din elementul 'chart' din graficul SVG

        bar.addEventListener('mouseover', () => showTooltip(entry, bar)); //adaug un eveniment 'mouseover' care sa arate utilizatorului un tooltip atunci cand plaseaza cursorul pe bara. Afisarea se face conform functiei 'showTooltip()' care primeste parametrii bara pe care se face hover si valoarea acesteia
        bar.addEventListener('mouseout', hideTooltip); //adaug un eveniment 'mouseout' care ascunde tooltip-ul, prin functia 'hideTooltip'
    });

    function showTooltip(data, target) { //functie ce afiseaza tooltip utilizatorului
        let tooltip = document.getElementById('chart-tooltip'); //retin id-ul elementului HTML in baza caruia voi afisa tooltip-ul
        if (!tooltip) { //testez daca exista sau nu elementul
            tooltip = document.createElement('div'); //creez un element de tip div daca nu exista
            tooltip.id = 'chart-tooltip'; //setez id-ul pentru elementul tooltip
            tooltip.style.position = 'absolute'; //setez pozitionarea ca fiind absoluta
            tooltip.style.padding = '10px'; //setez padding (distanta pana la marginea containerului)
            tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; //setez culoarea background-ului din containerul tooltip
            tooltip.style.border = '1px solid #ccc'; //setez marginea tooltip-ului
            tooltip.style.pointerEvents = 'none'; //dezactivez evenimentele cu cursorul ca sa pot da click sub tooltip
            document.body.appendChild(tooltip); //atasez elementul tooltip la corpul documentului HTML
        }
    
        const tooltipContent = `<strong>An:</strong> ${data.an}<br><strong>Populatie:</strong> ${data.valoare}`; //Creez continutul tooltip-ului conform datelor 
        tooltip.innerHTML = tooltipContent;//setez continutul 
    
        const rect = target.getBoundingClientRect(); //obtin dimensiunile si pozitiile elementelor tinta relative la viewport
        const chartRect = chart.getBoundingClientRect(); //obtin dimensiunile si pozitiile elementului chart relativ la viewport
        const tooltipX = rect.left - chartRect.left + rect.width / 2; //pozitia pe axa x a tooltipului, relativ la chart
        const tooltipY = rect.bottom - 200;//pozitia pe axa y a tooltipului, relativ la chart
    
        tooltip.style.left = `${tooltipX}px`; //setez pozitia stanga 
        tooltip.style.top = `${tooltipY}px`; //setez pozitia sus
        tooltip.style.display = 'block'; //afisez tooltip-ul
    }

    function hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip'); //obtin referinta catre elementul HTML in care afisez tooltip-ul
        if (tooltip) { //verifica data elementul tooltip exista
            tooltip.style.display = 'none'; //daca exista elementul, il ascund
        }
    }
}


function afiseazaBubbleChart() { //functie in care construiesc si afisez un bubble-chart care sa reprezinte valorile PIB-ului fiecarei tari din setul de date, in anul selectat de utilizator
    const anSelector = document.getElementById('year-selector'); //preiau referinta catre elementul html in care utilizatorul selecteaza anul pentru care vrea sa vada graficul cu datele PIB
    const an = anSelector.value; //retin valoarea anului din optiuena selectata
    const canvas = document.getElementById('bubble-chart'); //preiau referinta catre elementul HTML in care voi afisa bubble-chart-ul
    const context = canvas.getContext('2d'); //obtin contextul cum ca vreau sa desenez 2d

    context.clearRect(0, 0, canvas.width, canvas.height); //curat graficul pentru a sterge bulele din afisarile anterioare, pentru alti ani

    const dateAn = datePIB.filter(entry => parseInt(entry.an) === parseInt(an)); //filtrez datele pib pentru a obtine doar datele corespunzatoare anului dorit

    //Calculez valoarea maxima a pib-ului pentru a scala bulele in functie de aceasta
    const maxPIB = Math.max(...dateAn.map(entry => entry.valoare));
    const scala = canvas.width / maxPIB / 10;

    //Numarul de bule afisate per secunda
    const bulePerSecunda = 1;

    // Numarul total de bule afiaate pana la momentul actual
    let buleAfisate = 0;

    // Functie pentru animatia bulelor
    function animateBule() {
        // Verific daca am ajuns la numarul maxim de bule
        if (buleAfisate < dateAn.length) {
            // Desenez bulele în functie de numarul curent de bule afisate
            for (let i = 0; i < bulePerSecunda && buleAfisate < dateAn.length; i++) {
                //obtin datele pentru bucla curenta
                const entry = dateAn[buleAfisate];

                //generez niste coordonate aleatorii pentru pozitia bulei in canvas
                const x = Math.random() * (canvas.width - entry.valoare / 10 * scala);
                const y = Math.random() * (canvas.height - entry.valoare / 10 * scala);
                const r = entry.valoare * scala; // Raza bublei in functie de val PIB-ului

                // Desenez bula
                context.beginPath();
                context.arc(x + r, y + r, r, 0, 2 * Math.PI); //desenez cercul cu functia ARC
                context.fillStyle = 'rgba(200, 0, 0, 0.5)'; // setez culoarea bulelor sa fie un albastru-deschis semitransparent
                context.fill(); //umplu bula cu culoare
                context.stroke();  //adaug marigine

                // adaug eticheta cu valoarea in centru
                context.fillStyle = 'black'; 
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.font = '12px Arial';
                context.fillText(`${entry.tara}, PIB: ${entry.valoare}`, x + r, y + r);

                // Incrementez numarul total de bule afisate
                buleAfisate++;
            }

            // Solicit animatia pentru urmatoarea bucla
            requestAnimationFrame(animateBule);
        }
    }

    // Pornesc animatia
    animateBule();
}