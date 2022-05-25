import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js'
import {
  createTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setBackGroundColor,
  setTimerText,
  showPlayAgainButton,
} from './utils.js'
import {
  getColorElementList,
  getColorListElm,
  getInActiveColorList,
  getPlayAgainButton,
} from './selectors.js'

// Global variables
let selections = []
let gameStatus = GAME_STATUS.PLAYING
let timer = createTimer({
  seconds: GAME_TIME,
  onChange: handleTimerChange,
  onFinish: handleTimerFinish,
})

function handleTimerChange(second) {
  const fullSecond = `0${second}`.slice(-2)
  setTimerText(fullSecond)
}

function handleTimerFinish() {
  //end game
  gameStatus = GAME_STATUS.FINISHED

  setTimerText('Game Over ')
  showPlayAgainButton()
}

// TODOs
// 1. Generating colors using https://github.com/davidmerfield/randomColor
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElm) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus)
  const isClicked = liElm.classList.contains('active')
  if (!liElm || shouldBlockClick || isClicked) return
  liElm.classList.add('active')

  //save clicked cell to selections
  selections.push(liElm)
  if (selections.length < 2) return
  //check match
  const firstColor = selections[0].dataset.color
  const secondColor = selections[1].dataset.color
  const isMatch = firstColor === secondColor

  if (isMatch) {
    setBackGroundColor(firstColor)
    //check win
    const isWin = getInActiveColorList().length === 0
    if (isWin) {
      // show relay
      showPlayAgainButton()
      // show you win
      setTimerText('YOU WIN!')
      timer.clear()

      gameStatus = GAME_STATUS.FINISHED
    }
    selections = []
    return
  }

  //in case of not match
  //remove active class for 2 li elements
  gameStatus = GAME_STATUS.BLOCKING

  setTimeout(() => {
    selections[0].classList.remove('active')
    selections[1].classList.remove('active')
    //reset selections for the next turn
    selections = []
    // race-condition check with handleTimerFinish
    if (gameStatus !== GAME_STATUS.FINISHED) {
      gameStatus = GAME_STATUS.PLAYING
    }
  }, 500)
}
function initColor() {
  const colorList = getRandomColorPairs(PAIRS_COUNT)
  const liElm = getColorElementList()
  liElm.forEach((item, idx) => {
    item.dataset.color = colorList[idx]
    const overPlayElm = item.querySelector('.overlay')
    if (overPlayElm) overPlayElm.style.backgroundColor = colorList[idx]
  })
}

function attachEventForColorList() {
  const ulElm = getColorListElm()
  if (!ulElm) return
  ulElm.addEventListener('click', (e) => {
    if (e.target.tagName !== 'LI') return
    handleColorClick(e.target)
  })
}

function resetGame() {
  // reset global vars
  gameStatus = GAME_STATUS.PLAYING
  selections = []
  //reset DOM elm
  // - remove active class from li
  // -hide replay button
  // -clear you win / timeout text
  const colorElmList = getColorElementList()
  for (const colorElm of colorElmList) {
    colorElm.classList.remove('active')
  }

  hidePlayAgainButton()
  setTimerText('')

  //re-generate new colors
  initColor()

  //reset background color

  setBackGroundColor('goldenrod')
  //start a new game

  startTimer()
}

function attachEvenForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton()
  if (!playAgainButton) return
  playAgainButton.addEventListener('click', resetGame)
}

function startTimer() {
  timer.start()
}

//main
;(() => {
  initColor()

  attachEventForColorList()

  attachEvenForPlayAgainButton()

  startTimer()
})()
