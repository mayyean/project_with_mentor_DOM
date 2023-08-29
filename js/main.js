let registerUserModalBtn = document.querySelector('#registerUser-modal');
let loginUserModalBtn = document.querySelector('#loginUser-modal');
let registerUserModalBlock = document.querySelector('#registerUser-block');
let loginUserModalBlock = document.querySelector('#loginUser-block');
let registerUserBtn = document.querySelector('#registerUser-btn');
let loginUserBtn = document.querySelector('#loginUser-btn');
let logoutUserBtn = document.querySelector('#logoutUser-btn');
let closeModalBtn = document.querySelector('.btn-close');
let showUsername = document.querySelector('#showUsername');
let adminPanel = document.querySelector('#admin-panel');
let addProductBtn = document.querySelector('.add-product-btn');
let saveChangesBtn = document.querySelector('.save-changes-btn');
let productsList = document.querySelector('#products-list');
let categoriesList = document.querySelector('.dropdown-menu');
let searchForm = document.querySelector('form');
let prevPageBtn = document.querySelector('#prev-page-btn');
let nextPageBtn = document.querySelector('#next-page-btn');
let cartModalBtn = document.querySelector('#cartModal-btn');
let closeCartBtn = document.querySelector('.btn-close-cart');
let cartTable = document.querySelector('table');
let createCartOrderBtn = document.querySelector('#create-cart-order-btn');
let cleanCartBtn = document.querySelector('#clean-cart-btn')
let cartTotalCost = document.querySelector('#cart-total-cost');
// inputs group
let usernameInp = document.querySelector('#reg-username');
let ageInp = document.querySelector('#reg-age');
let passwordInp = document.querySelector('#reg-password');
let passwordConfirmInp = document.querySelector('#reg-passwordConfirm');
let isAdminInp = document.querySelector('#isAdmin');
let loginUsernameInp = document.querySelector('#login-username');
let loginPasswordInp = document.querySelector('#login-password');
let productTitle = document.querySelector('#product-title');
let productPrice = document.querySelector('#product-price');
let productDesc = document.querySelector('#product-desc');
let productImage = document.querySelector('#product-image');
let productCategory = document.querySelector('#product-category');
let searchInp = document.querySelector('#search-inp');

// account logic
registerUserModalBtn.addEventListener('click', () => {
    registerUserModalBlock.setAttribute('style', 'display: flex !important;');
    registerUserBtn.setAttribute('style', 'display: block !important;');
    loginUserModalBlock.setAttribute('style', 'display: none !important;');
    loginUserBtn.setAttribute('style', 'display: none !important;');
});

loginUserModalBtn.addEventListener('click', () => {
    registerUserModalBlock.setAttribute('style', 'display: none !important;');
    registerUserBtn.setAttribute('style', 'display: none !important;');
    loginUserModalBlock.setAttribute('style', 'display: flex !important;');
    loginUserBtn.setAttribute('style', 'display: block !important;');
});

// register
const USERS_API = 'http://localhost:8000/users';

async function checkUniqueUsername(username) {
    let res = await fetch(USERS_API);
    let users = await res.json();
    return users.some(user => user.username === username);
};

async function registerUser() {
    if(
        !usernameInp.value.trim() ||
        !ageInp.value.trim() ||
        !passwordInp.value.trim() ||
        !passwordConfirmInp.value.trim()
    ) {
        alert('Some inputs are empty!');
        return;
    };

    let uniqueUsername = await checkUniqueUsername(usernameInp.value);

    if(uniqueUsername) {
        alert('User with this username already exists!');
        return;
    };

    if(passwordInp.value !== passwordConfirmInp.value) {
        alert('Passwords don\'t match!');
        return;
    };

    let userObj = {
        username: usernameInp.value,
        age: ageInp.value,
        password: passwordInp.value,
        isAdmin: isAdmin.checked
    };

    fetch(USERS_API, {
        method: 'POST',
        body: JSON.stringify(userObj),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    usernameInp.value = '';
    ageInp.value = '';
    passwordInp.value = '';
    passwordConfirmInp.value = '';
    isAdminInp.checked = false;

    closeModalBtn.click();
};

registerUserBtn.addEventListener('click', registerUser);

// login
function checkLoginLogoutStatus() {
    let user = localStorage.getItem('user');
    if(!user) {
        loginUserModalBtn.parentNode.style.display = 'block';
        logoutUserBtn.parentNode.style.display = 'none';
        showUsername.innerText = 'No user';
        cartModalBtn.parentNode.style.display = 'none';
    } else {
        loginUserModalBtn.parentNode.style.display = 'none';
        logoutUserBtn.parentNode.style.display = 'block';
        showUsername.innerText = JSON.parse(user).username;
        cartModalBtn.parentNode.style.display = 'block';
    };

    showAdminPanel();
};
checkLoginLogoutStatus();

function checkUserInUsers(username, users) {
    return users.some(item => item.username === username);
};

function checkUserPassword(user, password) {
    return user.password === password;
};

function setUserToStorage(username, isAdmin) {
    localStorage.setItem('user', JSON.stringify({
        username,
        isAdmin
    }));
};

async function loginUser() {
    if(
        !loginUsernameInp.value.trim() ||
        !loginPasswordInp.value.trim()
    ) {
        alert('Some inpits are empty!');
        return;
    };

    let res = await fetch(USERS_API);
    let users = await res.json();

    if(!checkUserInUsers(loginUsernameInp.value, users)) {
        alert('User not found!');
        return;
    };

    let userObj = users.find(user => user.username === loginUsernameInp.value);

    if(!checkUserPassword(userObj, loginPasswordInp.value)) {
        alert('Wrong password!');
        return;
    };

    setUserToStorage(userObj.username, userObj.isAdmin);

    loginUsernameInp.value = '';
    loginPasswordInp.value = '';

    checkLoginLogoutStatus();

    closeModalBtn.click();

    render();
};

loginUserBtn.addEventListener('click', loginUser);

// logout
logoutUserBtn.addEventListener('click', () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    checkLoginLogoutStatus();
    render();
});

// product logic
function checkUserForProductCreate() {
    let user = JSON.parse(localStorage.getItem('user'));
    if(user) return user.isAdmin;
    return false;
};

function showAdminPanel() {
    if(!checkUserForProductCreate()) {
        adminPanel.setAttribute('style', 'display: none !important;');
    } else {
        adminPanel.setAttribute('style', 'display: flex !important;');
    };
};

// create
const PRODUCTS_API = 'http://localhost:8000/products';

function cleanAdminForm() {
    productTitle.value = '';
    productPrice.value = '';
    productDesc.value = '';
    productImage.value = '';
    productCategory.value = '';
};

async function createProduct() {
    if(
        !productTitle.value.trim() ||
        !productPrice.value.trim() ||
        !productDesc.value.trim() ||
        !productImage.value.trim() ||
        !productCategory.value.trim()
    ) {
        alert('Some inputs are empty!');
        return;
    };

    let productObj = {
        title: productTitle.value,
        price: productPrice.value,
        desc: productDesc.value,
        image: productImage.value,
        category: productCategory.value
    };

    await fetch(PRODUCTS_API, {
        method: 'POST',
        body: JSON.stringify(productObj),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    cleanAdminForm();

    render();
};

addProductBtn.addEventListener('click', createProduct);

// read
let category = '';
let search = '';
let currentPage = 1;

async function render() {
    let requestAPI = `${PRODUCTS_API}?q=${search}&category=${category}&_page=${currentPage}&_limit=2`;
    if(!category) {
        requestAPI = `${PRODUCTS_API}?q=${search}&_page=${currentPage}&_limit=2`;
    };
    productsList.innerHTML = '';
    let res = await fetch(requestAPI);
    let products = await res.json();
    products.forEach(product => {
        productsList.innerHTML += `
        <div class="card m-5" style="width: 18rem;">
            <img src="${product.image}" class="card-img-top" alt="error:(" height="200">
            <div class="card-body">
                <h5 class="card-title">${product.title}</h5>
                <p class="card-text">${product.desc}</p>
                <p class="card-text">${product.category}</p>
                <p class="card-text">${product.price}$</p>
                ${checkUserForProductCreate() ? 
                `<a href="#" class="btn btn-dark btn-edit" id="edit-${product.id}">EDIT</a>
                <a href="#" class="btn btn-danger btn-delete" id="del-${product.id}">DELETE</a>`
                :
                ''
                }
                ${checkLoginUser() ? `
                    <a href="#" class="btn btn-success btn-cart" id="cart-${product.id}">TO CART</a>
                `
                :
                ''
                }
            </div>
        </div>
        `;
    });

    if(products.length === 0) return;
    addDeleteEvent();
    addEditEvent();
    addCategoryToDropdownMenu();
    addCartEvent();
};
render();

// delete
async function deleteProduct(e) {
    let productId = e.target.id.split('-')[1];

    await fetch(`${PRODUCTS_API}/${productId}`, {
        method: 'DELETE'
    });

    render();
};

function addDeleteEvent() {
    let deleteProductBtns = document.querySelectorAll('.btn-delete');
    deleteProductBtns.forEach(btn => btn.addEventListener('click', deleteProduct));
};

// update
function checkCreateAndSaveBtn() {
    if(saveChangesBtn.id) {
        addProductBtn.setAttribute('style', 'display: none;');
        saveChangesBtn.setAttribute('style', 'display: block;');
    } else {
        addProductBtn.setAttribute('style', 'display: block;');
        saveChangesBtn.setAttribute('style', 'display: none;');
    };
};
checkCreateAndSaveBtn();

async function addProductDataToForm(e) {
    let productId = e.target.id.split('-')[1];
    let res = await fetch(`${PRODUCTS_API}/${productId}`);
    let productObj = await res.json();
    
    productTitle.value = productObj.title;
    productPrice.value = productObj.price;
    productDesc.value = productObj.desc;
    productImage.value = productObj.image;
    productCategory.value = productObj.category;

    saveChangesBtn.setAttribute('id', productObj.id);

    checkCreateAndSaveBtn();
};

function addEditEvent() {
    let editProductBtns = document.querySelectorAll('.btn-edit');
    editProductBtns.forEach(btn => btn.addEventListener('click', addProductDataToForm));
};

async function saveChanges(e) {
    let updatedProductObj = {
        id: e.target.id,
        title: productTitle.value,
        price: productPrice.value,
        desc: productDesc.value,
        image: productImage.value,
        category: productCategory.value,
    };

    await fetch(`${PRODUCTS_API}/${e.target.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedProductObj),
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        }
    });

    cleanAdminForm();

    saveChangesBtn.removeAttribute('id');

    checkCreateAndSaveBtn();

    render();
};

saveChangesBtn.addEventListener('click', saveChanges);

// filtering
async function addCategoryToDropdownMenu() {
    let res = await fetch(PRODUCTS_API);
    let data = await res.json();
    let categories = new Set(data.map(product => product.category));
    categoriesList.innerHTML = '<li><a class="dropdown-item" href="#">all</a></li>';
    categories.forEach(category => {
        categoriesList.innerHTML += `
            <li><a class="dropdown-item" href="#">${category}</a></li>
        `;
    });
    addClickEventOnDropdownItem();
};

function filterOnCategory(e) {
    let categoryText = e.target.innerText;
    if(categoryText === 'all') {
        category = '';
    } else {
        category = categoryText;
    };
    render();
};

function addClickEventOnDropdownItem() {
    let categoryItems = document.querySelectorAll('.dropdown-item');
    categoryItems.forEach(item => item.addEventListener('click', filterOnCategory));
};

// search
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    search = searchInp.value;
    render();
});

// pagination
async function getPagesCount() {
    let res = await fetch(PRODUCTS_API);
    let products = await res.json();
    let pagesCount = Math.ceil(products.length / 2);
    return pagesCount;
};

async function checkPages() {
    let maxPagesNum = await getPagesCount();
    if(currentPage === 1) {
        prevPageBtn.setAttribute('style', 'display: none;');
        nextPageBtn.setAttribute('style', 'display: block;');
    } else if(currentPage === maxPagesNum) {
        prevPageBtn.setAttribute('style', 'display: block;');
        nextPageBtn.setAttribute('style', 'display: none;');
    } else {
        prevPageBtn.setAttribute('style', 'display: block;');
        nextPageBtn.setAttribute('style', 'display: block;');
    };
};
checkPages();

prevPageBtn.addEventListener('click', () => {
    currentPage--;
    checkPages();
    render();
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    checkPages();
    render();
});

// cart logic
function checkLoginUser() {
    let user = JSON.parse(localStorage.getItem('user'));
    return user;
};

// add product to cart
async function getProductObjectById(productId) {
    let res = await fetch(`${_API}/${productId}`);
    let productObj = await res.json();
    return productObj;
};

function countCartTotalCost(products) {
    let cartTotalCost = products.reduce((acc, currentItem) => {
        return acc + currentItem.totalCost;
    }, 0);
    return cartTotalCost;
};

function addNewProductToCart(productCartObj) {
    let cartObj = JSON.parse(localStorage.getItem('cart'));
    cartObj.products.push(productCartObj);
    cartObj.totalCost = countCartTotalCost(cartObj.products);
    localStorage.setItem('cart', JSON.stringify(cartObj));
};

function addCartObjToLocalStorage() {
    let cartOwner = JSON.parse(localStorage.getItem('user'));
    let cartObj = {
        id: Date.now(),
        owner: cartOwner.username,
        totalCost: 0,
        products: []
    };
    localStorage.setItem('cart', JSON.stringify(cartObj));
};

async function addProductToCart(e) {
    let productId = e.target.id.split('-')[1];
    let productObj = await getProductObjectById(productId);
    let cartProductCount = +prompt('Enter product count for cart');
    let productCartObj = {
        count: cartProductCount,
        totalCost: +productObj.price * cartProductCount,
        productItem: productObj
    };
    let cartObj = JSON.parse(localStorage.getItem('cart'));
    if(cartObj) {
        addNewProductToCart(productCartObj);
    } else {
        addCartObjToLocalStorage();
        addNewProductToCart(productCartObj);
    };
};

function addCartEvent() {
    let cartBtns = document.querySelectorAll('.btn-cart');
    cartBtns.forEach(btn => btn.addEventListener('click', addProductToCart));
};

// render cart
function cartRender() {
    let cartObj = JSON.parse(localStorage.getItem('cart'));
    if(!cartObj) {
        cartTable.innerHTML = '<h3>No products in cart!</h3>';
        cartTotalCost.innerText = 'Total cost: 0$';
        return;
    };
    cartTable.innerHTML = `
        <tr>
            <th class="border border-dark">Image</th>
            <th class="border border-dark">Title</th>
            <th class="border border-dark">Count</th>
            <th class="border border-dark">Price</th>
            <th class="border border-dark">Total</th>
            <th class="border border-dark">Delete</th>
        </tr>
    `;
    cartObj.products.forEach(cartProduct => {
        cartTable.innerHTML += `
        <tr>
            <td class="border border-dark">
            <img src=${cartProduct.productItem.image} alt="error:(" width="50" height="50">
            </td>
            <td class="border border-dark">${cartProduct.productItem.title}</td>
            <td class="border border-dark">${cartProduct.count}</td>
            <td class="border border-dark">${cartProduct.productItem.price}</td>
            <td class="border border-dark">${cartProduct.totalCost}</td>
            <td class="border border-dark">
            <button class="btn btn-danger del-cart-btn" id="cart-product-${cartProduct.productItem.id}">DELETE</button>
            </td>
        </tr>
        `;
    });
    cartTotalCost.innerText = `Total cost: ${cartObj.totalCost}$`;
    addDeleteEventForCartProduct();
};

cartModalBtn.addEventListener('click', cartRender);

// remove product from cart
function deleteProductFromCart(e) {
    let productId = e.target.id.split('-');
    productId = productId[productId.length - 1];
    let cartObj = JSON.parse(localStorage.getItem('cart'));
    cartObj.products = cartObj.products.filter(cartProduct => cartProduct.productItem.id != productId);
    cartObj.totalCost = countCartTotalCost(cartObj.products);
    if(cartObj.products.length === 0) {
        localStorage.removeItem('cart');
    } else {
        localStorage.setItem('cart', JSON.stringify(cartObj));
    };
    cartRender();
};

function addDeleteEventForCartProduct() {
    let delCartProductBtns = document.querySelectorAll('.del-cart-btn');
    delCartProductBtns.forEach(btn => btn.addEventListener('click', deleteProductFromCart));
};

// create order
const ORDERS_API = 'http://localhost:8000/orders';

async function sendOrder(cartObj) {
    await fetch(ORDERS_API, {
        method: 'POST',
        body: JSON.stringify(cartObj),
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        }
    });
};

async function createOrder() {
    let cartObj = JSON.parse(localStorage.getItem('cart'));
    if(!cartObj) {
        alert('No products in cart!');
        return;
    };
    await sendOrder(cartObj);
    localStorage.removeItem('cart');
    cartRender();
};

createCartOrderBtn.addEventListener('click', createOrder);

// clean cart
cleanCartBtn.addEventListener('click', () => {
    localStorage.removeItem('cart');
    cartRender();
});