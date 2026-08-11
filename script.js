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

function getAlternativeProducts(product) {

    const alternativeModels =
        (product["Alternative Model"] || "")
            .split(",")
            .map(model => model.trim())
            .filter(Boolean);

    return allProducts.filter(p =>
        alternativeModels.includes(
            (p["Model Number"] || "").trim()
        )
    );

}

/* =========================
   FULL SPECS
========================= */

function formatSpecs(specs) {
    if (!specs) return "";

    const lines = specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");

    return lines.map(line => {

        // Numbered feature lines should stay normal
        if (/^\d+\.\s/.test(line.trim())) {
            return `
                <div class="spec-line">
                    ${line.trim()}
                </div>
            `;
        }

        // Lines containing a label followed by :
        const match = line.match(/^([^:]+):\s*(.*)$/);

        if (match) {

            const label = match[1].trim();
            const value = match[2].trim();

            return `
                <div class="spec-row">
                    <strong>${label}:</strong>
                    <span>${value}</span>
                </div>
            `;
        }

        // Any other text stays normal
        return `
            <div class="spec-line">
                ${line.trim()}
            </div>
        `;

    }).join("");
}

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

        const search =
            document.getElementById("search");

        if (search) {

            search.addEventListener(
                "input",
                function() {

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

                }
            );

        }

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

                </div>

                <span class="status ${status.toLowerCase().replace(/\s+/g, "-")}">
                   ${status}
                </span>

                ${status.toLowerCase() === "out of stock" && product["Alternative Model"] ? `
                     <button class="alternative-btn"
                             onclick="event.stopPropagation(); showAlternatives(${originalIndex})">
                    View Alternative Models →
                      </button>
               ` : ""}

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

        <button
            type="button"
            onclick="changeCartQuantity(1)"
        >
            +
        </button>

    </div>
    
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

function showAlternatives(index) {

    const product = allProducts[index];

    if (!product) return;

    const alternatives =
        getAlternativeProducts(product);

    if (alternatives.length === 0) {

        alert("No alternative models are currently available.");

        return;

    }

    let html = `
        <h2>Alternative Models</h2>

        <p>
            Alternatives for
            <strong>${product["Product Name"]}</strong>
        </p>

        <div class="alternative-list">
    `;

    alternatives.forEach(alt => {

        const altStatus =
            alt["Status"] || "";

        html += `

            <div class="alternative-product">

                <img
                    src="${alt["Image"] || "images/placeholder.png"}"
                    class="product-image"
                    onerror="this.src='images/placeholder.png'"
                >

                <h3>
                    ${alt["Product Name"] || ""}
                </h3>

                <p>
                    <strong>Model:</strong>
                    ${alt["Model Number"] || "-"}
                </p>

                <p>
                    <strong>SRP:</strong>
                    ₱${Number(
                        alt["SRP"] || 0
                    ).toLocaleString()}
                </p>

                <span class="status ${altStatus
                    .toLowerCase()
                    .replace(/\s+/g, "-")}">
                    ${altStatus}
                </span>

                <button
                    class="details-btn"
                    onclick="showDetails(
                        ${allProducts.indexOf(alt)}
                    )"
                >
                    View Product
                </button>

            </div>

        `;

    });

    html += `</div>`;

    document.getElementById(
        "modalBody"
    ).innerHTML = html;

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

    const moq =
        Number(product["MOQ"]) || 1;

    const quantityInput =
        document.getElementById("cartQuantity");

    let quantity =
        Number(quantityInput?.value) || moq;

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

            srp:
                Number(product["SRP"]) || 0,

            moq:
                moq,

            quantity:
                quantity

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

        cartTotal.innerHTML = "₱0";

        return;
    }


    let totalSRP = 0;
    let totalDealer = 0;


    cartItems.innerHTML = cart.map(
        (item, index) => {

            const srp =
                Number(item.srp || 0);

            const dealerPrice =
                Number(item.dealerPrice || 0);

            const srpSubtotal =
                srp * item.quantity;

            const dealerSubtotal =
                dealerPrice * item.quantity;

            totalSRP += srpSubtotal;
            totalDealer += dealerSubtotal;


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
                            Material Code:
                            ${item.materialCode || "-"}
                        </p>

                        <div class="cart-prices">

                            <p>
                                <strong>SRP:</strong>
                                ₱${srp.toLocaleString()}
                            </p>

                            <p>
                                <strong>Dealer:</strong>
                                ₱${dealerPrice.toLocaleString()}
                            </p>

                        </div>

                        <div class="cart-quantity">

                            <button
                                onclick="changeCartItemQuantity(${index}, -1)"
                            >
                                
                            </button>

                           <span class="cart-quantity-number">
                                 ${Number(item.quantity) || 1}
                           </span>

                            <button
                                onclick="changeCartItemQuantity(${index}, 1)"
                            >
                                +
                            </button>

                        </div>

                        <div class="cart-subtotals">

                            <p>
                                SRP Total:
                                <strong>
                                    ₱${srpSubtotal.toLocaleString()}
                                </strong>
                            </p>

                            <p>
                                Dealer Total:
                                <strong>
                                    ₱${dealerSubtotal.toLocaleString()}
                                </strong>
                            </p>

                        </div>

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


    cartTotal.innerHTML = `

        <div class="cart-total-row">
            <span>Total SRP</span>
            <strong>
                ₱${totalSRP.toLocaleString()}
            </strong>
        </div>

        <div class="cart-total-row">
            <span>Total Dealer</span>
            <strong>
                ₱${totalDealer.toLocaleString()}
            </strong>
        </div>

    `;
}

function changeCartItemQuantity(index, amount) {

    const item = cart[index];

    if (!item) return;

    const moq =
        Number(item.moq) || 1;

    let newQuantity =
        Number(item.quantity) + amount;

    if (newQuantity < moq) {
        newQuantity = moq;
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

const cartClose =
    document.querySelector(".cart-close");

if (cartClose && cartModal) {

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

        if (
            cartModal &&
            event.target === cartModal
        ) {

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
