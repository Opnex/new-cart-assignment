// Global cart array
let cart = [];

// Fetch products from JSON file using try and catch
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded. Initial cart state:', cart);

    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        console.log(products);

        renderProducts(products);
    } catch (error) {
        console.error('Error fetching product data:', error);
    }

    // Add event listeners to cart related actions
    setupCartActions();
});

// Function to render products dynamically
function renderProducts(products) {
    const productContainer = document.getElementById('product-list');
    productContainer.innerHTML = ''; // Clear existing content

    products.forEach((product) => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <picture>
                <source srcset="${product.image.desktop}" media="(min-width: 1024px)">
                <source srcset="${product.image.tablet}" media="(min-width: 768px)">
                <source srcset="${product.image.mobile}" media="(max-width: 767px)">
                <img src="${product.image.thumbnail}" alt="${product.name}">
            </picture>
                <button class="add-to-cart" data-image="${product.image.thumbnail}" data-name="${product.name}" data-price="${product.price}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2">
                    <path d="M5 4h4l3 9h7l3-9h4"></path>
                    <circle cx="10" cy="19" r="2"></circle>
                    <circle cx="18" cy="19" r="2"></circle>
                </svg>
                Add to Cart
            </button>
            <div class="counter-controls" style="display: none;">
                <button onclick="changeQuantityByName('${product.name}', -1)">-</button>
                <span class="quantity">0</span>
                <button onclick="changeQuantityByName('${product.name}', 1)">+</button>
            </div>
            <h4>${product.category}</h4>
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
        `;
        productContainer.appendChild(productItem);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const image = button.getAttribute('data-image');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            console.log(`Adding to cart: ${name} at $${price}`);
            addToCart(image, name, price );
        });
    });
}

// Function to add an item to the cart
function addToCart(image, name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
        console.log(`Increased quantity for ${name}. New quantity: ${existingItem.quantity}`);
    } else {
        cart.push({ image, name, price, quantity: 1 });
        console.log(`Added new item: ${name} with quantity 1`);
    }
    updateCart();
    updateProductButtons();
}

// Add this function to filter products
function searchProducts(query) {
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        const name = item.querySelector('h3').textContent.toLowerCase();
        const category = item.querySelector('h4').textContent.toLowerCase();
        if (name.includes(query.toLowerCase()) || category.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none'
        }
    })
}

// Add event listener for search input
document.getElementById('search-input').addEventListener('input', (e) => {
    searchProducts(e.target.value);
});

//Added `index` parameter to forEach loop
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const cartEmpty = document.getElementById('cart-empty');
    const cartTotalContainer = document.querySelector('.cart-total');
    const confirmButton = document.getElementById('confirm-order');
    const badge = document.querySelector('.cart .badge');

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;

        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        cartItem.innerHTML = `
            <p>${item.name} ${item.quantity}x @ $${item.price.toFixed(2)} $${itemTotal.toFixed(2)}</p>
            <div class="quantity-controls">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="changeQuantity(${index}, 1)">+</button>
                <button class="remove-item" onclick="removeFromCart(${index})">✖</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    cartCount.textContent = itemCount;
    cartTotal.textContent = `$${total.toFixed(2)}`;

    if (cart.length > 0) {
        cartEmpty.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        cartTotalContainer.style.display = 'block';
        confirmButton.style.display = 'block';
        badge.style.display = 'inline-block';
    } else {
        cartEmpty.style.display = 'block';
        cartItemsContainer.style.display = 'none';
        cartTotalContainer.style.display = 'none';
        confirmButton.style.display = 'none';
        badge.style.display = 'none';
    }

    console.log('Cart updated. Current cart:', cart);
    console.log(`Total items: ${itemCount}, Total price: $${total.toFixed(2)}`);
}

function changeQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    if (item.quantity <= 0) {
        cart.splice(index, 1); // Remove item if quantity is 0 or less
    }
    updateCart();
    updateProductButtons();
};

function removeFromCart(index) {
    cart.splice(index, 1); // Remove the item at the specified index
    updateCart();
    updateProductButtons();
};

// Function to update product buttons (Add to Cart vs Counter)
function updateProductButtons() {
    document.querySelectorAll('.product-item').forEach(item => {
        const name = item.querySelector('.add-to-cart').getAttribute('data-name');
        const cartItem = cart.find(cartItem => cartItem.name === name);
        const addButton = item.querySelector('.add-to-cart');
        const counter = item.querySelector('.counter-controls');
        const quantitySpan = counter.querySelector('.quantity');

        if (cartItem) {
            addButton.style.display = 'none';
            counter.style.display = 'flex';
            quantitySpan.textContent = cartItem.quantity;
        } else {
            addButton.style.display = 'flex';
            counter.style.display = 'none';
        }
    });
}

// Function to change the quantity of an item in the cart by name
function changeQuantityByName(name, change) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.name !== name);
        }
    }
    updateCart();
    updateProductButtons();
}

// Function to display the order modal
function showOrderModal() {
    const modal = document.getElementById('order-modal');
    const modalCartItems = document.getElementById('modal-cart-items');
    const modalTotal = document.getElementById('modal-total');

    modalCartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const modalItem = document.createElement('div');
        modalItem.classList.add('cart-item');
        modalItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <p>${item.name}</p>
                <p>${item.quantity}x @ $${item.price.toFixed(2)}</p>
            </div>
            <div class="item-total">$${itemTotal.toFixed(2)}</div>
        `;
        modalCartItems.appendChild(modalItem);
    });

    modalTotal.textContent = `$${total.toFixed(2)}`;
    modal.classList.add('active');
    console.log('Order modal displayed. Order summary:', cart);
    console.log(`Order total: $${total.toFixed(2)}`);
}

function setupCartActions() {
    document.getElementById('confirm-order').addEventListener('click', () => {
        if (cart.length > 0) {
            // Show a confirmation dialog
            const userConfirmed = confirm('Are you sure you want to proceed with the order?');
            if (userConfirmed) {
                console.log('User confirmed the order. Proceeding...');
                showOrderModal();
            } else {
                console.log('User canceled the order.');
            }
        } else {
            console.log('Cannot confirm order: Cart is empty');
        }
    });

    document.getElementById('start-new-order-modal').addEventListener('click', () => {
        console.log('Starting new order. Resetting cart.');
        cart = [];
        updateCart();
        updateProductButtons();
        document.getElementById('order-modal').classList.remove('active');
    });
}
