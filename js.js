const API_URL = 'https://johnrick-auto-backend-production.up.railway.app';

// ---------------- NAVBAR UPDATE ----------------
// Function to update navbar based on user role
function updateNavbar() {
  const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
  const admin = JSON.parse(sessionStorage.getItem('admin') || 'null');
  
  const loginButton = $('#loginButton');
  const userDropdown = $('#userDropdown');
  const adminLink = $('#adminLink');
  
  if (customer) {
    // Customer logged in - show dropdown
    if (loginButton.length) loginButton.hide();
    if (userDropdown.length) {
      userDropdown.show();
      $("#customerName").text(customer.name);
    }
    if (adminLink.length) adminLink.hide();
  } else if (admin) {
    // Admin logged in - show dropdown and admin link
    if (loginButton.length) loginButton.hide();
    if (userDropdown.length) {
      userDropdown.show();
      $("#customerName").text(admin.username);
    }
    if (adminLink.length) adminLink.show();
  } else {
    // Not logged in - show login button only
    if (loginButton.length) loginButton.show();
    if (userDropdown.length) userDropdown.hide();
    if (adminLink.length) adminLink.hide();
  }
}

// Function to update cart badge
function updateCartBadge() {
  const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  const badge = $('#cartBadge');
  
  if (cart.length > 0) {
    badge.text(cart.length).show();
  } else {
    badge.hide();
  }
}

// Call on page load
$(document).ready(function() {
  updateNavbar();
  updateCartBadge(); // ← Add this
});

// ---------------- PRODUCTS ----------------
let products = [];
let categories = [];
let cart = JSON.parse(sessionStorage.getItem('cart')) || [];

// ---------------- SEARCH & FILTER ----------------

let filteredProducts = [];
let currentCategory = 'All Categories';
let currentSearchTerm = '';

// Category filter
$(document).on("change", ".search-form .form-select", function() {
  currentCategory = $(this).val();
  applyFilters();
});

// Search functionality
$(document).on("input", ".search-form input[type='search']", function() {
  currentSearchTerm = $(this).val().toLowerCase();
  applyFilters();
});

// Search button click
$(document).on("click", ".search-form .btn-danger", function(e) {
  e.preventDefault();
  applyFilters();
});

// Apply both category and search filters
function applyFilters() {
  filteredProducts = products.filter(product => {
    // Category filter
    let categoryMatch = true;
    if (currentCategory !== 'All Categories') {
      categoryMatch = product.category_name === currentCategory;
    }
    
    // Search filter
    let searchMatch = true;
    if (currentSearchTerm) {
      searchMatch = product.name.toLowerCase().includes(currentSearchTerm);
    }
    
    return categoryMatch && searchMatch;
  });
  
  renderFilteredProducts();
}

// Render filtered products
function renderFilteredProducts() {
  if ($("#product-list").length) {
    $("#product-list").html('');
    
    const productsToShow = filteredProducts.length > 0 || currentCategory !== 'All Categories' || currentSearchTerm 
      ? filteredProducts 
      : products;
    
    if (productsToShow.length === 0) {
      $("#product-list").html(`
        <div class="col-12 text-center py-5">
          <div class="alert alert-info">
            <i class="fa fa-search fa-2x mb-3"></i>
            <h5>No products found</h5>
            <p class="mb-0">Try adjusting your search or filter criteria</p>
          </div>
        </div>
      `);
      return;
    }
    
    productsToShow.forEach((p) => {
      const isOutOfStock = p.stock <= 0;
      
      $("#product-list").append(`
        <div class="product-card">
          <!-- Image Container -->
          <div class="product-image-container">
            <img src="${p.image}" alt="${p.name}">
            ${isOutOfStock ? 
              '<div class="out-of-stock-overlay">OUT OF STOCK</div>' : 
              `<span class="stock-badge">${p.stock}</span>`
            }
          </div>
          
          <!-- Product Info -->
          <div class="product-info">
            <div class="product-title">${p.name}</div>
            <span class="product-price">₱${parseFloat(p.price).toFixed(2)}</span>
            <button class="btn-add-to-cart addCart" data-id="${p.id}" ${isOutOfStock ? 'disabled' : ''}>
              <i class="fa fa-shopping-cart"></i> ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      `);
    });
  }
}

// Load categories for search dropdown
async function loadCategoriesForSearch() {
  try {
    const response = await fetch(`${API_URL}/api/categories`);
    categories = await response.json();
    
    // Update search dropdown on index page
    if ($(".search-form .form-select").length) {
      $(".search-form .form-select").html('<option>All Categories</option>');
      categories.forEach(cat => {
        $(".search-form .form-select").append(`<option>${cat.name}</option>`);
      });
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

// Load products from database
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();
    await loadCategoriesForSearch();
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Error loading products. Make sure the server is running on http://localhost:3000');
  }
}

// Render products on index.html
function renderProducts() {
  // Initialize filters when products are loaded
  filteredProducts = products;
  currentCategory = 'All Categories';
  currentSearchTerm = '';
  
  if ($("#product-list").length) {
    renderFilteredProducts();
  }
}

async function loadManufacturers() {
    try {
        const response = await fetch(`${API_URL}/api/manufacturers`);
        const manufacturers = await response.json();
        
        // Find the container for logos (check your index.html for this ID)
        const container = $('#manufacturersList'); 

        if (container.length) {
            container.empty();
            manufacturers.forEach(man => {
                container.append(`
                    <div class="col-md-2 text-center mb-4">
                        <img src="${man.logo}" class="img-fluid" alt="${man.name}">
                        <p>${man.name}</p>
                    </div>
                `);
            });
        }
    } catch (error) {
        console.error('Error loading manufacturers:', error);
    }
}

// Show toast notification
function showNotification(message, type = "success") {
  // Create toast container if it doesn't exist
  if (!$('#toastContainer').length) {
    $('body').append(`
      <div id="toastContainer" class="position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      </div>
    `);
  }
  
  // Define colors based on type
  const colors = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-danger',
    info: 'bg-info'
  };
  
  const bgColor = colors[type] || 'bg-success';
  
  // Create unique toast ID
  const toastId = 'toast-' + Date.now();
  
  // Add toast HTML
  $('#toastContainer').append(`
    <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          <i class="fa ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `);
  
  // Show toast
  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000
  });
  toast.show();
  
  // Remove toast from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', function() {
    toastElement.remove();
  });
}

// Add to cart
$(document).on("click", ".addCart", async function() {
  let id = $(this).data("id");
  let product = products.find(p => p.id === id);
  
  if (product && product.stock > 0) {
    // Check if product already in cart
    const cartItem = cart.find(item => item.id === id);
    
    if (cartItem) {
      // Increase quantity if already in cart
      cartItem.quantity = (cartItem.quantity || 1) + 1;
      
      // Check if we have enough stock
      if (cartItem.quantity > product.stock) {
        showNotification("Not enough stock available!", "warning");
        cartItem.quantity--; // Revert the increase
        return;
      }
    } else {
      // Add new item to cart with quantity
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    
    // Save to BOTH sessionStorage AND localStorage
    sessionStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show notification
    showNotification(`${product.name} added to cart!`, "success");
    
    // Update cart badge
    updateCartBadge();
    
    loadProducts(); // Reload to refresh display
  }
});

// ---------------- CART ----------------

// Load cart on cart page
if ($("#cartItems").length) {
  // First, load products so we can check stock
  loadProducts().then(() => {
    cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    console.log('Cart loaded:', cart);
    
    // Auto-fill customer info if logged in
    const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
    if (customer) {
      $("#checkoutName").val(customer.name);
      $("#checkoutEmail").val(customer.email);
      $("#checkoutAddress").val(customer.address);
    }
    
    updateCart();
    updateCartBadge();
  });
}

function updateCart() {
  $("#cartItems").html("");
  let total = 0;
  
  console.log('Updating cart, items:', cart.length); // Debug
  
  if (cart.length === 0) {
    $("#emptyCart").show();
    $("#cartTable").hide();
    $("#checkoutSection").hide();
    $("#cartTotal").text("Total: ₱0");
    return;
  }
  
  $("#emptyCart").hide();
  $("#cartTable").show();
  $("#checkoutSection").show();
  
  // Group items by product ID
  const groupedItems = {};
  cart.forEach((item, index) => {
    if (groupedItems[item.id]) {
      groupedItems[item.id].quantity++;
      groupedItems[item.id].indices.push(index);
    } else {
      groupedItems[item.id] = {
        ...item,
        quantity: 1,
        indices: [index]
      };
    }
    total += item.price;
  });
  
  // Display grouped items
  Object.values(groupedItems).forEach((item) => {
    const itemTotal = item.price * item.quantity;
    
    $("#cartItems").append(`
      <tr>
        <td>${item.name}</td>
        <td>₱${item.price}</td>
        <td>
          <div class="d-flex align-items-center">
            <button class="btn btn-sm btn-outline-secondary decreaseQty" data-id="${item.id}">-</button>
            <span class="mx-2">${item.quantity}</span>
            <button class="btn btn-sm btn-outline-secondary increaseQty" data-id="${item.id}">+</button>
          </div>
        </td>
        <td>₱${itemTotal}</td>
        <td><button class="btn btn-sm btn-danger removeAllFromCart" data-id="${item.id}">Remove</button></td>
      </tr>
    `);
  });
  
  $("#cartTotal").text("Total: ₱" + total);
}

// --- INCREASE CART QUANTITY ---

function changeQuantity(productId, type) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let itemIndex = cart.findIndex(item => item.id == productId);

    if (itemIndex > -1) {
        if (type === 'increment') {
            // FIX: Increment the quantity
            cart[itemIndex].quantity++;
        } else if (type === 'decrement') {
            // Existing decrement logic
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity === 0) {
                // Remove item if quantity drops to 0
                cart.splice(itemIndex, 1);
            }
        }
        
        // Save and update UI
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart(); // Assumes this is where your cart table is redrawn
        updateCartBadge();
    }
}

// Remove from cart
$(document).on("click", ".removeCart", function() {
  let index = $(this).data("id");
  
  // Remove item from cart
  cart.splice(index, 1);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
});

// Remove all items of a product from cart
$(document).on("click", ".removeAllFromCart", function() {
  let productId = $(this).data("id");
  
  // Remove all instances of this product
  cart = cart.filter(item => item.id !== productId);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
});

// Increase quantity
$(document).on("click", ".increaseQty", function() {
  let productId = $(this).data("id");
  let product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  // Count current quantity in cart
  const currentQty = cart.filter(item => item.id === productId).length;
  
  // Check stock availability
  if (currentQty >= product.stock) {
    showNotification(`Sorry, only ${product.stock} items available in stock`, "warning");
    return;
  }
  
  // Add one more to cart
  cart.push(product);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
  updateCartBadge(); // ← Add this
});

// Decrease quantity
$(document).on("click", ".decreaseQty", function() {
  let productId = $(this).data("id");
  
  // Find first instance of this product in cart
  const index = cart.findIndex(item => item.id === productId);
  
  if (index !== -1) {
    cart.splice(index, 1);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
	updateCartBadge(); // ← Add this
  }
});

// Checkout
$("#checkoutForm").submit(async function(e) {
  e.preventDefault();
  
  console.log('=== CHECKOUT STARTED ===');
  
  // Check if customer is logged in
  const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
  
  if (!customer) {
    showNotification("Please login to place an order", "warning");
    
    // Open login modal after a short delay
    setTimeout(() => {
      const loginModal = new bootstrap.Modal(document.getElementById('customerLoginModal'));
      loginModal.show();
    }, 1000);
    
    return;
  }
  
  // Get cart from localStorage instead of global cart variable
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if (cart.length === 0) {
    showNotification('Your cart is empty!', 'warning');
    return;
  }
  
  // Get form values
  const customerName = $("#checkoutName").val();
  const email = $("#checkoutEmail").val();
  const address = $("#checkoutAddress").val();
  const paymentMethod = $("#checkoutPayment").val();
  
  console.log('Form values:', { customerName, email, address, paymentMethod });
  console.log('Cart items:', cart);
  
  // Validate form values
  if (!customerName || !email || !address || !paymentMethod) {
    showNotification('Please fill in all fields', 'warning');
    return;
  }
  
  // Group cart items by product ID and count quantities
  const itemQuantities = {};
  cart.forEach(item => {
    if (itemQuantities[item.id]) {
      itemQuantities[item.id].quantity += item.quantity || 1;
    } else {
      itemQuantities[item.id] = {
        ...item,
        quantity: item.quantity || 1
      };
    }
  });
  
  console.log('Item quantities:', itemQuantities);
  
  // Fetch fresh product data from server to check current stock
  let stockError = false;
  try {
    console.log('Fetching fresh product data for stock validation...');
    const response = await fetch(`${API_URL}/api/api/products`);
    const freshProducts = await response.json();
    console.log('Fresh products:', freshProducts);
    
    // Check stock availability with fresh data
    for (let id in itemQuantities) {
      const item = itemQuantities[id];
      const currentProduct = freshProducts.find(p => p.id == id);
      
      console.log(`Checking stock for ${item.name}: need ${item.quantity}, available ${currentProduct ? currentProduct.stock : 0}`);
      
      if (!currentProduct) {
        alert(`Product ${item.name} no longer exists.`);
        stockError = true;
        break;
      }
      
      if (currentProduct.stock < item.quantity) {
        alert(`Sorry, not enough stock for ${item.name}. Available: ${currentProduct.stock}, Requested: ${item.quantity}`);
        stockError = true;
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching fresh product data:', error);
    alert('Error checking stock availability. Please try again.');
    return;
  }
  
  if (stockError) {
    return;
  }
  
  // Calculate total amount from cart items
  let totalAmount = 0;
  for (let id in itemQuantities) {
    const item = itemQuantities[id];
    totalAmount += item.price * item.quantity;
  }
  
  console.log('Total amount calculated:', totalAmount);

  const orderData = {
    customer_id: customer.id,
    customer_name: customerName,
    customer_email: email,
    customer_address: address,
    payment_method: paymentMethod,
    total_amount: totalAmount,
    items: Object.values(itemQuantities).map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }))
  };
  
  console.log('Order data to send:', orderData);
  
  try {
    // Place order
    console.log('Sending order to server...');
    const response = await fetch(`${API_URL}/api/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    console.log('Order response status:', response.status);
    
    const result = await response.json();
    console.log('Order result:', result);
    
    if (response.ok && result.orderId) {
      console.log('✓ Order placed successfully:', result);
      
      // Reduce stock for each item
      for (let id in itemQuantities) {
        const item = itemQuantities[id];
        
        // Fetch current stock
        const freshResponse = await fetch(`${API_URL}/api/api/products`);
        const freshProducts = await freshResponse.json();
        const currentProduct = freshProducts.find(p => p.id == id);
        
        if (currentProduct) {
          const newStock = currentProduct.stock - item.quantity;
          console.log(`Reducing stock for ${item.name}: ${currentProduct.stock} - ${item.quantity} = ${newStock}`);
          
          await fetch(`${API_URL}/api/api/products/${id}/stock`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock: newStock })
          });
        }
      }
      
      // Show receipt modal
      if (result.receiptData) {
        showReceipt(result.receiptData);
      } else {
        // Fallback if receiptData is missing
        const fallbackData = {
          orderId: result.orderId,
          customer_name: customerName,
          email: email,
          address: address,
          payment_method: paymentMethod,
          items: Object.values(itemQuantities),
          total: totalAmount,
          order_date: new Date().toISOString(),
          emailSent: false
        };
        showReceipt(fallbackData);
      }
      
      // Clear cart from localStorage
      localStorage.removeItem('cart');
      
      // Also clear old sessionStorage cart if it exists
      sessionStorage.removeItem('cart');
      
      // Reload cart display
      if (typeof loadCartFromLocalStorage === 'function') {
        loadCartFromLocalStorage();
      }
      
      // Update cart badge
      if (typeof updateCartCount === 'function') {
        updateCartCount();
      }
      
      // Reset form
      $(this)[0].reset();
      
      // Reload products to show updated stock
      if (typeof loadProducts === 'function') {
        await loadProducts();
      }
    } else {
      console.error('❌ Order failed:', result);
      alert('Error placing order: ' + (result.error || result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Error placing order:', error);
    alert('Error placing order: ' + error.message);
  }
  
  console.log('=== CHECKOUT ENDED ===');
});

// Show receipt modal
function showReceipt(receiptData) {
  try {
    console.log('Showing receipt with data:', receiptData);
    
    if (!receiptData) {
      console.error('No receipt data provided');
      alert('Order placed successfully! Order ID: (check server logs)');
      return;
    }
    
    const { orderId, customer_name, email, address, payment_method, items, total, order_date, emailSent } = receiptData;
    
    // Validate required fields
    if (!orderId || !items) {
      console.error('Missing required receipt fields');
      alert('Order placed successfully! Order ID: ' + (orderId || 'Unknown'));
      return;
    }
    
    // Build items table
    let itemsHTML = '';
    items.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      itemsHTML += `
        <tr>
          <td>${item.name || 'Unknown Product'}</td>
          <td class="text-center">${item.quantity || 1}</td>
          <td class="text-end">₱${(item.price || 0).toFixed(2)}</td>
          <td class="text-end">₱${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    });
    
    const receiptHTML = `
      <div class="receipt-container" style="padding: 20px;">
        <div class="text-center mb-4">
          <h2 style="color: #d60000;">JOHNRICK AUTO SUPPLY</h2>
          <p class="mb-1">Phone: 0917-703-0700</p>
          <p class="text-muted">Thank you for your purchase!</p>
        </div>
        
        <hr>
        
        <div class="row mb-3">
          <div class="col-6">
            <strong>Order ID:</strong><br>
            <span class="text-primary">#${orderId}</span>
          </div>
          <div class="col-6 text-end">
            <strong>Date:</strong><br>
            ${order_date ? new Date(order_date).toLocaleString() : new Date().toLocaleString()}
          </div>
        </div>
        
        <hr>
        
        <div class="mb-3">
          <strong>Customer Information:</strong><br>
          <div class="ms-3 mt-2">
            Name: ${customer_name || 'N/A'}<br>
            Email: ${email || 'N/A'}<br>
            Address: ${address || 'N/A'}<br>
            Payment: ${payment_method || 'N/A'}
          </div>
        </div>
        
        <hr>
        
        <div class="mb-3">
          <strong>Order Items:</strong>
          <table class="table table-sm mt-2">
            <thead class="table-dark">
              <tr>
                <th>Product</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Price</th>
                <th class="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
            <tfoot>
              <tr class="table-success">
                <th colspan="3" class="text-end">Total:</th>
                <th class="text-end">₱${(total || 0).toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <hr>
        
        <div class="alert ${emailSent ? 'alert-success' : 'alert-warning'}" id="emailStatus">
          <i class="fa ${emailSent ? 'fa-check-circle' : 'fa-info-circle'} me-2"></i>
          <strong>${emailSent ? 'Email Sent!' : 'Email Not Configured'}</strong><br>
          <small>${emailSent ? 'Order confirmation sent to ' + email : 'Your order is confirmed! Email notifications are currently disabled.'}</small>
        </div>
        
        <div class="alert alert-info">
          <i class="fa fa-exclamation-triangle me-2"></i>
          <strong>What's Next?</strong><br>
          <small>
            • We will contact you to arrange delivery<br>
            • Keep your Order ID for reference: <strong>#${orderId}</strong><br>
            • For questions, call/text: <strong>0917-703-0700</strong>
          </small>
        </div>
      </div>
    `;
    
    $('#receiptContent').html(receiptHTML);
    
    // Show modal - try multiple methods
    const modalElement = document.getElementById('receiptModal');
    
    if (!modalElement) {
      console.error('Modal element not found!');
      alert('Order placed successfully! Order ID: #' + orderId + '\n\nCheck your email for confirmation.');
      return;
    }
    
    // Method 1: Try Bootstrap 5
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      try {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('✅ Modal shown using Bootstrap 5');
        return;
      } catch (error) {
        console.error('Bootstrap Modal error:', error);
      }
    }
    
    // Method 2: Fallback - show modal manually
    console.log('Using fallback modal display');
    $(modalElement).addClass('show').css('display', 'block');
    $('body').append('<div class="modal-backdrop fade show"></div>');
    
    // Add close handlers
    $(modalElement).find('[data-bs-dismiss="modal"]').on('click', function() {
      $(modalElement).removeClass('show').css('display', 'none');
      $('.modal-backdrop').remove();
    });
    
  } catch (error) {
    console.error('Error showing receipt:', error);
    alert('Order placed successfully! Order ID: #' + (receiptData?.orderId || 'Unknown') + '\n\nYour order has been confirmed.');
  }
}

// ---------------- ADMIN - CATEGORIES ----------------

if ($("#adminCategoryList").length) {
  loadCategories();
}

async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/api/api/categories`);
    categories = await response.json();
    renderCategories();
    updateCategoryDropdowns();
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

function renderCategories() {
  $("#adminCategoryList").html("");
  
  categories.forEach((cat) => {
    // Count products in this category
    const productCount = products.filter(p => p.category_id === cat.id).length;
    
    $("#adminCategoryList").append(`
      <tr>
        <td>${cat.name}</td>
        <td>${productCount} products</td>
        <td>
          <button class="btn btn-sm btn-danger deleteCategory" data-id="${cat.id}" ${productCount > 0 ? 'disabled' : ''}>
            ${productCount > 0 ? 'Has Products' : 'Delete'}
          </button>
        </td>
      </tr>
    `);
  });
}

// Add category
$("#categoryForm").submit(async function(e) {
  e.preventDefault();
  
  const newCategory = {
    name: $("#catname").val()
  };
  
  try {
    await fetch(`${API_URL}/api/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    });
    
    alert('Category added successfully!');
    await loadCategories();
    $(this)[0].reset();
  } catch (error) {
    console.error('Error adding category:', error);
    alert('Error adding category');
  }
});

// Delete category
$(document).on("click", ".deleteCategory", async function() {
  let id = $(this).data("id");
  
  if (confirm('Are you sure you want to delete this category?')) {
    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Category deleted successfully!');
        await loadCategories();
        await loadAdminProducts();
      } else {
        const result = await response.json();
        alert(result.error || 'Cannot delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error deleting category');
    }
  }
});

// ---------------- ADMIN - CUSTOMERS ----------------

// Load customers on admin page when Customers tab is visible
if ($("#adminCustomerList").length) {
  console.log('Admin customer list element found');
  
  // Load immediately if on page
  loadAdminCustomers();
  
  // Also load when Customers tab is clicked
  $('a[href="#customers"]').on('shown.bs.tab', function (e) {
    console.log('Customers tab activated, loading customers...');
    loadAdminCustomers();
  });
}

async function loadAdminCustomers() {
  console.log('=== Loading customers ===');
  
  try {
    console.log('Fetching from:', `${API_URL}/api/customers`);
    
    const response = await fetch(`${API_URL}/api/customers`);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const customers = await response.json();
    console.log('Customers received:', customers);
    console.log('Number of customers:', customers.length);
    
    // Hide debug message
    $('#customerDebug').hide();
    
    renderAdminCustomers(customers);
  } catch (error) {
    console.error('Error loading customers:', error);
    $('#customerDebug').removeClass('alert-info').addClass('alert-danger')
      .html('<i class="fa fa-exclamation-triangle"></i> Error loading customers: ' + error.message);
    
    $("#adminCustomerList").html(`
      <tr>
        <td colspan="7" class="text-center text-danger">
          <i class="fa fa-exclamation-triangle me-2"></i>
          Error loading customers. Check browser console (F12) for details.
          <br><small>Make sure server is running and customers table exists.</small>
        </td>
      </tr>
    `);
  }
}

function renderAdminCustomers(customers) {
  console.log('Rendering customers...');
  $("#adminCustomerList").html("");
  
  if (!customers || customers.length === 0) {
    console.log('No customers to display');
    $("#adminCustomerList").html(`
      <tr>
        <td colspan="7" class="text-center text-muted">
          <i class="fa fa-users me-2"></i>
          No customers registered yet. 
          <br><small>Customers will appear here after they sign up.</small>
        </td>
      </tr>
    `);
    return;
  }
  
  console.log(`Rendering ${customers.length} customers`);
  
  customers.forEach((customer, index) => {
    console.log(`Rendering customer ${index + 1}:`, customer.name);
    
    const createdDate = customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A';
    
    $("#adminCustomerList").append(`
      <tr>
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td>${customer.phone || 'N/A'}</td>
        <td>${customer.address || 'N/A'}</td>
        <td>${createdDate}</td>
        <td>
          <button class="btn btn-sm btn-danger deleteCustomer" data-id="${customer.id}">
            <i class="fa fa-trash me-1"></i> Delete
          </button>
        </td>
      </tr>
    `);
  });
  
  console.log('Customers rendered successfully');
}

// Delete customer
$(document).on("click", ".deleteCustomer", async function() {
  let id = $(this).data("id");
  console.log('Deleting customer:', id);
  
  if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
    try {
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Customer deleted successfully!');
        loadAdminCustomers();
      } else {
        const error = await response.json();
        alert('Error deleting customer: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Error deleting customer. Check console for details.');
    }
  }
});

function updateCategoryDropdowns() {
  const dropdowns = ['#pcategory', '#editPcategory'];
  
  dropdowns.forEach(selector => {
    if ($(selector).length) {
      const currentValue = $(selector).val();
      $(selector).html('<option value="">Select Category</option>');
      categories.forEach(cat => {
        $(selector).append(`<option value="${cat.id}">${cat.name}</option>`);
      });
      if (currentValue) {
        $(selector).val(currentValue);
      }
    }
  });
}

// ---------------- ADMIN - PRODUCTS ----------------

if ($("#adminProductList").length) {
  loadAdminProducts();
}

async function loadAdminProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    products = await response.json();
    await loadCategories(); // Load categories first
    renderAdminProducts();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function renderAdminProducts() {
  $("#adminProductList").html("");
  products.forEach((p) => {
    $("#adminProductList").append(`
      <tr>
        <td>${p.name}</td>
        <td>${p.category_name || 'No Category'}</td>
        <td>₱${p.price}</td>
        <td>${p.stock}</td>
        <td><img src="${p.image}" width="50"></td>
        <td>
          <button class="btn btn-sm btn-primary editProduct" data-id="${p.id}">Edit</button>
          <button class="btn btn-sm btn-danger deleteProduct" data-id="${p.id}">Delete</button>
        </td>
      </tr>
    `);
  });
}

// Add product
$("#productForm").submit(async function(e) {
  e.preventDefault();
  
  const newProduct = {
    name: $("#pname").val(),
    price: parseFloat($("#pprice").val()),
    stock: parseInt($("#pstock").val()),
    image: $("#pimage").val(),
    category_id: parseInt($("#productCategory").val())
  };
  
  if (!newProduct.category_id) {
    alert('Please select a category');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    
    const createdProduct = await response.json();
    
    if (response.ok && createdProduct.id) {
      // Get selected manufacturers
      const manufacturerIds = getSelectedManufacturers('manufacturerCheckboxes');
      
      // Assign manufacturers to the new product
      if (manufacturerIds.length > 0) {
        await assignManufacturersToProduct(createdProduct.id, manufacturerIds);
      }
      
      alert('✓ Product added successfully!');
      loadAdminProducts();
      $(this)[0].reset();
      $('#manufacturerCheckboxes .manufacturer-checkbox').prop('checked', false);
    } else {
      alert('Error adding product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Error adding product');
  }
});

// Edit product - show modal
$(document).on("click", ".editProduct", async function() {
  let id = $(this).data("id");
  let product = products.find(p => p.id === id);
  
  if (product) {
    $("#editProductId").val(product.id);
    $("#editPname").val(product.name);
    $("#editPprice").val(product.price);
    $("#editPstock").val(product.stock);
    $("#editPimage").val(product.image);
    $("#editProductCategory").val(product.category_id);
    
    // Load manufacturers for this product
    try {
      const manufResponse = await fetch(`${API_URL}/api/products/${id}/manufacturers`);
      const manufacturers = await manufResponse.json();
      const selectedIds = manufacturers.map(m => m.id);
      
      await loadManufacturerCheckboxes('editManufacturerCheckboxes', selectedIds);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
    modal.show();
  }
});

// Update product
$("#editProductForm").submit(async function(e) {
  e.preventDefault();
  
  const id = $("#editProductId").val();
  const updatedProduct = {
    name: $("#editPname").val(),
    price: parseFloat($("#editPprice").val()),
    stock: parseInt($("#editPstock").val()),
    image: $("#editPimage").val(),
    category_id: parseInt($("#editProductCategory").val())
  };
  
  if (!updatedProduct.category_id) {
    alert('Please select a category');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    });
    
    if (response.ok) {
      // Update manufacturers
      const manufacturerIds = getSelectedManufacturers('editManufacturerCheckboxes');
      await assignManufacturersToProduct(id, manufacturerIds);
      
      alert('✓ Product updated successfully!');
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
      modal.hide();
      
      loadAdminProducts();
    } else {
      alert('Error updating product');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    alert('Error updating product');
  }
});

// Delete product
$(document).on("click", ".deleteProduct", async function() {
  let id = $(this).data("id");
  
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await fetch(`${API_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      
      alert('Product deleted successfully!');
      loadAdminProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  }
});

// ---------------- LOGIN ----------------

$("#loginForm").submit(async function(e) {
  e.preventDefault();
  
  console.log('🔴 LOGIN FORM SUBMITTED');
  
  const credentials = {
    username: $("#username").val().trim(),  // ← Add .trim()
    password: $("#password").val().trim()   // ← Add .trim()
  };
  
  console.log('Credentials:', credentials);
  
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    console.log('Response:', result); // ← Add this
    
    if (response.ok && result.success) {
      sessionStorage.setItem('admin', JSON.stringify(result.user));
      updateNavbar();
      window.location.href = "admin.html";
    } else {
      $("#loginMsg").text("Invalid credentials!");
    }
  } catch (error) {
    console.error('Error logging in:', error);
    $("#loginMsg").text("Login error! Make sure the server is running.");
  }
});

// ---------------- CUSTOMER AUTH ----------------

// Check if customer is logged in on page load and update navbar
// (This is now handled by updateNavbar() function)
if ($("#customerName").length) {
  const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
  if (customer) {
    $("#customerName").text(customer.name);
    $("#profileLink").show();
  }
}

// Toggle between login and signup
$("#showSignup").click(function(e) {
  e.preventDefault();
  $("#loginSection").hide();
  $("#signupSection").show();
});

$("#showLogin").click(function(e) {
  e.preventDefault();
  $("#signupSection").hide();
  $("#loginSection").show();
});

// ========================================
// SIGNUP FORM VALIDATION
// ========================================

// Password visibility toggle
$("#toggleSignupPassword").click(function() {
  const passwordField = $("#signupPassword");
  const passwordIcon = $("#signupPasswordIcon");
  
  if (passwordField.attr("type") === "password") {
    passwordField.attr("type", "text");
    passwordIcon.removeClass("fa-eye").addClass("fa-eye-slash");
  } else {
    passwordField.attr("type", "password");
    passwordIcon.removeClass("fa-eye-slash").addClass("fa-eye");
  }
});

// Validate full name (no numbers)
$("#signupName").on('input', function() {
  const name = $(this).val();
  const hasNumbers = /\d/.test(name);
  
  if (hasNumbers) {
    $("#nameError").text("Name cannot contain numbers").show();
    $(this).addClass("is-invalid");
  } else if (name.length > 0 && name.length < 2) {
    $("#nameError").text("Name must be at least 2 characters").show();
    $(this).addClass("is-invalid");
  } else {
    $("#nameError").hide();
    $(this).removeClass("is-invalid");
  }
});

// Validate email (must have @gmail, @yahoo, @outlook, etc)
$("#signupEmail").on('input', function() {
  const email = $(this).val();
  const validDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com', '@icloud.com'];
  const hasValidDomain = validDomains.some(domain => email.toLowerCase().includes(domain));
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (email.length > 0) {
    if (!emailRegex.test(email)) {
      $("#emailError").text("Please enter a valid email address").show();
      $(this).addClass("is-invalid");
    } else if (!hasValidDomain) {
      $("#emailError").text("Please use Gmail, Yahoo, Outlook, Hotmail, or iCloud").show();
      $(this).addClass("is-invalid");
    } else {
      $("#emailError").hide();
      $(this).removeClass("is-invalid");
    }
  }
});

// Validate phone (must be exactly 11 digits)
$("#signupPhone").on('input', function() {
  let phone = $(this).val().replace(/\D/g, ''); // Remove non-digits
  $(this).val(phone); // Update field with digits only
  
  if (phone.length > 0 && phone.length < 11) {
    $("#phoneError").text("Phone must be exactly 11 digits").show();
    $(this).addClass("is-invalid");
  } else if (phone.length === 11) {
    $("#phoneError").hide();
    $(this).removeClass("is-invalid");
  } else if (phone.length === 0) {
    $("#phoneError").hide();
    $(this).removeClass("is-invalid");
  }
});

// Validate password strength
$("#signupPassword").on('input', function() {
  const password = $(this).val();
  let strength = 0;
  let feedback = [];
  
  // Check length
  if (password.length >= 8) {
    strength += 1;
  } else {
    feedback.push("at least 8 characters");
  }
  
  // Check uppercase
  if (/[A-Z]/.test(password)) {
    strength += 1;
  } else {
    feedback.push("1 uppercase letter");
  }
  
  // Check lowercase
  if (/[a-z]/.test(password)) {
    strength += 1;
  }
  
  // Check numbers
  if (/\d/.test(password)) {
    strength += 1;
  } else {
    feedback.push("1 number");
  }
  
  // Check special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength += 1;
  } else {
    feedback.push("1 special character (!@#$%^&*)");
  }
  
  // Display strength
  const strengthText = $("#passwordStrength");
  const passwordError = $("#passwordError");
  
  if (password.length === 0) {
    strengthText.html('');
    passwordError.hide();
    $(this).removeClass("is-invalid");
  } else if (strength < 4) {
    strengthText.html('<span class="text-danger">❌ Weak - Missing: ' + feedback.join(", ") + '</span>');
    passwordError.text("Password is too weak").show();
    $(this).addClass("is-invalid");
  } else if (strength === 4) {
    strengthText.html('<span class="text-warning">⚠️ Medium - Add more characters for better security</span>');
    passwordError.hide();
    $(this).removeClass("is-invalid");
  } else {
    strengthText.html('<span class="text-success">✓ Strong password!</span>');
    passwordError.hide();
    $(this).removeClass("is-invalid");
  }
});

// Customer Signup with validation
$("#customerSignupForm").submit(async function(e) {
  e.preventDefault();
  
  // Clear previous errors
  $("#signupError").text('');
  
  // Get form data
  const name = $("#signupName").val().trim();
  const email = $("#signupEmail").val().trim();
  const phone = $("#signupPhone").val().trim();
  const address = $("#signupAddress").val().trim();
  const password = $("#signupPassword").val();
  
  // Validate name (no numbers)
  if (/\d/.test(name)) {
    $("#signupError").text("Name cannot contain numbers");
    $("#signupName").focus();
    return;
  }
  
  if (name.length < 2) {
    $("#signupError").text("Name must be at least 2 characters");
    $("#signupName").focus();
    return;
  }
  
  // Validate email domain
  const validDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com', '@icloud.com'];
  const hasValidDomain = validDomains.some(domain => email.toLowerCase().includes(domain));
  
  if (!hasValidDomain) {
    $("#signupError").text("Please use a valid email provider (Gmail, Yahoo, Outlook, Hotmail, or iCloud)");
    $("#signupEmail").focus();
    return;
  }
  
  // Validate phone (exactly 11 digits)
  if (phone.length !== 11 || !/^\d{11}$/.test(phone)) {
    $("#signupError").text("Phone number must be exactly 11 digits");
    $("#signupPhone").focus();
    return;
  }
  
  // Validate password strength
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 8;
  
  if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecial) {
    $("#signupError").text("Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character");
    $("#signupPassword").focus();
    return;
  }
  
  // All validations passed, submit form
  const signupData = {
    name: name,
    email: email,
    phone: phone,
    address: address,
    password: password
  };
  
  console.log('Attempting signup with data:', signupData);
  
  try {
    const response = await fetch(`${API_URL}/api/customers/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    console.log('Signup response status:', response.status);
    
    const result = await response.json();
    console.log('Signup result:', result);
    
    if (response.ok && result.success) {
      alert('✓ Account created successfully! Please login.');
      $("#signupSection").hide();
      $("#loginSection").show();
      $("#customerSignupForm")[0].reset();
      $("#signupError").text('');
      $("#passwordStrength").html('');
    } else {
      const errorMsg = result.error || result.message || 'Signup failed';
      console.error('Signup error:', errorMsg);
      $("#signupError").text(errorMsg);
    }
  } catch (error) {
    console.error('Error signing up:', error);
    $("#signupError").text('Cannot connect to server. Make sure server is running on port 3000.');
  }
});

// Customer/Admin Login (Auto-detect)
$("#customerLoginForm").submit(async function(e) {
  e.preventDefault();
  
  const loginIdentifier = $("#loginEmail").val(); // Can be email or username
  const password = $("#loginPassword").val();
  
  // Try admin login first (check if it's a username format)
  let isAdmin = false;
  let loginSuccess = false;
  
  // First, try admin login
  try {
    const adminResponse = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: loginIdentifier,
        password: password
      })
    });
    
    const adminResult = await adminResponse.json();
    
    if (adminResponse.ok && adminResult.success) {
      // Admin login successful
      sessionStorage.setItem('admin', JSON.stringify(adminResult.user));
      sessionStorage.removeItem('customer');
      
      // Update UI
      $("#customerName").text(adminResult.user.username);
      updateNavbar();
      
      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('customerLoginModal'));
      if (modal) modal.hide();
      
      // Redirect to admin page
      window.location.href = 'admin.html';
      loginSuccess = true;
      return;
    }
  } catch (error) {
    // Admin login failed, try customer login
  }
  
  // If admin login failed, try customer login
  if (!loginSuccess) {
    try {
      const customerResponse = await fetch(`${API_URL}/api/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginIdentifier,
          password: password
        })
      });
      
      const customerResult = await customerResponse.json();
      
      if (customerResponse.ok && customerResult.success) {
        // Customer login successful
        sessionStorage.setItem('customer', JSON.stringify(customerResult.customer));
        sessionStorage.removeItem('admin');
        
        // Update UI
        $("#customerName").text(customerResult.customer.name);
        updateNavbar();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('customerLoginModal'));
        if (modal) modal.hide();
        
        // Reload page to update navbar
        window.location.reload();
        
        $("#loginError").text('');
        $("#customerLoginForm")[0].reset();
        loginSuccess = true;
      } else {
        $("#loginError").text('Invalid email/username or password');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      $("#loginError").text('Invalid email/username or password');
    }
  }
});

// Customer Logout
$("#logoutBtn, #logoutLink").click(function() {
  sessionStorage.removeItem('customer');
  sessionStorage.removeItem('admin');
  window.location.reload();
});

// Show appropriate section when modal opens
$('#customerLoginModal').on('show.bs.modal', function() {
  // Always show login section
  $("#loginSection").show();
  $("#signupSection").hide();
});

// Load data on page load
if ($("#product-list").length) {
    loadProducts();
}

// Add this part to load the manufacturers
if ($("#manufacturersList").length) {
    loadManufacturers();
}

// Final Fix