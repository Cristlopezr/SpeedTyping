const API_URL = 'https://api.quotable.io/random';

const timerElement = document.querySelector('#timer');
const quoteDisplayElement = document.querySelector('#quoteDisplay');
const inputQuoteElement = document.querySelector('#inputQuote');
const percentageElement = document.querySelector('#percentage');
const restartBtn = document.querySelector('#restart');
const charactersPerSecondElement = document.querySelector('.characters-per-second');
const percentageSpacesElement = document.querySelector('#percentageSpaces');
const charactersPerSecondSpacesElement = document.querySelector('.characters-per-second-spaces');

let arrayRenderedQuote;

inputQuoteElement.focus();

const getQuote = () => {
  return fetch(API_URL)
    .then((response) => response.json())
    .then((data) => data.content);
};

const handleInputElement = (inputElement, inputValue, state) => {
  inputElement.value = inputValue;
  inputElement.disabled = state;
};

const splitQuote = (quote) => {
  return quote.split('');
};

const createSpan = (splittedQuote, quoteDisplayElement) => {
  splittedQuote.forEach((character) => {
    const spanQuote = document.createElement('span');
    spanQuote.innerText = character;
    quoteDisplayElement.appendChild(spanQuote);
  });
  return quoteDisplayElement;
};

const renderQuote = async () => {
  quoteDisplayElement.innerHTML = '';
  handleInputElement(inputQuoteElement, '', false);
  const quote = await getQuote();
  const splittedQuote = splitQuote(quote);
  return (quoteDisplayed = createSpan(splittedQuote, quoteDisplayElement));
};

const createRenderedQuoteArray = async () => {
  const renderedQuote = await renderQuote();
  arrayRenderedQuote = renderedQuote.querySelectorAll('span');
  arrayRenderedQuote[0].classList.add('active-character');
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
    arrayRenderedQuote.forEach((character) => {
      character.classList.remove('active-character');
    });
    arrayRenderedQuote[0].classList.add('active-characer');
  }
  if (arrayRenderedQuote[inputLength]) arrayRenderedQuote[inputLength].classList.add('active-character');
  if (arrayRenderedQuote[inputLength - 1]) arrayRenderedQuote[inputLength - 1].classList.remove('active-character');
  if (arrayRenderedQuote[inputLength + 1]) arrayRenderedQuote[inputLength + 1].classList.remove('active-character');
};

const hasFinished = (arrayQuoteDisplay) => {
  return Array.from(arrayQuoteDisplay).every((character) => {
    if (character.classList.contains('correct') || character.classList.contains('incorrect')) return true;
    return false;
  });
};

const getCorrectCharactersTotal = () => {
  let correctCharacters = 0;
  let correctCharactersWithSpaces = 0;
  arrayRenderedQuote.forEach((character) => {
    if (character.classList.contains('correct') && !is_all_ws(character)) correctCharacters += 1;
  });
  arrayRenderedQuote.forEach((character) => {
    if (character.classList.contains('correct')) correctCharactersWithSpaces += 1;
  });
  return [correctCharacters, correctCharactersWithSpaces];
};

const renderCorrectPercentage = (percentageElement, percentage, percentageSpacesElement, correctPercentageCharactersWithSpaces, charactersPerSecondElement, charactersPerSecond, charactersPerSecondSpacesElement, charactersPerSecondWithSpaces) => {
  percentageElement.innerText = `Not counting spaces: ${percentage.toFixed(0)}%`;
  percentageSpacesElement.innerText = `Counting spaces: ${correctPercentageCharactersWithSpaces.toFixed(0)}%`;
  charactersPerSecondElement.innerText = `Not counting spaces: ${charactersPerSecond.toFixed(1)}`;
  charactersPerSecondSpacesElement.innerText = `Counting spaces: ${charactersPerSecondWithSpaces.toFixed(1)}`;
};

const startTimer = (timerElement) => {
  time += 1;
  timerElement.innerText = `${time} seconds`;
};

let time = 0;
let timer = 0;
let timerInterval;

inputQuoteElement.addEventListener('input', () => {
  timer += 1;
  if (timer === 1) {
    timerInterval = setInterval(() => {
      startTimer(timerElement, time);
    }, 1000);
  }
  const input = inputQuoteElement.value;
  handleActiveCharacter(arrayRenderedQuote, input.length, input);
  checkCharacters(arrayRenderedQuote, input);

  if (hasFinished(arrayRenderedQuote)) {
    let [correctCharacters, correctCharactersWithSpaces] = getCorrectCharactersTotal();
    let [correctPercentage, correctPercentageCharactersWithSpaces, charactersPerSecond, charactersPerSecondWithSpaces] = getTypingSpeedData(correctCharacters, correctCharactersWithSpaces, arrayRenderedQuote, time);
    renderCorrectPercentage(percentageElement, correctPercentage, percentageSpacesElement, correctPercentageCharactersWithSpaces, charactersPerSecondElement, charactersPerSecond, charactersPerSecondSpacesElement, charactersPerSecondWithSpaces);
    handleInputElement(inputQuoteElement, input, true);
    clearInterval(timerInterval);
  }
});

const getTypingSpeedData = (correctCharacters, correctCharactersWithSpaces, arrayRenderedQuote, time) => {
  const arrayNoWS = Array.from(arrayRenderedQuote).filter((character) => !is_all_ws(character));
  let correctPercentage = (correctCharacters / arrayNoWS.length) * 100;
  let correctPercentageCharactersWithSpaces = (correctCharactersWithSpaces / arrayRenderedQuote.length) * 100;
  let charactersPerSecond = correctCharacters / time;
  let charactersPerSecondWithSpaces = correctCharactersWithSpaces / time;
  return [correctPercentage, correctPercentageCharactersWithSpaces, charactersPerSecond, charactersPerSecondWithSpaces];
};

restartBtn.addEventListener('click', () => {
  timer = 0;
  time = 0;
  restartBtn.blur();
  inputQuoteElement.focus();
  timerElement.innerText = `${time} seconds`;
  renderCorrectPercentage(percentageElement, 0, percentageSpacesElement, 0, charactersPerSecondElement, 0, charactersPerSecondSpacesElement, 0);
  clearInterval(timerInterval);
  createRenderedQuoteArray();
});

function is_all_ws(nod) {
  return !/[^\t\n\r ]/.test(nod.textContent);
}

createRenderedQuoteArray();
