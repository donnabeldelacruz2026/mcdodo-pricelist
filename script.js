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

            <h3>${product["Product Name"]}</h3>

            <p><strong>Model:</strong> ${product["Model Number"]}</p>

            <p><strong>Item Code:</strong> ${product["Item Code"]}</p>

            <p>${product["Specs"]}</p>

            <p><strong>SRP:</strong> ₱${product["SRP"]}</p>

            <p><strong>Dealer:</strong> ₱${product["Dealer Price"]}</p>

            <p><strong>VOL:</strong> ₱${product["VOL Price"]}</p>

            <p><strong>MOQ:</strong> ${product["MOQ"]}</p>

            <p class="status">${product["Status"]}</p>

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
