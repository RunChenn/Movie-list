const BASE_URL = 'https://movie-list.alphacamp.io';
const INDEX_URL = BASE_URL + '/api/v1/movies/';
const POSTER_URL = BASE_URL + '/posters/';
const movies = [];
let filteredMovies = []
const MOVIES_PER_PAGE = 12 // 每頁顯示個數

const dataPanel = document.querySelector('#data-panel')

function renderMovieList(data) {
    let rawHTML = ''
    data.forEach((item) => {
        // title, image, id 隨著每個 item 改變
        rawHTML += `<div class="col-sm-3">
            <div class="mb-2">
            <div class="card">
                <img src="${
                POSTER_URL + item.image
                }" class="card-img-top" alt="Movie Poster">
                <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
                </div>
                <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                </div>
            </div>
            </div>
        </div>`
    })
    dataPanel.innerHTML = rawHTML
}

axios
    .get(INDEX_URL)
    .then((response) => {
        movies.push(...response.data.results)
        renderMovieList(getMoviesByPage(1))
    })
    .catch((err) => console.log(err));

// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
    if (event.target.matches('.btn-show-movie')) {
        showMovieModal(Number(event.target.dataset.id))
        //新增以下
    } else if (event.target.matches('.btn-add-favorite')) {
        addToFavorite(Number(event.target.dataset.id))
    }
})

// function renderMovieList(data) {
function showMovieModal(id) {
    const modalTitle = document.querySelector('#movie-modal-title')
    const modalImage = document.querySelector('#movie-modal-image')
    const modalDate = document.querySelector('#movie-modal-date')
    const modalDescription = document.querySelector('#movie-modal-description')
    axios.get(INDEX_URL + id).then((response) => {
        const data = response.data.results
        modalTitle.innerText = data.title
        modalDate.innerText = 'Release date: ' + data.release_date
        modalDescription.innerText = data.description
        modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`
    })
}

const searchForm = document.querySelector('#search-form')

const searchInput = document.querySelector('#search-input') //新增這裡

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
    //取消預設事件
    event.preventDefault()
    //取得搜尋關鍵字
    const keyword = searchInput.value.trim().toLowerCase()
    //儲存符合篩選條件的項目
    // let filteredMovies = [] // 再分頁時辨全域變數
    //錯誤處理：輸入無效字串
    if (!keyword.length) {
        return alert('請輸入有效字串！')
    }
    //條件篩選
    filteredMovies = movies.filter((movie) =>
        movie.title.toLowerCase().includes(keyword)
    )
    //錯誤處理：無符合條件的結果
    if (filteredMovies.length === 0) {
        return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
    }
    //重新輸出至畫面
    //重製分頁器
    renderPaginator(filteredMovies.length) //新增這裡
    //預設顯示第 1 頁的搜尋結果
    renderMovieList(getMoviesByPage(1)) //修改這裡
})

// 這裡我們順手做了幾個優化：

// 加入錯誤處理： 若使用者沒輸入東西就送出， 會跳出警告訊息。
// trim()： 把字串頭尾空格去掉。 若使用者不小心輸入一堆空白送出， 也會被視為沒有輸入東西， 而收到警告訊息。
// toLowerCase()： 把字串轉成小寫。 我們希望這個搜尋功能是大小寫不敏感的， 所以一律把拿到的值都轉成小寫， 方便之後比對。
// 最後我們做兩個簡單的優化：

// 當使用者沒有輸入任何關鍵字時， 畫面顯示全部電影(在 include() 中傳入空字串， 所有項目都會通過篩選） 當使用者輸入的關鍵字找不到符合條件的項目時， 跳出提示

//新增函式
function addToFavorite(id) {
    console.log(id);
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = movies.find((movie) => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
        return alert('此電影已經在收藏清單中！')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

function renderPaginator(amount) {
    //計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
    //製作 template 
    let rawHTML = ''

    for (let page = 1; page <= numberOfPages; page++) {
        rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    //放回 HTML
    paginator.innerHTML = rawHTML
}

// 分頁功能
function getMoviesByPage(page) {
    //新增這裡
    const data = filteredMovies.length ? filteredMovies : movies
    const startIndex = (page - 1) * MOVIES_PER_PAGE
    //修改這裡
    return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}