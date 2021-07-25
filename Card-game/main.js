const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardsMatchFailed: 'CardsMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

// 開始MVC
const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]


// ----------------------------------- view ----------------------------------------
const view = {
  getCardContent(index) {
    const number = this.transforNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    // 一開始，初始畫面是背面 back
    return ` <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  getCardElement(index) {
    return ` <div class="card back" data-index="${index}"></div>`
  },



  transforNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards() {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = utility.getRandomNumberArray(52)
      .map(index => this.getCardElement(index))
      .join('')
  },

  flipCards(...cards) {
    //結論，加上  ... 變成可接受多張卡片輸入，並回傳"一個"陣列，
    //所以cards 是一個陣列
    cards.map(card => {

      //如果是背面，"回傳 return"正面，並去掉Back
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      //如果是正面，"回傳 return"背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCard(...cards) {
    cards.map(card => {
      card.classList.add('paired')
      //接著去CSS 增加樣式設定
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score : ${score}`
  },

  renderTtiedTimes(times) {
    document.querySelector('.triedtimens').textContent = `You've tried : ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener(
        'animationend',
        e => {
          card.classList.remove('wrong')
        },
        {
          once: true
        }
      )
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>完成~! （ノ≧∀≦）ノ  </p>
      <p>分數: ${model.score}</p>
      <p>嘗試次數: ${model.triedTimes}次</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

}


// ----------------------------------- 外掛 ----------------------------------------
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


// ----------------------------------- model ----------------------------------------
const model = {

  //將比較的兩張卡片，存起來。
  revealedCards: [],

  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },

  score: 0,

  triedTimes: 0

}


// ----------------------------------- controller ----------------------------------------
const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray)
  },

  //依照不同遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        //修改狀態
        this.currentState = GAME_STATE.SecondCardAwaits
        //翻卡片
        view.flipCards(card)
        //將卡片"丟入" push  兩張卡比較的容器內
        model.revealedCards.push(card)
        break

      case GAME_STATE.SecondCardAwaits:
        view.renderTtiedTimes(++model.triedTimes)

        //翻卡片
        view.flipCards(card)
        //將卡片"丟入" push  兩張卡比較的容器內
        model.revealedCards.push(card)

        if (model.isRevealedCardsMatched()) {
          //配對正確時，先去擴充一下view 的function
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched

          //將配對成功的卡片，加上新的css樣式
          view.pairCard(...model.revealedCards)
          //測試看看配對成功時，有沒有變換顏色，利用f12的Element去找
          //清空陣列!!不然會一直翻
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          //翻完兩張，再轉換狀態
          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          //配對失敗時，一樣先改狀態，方便debug
          this.currentState = GAME_STATE.CardsMatchFailed

          view.appendWrongAnimation(...model.revealedCards)

          //配對失敗時，須暫停一下牌面，再蓋牌!!
          setTimeout(this.resetCards, 1000)
          //這裡的 this.resetCards 不可以加() ，因為加了()變成回傳結果，這裡只要這個function
        }
        // console.log(model.isRevealedCardsMatched()) 先試看看功能有沒有正常

        break
    }

    //顯示狀態 ， index
    console.log('currentState :', this.currentState)
    console.log('revealed Cards :', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    //清空陣列!!不然會一直翻
    view.flipCards(...model.revealedCards)
    //上下順序不能反
    model.revealedCards = []

    //這裡的controller 不能用this! 因為上層使用this來呼叫這個function，
    //所以this就變成 setTimeout 而不是controller
    //setTimeout 是一個由瀏覽器提供的東西，所以console出來 指向瀏覽器 windows
    controller.currentState = GAME_STATE.FirstCardAwaits
    console.log('currentState :', controller.currentState)
  }

}

//先顯示卡牌
view.displayCards()
// 顯示原始分數0
// view.renderScore(model.score)


//再放置點擊事件，上下反了會沒反應!!!
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)

    // view.showGameFinished()  測試結束畫面
    // view.appendWrongAnimation(card)  測試 卡片閃爍
  })
})


// 測試看看有沒有發揮功能
// console.log(utility.getRandomNumberArray(5))