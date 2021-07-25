const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

// 拿來放電影清單裡的電影
const movies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
//  分頁器
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')
//篩選過的電影
let filteredMovies = []
//卡片、清單展示按鍵節點
const display_style_icon = document.querySelector('.display-style')
//設定模式全域設定
let display_mode = 'cardMode' || []


//------------------------- 卡片、清單切換 監聽事件 -----------------------------
display_style_icon.addEventListener("click", function styleChange(event) {

  //當尚未搜尋，localStorage還沒有資料，因此先以第 1 頁渲染畫面
  const localpage = Number(localStorage.getItem("page")) || 1

   //點擊時，渲染畫面，並修改變數內容。
  if (event.target.matches(".display-card")) {
    renderCardMovie(getMoviesByPage(localpage))
    display_mode = 'cardMode'
  } else if (event.target.matches(".display-list")) {
    renderListMovie(getMoviesByPage(localpage))
    display_mode = 'listMode'
  }
})

//-------------------------function List render-----------------------------
function renderListMovie(data) {
  let rawHTML = ''
  rawHTML = ""
  data.forEach((item) => {
    rawHTML += `
       <div class="list-style align-items-center">
        <div class="lise-title ml-2 col-sm-4 ">
          ${item.title}
        </div>
        <div class="btn col-sm-8">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
       `
  })
  dataPanel.innerHTML = rawHTML
}

//-------------------------function Card render-----------------------------
function renderCardMovie(data) {
  let rawHTML = ''
  rawHTML = ""

  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  })
  dataPanel.innerHTML = rawHTML
}

//------------------------辨別模式，進行畫面渲染---------------------------------------
function identifyModeRender(page) {
  if (display_mode.includes('cardMode')) {
    renderCardMovie(getMoviesByPage(page))
  } else if (display_mode.includes('listMode')) {
    renderListMovie(getMoviesByPage(page))
  }
}


//------------------------每個分頁內，物件數---------------------------------------
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //pag1 : 0 - 11
  //pag2 : 12- 23 
  const startPagIndex = (page - 1) * MOVIES_PER_PAGE
  const endPagIndex = startPagIndex + MOVIES_PER_PAGE
  return data.slice(startPagIndex, endPagIndex)
}


//---------------------------- pagination --------------------------------------
function renderPaginator(anmount) {
  //   80部/12部每頁 = 6  ...... 8
  const numberOfPage = Math.ceil(anmount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>
    `
  }

  paginator.innerHTML = rawHTML

}

//--------------------分頁按鈕監聽事件 ---------------------------
paginator.addEventListener('click', function onPanelClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)

  identifyModeRender(page)

  localStorage.setItem('page', String(page))
})


// -----------------------function 跳出Modal -----------------------------
function showMovieModal(id) {
  //先寫下要修改modal的項目
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalData = document.querySelector('#movie-modal-data')
  const modaldescription = document.querySelector('#movie-modal-description')
  //先清空，避免顯示前一筆資料
  modalTitle.innerHTML = ''
  modalImage.innerHTML = ''
  modalData.innerHTML = ''
  modaldescription.innerHTML = ''

  axios
    .get(INDEX_URL + id)
    .then(function (response) {
      const data = response.data.results
      modalTitle.innerHTML = data.title
      modalData.innerHTML = `release at : ${data.release_date}`
      modaldescription.innerHTML = data.description
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
    })
    .catch(function (error) {
      console.log(error)
    })
}

// ----------------------------加到我的最愛 localStorage----------------------------------------------
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('FavoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)
  if (list.some(movie => movie.id === id)) {
    return alert('此電影已經加入我的最愛')
  }
  list.push(movie)
  alert('成功加入我的最愛')
  localStorage.setItem('FavoriteMovies', JSON.stringify(list))

}


// ------------------------------按鍵功能鍵 more 和 + -------------------------------------
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    // console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


// ----------------------------搜尋功能--------------------------------------------------
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //終止瀏覽器的頁面刷新預設
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length) {
    return alert('Please enter a valid string')
  }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert('Cannot find movies with keyword  ' + keyword)
  }
  
  identifyModeRender(1)

  renderPaginator(filteredMovies.length)
  //須將local page，塞入第一頁，避免當停留在其他數字，但篩選結果只有1頁時，造成顯示錯誤。
  localStorage.setItem('page', 1)
})

// ------------------------------- 頁面自動載入----------------------------------
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)        //下方頁碼渲染
    renderCardMovie(getMoviesByPage(1))   //中間電影渲染
  })
  .catch(function (error) {
    console.log(error)
  })