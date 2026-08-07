const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhIMvR1ZIpgtxhcUnkDOcUy296YoM0ZtnvtWnE72QWjAYQxIc23NItsrPbWclTc7ScJ9AjZx65_52k/pub?output=csv";

const container = document.getElementById("product-list");

let allProducts = [];

function formatSpecs(specs) {
    if (!specs) return "";

    // Split the string into lines (or create lines before each label)
    const lines = specs
        .replace(/([A-Z][A-Za-z0-9 .&/()_-]+:)/g, "\n$1")
        .trim()
        .split("\n")
        .filter(line => line.trim() !== "");

    let html = '<table class="spec-table">';

    lines.forEach(line => {
        const parts = line.split(":");

        if (parts.length >= 2) {
            const label = parts.shift().trim();
            const value = parts.join(":").trim();

            html += `
                <tr>
                    <td class="spec-label">${label}</td>
                    <td class="spec-value">${value}</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <td colspan="2">${line}</td>
                </tr>
            `;
        }
    });

    html += "</table>";

    return html;
}

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

    <p><strong>Material Code:</strong> ${product["Material Code"]}</p>

    <div class="specs">
        ${formatSpecs(product["Specs"])}
    </div>

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

        <p><strong>Material Code:</strong> ${product["Material Code"]}</p>

        <p><strong>Category:</strong> ${product["Category"]}</p>

        <p><strong>Specs:</strong></p>

        <div class="specs">
            ${formatSpecs(product["Specs"])}
        </div>

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

const modal = document.getElementById("productModal");
const closeBtn = document.querySelector(".close");

closeBtn.addEventListener("click", function () {
    modal.style.display = "none";
});

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}); 
