document.addEventListener("DOMContentLoaded", function() {
    const alphabetElements = document.querySelectorAll(".alphabet");
    const wordListContainer = document.getElementById("word-list");
    const prevPageButton = document.getElementById("prev-page");
    const nextPageButton = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");
    const WORDS_PER_PAGE = 50;
    let currentPage = 1;
    let currentLetter = "അ";
    let xmlDoc = null;

    async function loadXML() {
        const response = await fetch("data.xml");
        const xml = await response.text();
        const parser = new DOMParser();
        xmlDoc = parser.parseFromString(xml, "application/xml");
        filterWords(currentLetter, currentPage);
    }

let openDetails = null; 

function filterWords(letter, page = 1) {
    const entries = xmlDoc.getElementsByTagName("entry");
    const startIndex = (page - 1) * WORDS_PER_PAGE;
    const endIndex = page * WORDS_PER_PAGE;
    let wordCount = 0;

    wordListContainer.innerHTML = ""; 
    let filteredEntries = Array.from(entries).filter((entry) => {
        const headword = entry.getElementsByTagName("headword")[0]?.textContent.trim();
        return headword && headword.startsWith(letter);
    });

    filteredEntries.slice(startIndex, endIndex).forEach(entry => {
        wordCount++;
        const headword = entry.getElementsByTagName("headword")[0]?.textContent.trim();
        const variation = entry.getElementsByTagName("variation")[0]?.textContent.trim() || "";
        const pos = entry.getElementsByTagName("pos")[0]?.textContent.trim() || "";
        const senses = Array.from(entry.getElementsByTagName("sense")).map(sense => sense?.textContent.trim());

        const listItem = document.createElement("div");
        listItem.className = "word-item";
        listItem.innerHTML = `
    <h3 class="word-header">${headword}${variation ? ' (' + variation + ')' : ''}</h3>
    <div class="word-details hidden">
        <h4> ${pos}</h4>
        <p> ${senses.join(", ")}</p>
    </div>
`;

        listItem.querySelector(".word-header").addEventListener("click", function() {

            if (openDetails && openDetails !== listItem) {
                openDetails.querySelector(".word-details").classList.add("hidden");
            }

            const details = listItem.querySelector(".word-details");
            details.classList.toggle("hidden");

            openDetails = details.classList.contains("hidden") ? null : listItem;
        });

        wordListContainer.appendChild(listItem);
    });

    updatePaginationControls(filteredEntries.length, page);
}

    function updatePaginationControls(totalEntries, page) {
        const totalPages = Math.ceil(totalEntries / WORDS_PER_PAGE);

        pageInfo.textContent = `Page ${page} of ${totalPages}`;
        prevPageButton.disabled = page === 1;
        nextPageButton.disabled = page === totalPages;
    }

    alphabetElements.forEach(element => {
        element.addEventListener("click", function() {
            currentLetter = this.getAttribute("data-letter");
            currentPage = 1;  
            alphabetElements.forEach(el => el.classList.remove("active"));
            this.classList.add("active");
            filterWords(currentLetter, currentPage);
        });
    });

    prevPageButton.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            filterWords(currentLetter, currentPage);
        }
    });

    nextPageButton.addEventListener("click", function() {
        currentPage++;
        filterWords(currentLetter, currentPage);
    });

    loadXML();
});
