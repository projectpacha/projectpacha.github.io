function searchWord() {
    var searchTerm = document.getElementById("search-bar").value.trim().toLowerCase();
    var resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = '';

    var exactMatchFound = false;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(this.responseText, "text/xml");
            var entries = xmlDoc.getElementsByTagName("entry");

            var otherMatchesDiv = document.createElement("div");
            otherMatchesDiv.classList.add("other-matches");

            for (var i = 0; i < entries.length; i++) {
                var headwordElement = entries[i].getElementsByTagName("headword")[0];
                var variationElement = entries[i].getElementsByTagName("variation")[0];
                var posElement = entries[i].getElementsByTagName("pos")[0];
                var senses = entries[i].getElementsByTagName("sense");

                var headword = headwordElement.textContent.toLowerCase();
                var variation = variationElement ? variationElement.textContent.toLowerCase() : null;

                // Check if any sense contains the search term
                var senseMatchFound = false;
                for (var j = 0; j < senses.length; j++) {
                    if (senses[j].textContent.toLowerCase().includes(searchTerm)) {
                        senseMatchFound = true;
                        break;
                    }
                }

                // Check for exact match in headword, variation, or sense
                if (headword === searchTerm || (variation && variation === searchTerm) || senseMatchFound) {
                    exactMatchFound = true;

                    var partOfSpeech = posElement.textContent;
                    var partOfSpeechText = getPartOfSpeechText(partOfSpeech);

                    var sensesList = "<ul class='sense-list'>";
                    for (var j = 0; j < senses.length; j++) {
                        sensesList += "<li>" + senses[j].textContent + "</li>";
                    }
                    sensesList += "</ul>";

                    var resultDiv = document.createElement("div");
                    resultDiv.classList.add("entry");
                resultDiv.innerHTML = "<h2>" + headwordElement.textContent + (variationElement ? " (" + variationElement.textContent + ")" : "") + "</h2><h4><span class='pos-highlight'>" + partOfSpeechText + "</span></h4>" + sensesList;


                    resultsContainer.appendChild(resultDiv);
                }
                // Check for partial match in headword, variation, or sense
                else {
                    var partialMatchFound = headword.includes(searchTerm) || (variation && variation.includes(searchTerm));
                    
                    if (!partialMatchFound) {
                        for (var j = 0; j < senses.length; j++) {
                            if (senses[j].textContent.toLowerCase().includes(searchTerm)) {
                                partialMatchFound = true;
                                break;
                            }
                        }
                    }

                    if (partialMatchFound) {
                        var partialMatchLink = document.createElement("a");
                        partialMatchLink.href = "#";
                        partialMatchLink.textContent = headwordElement.textContent + (variationElement ? " (" + variationElement.textContent + ")" : "");
                        partialMatchLink.addEventListener("click", function(event) {
                            event.preventDefault();
                            var clickedTerm = this.textContent.split(" (")[0]; // Extract headword from link text
                            document.getElementById("search-bar").value = clickedTerm;
                            searchWord();
                        });
                        otherMatchesDiv.appendChild(partialMatchLink);
                    }
                }
            }

            // Append other matches div if there are any partial matches
            if (otherMatchesDiv.childNodes.length > 0) {
                resultsContainer.appendChild(otherMatchesDiv);
            }

            // If no exact match found, display message
            if (!exactMatchFound) {
                var noMatchDiv = document.createElement("div");
                noMatchDiv.textContent = "No exact match found.";
                resultsContainer.appendChild(noMatchDiv);
            }
        }
    };
    xhttp.open("GET", "trial.xml", true);
    xhttp.send();
}

function getPartOfSpeechText(abbreviation) {
    switch (abbreviation) {
        case 'noun':
            return 'Noun';
        case 'verb':
            return 'Verb';
        default:
            return abbreviation;
    }
}

