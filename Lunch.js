const DEFAULT_STARTING_WEIGHT = 1;
const PICK_WEIGHT = 23;
const FPS = 30;
const MAX_EFFECT_TIME = FPS * 6; // 5 seconds

var allPlaces = [];
var copyOfAllPlaces = [];
var copyOfAllPlaces2 = [];

var hft = new placeClass("HFT");
var sonic = new placeClass("Sonic");
var panera = new placeClass("Panera");
var nardelis = new placeClass("Nardelis");
var jerseymikes = new placeClass("Jersey Mikes");
var panch = new placeClass("Panch");
var chipotle = new placeClass("Chipotle");
var rosas = new placeClass("Rosas");
var bmuse = new placeClass("B Muse");
var smash = new placeClass("Smashburger");
var chickfila = new placeClass("Chick-fil-a");
var chilis = new placeClass("Chilis");
var mainstpizza = new placeClass("Main St. Pizza");
var dibellas = new placeClass("DiBellas");
var popeyes = new placeClass("Popeyes");

var sumOfWeights = 0;
var winner;
var winnerIndex;
var resultDiv;
var effectCounter = 0;
var effectInterval;

function init() {
    resultDiv = document.getElementById('result');

    //make sure the div holding the chosen place is hidden
    resultDiv.classList.remove('visible');
    resultDiv.classList.add('hidden');
    resultDiv.innerHTML = '';

    allPlaces.push(hft);
    allPlaces.push(sonic);
    allPlaces.push(panera);
    allPlaces.push(nardelis);
    allPlaces.push(jerseymikes);
    allPlaces.push(panch);
    allPlaces.push(chipotle);
    allPlaces.push(rosas);
    allPlaces.push(bmuse);
    allPlaces.push(smash);
    allPlaces.push(chickfila);
    allPlaces.push(chilis);
    allPlaces.push(mainstpizza);
    allPlaces.push(dibellas);
    allPlaces.push(popeyes);


    var table = document.getElementById("placeList");
    if (table) {
        for (var i = 0; i < allPlaces.length; i++) {
            var tr = document.createElement('tr');
            tr.id = allPlaces[i].placeName + '_row';
            var td1 = document.createElement('td'); //probability
            td1.id = allPlaces[i].placeName + '_probability';
            var td2 = document.createElement('td'); //weight
            td2.id = allPlaces[i].placeName + '_weight';
            var td3 = document.createElement('td'); //name
            var td4 = document.createElement('BUTTON'); //pick
            td4.onclick = allPlaces[i].pick;
            var td5 = document.createElement('BUTTON'); //ban
            td5.onclick = allPlaces[i].ban;


            td1.innerHTML = parseFloat(allPlaces[i].probability).toFixed(3);
            td2.innerHTML = allPlaces[i].weight;
            td3.innerHTML = allPlaces[i].placeName;
            td4.innerHTML = 'PICK';
            td5.innerHTML = 'BAN';



            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            table.appendChild(tr);

            recalculateProbabilities();
        }
    }
}


function placeClass(placeName) {
    this.placeName = placeName;
    this.weight = DEFAULT_STARTING_WEIGHT;
    this.probability;
    this.isBanned = false;
    this.cannotBeBannedThisRound = false;

    var self = this; // remember who you are
    this.ban = function() {
        if (self.cannotBeBannedThisRound == false) {
            self.weight = 0;
            self.isBanned = true;
            var weightTD = document.getElementById(self.placeName + '_weight');
            if (weightTD) {
                weightTD.innerHTML = self.weight;
            }
            recalculateProbabilities();
        } else {
            console.log("Cannot ban " + self.placeName + "! It was banned last round you cheater...");
        }
    }

    this.pick = function() {
        if (self.isBanned == false) {
            if (self.weight < PICK_WEIGHT) {
                self.weight += PICK_WEIGHT - 1;
            } else if (self.weight < PICK_WEIGHT * 2) {
                self.weight += PICK_WEIGHT;
            }
            var weightTD = document.getElementById(self.placeName + '_weight');
            if (weightTD) {
                weightTD.innerHTML = self.weight;
            }
            recalculateProbabilities();
        } else {
            console.log("Cannot pick " + self.placeName + " as it has already been banned...");
        }
    }

    this.setWeightInTable = function() {
        var weightTD = document.getElementById(self.placeName + '_weight');
        if (weightTD) {
            weightTD.innerHTML = self.weight;
        }
    }

    this.calculateMyProbability = function() {

        self.probability = self.weight / getSumOfAllWeights();
        var probTD = document.getElementById(self.placeName + '_probability');
        if (probTD) {
            probTD.innerHTML = parseFloat(self.probability * 100).toFixed(2);
        }
    }
}

function pickThePlace() {
    copyOfAllPlaces = allPlaces.slice(); // copies allPlaces array into a separate array
    sumOfWeights = getSumOfAllWeights();
    var randomWeight = getRoundedRandomNumberBetweenMinMax(1, sumOfWeights);

    while (randomWeight > 0) {
        // if the array is empty, fill it back up
        if (copyOfAllPlaces.length == 0) {
            copyOfAllPlaces = allPlaces.slice();
        }

        var randomIndex = getRoundedRandomNumberBetweenMinMax(0, copyOfAllPlaces.length - 1);
        randomWeight = randomWeight - allPlaces[randomIndex].weight;
        copyOfAllPlaces.splice(randomIndex, 1); // remove 1 element from randomIndex

        // if we found a winner, store the name in the winner variable
        if (randomWeight <= 0) {
            winner = allPlaces[randomIndex];
            winnerIndex = randomIndex;
            break;
        }
    }
    copyOfAllPlaces2 = allPlaces.slice();
    effectCounter = 0;
    effectInterval = setInterval(pingPongEffect, 1000/FPS);

    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('visible');
    resultDiv.innerHTML = winner.placeName;
}

function resetAllPlaces() {
    for (var i = 0; i < allPlaces.length; i++) {
        if (allPlaces[i].isBanned) {
            allPlaces[i].isBanned = false;
            allPlaces[i].cannotBeBannedThisRound = true;
        } else {
            allPlaces[i].cannotBeBannedThisRound = false;
        }

        allPlaces[i].weight = DEFAULT_STARTING_WEIGHT;
        allPlaces[i].setWeightInTable();
        copyOfAllPlaces = [];
        sumOfWeights = sumOfWeights;
        recalculateProbabilities();
        winner = null;

        resultDiv.classList.remove('visible');
        resultDiv.classList.add('hidden');
        resultDiv.innerHTML = '';
    }
}

function pingPongEffect() {
    if (effectCounter < MAX_EFFECT_TIME && effectCounter % 2 == 0 && copyOfAllPlaces2.length > 0) {
        var randomIndex = getRoundedRandomNumberBetweenMinMax(0, copyOfAllPlaces2.length - 1);

        while (copyOfAllPlaces2[randomIndex] == winner) {
            randomIndex = getRoundedRandomNumberBetweenMinMax(0, copyOfAllPlaces2.length - 1);
        }

        var rowTR = document.getElementById(allPlaces[randomIndex].placeName + '_row');

        if (rowTR) {
            rowTR.style.backgroundColor = 'red';
        }

        copyOfAllPlaces2.slice(randomIndex, 1);

    } else if (effectCounter >= MAX_EFFECT_TIME) {

        for (var i = 0; i < allPlaces.length; i++) {
            var rowTR = document.getElementById(allPlaces[i].placeName + '_row');
            if (rowTR) {
                rowTR.style.backgroundColor = 'white';
            }
        }

        resetAllPlaces();
        clearInterval(effectInterval);
    }

    effectCounter++;
}

function recalculateProbabilities() {
    for (var i = 0; i < allPlaces.length; i++) {
        allPlaces[i].calculateMyProbability();
    }
}

function getSumOfAllWeights() {
    var sum = 0;
    for (var i = 0; i < allPlaces.length; i++) {
        sum += allPlaces[i].weight;
    }
    return sum;
}

function getRoundedRandomNumberBetweenMinMax(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}