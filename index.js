function isDomReady (fn) {
    return document.readyState === 'complete' || document.readyState === 'interactive' 
        ? setTimeout(fn, 1) 
        : document.addEventListener('DOMContentLoaded', fn);
}

async function callProductApi (limit, lastData) {
    return fetch(`https://dummyjson.com/products?limit=${limit ? limit : '8'}&skip=${lastData ? lastData : '0'}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data);
            arrayList.push(data);
            return data;
        })
        .catch(error => console.error(error));
}

function skeletonLoading(selector) {
    selector.innerHTML = '';
    const template = document.createElement('template');
    template.innerHTML = `
        <div class="card max-w-full w-full h-[23.25rem]">
            <div class="w-full h-[12rem] bg-slate-300 animate-pulse"></div>
            <div class="card-body">
                <div class="w-full h-6 mb-3 rounded bg-slate-300 animate-pulse"></div>
                <div class="w-full h-6 mb-3 rounded bg-slate-300 animate-pulse"></div>
                <div class="w-full h-6 mb-3 rounded bg-slate-300 animate-pulse"></div>
            </div>
        </div>
    `;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 8; i++) {
        fragment.appendChild(template.content.cloneNode(true));
    }
    selector.appendChild(fragment);
}

function renderProductList (selector, data) {
    const products = data["products"];
    const fragment = document.createDocumentFragment();

    for (const product of products) {
        const { thumbnail, id, title, brand } = product;
        const card = document.createElement('div');
        card.classList.add('card', 'max-w-full', 'w-full');

        const img = document.createElement('img');
        img.src = thumbnail;
        img.classList.add('card-img-top', 'object-fit-cover');
        img.alt = title;
        img.style.height = '12rem';

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const idSubtitle = document.createElement('h6');
        idSubtitle.classList.add('card-subtitle', 'mb-2', 'text-body-secondary');
        idSubtitle.textContent = id;

        const titleHeading = document.createElement('h5');
        titleHeading.classList.add('card-title');
        titleHeading.textContent = title;

        const brandSubtitle = document.createElement('h6');
        brandSubtitle.classList.add('card-subtitle', 'mb-2', 'text-body-secondary');
        brandSubtitle.textContent = brand;

        const cardText = document.createElement('p');
        cardText.classList.add('card-text');
        cardText.textContent = 'Some quick example text to build on the card title and make up the bulk of the card\'s content.';

        cardBody.append(idSubtitle, titleHeading, brandSubtitle, cardText);
        card.append(img, cardBody);
        fragment.appendChild(card);
    }

    selector.innerHTML = '';
    selector.appendChild(fragment);
}

function renderPagination (selector, data, last, current) {
    let lastPage = last ? last : 0
    let currentPage = current ? current : 1;

    const cardList = document.querySelector('.products');
    const paginationElement = selector;

    // console.log(data);
    listTotal = Object.hasOwn(data, 'total') ? data.total : listTotal;

    // create pagination
    const paginationList = Array.from({ length: listTotal }, (_, index) => index + 1)
        // .slice(0, 3)
        .slice(lastPage, currentPage > 2 ? (currentPage + 1) : 3)
        .map((num) => {
            return `<li class="page-item ${num === currentPage ? 'active' : ''}"  ${num === currentPage ? 'aria-current="page"' : ''} >
                <a class="page-link" data-page="${num}" href="#${num}">${num}</a>
            </li>`
        }).join('');

    paginationElement.innerHTML = `
        <li class="page-item">
            <a class="page-link" href="#" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
        
        ${paginationList}

        <li class="page-item">
            <a class="page-link" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;

    [...paginationElement.children].forEach((pagList) => {
        pagList.addEventListener('click', function (event) {
            const targetPage = parseInt(event.target.dataset.page);
            
            if (targetPage === parseInt(lastClicked)) {
                return;
            }

            const isGoingToFirstPage = targetPage === 1;
            const isGoingToSecondPage = targetPage === 2;
            const isGoingForward = targetPage > parseInt(lastClicked);
            const isGoingBackward = targetPage < parseInt(lastClicked);
            
            if (isGoingToFirstPage || isGoingToSecondPage) {
                lastPage = 0;
            } else if (isGoingForward) {
                lastPage = targetPage <= 2 ? 1 : targetPage - 2;
            } else if (isGoingBackward) {
                lastPage = targetPage - 2;
            }

            currentPage = targetPage
            lastClicked = currentPage;

            // renderPagination(selector, data, lastPage, currentPage);

            skeletonLoading(cardList);
            
            const paginationList = selector.querySelectorAll('.page-item');
            paginationList.forEach((pagList) => pagList.firstChild.disable = true);

            const fetchAndRender = (offset) => {
                callProductApi(null, offset).then(data => {
                    renderProductList(cardList, data);
                    renderPagination(selector, data, lastPage, currentPage);

                    paginationList.forEach((pagList) => pagList.firstChild.disable = false);
                });
            };

            console.log(arrayList.length, currentPage);

            if (isGoingForward) {
                const paginationList = selector.querySelectorAll('.page-item');
                paginationList.forEach((pagList) => pagList.firstChild.disable = true);

                if (arrayList.length > 0) {
                    if (arrayList.length >= currentPage) {
                        renderProductList(cardList, arrayList[currentPage - 1]);
                        renderPagination(selector, data, lastPage, currentPage);

                        paginationList.forEach((pagList) => pagList.firstChild.disable = false);
                    } else {
                        fetchAndRender((currentPage - 1) * 8);
                    }
                } else {
                    fetchAndRender((currentPage - 1) * 8);
                }
            } else if (isGoingBackward) {
                if (arrayList.length > 0) {
                    renderProductList(cardList, arrayList[currentPage - 1]);
                    renderPagination(selector, data, lastPage, currentPage);
                }
            }
        })
    })
}

let listTotal = 0;
let lastClicked = 0;
const arrayList = [];

isDomReady(() => {
    const selector = document.querySelector('.products');
    const pagination = document.querySelector('.pagination')

    skeletonLoading(selector);
    callProductApi().then(data => {
        renderProductList(selector, data);
        renderPagination(pagination, data, 0);
    });
});