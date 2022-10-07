(() => {
	'use strict';

	const API_URL = 'https://api.quotable.io/random';

	const timerElement = document.querySelector('#timer'),
		quoteDisplayElement = document.querySelector('#quoteDisplay'),
		inputQuoteElement = document.querySelector('#inputQuote'),
		percentageElement = document.querySelector('#percentage'),
		charactersPerSecondElement = document.querySelector('.characters-per-second'),
		percentageSpacesElement = document.querySelector('#percentageSpaces'),
		charactersPerSecondSpacesElement = document.querySelector('.characters-per-second-spaces'),
		errorElement = document.querySelector('#error'),
		restartBtn = document.querySelector('#restart');

	let arrayRenderedQuote;

	inputQuoteElement.focus();

	const getQuote = () => {
		return fetch(API_URL)
			.then(response => response.json())
			.then(data => data.content);
	};

	const handleInputElement = (inputElement, inputValue, state) => {
		inputElement.value = inputValue;
		inputElement.disabled = state;
	};

	const splitQuote = quote => {
		return quote.split('');
	};

	const renderSplittedQuote = splittedQuote => {
		quoteDisplayElement.innerHTML = '';
		handleInputElement(inputQuoteElement, '', false);

		splittedQuote.forEach(character => {
			const span = document.createElement('span');
			span.innerText = character;
			quoteDisplayElement.appendChild(span);
		});
		return quoteDisplayElement;
	};

	const createRenderedQuoteArray = async () => {
		try {
			const renderedQuote = await renderSplittedQuote(splitQuote(await getQuote()));
			arrayRenderedQuote = renderedQuote.querySelectorAll('span');
			arrayRenderedQuote[0].classList.add('active-character');
		} catch (error) {
			renderError(errorElement, true);
		}
	};

	const renderError = (errorElement, state) => {
		if (state) {
			errorElement.innerText = 'Error trying to get a quote, please restart';
			errorElement.classList.remove('hide');
			return;
		}
		errorElement.innerText = '';
		errorElement.classList.add('hide');
	};

	const checkCharacters = (arrayRenderedQuote, inputValue) => {
		for (let i = 0; i < arrayRenderedQuote.length; i++) {
			if (inputValue[i] === undefined) {
				arrayRenderedQuote[i].classList.remove('correct');
				arrayRenderedQuote[i].classList.remove('incorrect');
			}
			if (inputValue[i] === arrayRenderedQuote[i].innerText) {
				arrayRenderedQuote[i].classList.add('correct');
				arrayRenderedQuote[i].classList.remove('incorrect');
			} else if (inputValue[i] !== arrayRenderedQuote[i].innerText && inputValue[i] !== undefined) {
				arrayRenderedQuote[i].classList.add('incorrect');
				arrayRenderedQuote[i].classList.remove('correct');
			}
		}
	};

	const handleActiveCharacter = (arrayRenderedQuote, inputLength, input) => {
		if (input === '') {
			arrayRenderedQuote.forEach(character => {
				character.classList.remove('active-character');
			});
			arrayRenderedQuote[0].classList.add('active-characer');
		}
		if (arrayRenderedQuote[inputLength])
			arrayRenderedQuote[inputLength].classList.add('active-character');
		if (arrayRenderedQuote[inputLength - 1])
			arrayRenderedQuote[inputLength - 1].classList.remove('active-character');
		if (arrayRenderedQuote[inputLength + 1])
			arrayRenderedQuote[inputLength + 1].classList.remove('active-character');
	};

	const hasFinished = arrayQuoteDisplay => {
		return Array.from(arrayQuoteDisplay).every(character => {
			return character.classList.contains('correct') || character.classList.contains('incorrect');
		});
	};

	const getCorrectCharactersTotal = () => {
		let correctCharacters = 0;
		let correctCharactersWithSpaces = 0;
		arrayRenderedQuote.forEach(character => {
			if (character.classList.contains('correct') && !is_all_ws(character)) correctCharacters += 1;
		});
		arrayRenderedQuote.forEach(character => {
			if (character.classList.contains('correct')) correctCharactersWithSpaces += 1;
		});
		return [correctCharacters, correctCharactersWithSpaces];
	};

	const renderCorrectPercentage = (
		percentage,
		correctPercentageCharactersWithSpaces,
		charactersPerSecond,
		charactersPerSecondWithSpaces
	) => {
		percentageElement.innerText = `Not counting spaces: ${percentage.toFixed(0)}%`;
		percentageSpacesElement.innerText = `Counting spaces: ${correctPercentageCharactersWithSpaces.toFixed(
			0
		)}%`;
		charactersPerSecondElement.innerText = `Not counting spaces: ${charactersPerSecond.toFixed(1)}`;
		charactersPerSecondSpacesElement.innerText = `Counting spaces: ${charactersPerSecondWithSpaces.toFixed(
			1
		)}`;
	};

	const startTimer = timerElement => {
		seconds += 1;
		timerElement.innerText = `${seconds} seconds`;
	};

	const getTypingSpeedData = (
		correctCharacters,
		correctCharactersWithSpaces,
		arrayRenderedQuote,
		seconds
	) => {
		const arrayNoWS = Array.from(arrayRenderedQuote).filter(character => !is_all_ws(character));

		return [
			(correctCharacters / arrayNoWS.length) * 100,
			(correctCharactersWithSpaces / arrayRenderedQuote.length) * 100,
			correctCharacters / seconds,
			correctCharactersWithSpaces / seconds,
		];
	};

	function is_all_ws(nod) {
		return !/[^\t\n\r ]/.test(nod.textContent);
	}

	let seconds = 0;
	let timer = null;

	inputQuoteElement.addEventListener('input', () => {
		if (!timer) {
			timer = setInterval(() => {
				startTimer(timerElement);
			}, 1000);
		}
		const input = inputQuoteElement.value;
		handleActiveCharacter(arrayRenderedQuote, input.length, input);
		checkCharacters(arrayRenderedQuote, input);

		if (hasFinished(arrayRenderedQuote)) {
			let [correctCharacters, correctCharactersWithSpaces] = getCorrectCharactersTotal();
			let [
				correctPercentage,
				correctPercentageCharactersWithSpaces,
				charactersPerSecond,
				charactersPerSecondWithSpaces,
			] = getTypingSpeedData(
				correctCharacters,
				correctCharactersWithSpaces,
				arrayRenderedQuote,
				seconds
			);
			renderCorrectPercentage(
				correctPercentage,
				correctPercentageCharactersWithSpaces,
				charactersPerSecond,
				charactersPerSecondWithSpaces
			);
			handleInputElement(inputQuoteElement, input, true);
			clearInterval(timer);
			timer = null;
		}
	});

	const handleFocus = () => {
		restartBtn.blur();
		inputQuoteElement.focus();
	};

	restartBtn.addEventListener('click', () => {
		renderError(errorElement, false);
		seconds = 0;
		timerElement.innerText = `${seconds} seconds`;
		handleFocus();
		renderCorrectPercentage(0, 0, 0, 0);
		clearInterval(timer);
		timer = null;
		createRenderedQuoteArray();
	});

	createRenderedQuoteArray();
})();
