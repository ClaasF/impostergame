
// Wortliste wird dynamisch geladen
let wordsByCategory = {};
let words = [];
let playerCount = 4;
let players = [];
const playerColors = [
	'#94a7bc', // Blue Grey
	'#bc94a7', // Rose Grey
	'#a7bc94', // Sage Grey
	'#bcb794', // Warm Grey
	'#9f94bc', // Lavender Grey
	'#bc9f94', // Terra Grey
	'#94bcb7', // Ocean Grey
	'#bc94b7'  // Mauve Grey
];
let imposterIndex = null;
let codeWord = "";
let currentPlayer = 0;
let enteredWords = [];
let votes = [];

// Lade Wortliste aus words.json
fetch('words.json')
	.then(response => response.json())
	.then(data => {
		wordsByCategory = data;
	})
	.catch(() => {
		wordsByCategory = {
			"Obst": ["Apfel", "Banane", "Birne", "Kirsche", "Traube"],
			"Natur": ["Fluss", "Berg", "Wald", "See", "Wiese"],
			"Technik": ["Computer", "Kamera", "Auto", "Handy", "Roboter"],
			"Musik": ["Klavier", "Gitarre", "Trommel", "Violine", "Flöte"],
			"Alltag": ["Buch", "Garten", "Stuhl", "Tisch", "Lampe"]
		};
	});
const categoryPhase = document.getElementById('category-phase');
const categorySelect = document.getElementById('category-select');
const categoryConfirmBtn = document.getElementById('category-confirm-btn');


const setupPhase = document.getElementById('setup-phase');
const startGameBtn = document.getElementById('start-game-btn');
const playerCountInput = document.getElementById('player-count');
const playerNamesContainer = document.getElementById('player-names-container');
const gamePhase = document.getElementById('game-phase');
const passPhase = document.getElementById('pass-phase');
const nextPlayerBtn = document.getElementById('next-player-btn');
const playerInfo = document.getElementById('player-info');
const wordInfo = document.getElementById('word-info');
const inputPhase = document.getElementById('input-phase');
const relatedWordInput = document.getElementById('related-word');
const submitWordBtn = document.getElementById('submit-word-btn');
const wordsList = document.getElementById('words-list');
const votePhase = document.getElementById('vote-phase');
const voteSelect = document.getElementById('vote-select');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const resultPhase = document.getElementById('result-phase');

// Update player name inputs when player count changes
playerCountInput.oninput = () => {
	updatePlayerNameInputs();
};

function updatePlayerNameInputs() {
	const count = parseInt(playerCountInput.value) || 4;
	playerNamesContainer.innerHTML = '';
	for (let i = 0; i < count; i++) {
		const label = document.createElement('label');
		label.textContent = `Name von Spieler ${i+1}:`;
		label.setAttribute('for', `player-name-${i}`);
		const input = document.createElement('input');
		input.type = 'text';
		input.id = `player-name-${i}`;
		input.value = `Player ${i+1}`;
		input.className = 'player-name-input';
		playerNamesContainer.appendChild(label);
		playerNamesContainer.appendChild(input);
		playerNamesContainer.appendChild(document.createElement('br'));
	}
}

// Initialize name inputs on load
updatePlayerNameInputs();


startGameBtn.onclick = () => {
	playerCount = parseInt(playerCountInput.value);
	if (isNaN(playerCount) || playerCount < 3) {
		alert('Mindestens 3 Spieler erforderlich.');
		return;
	}
	// Get player names and assign random colors
	const nameInputs = document.querySelectorAll('.player-name-input');
	players = [];
	// Shuffle colors and assign
	const shuffledColors = playerColors.slice().sort(() => Math.random() - 0.5);
	for (let i = 0; i < playerCount; i++) {
		const name = nameInputs[i] ? nameInputs[i].value.trim() || `Player ${i+1}` : `Player ${i+1}`;
		const color = shuffledColors[i % shuffledColors.length];
		players.push({role: 'teammate', name, color});
	}
	// Show category selection
	categoryPhase.style.display = '';
	startGameBtn.style.display = 'none';
	// Populate categories
	categorySelect.innerHTML = '';
	Object.keys(wordsByCategory).forEach(cat => {
		const opt = document.createElement('option');
		opt.value = cat;
		opt.textContent = cat;
		categorySelect.appendChild(opt);
	});
};

categoryConfirmBtn.onclick = () => {
	setupPhase.style.display = 'none';
	gamePhase.style.display = '';
	startGameBtn.style.display = '';
	categoryPhase.style.display = 'none';
	startGame(categorySelect.value);
};


function startGame(category) {
	// Assign roles
	imposterIndex = Math.floor(Math.random() * playerCount);
	players.forEach((p, i) => p.role = i === imposterIndex ? 'imposter' : 'teammate');
	// Choose word from selected category or randomly from all
	let catWords = [];
	if (category === 'random') {
		Object.values(wordsByCategory).forEach(arr => catWords = catWords.concat(arr));
	} else {
		catWords = wordsByCategory[category] || [];
	}
	codeWord = catWords.length > 0 ? catWords[Math.floor(Math.random() * catWords.length)] : '';
	currentPlayer = 0;
	enteredWords = [];
	votes = [];
	resultPhase.style.display = 'none';
	wordsList.style.display = 'none';
	votePhase.style.display = 'none';
	inputPhase.style.display = '';
	showPlayer();
}



function showPlayer() {
	// Show pass screen first
	passPhase.style.display = '';
	playerInfo.style.display = 'none';
	wordInfo.style.display = 'none';
	inputPhase.style.display = 'none';
	wordsList.style.display = 'none';
	votePhase.style.display = 'none';
	resultPhase.style.display = 'none';
	// Change color scheme for current player
	document.body.style.background = players[currentPlayer].color;
	nextPlayerBtn.onclick = () => {
		passPhase.style.display = 'none';
		playerInfo.style.display = '';
		wordInfo.style.display = '';
		inputPhase.style.display = '';
		wordsList.style.display = 'none';
		votePhase.style.display = 'none';
		resultPhase.style.display = 'none';
		playerInfo.textContent = `${players[currentPlayer].name} (${currentPlayer + 1} of ${playerCount})`;
		if (players[currentPlayer].role === 'teammate') {
			wordInfo.textContent = `Codewort: ${codeWord}`;
		} else {
			wordInfo.textContent = `Du bist der Impostor! Versuche, dich unauffällig zu verhalten.`;
		}
		relatedWordInput.value = '';
		// Update color scheme for current player with solid color
		document.body.style.background = players[currentPlayer].color;
	};
}

submitWordBtn.onclick = () => {
	const word = relatedWordInput.value.trim();
	if (!word) {
		alert('Bitte gib ein Wort ein.');
		return;
	}
	enteredWords.push(word);
	currentPlayer++;
	if (currentPlayer < playerCount) {
		showPlayer();
	} else {
		showWords();
	}
};


function showWords() {
	inputPhase.style.display = 'none';
	wordsList.style.display = '';
	wordsList.innerHTML = `<h3>Words:</h3><ul>${enteredWords.map((w,i)=>`<li>${players[i].name}: ${w}</li>`).join('')}</ul>`;
	setupVoting();
}


function setupVoting() {
	votePhase.style.display = '';
	voteSelect.innerHTML = '';
	const votingPlayerInfo = document.getElementById('voting-player-info');
	let votingIndex = 0;
	function updateVotingPlayer() {
		votingPlayerInfo.textContent = `Jetzt stimmt ab: ${players[votingIndex].name}`;
		voteSelect.selectedIndex = 0;
	// Update color scheme for voting player
	document.body.style.background = players[votingIndex].color;
	}
	for (let i = 0; i < playerCount; i++) {
		const opt = document.createElement('option');
		opt.value = i;
		opt.textContent = `${players[i].name}`;
		voteSelect.appendChild(opt);
	}
	updateVotingPlayer();
	submitVoteBtn.onclick = () => {
		const voted = parseInt(voteSelect.value);
		votes.push(voted);
		votingIndex++;
		if (votes.length < playerCount) {
			updateVotingPlayer();
		} else {
			// Reset color scheme after voting
			document.body.style.background = '#e3f2fd';
			showResult();
		}
	};
}


function showResult() {
	votePhase.style.display = 'none';
	resultPhase.style.display = '';
	// Reset color scheme after voting
	document.body.style.background = '#e3f2fd';
	// Tally votes
	const tally = Array(playerCount).fill(0);
	votes.forEach(v => tally[v]++);
	const maxVotes = Math.max(...tally);
	const suspects = [];
	tally.forEach((v, i) => {
		if (v === maxVotes) suspects.push(i);
	});
	let resultMsg = `<h3>Voting Results</h3>`;
	resultMsg += `<ul>${tally.map((v,i)=>`<li>${players[i].name}: ${v} vote(s)</li>`).join('')}</ul>`;
	if (suspects.includes(imposterIndex)) {
		resultMsg += `<p><strong>Imposter was ${players[imposterIndex].name}. You found the imposter!</strong></p>`;
	} else {
		resultMsg += `<p><strong>Imposter was ${players[imposterIndex].name}. The imposter escaped!</strong></p>`;
	}
	resultMsg += `<button id=\"play-again-btn\">Play Again</button>`;
	resultMsg = `<h3>Abstimmungsergebnisse</h3>`;
	resultMsg += `<ul>${tally.map((v,i)=>`<li>${players[i].name}: ${v} Stimme(n)</li>`).join('')}</ul>`;
	if (suspects.includes(imposterIndex)) {
		resultMsg += `<p><strong>${players[imposterIndex].name} war der Impostor. Ihr habt ihn gefunden!</strong></p>`;
	} else {
		resultMsg += `<p><strong>${players[imposterIndex].name} war der Impostor. Der Impostor ist entkommen!</strong></p>`;
	}
	resultMsg += `<button id=\"play-again-btn\">Nochmal spielen</button>`;
	resultPhase.innerHTML = resultMsg;
	document.getElementById('play-again-btn').onclick = () => {
		setupPhase.style.display = '';
		gamePhase.style.display = 'none';
	};
}
