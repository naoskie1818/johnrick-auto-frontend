const API_URL = 'johnrick-auto-backend-production.up.railway.app';

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
        <div class="col-12 text-center">
          <div class="alert alert-info">
            <i class="fa fa-info-circle"></i> No products found matching your criteria.
          </div>
        </div>
      `);
      return;
    }
    
    productsToShow.forEach((p) => {
      $("#product-list").append(`
        <div class="col-md-4 mb-4">
          <div class="card">
            <img src="${p.image}" class="card-img-top">
            <div class="card-body">
              <h5 class="card-title">${p.name}</h5>
              <p class="card-text">₱${p.price} | Stock: ${p.stock}</p>
              <button class="btn btn-danger addCart" data-id="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>
                ${p.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      `);
    });
  }
}

// Load categories for search dropdown
async function loadCategoriesForSearch() {
  try {
    const response = await fetch(`${API_URL}/categories`);
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
    const response = await fetch(`${API_URL}/products`);
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

// Add to cart
$(document).on("click", ".addCart", async function() {
  let id = $(this).data("id");
  let product = products.find(p => p.id === id);
  
  if (product && product.stock > 0) {
    // Check if product already in cart
    const cartItem = cart.find(item => item.id === id);
    
    if (cartItem) {
      // Check if we have enough stock for one more
      const quantityInCart = cart.filter(item => item.id === id).length;
      if (quantityInCart >= product.stock) {
        alert("Not enough stock available!");
        return;
      }
    }
    
    // Add to cart (stored in sessionStorage) - DO NOT reduce stock yet
    cart.push(product);
    sessionStorage.setItem('cart', JSON.stringify(cart));
    
    alert("Added to cart!");
    loadProducts(); // Reload to refresh display
  }
});

// ---------------- CART ----------------

// Load cart on cart page
if ($("#cartItems").length) {
  cart = JSON.parse(sessionStorage.getItem('cart')) || [];
  console.log('Cart loaded:', cart); // Debug
  
  // Auto-fill customer info if logged in
  const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
  if (customer) {
    $("#checkoutName").val(customer.name);
    $("#checkoutEmail").val(customer.email);
    $("#checkoutAddress").val(customer.address);
  }
  
  updateCart();
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
    alert(`Sorry, only ${product.stock} items available in stock`);
    return;
  }
  
  // Add one more to cart
  cart.push(product);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCart();
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
  }
});

// Checkout
$("#checkoutForm").submit(async function(e) {
  e.preventDefault();
  
  console.log('=== CHECKOUT STARTED ===');
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  
  // Get form values
  const customerName = $("#checkoutName").val();
  const email = $("#checkoutEmail").val();
  const address = $("#checkoutAddress").val();
  const paymentMethod = $("#checkoutPayment").val();
  
  console.log('Form values:', { customerName, email, address, paymentMethod });
  
  // Validate form values
  if (!customerName || !email || !address || !paymentMethod) {
    alert('Please fill in all fields');
    return;
  }
  
  // Group cart items by product ID and count quantities
  const itemQuantities = {};
  cart.forEach(item => {
    if (itemQuantities[item.id]) {
      itemQuantities[item.id].quantity++;
    } else {
      itemQuantities[item.id] = {
        ...item,
        quantity: 1
      };
    }
  });
  
  console.log('Item quantities:', itemQuantities);
  
  // Fetch fresh product data from server to check current stock
  let stockError = false;
  try {
    console.log('Fetching fresh product data for stock validation...');
    const response = await fetch(`${API_URL}/products`);
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
  
  const orderData = {
    customer_name: customerName,
    email: email,
    address: address,
    payment_method: paymentMethod,
    items: Object.values(itemQuantities),
    total: cart.reduce((sum, item) => sum + item.price, 0)
  };
  
  console.log('Order data to send:', orderData);
  
  try {
    // Place order
    console.log('Sending order to server...');
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    
    console.log('Order response status:', response.status);
    
    const result = await response.json();
    console.log('Order result:', result);
    
    if (response.ok && result.orderId) {
      console.log('Order placed successfully:', result);
      
      // Reduce stock for each item
      for (let id in itemQuantities) {
        const item = itemQuantities[id];
        
        // Fetch current stock
        const freshResponse = await fetch(`${API_URL}/products`);
        const freshProducts = await freshResponse.json();
        const currentProduct = freshProducts.find(p => p.id == id);
        
        if (currentProduct) {
          const newStock = currentProduct.stock - item.quantity;
          console.log(`Reducing stock for ${item.name}: ${currentProduct.stock} - ${item.quantity} = ${newStock}`);
          
          await fetch(`${API_URL}/products/${id}/stock`, {
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
          total: orderData.total,
          order_date: new Date().toISOString(),
          emailSent: false
        };
        showReceipt(fallbackData);
      }
      
      // Clear cart
      cart = [];
      sessionStorage.removeItem('cart');
      updateCart();
      $(this)[0].reset();
      
      // Reload products to show updated stock
      if (typeof loadProducts === 'function') {
        await loadProducts();
      }
    } else {
      console.error('Order failed:', result);
      alert('Error placing order: ' + (result.error || result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error placing order:', error);
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
    const response = await fetch(`${API_URL}/categories`);
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
    await fetch(`${API_URL}/categories`, {
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
      const response = await fetch(`${API_URL}/categories/${id}`, {
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
    console.log('Fetching from:', `${API_URL}/customers`);
    
    const response = await fetch(`${API_URL}/customers`);
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
      const response = await fetch(`${API_URL}/customers/${id}`, {
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
    const response = await fetch(`${API_URL}/products`);
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
    category_id: parseInt($("#pcategory").val())
  };
  
  if (!newProduct.category_id) {
    alert('Please select a category');
    return;
  }
  
  try {
    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });
    
    alert('Product added successfully!');
    loadAdminProducts();
    $(this)[0].reset();
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Error adding product');
  }
});

// Edit product - show modal
$(document).on("click", ".editProduct", function() {
  let id = $(this).data("id");
  let product = products.find(p => p.id === id);
  
  if (product) {
    $("#editProductId").val(product.id);
    $("#editPname").val(product.name);
    $("#editPprice").val(product.price);
    $("#editPstock").val(product.stock);
    $("#editPimage").val(product.image);
    $("#editPcategory").val(product.category_id);
    
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
    category_id: parseInt($("#editPcategory").val())
  };
  
  if (!updatedProduct.category_id) {
    alert('Please select a category');
    return;
  }
  
  try {
    await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    });
    
    alert('Product updated successfully!');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    modal.hide();
    
    loadAdminProducts();
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
      await fetch(`${API_URL}/products/${id}`, {
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
  
  const credentials = {
    username: $("#username").val(),
    password: $("#password").val()
  };
  
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Store session info (optional)
      sessionStorage.setItem('adminLoggedIn', 'true');
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

// Customer Signup
$("#customerSignupForm").submit(async function(e) {
  e.preventDefault();
  
  const signupData = {
    name: $("#signupName").val(),
    email: $("#signupEmail").val(),
    phone: $("#signupPhone").val(),
    address: $("#signupAddress").val(),
    password: $("#signupPassword").val()
  };
  
  console.log('Attempting signup with data:', signupData); // Debug
  
  try {
    const response = await fetch(`${API_URL}/customers/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signupData)
    });
    
    console.log('Signup response status:', response.status); // Debug
    
    const result = await response.json();
    console.log('Signup result:', result); // Debug
    
    if (response.ok && result.success) {
      alert('Account created successfully! Please login.');
      $("#signupSection").hide();
      $("#loginSection").show();
      $("#customerSignupForm")[0].reset();
      $("#signupError").text('');
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

// Customer Login
$("#customerLoginForm").submit(async function(e) {
  e.preventDefault();
  
  const loginData = {
    email: $("#loginEmail").val(),
    password: $("#loginPassword").val()
  };
  
  try {
    const response = await fetch(`${API_URL}/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Store customer info
      sessionStorage.setItem('customer', JSON.stringify(result.customer));
      
      // Update UI
      $("#customerName").text(result.customer.name);
      $("#welcomeName").text(result.customer.name);
      $("#welcomeEmail").text(result.customer.email);
      
      // Show logged in section
      $("#loginSection").hide();
      $("#loggedInSection").show();
      
      $("#loginError").text('');
      $("#customerLoginForm")[0].reset();
    } else {
      $("#loginError").text(result.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in:', error);
    $("#loginError").text('Error logging in. Please try again.');
  }
});

// Customer Logout
$("#logoutBtn").click(function() {
  sessionStorage.removeItem('customer');
  $("#customerName").text('Login');
  $("#loggedInSection").hide();
  $("#loginSection").show();
  
  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById('customerLoginModal'));
  if (modal) modal.hide();
});

// Show appropriate section when modal opens
$('#customerLoginModal').on('show.bs.modal', function() {
  const customer = JSON.parse(sessionStorage.getItem('customer') || 'null');
  
  if (customer) {
    // Show logged in section
    $("#welcomeName").text(customer.name);
    $("#welcomeEmail").text(customer.email);
    $("#loginSection").hide();
    $("#signupSection").hide();
    $("#loggedInSection").show();
  } else {
    // Show login section
    $("#loggedInSection").hide();
    $("#signupSection").hide();
    $("#loginSection").show();
  }
});

// Load products on page load
if ($("#product-list").length) {
  loadProducts();
}