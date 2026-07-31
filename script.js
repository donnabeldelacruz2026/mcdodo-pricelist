const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhIMvR1ZIpgtxhcUnkDOcUy296YoM0ZtnvtWnE72QWjAYQxIc23NItsrPbWclTc7ScJ9AjZx65_52k/pub?output=csv";

const container = document.getElementById("product-list");

let allProducts = [];

Papa.parse(sheetURL, {
    download: true,
    header: true,
    complete: function(results) {

        allProducts = results.data.filter(product => product["Product Name"]);

        displayProducts(allProducts);

        createCategoryButtons(allProducts);

        document.getElementById("search").addEventListener("input", function () {

            const keyword = this.value.toLowerCase();

            const filtered = allProducts.filter(product =>
                Object.values(product)
                    .join(" ")
                    .toLowerCase()
                    .includes(keyword)
            );

            displayProducts(filtered);
        });

    }
});

function displayProducts(products) {

    container.innerHTML = "";

    products.forEach((product, index) => {

       container.innerHTML += `
<div class="product" onclick="showDetails(${index})">

    <img
        src="${product["Image"] || "images/placeholder.png"}"
        alt="${product["Product Name"]}"
        class="product-image"
        onerror="this.src='images/placeholder.png'"
    >

    <h2>${product["Product Name"]}</h2>

    <p><strong>Model:</strong> ${product["Model Number"]}</p>

    <p><strong>Item Code:</strong> ${product["Item Code"]}</p>

    <p class="specs">${product["Specs"]}</p>


    <div class="price-box">

        <p><span>SRP</span><strong>₱${Number(product["SRP"]).toLocaleString()}</strong></p>

        <p><span>Dealer</span><strong>₱${Number(product["Dealer Price"]).toLocaleString()}</strong></p>

        <p><span>VOL</span><strong>₱${Number(product["VOL Price"]).toLocaleString()}</strong></p>

        <p><span>MOQ</span><strong>${product["MOQ"]}</strong></p>

    </div>

    <span class="status ${product["Status"].toLowerCase().replace(/\s+/g,'-')}">
        ${product["Status"]}
    </span>

    
    </div>

   
`;
    });
}

function createCategoryButtons(products) {

    const categoryContainer = document.getElementById("categories");

    categoryContainer.innerHTML = "";

    const categories = [
        "All",
        ...new Set(products.map(p => p["Category"]).filter(Boolean))
    ];

    categories.forEach(category => {

        const button = document.createElement("button");

        button.textContent = category;

        button.className = "category-btn";

        if (category === "All") {
            button.classList.add("active");
        }

        button.onclick = () => {

            document.querySelectorAll(".category-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            if (category === "All") {
                displayProducts(allProducts);
            } else {
                displayProducts(
                    allProducts.filter(p => p["Category"] === category)
                );
            }
        };

        categoryContainer.appendChild(button);
    });
}
function showDetails(index){

    const product = allProducts[index];

    const image =
        product["Image"] && product["Image"].trim() !== ""
        ? product["Image"]
        : "images/placeholder.png";

    document.getElementById("modalBody").innerHTML = `
        <img src="${image}" class="product-image">

        <h2>${product["Product Name"]}</h2>

        <p><strong>Model Number:</strong> ${product["Model Number"]}</p>

        <p><strong>Item Code:</strong> ${product["Item Code"]}</p>

        <p><strong>Category:</strong> ${product["Category"]}</p>

        <p><strong>Specs:</strong></p>

        <p>${product["Specs"]}</p>

        <hr>

        <p><strong>SRP:</strong> ₱${Number(product["SRP"]).toLocaleString()}</p>

        <p><strong>Dealer Price:</strong> ₱${Number(product["Dealer Price"]).toLocaleString()}</p>

        <p><strong>VOL Price:</strong> ₱${Number(product["VOL Price"]).toLocaleString()}</p>

        <p><strong>MOQ:</strong> ${product["MOQ"]}</p>

        <p>
        <strong>Status:</strong>
        <span class="status ${product["Status"].toLowerCase().replace(/\s+/g,'-')}">
        ${product["Status"]}
        </span>
        </p>
    `;

    document.getElementById("productModal").style.display = "block";
}

const closeBTN = docment.querySelector(".close");

if (closeBTN) {
    closeBtn.addEventListener("click",function () {
        document.getElementById("productModal").style.display = "none";
    });
}

window.onclick = function(event){
    const modal = document.getElementById("productModal");

    if(event.target === modal){
        modal.style.display = "none";
    }
}
    
