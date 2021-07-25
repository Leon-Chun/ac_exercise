const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const data_panel = document.querySelector("#data-panel");
const people = []
//  Search bar用
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
let filterPeople = []
//頁碼使用
const ITEMS_PER_PAG = 10
const pagination = document.querySelector('#paginator')
//我的最愛頁面
const myFavorite = JSON.parse(localStorage.getItem('lover'))


//----------------------------------  Render   --------------------------------------
function render(people){
  let rawHTML = '';
  people.forEach((item) => {
    // console.log(item)
    rawHTML += `
    <div class="card ml-3 mb-3" style="width: 11rem;">
      <button type="button" class="btn btn-show-info" data-toggle="modal" data-target="#person-info" >
        <img src="${item.avatar}" class="card-img-top" data-id="${item.id}" alt="avatar">
      </button>
      <div class="card-body"">
        <p class="card-text">
            ${item.name} ${item.surname}
        </p>
        <button class="btn btn-info btn-remove-info" data-id="${item.id}" >
           <i class="fas fa-heart-broken" data-id="${item.id}">Dislike</i>
        </button>
      </div>
    </div>`;
    
      
    })
    
    data_panel.innerHTML = rawHTML;

  }


// ---------------------------------  點擊人像卡 監聽事件  ------------------------------------
data_panel.addEventListener('click', function (event) {
  if (event.target.matches(".card-img-top")) {
    // console.log(event.target.dataset.id)
    modal_info(event)
  }else if(event.target.matches(".fa-heart-broken")){
    // console.log(event.target.dataset.id)
    removieLover(Number(event.target.dataset.id))
  }else if(event.target.matches(".btn-remove-info")){
    // console.log(event.target.dataset.id)
    removieLover(Number(event.target.dataset.id))
  }
});


// ---------------------------------  function modal  ------------------------------------
function modal_info (event) {
  const itemID = event.target.dataset.id
  const modalName = document.querySelector('.modal-title')
  const modalBody = document.querySelector('.modal-body')
  const modalAvatar = document.querySelector('.modal-avatar')
  
  modalAvatar.innerHTML=""
  axios
   .get(INDEX_URL + '/' +  itemID)
   .then(function(response){
    // console.log(response)
    modalName.innerHTML = `${response.data.name} ${response.data.surname}`
    modalAvatar.innerHTML = `<img class="inline-block" src="${response.data.avatar}" alt="">`
    modalBody.innerHTML = `
      gender: ${response.data.gender}</br>
      age   : ${response.data.age}</br>
      email : ${response.data.email}
      ` 
  })
}

//  ----------------------------------  function removeLove  -----------------------------------
function removieLover (id){
  const delIndex = myFavorite.findIndex(item => item.id === id)
  // console.log(delIndex)
  myFavorite.splice( delIndex , 1)

  localStorage.setItem('lover', JSON.stringify(myFavorite))
  
  render(myFavorite)
}
    
//  ---------------------------------  search submit監聽事件 ------------------------------------

searchForm.addEventListener('submit',function onSearchFormSubmitted(event){
  event.preventDefault()

  const keyword = searchInput.value.trim()

  if(!keyword.length){
    return alert('Please enter a valid string')
  }

  filterPeople = myFavorite.filter((item) => 
  item.name.toLowerCase().includes(keyword.toLowerCase()))

   if(filterPeople.length === 0){
    return alert('No result with keyword  "' + keyword + '"')
  }

  render(getItemByPage(1) )
  paginator(filterPeople.length)

})

//  --------------------------------  每頁items呈現  ------------------------------------
//    輸入頁碼，輸出該頁內容陣列
function getItemByPage (page) {
  
  const data = filterPeople.length? filterPeople:myFavorite
  const startPageIndex = (page-1) * ITEMS_PER_PAG
  const endPageIndex = startPageIndex + ITEMS_PER_PAG
  return data.slice(startPageIndex , endPageIndex)
}


//  --------------------------------  頁碼表render  ------------------------------------
//    輸入陣列內物件數量。 輸出頁碼表呈現頁數。
function paginator(amount) {
  let allPage = Math.ceil( amount / ITEMS_PER_PAG )
  let rawHTML = ''
  for(page = 1 ; page <= allPage ; page++){
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }

  pagination.innerHTML = rawHTML
}

//  --------------------------------  頁碼表監聽事件  ------------------------------------
pagination.addEventListener('click', function pageClick(event){
  // console.log(event.target.dataset.page)
  if(event.target.tagName !== 'A') return
  
  const pageNumber = Number(event.target.dataset.page) 
  // console.log(pageNumber)
  render( getItemByPage(pageNumber))

})


// ---------------------------------  頁面自動載入  ------------------------------------
// axios
//   .get(INDEX_URL)
//   .then((response) => {
//     // console.log(...response.data.results);
//     people.push(...response.data.results)
   
//     render(getItemByPage(1))
//     paginator(myFavorite.length)
//   })
//   .catch((error) => {
//     console.log(error);
//   })

  render(myFavorite)

  