const cardObjectDefinition = [
    {id:1, imagePath:'images/card-KingHearts.png'},
    {id:2, imagePath:'images/card-JackClubs.png'},
    {id:3, imagePath:'images/card-QueenDiamonds.png'},
    {id:4, imagePath:'images/card-AceSpades.png'},
]
const aceId = 4

const cardBackImgPath = 'images/card-back-Blue.png'

let cards = []


const playGameButtonElem = document.getElementById("playGame")

const collapsedGridAreaTemplate = '"a a" "a a"'
const cardCollectionCellclass = '.card-pos-a'

const numCards = cardObjectDefinition.length

const cardContainerElem = document.querySelector('.card-container')

let cardPositions = []

let gameInProgress = false
let shufflingInProgress = false
let cardRevealed = false

//updatestatusElement (currentGameStatusElem, "Block", winColor, "Hit!! - Well Done!! :)")

const currentGameStatusElem = document.querySelector('.current-status')
const scoreContainerElem = document.querySelector('.header-score-container')
const scoreElem = document.querySelector('.score')
const roundContainerElem = document.querySelector('.header-round-container')
const roundElem = document.querySelector('.round')

const winColor = "green"
const loseColor = "red"
const primareyColor = "black"

let roundNum = 0
let maxRounds = 4
let score = 0

let gameObj = {}

const localStorageGameKey = "HTA"

loadGame()
function gameOver()
{
    updateStatusElement(scoreContainerElem, "none")
    updateStatusElement(roundContainerElem, "none")

    const gameOverMessage = `Game Over! Final Score - <span class='badge'>${score}</span> Click 'Play Game' button to play again`
    updateStatusElement(currentGameStatusElem, "block", primareyColor, gameOverMessage)

    gameInProgress = false
    playGameButtonElem.disabled = false
}

function endRound()
{
    setTimeout(() => {
        if(roundNum == maxRounds)
        {
            gameOver()
            return
        }
        else
        {
            setTimeout(() => {
                startRound()
            }, 2000);
        }
    })
} 


function chooseCard(card)
{
    if(canChooseCard())
    {
        evaluateCardChoice(card)
        saveGameObjectToLocalStorage(score, roundNum)
        flipCard(card,false)

        setTimeout(() => {
            flipCards(false)
            updateStatusElement(currentGameStatusElem, "block", primareyColor, "Card position revealed")

            endRound()
        },3000)
        cardRevealed = true
    }
}

function calculateScoreToAdd(roundNum)
{
    if(roundNum == 1)
    {
        return 100
    }
    else if (roundNum == 2)
    {
        return 50
    }
    else if (roundNum == 3)
    {
        return 25
    }
    else
    {
        return 10
    }
}

function calculateScore()
{
    const scoreToAdd = calculateScoreToAdd(roundNum)
    score = score + scoreToAdd
}

function updateScore() {
    calculateScore()
    updateStatusElement(
        scoreElem,
        "block",
        primareyColor,
        `<span class='badge'>${score}</span>`
    )
}


function updateStatusElement(elem, display, color, innerHTML)
{
    elem.style.display = display
    if(arguments.length > 2)
    {
        elem.style.color = color
        elem.innerHTML = innerHTML
    }
}

function outputChoiceFeedBack(hit)
{
    if(hit)
    {
        updateStatusElement(currentGameStatusElem, "block", winColor, "Hit!! - Well Done!! :)")
    }
    else
    {
        updateStatusElement(currentGameStatusElem, "block", loseColor, "Missed!! :(")
    }
}

function evaluateCardChoice(card)
{
    if(card.id == aceId)
    {
        updateScore()
        outputChoiceFeedBack(true)
    }
    else
    {
        outputChoiceFeedBack(false)
    }
}


function canChooseCard()
{
    return gameInProgress == true && !shufflingInProgress && !cardRevealed
}

function loadGame() {
    createCards();

    cards = document.querySelectorAll('.card')
    cardFlyInEffect();
    playGameButtonElem.addEventListener('click', () => startGame())

    updateStatusElement(scoreContainerElem, "none")
    updateStatusElement(roundContainerElem, "none")


}

function checkForIncompliteGame()
{
    const getSerializedGameObj = getLocalStorageItemValue(localStorageGameKey)
    if(getSerializedGameObj)
    {
        gameObj = getObjectFromJSON(getSerializedGameObj)

        if(gameObj.round >= maxRounds)
        {
            removeLocalStorageItem(localStorageGameKey)
        }
        else
        {
            if(confirm('Would you like to continue with your last game?'))
            {
               score = gameObj.score
               round = gameObj.round 
            }
        }
    }
}
function startGame() {
    initializeNewGame()
    startRound()
}
function initializeNewGame() {
    score = 0
    roundNum = 0

    checkForIncompliteGame()

    shufflingInProgress = false

    updateStatusElement(scoreContainerElem, "flex")
    updateStatusElement(roundContainerElem, "flex")

    updateStatusElement(scoreElem, "block", primareyColor, `Score <span class='badge'>${score}</span>`)
    updateStatusElement(roundElem, "block", primareyColor, `Round <span class='badge'>${roundNum}</span>`)
}
function startRound() 
{
    initializeNewRound()
    colletcards()
    flipCards(true)
    shuffleCards()

}
function initializeNewRound() {
    roundNum++
    playGameButtonElem.disabled = true

    gameInProgress = true
    shufflingInProgress = true
    cardRevealed = false

    updateStatusElement(currentGameStatusElem, "block", primareyColor, "Shuffling...")
    updateStatusElement(roundElem, "block", primareyColor, `Round <span class='badge'>${roundNum}</span>`)
}

function colletcards() 
{
    transformGridArea(collapsedGridAreaTemplate)
    addCardsToGridAreaCell(cardCollectionCellclass)

}
function transformGridArea(areas)
{
    cardContainerElem.style.gridTemplateAreas = areas
}
function addCardsToGridAreaCell(cellpositionClassName)
{
    const cellPositionElem = document.querySelector(cellpositionClassName)
    cards.forEach((card, index)=>{
        addChildElement(cellPositionElem, card)
    })
}

function flipCard(card, flipToBack)
{
   const innerCardElem = card.firstChild


   if(flipToBack && !innerCardElem.classList.contains('flip-it'))
   {
       innerCardElem.classList.add('flip-it')
   } 
   else if (innerCardElem.classList.contains('flip-it'))
    {
       innerCardElem.classList.remove('flip-it') 
    }
}

function flipCards(flipToBack){
    cards.forEach((card,index)=>{
        setTimeout(() => {
            flipCard(card, flipToBack)
        },index * 100);
    })

}

function cardFlyInEffect()
{
    const id = setInterval(flyIn, 5)
    let cardCount = 0;

    let count = 0

    function flyIn()
    {
        count++
        if(cardCount == numCards)
        {
            clearInterval(id)
            playGameButtonElem.style.display = "inline-block"
        }
        if(count == 1 || count == 80 || count == 160 || count == 220)
        {
            cardCount++
            let card = document.getElementById(cardCount)
            card.classList.remove ("fly-in")
        }
    }
}

function removeShuffleClasses()
{
    cards.forEach((card)=>
    {
        card.classList.remove("shuffle-left")
        card.classList.remove("shuffle-right")
    })
}

function animationshuffle(shuffleCount)
{
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    let card1 = document.getElementById(random1)
    let card2 = document.getElementById(random2)
    if (shuffleCount % 4 == 0)
    {
        card1.classList.toggle("shuffle-left")
        card1.style.zIndex = 100
    }
    if (shuffleCount % 10 == 0)
    {
        card2.classList.toggle("shuffle-right")
        card2.style.zIndex = 200
    }
}

function shuffleCards()
{
    const id = setInterval(shuffle, 12)
    let shuffleCount = 0

    function shuffle()
    {
        randomizeCardPositions()

        animationshuffle(shuffleCount)
        if(shuffleCount == 500)
        {
            clearInterval(id)
            shufflingInProgress = false
            removeShuffleClasses()
            dealCards()
            updateStatusElement(currentGameStatusElem, "block", primareyColor, "Please click the card that you think is the Ace of Spades...")
        }
        else
        {shuffleCount++;
        }
    }    
}   
function randomizeCardPositions()
{
    const random1 = Math.floor(Math.random() * numCards) + 1
    const random2 = Math.floor(Math.random() * numCards) + 1

    const temp = cardPositions[random1 - 1]

    cardPositions[random1 - 1] = cardPositions[random2 - 1]
    cardPositions[random2 - 1] = temp
}
function dealCards()
{
    addCardsToAppropriateCell()
    const areasTemplate = returnGridAreasMappedToCardPos()

    transformGridArea(areasTemplate)

}
function returnGridAreasMappedToCardPos()
{
    let firstPart = ""
    let secondPart = ""
    let areas = ""
    cards.forEach((card, index) => {
        if(cardPositions[index] ==1)
        {
           areas = areas + "a "
        }
        else if (cardPositions[index] ==2)
        {
            areas = areas + "b "
        }
        else if (cardPositions[index] ==3)
        {
            areas = areas + "c "
        }
        else if (cardPositions[index] ==4)
        {
            areas = areas + "d "
        }
        if (index == 1)
        {
           firstPart = areas.substring(0, areas.length - 1)
           areas = "";
        }
        else if (index == 3)
        {
            secondPart = areas.substring(0, areas.length - 1)
        }
        
    })
    return `"${firstPart}" "${secondPart}"`
}
function addCardsToAppropriateCell()
{
  cards.forEach((card)=>{
    addCardToGridCell(card)
  })  
}

function createCards()
{
    cardObjectDefinition.forEach((cardItem)=>{
        createCard(cardItem);
    })
}
function createCard(cardItem) {
   
    //Create div elements that make up a card
    const cardElem = createElement('div')
    const cardInnerElem = createElement('div')
    const cardFrontElem = createElement('div')
    const cardBackElem = createElement('div')

    //create front and back image elements for a card
    const cardFrontImg = createElement('img')
    const cardBackImg = createElement('img')
    
    //add class and id to card element
    addClassToElement(cardElem, 'card')
    addClassToElement(cardElem, 'fly-in')
    addIdToElement(cardElem, cardItem.id)

    //add class to inner card element
    addClassToElement(cardInnerElem, 'card-inner')

    //add class to front card element
    addClassToElement(cardFrontElem, 'card-front')

    //add class to back card element 
    addClassToElement(cardBackElem, 'card-back')

    //add src attribute and appropriate value to img element - back of card
    addSrcToImageElem(cardBackImg, cardBackImgPath)
    
    //add src attribute and appropriate value to img element - front of card
    addSrcToImageElem(cardFrontImg, cardItem.imagePath)

    //assign class to back image element of back of card
    addClassToElement(cardBackImg, 'card-img')

    //assign class to front image element of front of card
    addClassToElement(cardFrontImg, 'card-img')

    //add front image element as child element to front of card element
    addChildElement(cardFrontElem, cardFrontImg)

    //add back image element as child element to back card element 
    addChildElement(cardBackElem, cardBackImg)

    //add front card element as child element to inner card element
    addChildElement(cardInnerElem, cardFrontElem)

    //add back card element as child element to inner card element
    addChildElement(cardInnerElem, cardBackElem)

    //add inner card element as child element to card element 
    addChildElement(cardElem, cardInnerElem)

    //add card element as child element to appropriate grid cell
    addCardToGridCell(cardElem)

    initializeCardPosition(cardElem)

    attachClickEventHandlerToCard(cardElem)
}

function attachClickEventHandlerToCard(card)
{
    card.addEventListener('click', () => chooseCard(card))
}

function initializeCardPosition(card)
{
    cardPositions.push(card.id)
}
function createElement(elemType)
{
    return document.createElement(elemType)
}
function addClassToElement(elem, className)
{
    elem.classList.add(className)
}
function addIdToElement(elem, id)
{
    elem.id = id
}
function addSrcToImageElem(imgElem, src)
{
    imgElem.src = src
}
function addChildElement(parentElem, childElem)
{
    parentElem.appendChild(childElem)
}
function addCardToGridCell(card)
{
    const cardPositionClassName = mapCardIdToGridCell(card)

    const cardPosElem = document.querySelector(cardPositionClassName)

    addChildElement(cardPosElem, card)
}
function mapCardIdToGridCell(card){
    if(card.id == 1)
    {
        return '.card-pos-a'
    }
    else if(card.id == 2)
    {
        return '.card-pos-b'
    }
    else if(card.id == 3)
    {
        return '.card-pos-c'
    }
    else if(card.id == 4)
    {
        return '.card-pos-d'
    }  
}

//local storage functions

function getSerializedObjectAsJSON(obj)
{
    return JSON.stringify(obj)
}
function getObjectFromJSON(json)
{
    return JSON.parse(json)
}
function updateLocalStorage(key, value)
{
    localStorage.setItem(key, value)
}
function removeLocalStorageItem(key)
{
    localStorage.removeItem(key)
}
get
function getLocalStorageItemValue(key)
{
    return localStorage.getItem(key)
}
function updateGameObject(score,round)
{
    gameObj.score = score
    gameObj.round = round

}
function saveGameObjectToLocalStorage(score,round)
{
    updateGameObject(score, round)
    updateLocalStorage(localStorageGameKey, getSerializedObjectAsJSON(gameObj))

}
