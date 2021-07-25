 const BASE_URL = 'https://movie-list.alphacamp.io'
 const INDEX_URL = BASE_URL + '/api/v1/movies/'
 const POSTER_URL = BASE_URL + '/posters/'

// 我的最愛  local裡的電影
 const favoMovie = JSON.parse(localStorage.getItem('FavoriteMovies'))
 
 const dataPanel = document.querySelector('#data-panel')
 const searchForm = document.querySelector('#search-form')
 const searchInput = document.querySelector('#search-input')


 // ------------------------function   畫面重整渲染 --------------------------------------
 function renderMovieList(data){
   let rawHTML = ''
  //抓title, image
   data.forEach((item) => {
    //  console.log(item)
  rawHTML += `<div class="col-sm-3">
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
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>`
   })
  dataPanel.innerHTML = rawHTML
 }


//  ----------------------- function    Modal --------------------------------------
 function showMovieModal(id){
   //先寫下要修改modal的項目
   const modalTitle = document.querySelector('#movie-modal-title')
   const modalImage = document.querySelector('#movie-modal-image')
   const modalData = document.querySelector('#movie-modal-data')
   const modaldescription = document.querySelector('#movie-modal-description')
   //向網站請求資料，記住，是對應id喔!
   axios
     .get(INDEX_URL + id)
     .then(function(response){
      //  console.log(response)
       const data = response.data.results
       modalTitle.innerHTML = data.title
       modalData.innerHTML = data.release_date
       modaldescription.innerHTML = data.description
       modalImage.innerHTML=`<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
     })
    .catch(function(error){
      console.log(error)
    })
 }
 

// --------------------------function   加到我的最愛 localStorage-------------------------------------------
function addToFavorite(id){
  // console.log(id)
  //下面find 裡面的function 拉出來寫
  // function isMovieIdMatched(movie){
  //   return movie.id === id
  // }
  const list = JSON.parse(localStorage.getItem('FavoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id )
  // console.log(movie)

  if(list.some(movie => movie.id === id)){
    return alert('此電影已經加入我的最愛')
  }

  list.push(movie)
  // console.log(list) 

  localStorage.setItem('FavoriteMovies' , JSON.stringify(list))

}


//--------------------------function   移除我的最愛 localStorage-----------------------------
function removeFavoriteMovie(id){
  const movieIndex = favoMovie.findIndex(movie => movie.id === id )
  // return console.log(movieIndex)  
  favoMovie.splice(movieIndex,1)
  // console.log(favoMovie)

  localStorage.setItem('FavoriteMovies' , JSON.stringify(favoMovie))
  renderMovieList(favoMovie)
}




// --------------------------監聽器  按鍵more 和 + ------------------------------------------
dataPanel.addEventListener('click',function onPanelClicked (event){
  if(event.target.matches('.btn-show-movie')){
    // console.log(event.target.dataset.id)
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-remove-favorite')){
    removeFavoriteMovie(Number(event.target.dataset.id))
  }
})


// ----------------------------搜尋功能------------------------------------------------------
// searchForm.addEventListener('submit',function onSearchFormSubmitted(event){
//   event.preventDefault()
//   // console.log(event)
//   const keyword = searchInput.value.trim().toLowerCase()
//   let filteredMovies = []
//   if(!keyword.length){
//     return alert('Please enter a valid string')
//   }
//   // 法1，塞選電影
//   // for(const movie of movies){
//   //   if(movie.title.toLowerCase().includes(keyword)){
//   //     filteredMovies.push(movie)
//   //   }
//   filteredMovies = movies.filter((movie) => 
//   movie.title.toLowerCase().includes(keyword))

//   if(filteredMovies.length === 0){
//     return alert('Cannot find movies with keyword' + keyword)
//   }
//   renderMovieList(filteredMovies)
// })

// ------------------------- 頁面自動載入----------------------------------
//  axios
//    .get(INDEX_URL)
//    .then((response) => {

//     // Array(80)
//     //  console.log(response.data.results)
    
//     //推電影進去變數
//      movies.push(...response.data.results)
//     //  console.log(movies)
//     renderMovieList(movies)
//    })
//    .catch(function(error){
//      console.log(error)
//    })
//   //  console.log(movies)

//--------------我的最愛頁面 -------------------------

renderMovieList(favoMovie)
  