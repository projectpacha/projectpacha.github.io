let typingTimer;
const debounceDelay = 300;

function debouncedTransliterate() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        if (manglishToggle.checked) { 
            transliterate();
        }
    }, debounceDelay);
}

function transliterate() {
    const input = searchInput.value;
    const output = manglishToMalayalam(input);
    searchInput.value = output;
}

function normalizeMalayalam(text) {
    return text.replace(/\u200D/g, ''); 
}

document.getElementById('searchIcon').addEventListener('click', searchDictionary);

async function searchDictionary() {
    let query = document.getElementById('searchInput').value.trim();
    if (!query) return;

   query = normalizeMalayalam(query);

    const searchType = determineSearchType(query);  

    if (searchType === 'headword') {
        await searchHeadword(query);
    } else if (searchType === 'sense') {
        await searchSense(query);
    }
}

async function searchHeadword(query) {
    try {
        const response = await fetch('data.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const entries = xmlDoc.getElementsByTagName('entry');

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        let foundExact = false;
        let otherMatches = [];
        let relatedWords = new Set();

        const normalizedQuery = normalizeMalayalam(query);

        Array.from(entries).forEach(entry => {

            const originalHeadword = entry.getElementsByTagName('headword')[0].textContent;
            const originalVariation = entry.getElementsByTagName('variation')[0]?.textContent || '';
            const pos = entry.getElementsByTagName('pos')[0].textContent;
            const senses = Array.from(entry.getElementsByTagName('sense')).map(sense => sense.textContent);

            const normalizedHeadword = normalizeMalayalam(originalHeadword);
            const normalizedVariation = normalizeMalayalam(originalVariation);

            if (normalizedHeadword === normalizedQuery || normalizedVariation === normalizedQuery) {
                foundExact = true;
                displayEntry(originalHeadword, originalVariation, pos, senses, resultsContainer); 
                findRelatedWords(entries, originalHeadword, senses, relatedWords);
            } else if (normalizedHeadword.includes(normalizedQuery) || normalizedVariation.includes(normalizedQuery)) {
                otherMatches.push(originalHeadword); 
            }
        });

        if (!foundExact) {
            resultsContainer.innerHTML = '<p>No exact match found.</p>';
        }

        displayOtherMatches(otherMatches, resultsContainer);
        displayRelatedWords(relatedWords, resultsContainer);

    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
        document.getElementById('results-container').innerHTML = '<p>Could not load data.</p>';
    }
}

async function searchSense(query) {
    try {
        const response = await fetch('data.xml');
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
        const entries = xmlDoc.getElementsByTagName('entry');

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        let matches = [];

        Array.from(entries).forEach(entry => {
            const headword = entry.getElementsByTagName('headword')[0].textContent;
            const pos = entry.getElementsByTagName('pos')[0].textContent;
            const senses = Array.from(entry.getElementsByTagName('sense')).map(sense => sense.textContent);

            const matchingSenses = senses.filter(sense => sense.includes(query));
            if (matchingSenses.length > 0) {
                matches.push({ headword, pos, senses });
            }
        });

        if (matches.length === 0) {
            resultsContainer.innerHTML = '<p>No matches found.</p>';
        } else {
             matches.forEach(match => displayEntry(match.headword, '', match.pos, match.senses, resultsContainer));
        }

    } catch (error) {
        console.error('Error fetching or parsing XML:', error);
        document.getElementById('results-container').innerHTML = '<p>Could not load data.</p>';
    }
}

function determineSearchType(query) {

    return query.match(/^[a-zA-Z]+$/) ? 'sense' : 'headword';
}

function displayEntry(headword, variation, pos, senses, container) {
    const entryDiv = document.createElement('div');
    entryDiv.classList.add('result');

    const isoTransliteration = transliterateToISO(headword);
    const isoTransliterationVariation = transliterateToISO(variation);

    entryDiv.innerHTML = `
       <h3>${headword}${variation ? ` (${variation})` : ''}</h3>
       <p class="iso-transliteration">${isoTransliteration}${variation ? ` | ${isoTransliterationVariation}` : ''}</p>
       <h4><strong></strong> ${pos}</h4>
       <p><strong></strong> ${senses.join(', ')}</p>
    `;
    container.appendChild(entryDiv);
}

function displayOtherMatches(matches, container) {
    if (matches.length > 0) {
        const otherMatchesDiv = document.createElement('div');
        otherMatchesDiv.classList.add('other-matches');
        otherMatchesDiv.innerHTML = `<h4>other matches</h4>`;
        matches.forEach(match => {
            const matchLink = document.createElement('a');
            matchLink.href = '#';
            matchLink.textContent = match;
            matchLink.classList.add('match-link');
            matchLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('searchInput').value = match;
                searchDictionary();
            });
            otherMatchesDiv.appendChild(matchLink);
            otherMatchesDiv.appendChild(document.createElement('br'));
        });
        container.appendChild(otherMatchesDiv);
    }
}

function displayRelatedWords(relatedWords, container) {
    if (relatedWords.size > 0) {
        const relatedWordsDiv = document.createElement('div');
        relatedWordsDiv.classList.add('related-words');
        relatedWordsDiv.innerHTML = `<h4>Related Words:</h4>`;
        relatedWords.forEach(word => {
            const wordLink = document.createElement('a');
            wordLink.href = '#';
            wordLink.textContent = word;
            wordLink.classList.add('related-link');
            wordLink.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('searchInput').value = word;
                searchDictionary();
            });
            relatedWordsDiv.appendChild(wordLink);
            relatedWordsDiv.appendChild(document.createElement('br'));
        });
        container.appendChild(relatedWordsDiv);
    }
}

function findRelatedWords(entries, headword, senses, relatedWords) {
    Array.from(entries).forEach(otherEntry => {
        const otherHeadword = otherEntry.getElementsByTagName('headword')[0].textContent;
        if (otherHeadword !== headword) {
            Array.from(otherEntry.getElementsByTagName('sense')).forEach(otherSense => {
                if (senses.includes(otherSense.textContent) && !relatedWords.has(otherHeadword)) {
                    relatedWords.add(otherHeadword);
                }
            });
        }
    });
}

document.getElementById('searchIcon').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        addSearchHistory(query);
        searchDictionary();
    }
});

document.getElementById('history-icon').addEventListener('click', toggleHistory);

function toggleHistory() {
    const historyContainer = document.getElementById('search-history');
    if (historyContainer.classList.contains('hidden')) {
        showSearchHistory();
    } else {
        historyContainer.classList.add('hidden');
    }
}

function addSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    if (!history.includes(query)) {
        history.unshift(query);
        if (history.length > 10) history.pop(); 
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }
}

function showSearchHistory() {
    const historyContainer = document.getElementById('search-history');
    historyContainer.innerHTML = '';
    const history = JSON.parse(localStorage.getItem('searchHistory')) || [];

    if (history.length === 0) {
        historyContainer.innerHTML = '<p class="search-history-item">No search history</p>';
    } else {
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('search-history-item');
            historyItem.textContent = item;
            historyItem.addEventListener('click', () => {
                document.getElementById('searchInput').value = item;
                historyContainer.classList.add('hidden');
                searchDictionary();
            });
            historyContainer.appendChild(historyItem);
        });
    }
    historyContainer.classList.remove('hidden');
}

document.getElementById('searchInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        addSearchHistory(document.getElementById('searchInput').value.trim());
        searchDictionary();
    }
});

document.addEventListener('click', (event) => {
    const historyContainer = document.getElementById('search-history');
    if (!historyContainer.contains(event.target) && !document.getElementById('history-icon').contains(event.target)) {
        historyContainer.classList.add('hidden');
    }
});

