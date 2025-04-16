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

    // Add event listeners for cart actions
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
            <h3>${product.name}</h3>
            <p>Category: ${product.category}</p>
            <p>Price: $${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-name="${product.name}" data-price="${product.price}">Add to Cart</button>
        `;
        productContainer.appendChild(productItem);
    });

    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            console.log(`Adding to cart: ${name} at $${price}`);
            addToCart(name, price);
        });
    });
}

// Function to add an item to the cart
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
        console.log(`Increased quantity for ${name}. New quantity: ${existingItem.quantity}`);
    } else {
        cart.push({ name, price, quantity: 1 });
        console.log(`Added new item: ${name} with quantity 1`);
    }
    updateCart();
}

// Function to update the cart UI
function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');

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
            <p>${item.name} ${item.quantity}x @ $${item.price.toFixed(2)} = $${itemTotal.toFixed(2)}</p>
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
    console.log('Cart updated. Current cart:', cart);
    console.log(`Total items: ${itemCount}, Total price: $${total.toFixed(2)}`);
}

// Function to change the quantity of an item in the cart
function changeQuantity(index, change) {
    const item = cart[index];
    item.quantity += change;
    if (item.quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCart();
}

// Function to remove an item from the cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
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
            <p>${item.name} ${item.quantity}x @ $${item.price.toFixed(2)}</p>
            <p>$${itemTotal.toFixed(2)}</p>
        `;
        modalCartItems.appendChild(modalItem);
    });

    modalTotal.textContent = `$${total.toFixed(2)}`;
    modal.classList.add('active');
    console.log('Order modal displayed. Order summary:', cart);
    console.log(`Order total: $${total.toFixed(2)}`);
}

// Function to set up cart actions
function setupCartActions() {
    // Confirm Order
    document.getElementById('confirm-order').addEventListener('click', () => {
        if (cart.length > 0) {
            console.log('Confirming order. Current cart:', cart);
            const confirmButton = document.getElementById('confirm-order');
            confirmButton.classList.add('loading');
            setTimeout(() => {
                showOrderModal();
                confirmButton.classList.remove('loading');
            }, 1000);
        } else {
            console.log('Cannot confirm order: Cart is empty');
        }
    });

    // Start New Order
    document.getElementById('start-new-order').addEventListener('click', () => {
        console.log('Starting new order. Resetting cart.');
        cart = [];
        updateCart();
        document.getElementById('order-modal').classList.remove('active');
    });

    // Close Modal
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('order-modal').classList.remove('active');
    });
}