const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhIMvR1ZIpgtxhcUnkDOcUy296YoM0ZtnvtWnE72QWjAYQxIc23NItsrPbWclTc7ScJ9AjZx65_52k/pub?output=csv";

const container = document.getElementById("product-list");

let allProducts = [];


/* =========================
   SHORT SPECS
========================= */

function shortSpecs(specs) {

    if (!specs) return "";

    const lines = specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    return lines
        .slice(0, 3)
        .map(line => {

            const parts = line.split(":");
            const label = parts.shift().trim();
            const value = parts.join(":").trim();

            return `
                <p>
                    <strong>${label}:</strong> ${value}
                </p>
            `;
        })
        .join("");
}


/* =========================
   FULL SPECS
========================= */

function formatSpecs(specs) {

    if (!specs) return "";

    const lines = specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    return lines
        .map(line => {

            const parts = line.split(":");
            const label = parts.shift().trim();
            const value = parts.join(":").trim();

            return `
                <div class="spec-row">
                    <strong>${label}:</strong>
                    <span>${value}</span>
                </div>
            `;
        })
        .join("");
}


/* =========================
   LOAD GOOGLE SHEET
========================= */

/* =========================
   LOAD GOOGLE SHEET
========================= */

Papa.parse(sheetURL, {

    download: true,
    header: true,

    complete: function(results) {

        console.log("Google Sheet loaded:", results.data);

        allProducts = results.data.filter(
            product => product["Product Name"]
        );

        displayProducts(allProducts);

        createCategoryButtons(allProducts);

        const cartButton =
            document.getElementById("cartButton");

        if (cartButton) {
            cartButton.style.display = "inline-block";
        }

        document
            .getElementById("search")
            .addEventListener("input", function() {

                const keyword =
                    this.value.toLowerCase();

                const filtered =
                    allProducts.filter(product =>
                        Object.values(product)
                            .join(" ")
                            .toLowerCase()
                            .includes(keyword)
                    );

                displayProducts(filtered);

            });
    }
});


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(products) {

    container.innerHTML = "";

    products.forEach(product => {

        const originalIndex =
            allProducts.indexOf(product);

        const status =
            product["Status"] || "";

        container.innerHTML += `

            <div
                class="product-card"
                onclick="showDetails(${originalIndex})"
            >

                <img
                    src="${product["Image"] || "images/placeholder.png"}"
                    alt="${product["Product Name"] || ""}"
                    class="product-image"
                    onerror="this.src='images/placeholder.png'"
                >

                <h2>
                    ${product["Product Name"] || ""}
                </h2>

                <p>
                    <strong>Model:</strong>
                    ${product["Model Number"] || "-"}
                </p>

                <p>
                    <strong>Material Code:</strong>
                    ${product["Material Code"] || "-"}
                </p>

                <div class="short-specs">
                    ${shortSpecs(product["Specs"])}
                </div>

                <div class="price-box">

                    <p>
                        <span>SRP</span>
                        <strong>
                            ₱${Number(
                                product["SRP"] || 0
                            ).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>Dealer</span>
                        <strong>
                            ₱${Number(
                                product["Dealer Price"] || 0
                            ).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>VOL</span>
                        <strong>
                            ₱${Number(
                                product["VOL Price"] || 0
                            ).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>MOQ</span>
                        <strong>
                            ${product["MOQ"] || "-"}
                        </strong>
                    </p>

                </div>

                <span class="status ${status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}">
                    ${status}
                </span>

                <p class="view-details">
                    Click to view full details →
                </p>

            </div>

        `;

    });

}


/* =========================
   CATEGORY BUTTONS
========================= */

function createCategoryButtons(products) {

    const categoryContainer =
        document.getElementById("categories");

    categoryContainer.innerHTML = "";

    const categories = [
        "All",
        ...new Set(
            products
                .map(p => p["Category"])
                .filter(Boolean)
        )
    ];

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.textContent = category;

        button.className =
            "category-btn";

        if (category === "All") {
            button.classList.add("active");
        }

        button.onclick = function() {

            document
                .querySelectorAll(".category-btn")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            if (window.innerWidth <= 768) {

                button.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest"
                });

            }

            if (category === "All") {

                displayProducts(allProducts);

            } else {

                displayProducts(
                    allProducts.filter(
                        p => p["Category"] === category
                    )
                );

            }

        };

        categoryContainer.appendChild(button);

    });

}


/* =========================
   SHOW DETAILS
========================= */

function showDetails(index) {

    const product =
        allProducts[index];

    if (!product) return;

    const image =
        product["Image"] &&
        product["Image"].trim() !== ""

            ? product["Image"]

            : "images/placeholder.png";

    const status =
        product["Status"] || "";

    document.getElementById("modalBody").innerHTML = `

        <img
            src="${image}"
            class="product-image"
            onerror="this.src='images/placeholder.png'"
        >

        <h2>
            ${product["Product Name"] || ""}
        </h2>

        <p>
            <strong>Model Number:</strong>
            ${product["Model Number"] || "-"}
        </p>

        <p>
            <strong>Material Code:</strong>
            ${product["Material Code"] || "-"}
        </p>

        <p>
            <strong>Category:</strong>
            ${product["Category"] || "-"}
        </p>

        <hr>

        <h3>Specifications</h3>

        <div class="full-specs">
            ${formatSpecs(product["Specs"])}
        </div>

        <hr>

        <h3>Pricing</h3>

        <p>
            <strong>SRP:</strong>
            ₱${Number(
                product["SRP"] || 0
            ).toLocaleString()}
        </p>

        <p>
            <strong>Dealer Price:</strong>
            ₱${Number(
                product["Dealer Price"] || 0
            ).toLocaleString()}
        </p>

        <p>
            <strong>VOL Price:</strong>
            ₱${Number(
                product["VOL Price"] || 0
            ).toLocaleString()}
        </p>

        <p>
            <strong>MOQ:</strong>
            ${product["MOQ"] || "-"}
        </p>

        <p>
            <strong>Status:</strong>

            <span class="status ${status
                .toLowerCase()
                .replace(/\s+/g, "-")}">
                ${status}
            </span>
        </p>
      
        <div class="add-cart-section">

    <label for="cartQuantity">
        Quantity
    </label>

    <div class="quantity-control">

        <button
            type="button"
            onclick="changeCartQuantity(-1)"
        >
            −
        </button>

        <input
            type="number"
            id="cartQuantity"
            value="${Number(product["MOQ"]) || 1}"
            min="${Number(product["MOQ"]) || 1}"
        >

        <button
            type="button"
            onclick="changeCartQuantity(1)"
        >
            +
        </button>

    </div>

    <p class="moq-note">
        Minimum order: ${product["MOQ"] || 1}
    </p>

    <button
        class="add-cart-btn"
        onclick="addToCart(${index})"
    >
        🛒 Add to Cart
    </button>

</div>

    `;

    document.getElementById(
        "productModal"
    ).style.display = "block";

}

/* =========================
   SHOPPING CART
========================= */

let cart = JSON.parse(
    localStorage.getItem("productCart")
) || [];


/* =========================
   ADD TO CART
========================= */

function addToCart(index) {

    const product = allProducts[index];

    if (!product) return;

    const moq = Number(product["MOQ"]) || 1;

    const quantityInput =
        document.getElementById("cartQuantity");

    let quantity =
        Number(quantityInput.value) || moq;

    // Make sure quantity is not below MOQ
    if (quantity < moq) {
        quantity = moq;
    }

    // Find existing product
    const existing =
        cart.find(item =>
            item.materialCode === product["Material Code"]
        );


    if (existing) {

        existing.quantity += quantity;

    } else {

        cart.push({

            materialCode:
                product["Material Code"],

            productName:
                product["Product Name"],

            modelNumber:
                product["Model Number"],

            image:
                product["Image"],

            dealerPrice:
                Number(product["Dealer Price"]) || 0,

            moq: moq,

            quantity: quantity

        });

    }


    saveCart();

    updateCartCount();

    alert(
        product["Product Name"] +
        " has been added to your cart."
    );

}

function changeCartQuantity(amount) {

    const input =
        document.getElementById("cartQuantity");

    if (!input) return;

    const min =
        Number(input.min) || 1;

    let value =
        Number(input.value) || min;

    value += amount;

    if (value < min) {
        value = min;
    }

    input.value = value;
}

function saveCart() {

    localStorage.setItem(
        "productCart",
        JSON.stringify(cart)
    );

    updateCartCount();
}
function updateCartCount() {

    const countElement =
        document.getElementById("cartCount");

    if (!countElement) return;

    const count = cart.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );

    countElement.textContent = count;
}

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        cartTotal.textContent = "₱0";

        return;
    }


    let total = 0;


    cartItems.innerHTML = cart.map(
        (item, index) => {

            const subtotal =
                item.dealerPrice *
                item.quantity;

            total += subtotal;


            return `

                <div class="cart-item">

                    <img
                        src="${item.image || "images/placeholder.png"}"
                        onerror="this.src='images/placeholder.png'"
                    >

                    <div class="cart-item-info">

                        <h3>
                            ${item.productName}
                        </h3>

                        <p>
                            Model:
                            ${item.modelNumber || "-"}
                        </p>

                        <p>
                            Dealer Price:
                            ₱${item.dealerPrice.toLocaleString()}
                        </p>

                        <div class="cart-quantity">

                            <button
                                onclick="changeCartItemQuantity(${index}, -1)"
                            >
                                −
                            </button>

                            <span>
                                ${item.quantity}
                            </span>

                            <button
                                onclick="changeCartItemQuantity(${index}, 1)"
                            >
                                +
                            </button>

                        </div>

                        <strong>
                            ₱${subtotal.toLocaleString()}
                        </strong>

                        <button
                            class="remove-cart-item"
                            onclick="removeFromCart(${index})"
                        >
                            Remove
                        </button>

                    </div>

                </div>

            `;

        }
    ).join("");


    cartTotal.textContent =
        "₱" + total.toLocaleString();
}

function changeCartItemQuantity(index, amount) {

    const item = cart[index];

    if (!item) return;

    let newQuantity =
        item.quantity + amount;


    if (newQuantity < item.moq) {
        newQuantity = item.moq;
    }


    item.quantity = newQuantity;

    saveCart();

    displayCart();
}

function removeFromCart(index) {

    cart.splice(index, 1);

    saveCart();

    displayCart();
}

const cartModal =
    document.getElementById("cartModal");

const cartButton =
    document.getElementById("cartButton");

if (cartButton) {

    cartButton.addEventListener(
        "click",
        function() {

            displayCart();

            cartModal.style.display = "block";

        }
    );

}

updateCartCount();

const clearCart =
    document.getElementById("clearCart");

if (clearCart) {

    clearCart.addEventListener(
        "click",
        function() {

            if (cart.length === 0) return;

            if (
                confirm(
                    "Are you sure you want to clear your cart?"
                )
            ) {

                cart = [];

                saveCart();

                displayCart();

            }

        }
    );

}

const cartModal =
    document.getElementById("cartModal");

const cartClose =
    document.querySelector(".cart-close");

if (cartClose) {

    cartClose.addEventListener(
        "click",
        function() {

            cartModal.style.display = "none";

        }
    );

}


window.addEventListener(
    "click",
    function(event) {

        if (event.target === cartModal) {

            cartModal.style.display = "none";

        }

    }
);

/* =========================
   CLOSE MODAL
========================= */

const modal =
    document.getElementById("productModal");

const closeBtn =
    document.querySelector(".close");

closeBtn.addEventListener("click", function() {

    modal.style.display = "none";

});

window.addEventListener("click", function(event) {

    if (event.target === modal) {
        modal.style.display = "none";
    }

});
