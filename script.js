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

    products.forEach(product => {

       container.innerHTML += `
<div class="product">

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

    <span class="status">${product["Status"]}</span>

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
