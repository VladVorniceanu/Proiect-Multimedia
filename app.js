
document.addEventListener('DOMContentLoaded', function() {
    baseFunction();
});

async function baseFunction() {
    try {
        dateSperantaViata = await fetchDataEurostat('demo_mlexpec?sex=T&age=Y1');
        datePopulatie = await fetchDataEurostat('demo_pjan?sex=T&age=TOTAL');
        datePIB = await fetchDataEurostat('sdg_08_10?na_item=B1GQ&unit=CLV10_EUR_HAB');
    
        const tari = ['Selecteaza o tara...','AT', 'BE', 'BG', 'CZ', 'CY', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
        const countrySelector = document.getElementById('country-selector');
        tari.forEach(tara => {
            const option = document.createElement('option');
            option.value = tara;
            option.textContent = tara;
            countrySelector.appendChild(option);
        });

        const ani = ['Selecteaza un an...', '2007', '2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021'];
        const yearSelector = document.getElementById('year-selector');
        ani.forEach(an => {
            const optiune = document.createElement('option');
            optiune.value = an;
            optiune.textContent = an;
            yearSelector.appendChild(optiune);
        });
    
    } catch (error) {
        console.error('Eroare la preluarea sau formatarea datelor:', error);
    }
}
async function fetchDataEurostat(setDate) { 
    const urlBaza = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';
    const tari = ['AT', 'BE', 'BG', 'CZ', 'CY', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
    
    const urlFinal = `${urlBaza}${setDate}&geo=${tari.join('&geo=')}&sinceTimePeriod=2007&untilTimePeriod=2021`;

    const response = await fetch(urlFinal);

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    const dateRaw = JSON.parse(text); 
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
            const startIndex = countryIndex * years.length; 
            for (let yearIndex = 0; yearIndex < years.length; yearIndex++) {
                const year = years[yearIndex];
                const value = values[startIndex + yearIndex];

                if (value !== undefined) {
                    const entry = {
                        tara: country,
                        an: year,
                        indicator: indicator,
                        valoare: value,
                    };
                    result.push(entry);
                }
            }
        }
    }

    console.log(result);
    return result;
}

function updateGrafic() {
    const countrySelector = document.getElementById('country-selector');
    const selectedCountry = countrySelector.value;

    const populatieTara = datePopulatie.filter(entry => entry.tara === selectedCountry);

    const svg = document.getElementById('chart-svg');
    svg.innerHTML = ''; 

    const margin = { top: 30, right: 0, bottom: 30, left: 0 };
    const width = 900 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    chart.setAttribute('width', width + margin.left + margin.right);
    chart.setAttribute('height', height + margin.top + margin.bottom);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    svg.appendChild(chart);
    chart.appendChild(g);

    const years = populatieTara.map(d => d.an);
    const x = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    x.setAttribute('class', 'x-axis');

    years.forEach((year, index) => {
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        tick.setAttribute('class', 'tick');
        tick.setAttribute('transform', `translate(${index * (width / years.length)},0)`);
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (width / years.length) / 2);
        text.setAttribute('y', height + 50);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = year;
        tick.appendChild(text);
        x.appendChild(tick);
    });

    chart.appendChild(x);

    const maxValoare = Math.max(...populatieTara.map(entry => +entry.valoare));

    populatieTara.forEach((entry, index) => {
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('class', 'bar');
        bar.setAttribute('x', index * (width / years.length));
        bar.setAttribute('y', height - (entry.valoare / maxValoare) * height);
        bar.setAttribute('width', width / years.length-1);
        bar.setAttribute('height', (entry.valoare / maxValoare) * height);
        bar.setAttribute('fill', 'green');
        g.appendChild(bar);

        bar.addEventListener('mouseover', () => showTooltip(entry, bar));
        bar.addEventListener('mouseout', hideTooltip);
    });

    function showTooltip(data, target) {
        let tooltip = document.getElementById('chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.padding = '10px';
            tooltip.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            tooltip.style.border = '1px solid #ccc';
            tooltip.style.pointerEvents = 'none';
            document.body.appendChild(tooltip);
        }
    
        const tooltipContent = `<strong>An:</strong> ${data.an}<br><strong>Populatie:</strong> ${data.valoare}`;
        tooltip.innerHTML = tooltipContent;
    
        const rect = target.getBoundingClientRect();
        const chartRect = chart.getBoundingClientRect();
        const tooltipX = rect.left - chartRect.left + rect.width / 2;
        const tooltipY = rect.bottom - 200;
    
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        const tooltip = document.getElementById('chart-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
}


function afiseazaBubbleChart() {
    const anSelector = document.getElementById('year-selector');
    const an = anSelector.value;
    const canvas = document.getElementById('bubble-chart');
    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);

    const dateAn = datePIB.filter(entry => parseInt(entry.an) === parseInt(an));

    const maxPIB = Math.max(...dateAn.map(entry => entry.valoare));
    const scala = canvas.width / maxPIB / 10;

    const bulePerSecunda = 1;
    // Numărul total de bule afișate până acum
    let buleAfișate = 0;

    // Funcție pentru animația bulelor
    function animateBule() {
        // Verificăm dacă am ajuns la numărul maxim de bule
        if (buleAfișate < dateAn.length) {
            // Desenăm bulele în funcție de numărul curent de bule afișate
            for (let i = 0; i < bulePerSecunda && buleAfișate < dateAn.length; i++) {
                const entry = dateAn[buleAfișate];
                const x = Math.random() * (canvas.width - entry.valoare / 10 * scala);
                const y = Math.random() * (canvas.height - entry.valoare / 10 * scala);
                const r = entry.valoare * scala; // Raza bublei în funcție de valoarea PIB-ului

                // Desenăm bulă
                context.beginPath();
                context.arc(x + r, y + r, r, 0, 2 * Math.PI);
                context.fillStyle = 'rgba(200, 0, 0, 0.5)'; // Culoare albastră semi-transparentă
                context.fill();
                context.stroke();

                // Adăugăm eticheta cu valoarea în centru
                context.fillStyle = 'black';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.font = '12px Arial';
                context.fillText(`${entry.tara}, PIB: ${entry.valoare}`, x + r, y + r);

                // Incrementăm numărul total de bule afișate
                buleAfișate++;
            }

            // Solicităm animația pentru următoarea buclă
            requestAnimationFrame(animateBule);
        }
    }

    // Pornim animația
    animateBule();
}