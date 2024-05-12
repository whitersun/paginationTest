const paginationList = selector.querySelectorAll('.page-item');
paginationList.forEach((pagList) => pagList.firstChild.disabled = true);

const fetchAndRender = (offset) => {
    callProductApi(null, offset).then(data => {
        arrayList[currentPage - 1] = data;
        renderProductList(cardList, data);
        renderPagination(selector, data, lastPage, currentPage);

        paginationList.forEach((pagList) => pagList.firstChild.disabled = false);
    });
};

if (isGoingForward) {
    if (arrayList.length >= currentPage) {
        renderProductList(cardList, arrayList[currentPage - 1]);
    } else {
        fetchAndRender((currentPage - 1) * 8);
    }
} else if (isGoingBackward) {
    if (arrayList.length > 0) {
        renderProductList(cardList, arrayList[currentPage - 1]);
    }
}