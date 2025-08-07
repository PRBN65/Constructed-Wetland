const Kf = 2e-3;
const slope = 0.01;
const maxWidth = 15;
const depth = 0.4;
const KBOD_HF = 0.15;
const KBOD_VF = 0.2;

function calculateArea(Q, Ci, Ce, KBOD) {
    return Q * (Math.log(Ci) - Math.log(Ce)) / KBOD;
}

function calculateCrossSection(Qs, Kf, slope) {
    return Qs / (Kf * slope);
}

function adjustParallelSections(area, maxWidth, depth, sections=3) {
    const sectionArea = area / sections;
    const width = maxWidth;
    const length = sectionArea / width;
    return [sectionArea, width, length];
}

document.getElementById('calculateBtn').addEventListener('click', function() {
    const population = parseInt(document.getElementById('population').value);
    const wastewater = parseFloat(document.getElementById('wastewater').value);
    const Ci = parseFloat(document.getElementById('Ci').value);
    const Ce = parseFloat(document.getElementById('Ce').value);
    const wetlandType = document.getElementById('wetlandType').value;

    if (isNaN(population) || isNaN(wastewater) || isNaN(Ci) || isNaN(Ce) ||
        population <= 0 || wastewater <= 0 || Ci <= 0 || Ce <= 0) {
        alert('Please enter valid positive numbers for all fields.');
        return;
    }

    const Q = (population * wastewater) / 1000;
    const Qs = Q / 86400;
    const KBOD = wetlandType === 'HF' ? KBOD_HF : KBOD_VF;
    const area = calculateArea(Q, Ci, Ce, KBOD);
    const Ac = calculateCrossSection(Qs, Kf, slope);
    const width = Ac / depth;
    const length = area / width;

    let sections = 1;
    let adjWidth = width;
    let adjLength = length;
    let sectionArea = area;

    if (width > maxWidth) {
        sections = 3;
        [sectionArea, adjWidth, adjLength] = adjustParallelSections(area, maxWidth, depth, sections);
    }

    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Constructed Wetland Design Summary</h2>
        <p>Daily wastewater flow: ${Q.toFixed(2)} m^3/day</p>
        <p>Required wetland area: ${area.toFixed(2)} m^2</p>
        <p>Cross-sectional area: ${Ac.toFixed(2)} m^2</p>
        <p>Initial width: ${width.toFixed(2)} m</p>
    `;

    if (sections > 1) {
        resultsDiv.innerHTML += `
            <p>Adjusted for ${sections} parallel sections:</p>
            <p>Each section area: ${sectionArea.toFixed(2)} m^2</p>
            <p>Width per section: ${adjWidth.toFixed(2)} m</p>
            <p>Length per section: ${adjLength.toFixed(2)} m</p>
        `;
    } else {
        resultsDiv.innerHTML += `
            <p>Single section dimensions:</p>
            <p>Width: ${adjWidth.toFixed(2)} m</p>
            <p>Length: ${adjLength.toFixed(2)} m</p>
        `;
    }

    const plotDiv = document.getElementById('plot');
    plotDiv.innerHTML = '';
    const scale = 20;  

    for (let i = 0; i < sections; i++) {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.width = `${adjWidth * scale}px`;
        sectionDiv.style.height = `${adjLength * scale}px`;
        sectionDiv.innerText = `Section ${i+1}`;
        plotDiv.appendChild(sectionDiv);
    }
});