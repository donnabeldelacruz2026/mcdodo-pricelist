const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhIMvR1ZIpgtxhcUnkDOcUy296YoM0ZtnvtWnE72QWjAYQxIc23NItsrPbWclTc7ScJ9AjZx65_52k/pub?output=csv";

const container = document.getElementById("product-list");

let allProducts = [];


function formatSpecs(specs) {
    if (!specs) return "";

    return specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "")
        .map(line => {
            const parts = line.split(":");
            const label = parts.shift();
            const value = parts.join(":");

            return `
                <div class="spec-row">
                    <strong>${label}:</strong>
                    <span>${value}</span>
                </div>
            `;
        })
        .join("");
}

function shortSpecs(specs, maxLines = 3) {
    if (!specs) return "";

    return specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "")
        .slice(0, maxLines)
        .map(line => {
            const parts = line.split(":");
            const label = parts.shift();
            const value = parts.join(":");

            return `<p>
                <strong>${label}:</strong>${value}
            </p>`;
        })
        .join("");
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

function shortSpecs(specs, maxLines = 3) {
    if (!specs) return "";

    return specs
        .split(/\r?\n/)
        .filter(line => line.trim() !== "")
        .slice(0, maxLines)
        .map(line => `<p>${line}</p>`)
        .join("");
}

function displayProducts(products) {

    container.innerHTML = "";

    products.forEach((product) => {

        // Find the original product index
        const originalIndex = allProducts.indexOf(product);

        const status = product["Status"] || "";

        container.innerHTML += `
            <div class="product-card" onclick="showDetails(${originalIndex})">

                <img
                    src="${product["Image"] || "images/placeholder.png"}"
                    alt="${product["Product Name"] || ""}"
                    class="product-image"
                    onerror="this.src='images/placeholder.png'"
                >

                <h2>${product["Product Name"] || ""}</h2>

                <p>
                    <strong>Model:</strong>
                    ${product["Model Number"] || "-"}
                </p>

                <p>
                    <strong>Material Code:</strong>
                    ${product["Material Code"] || "-"}
                </p>

                <div class="short-specs">
                    ${shortSpecs(product["Specs"], 3)}
                </div>

                <div class="price-box">

                    <p>
                        <span>SRP</span>
                        <strong>
                            ₱${Number(product["SRP"] || 0).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>Dealer</span>
                        <strong>
                            ₱${Number(product["Dealer Price"] || 0).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>VOL</span>
                        <strong>
                            ₱${Number(product["VOL Price"] || 0).toLocaleString()}
                        </strong>
                    </p>

                    <p>
                        <span>MOQ</span>
                        <strong>${product["MOQ"] || "-"}</strong>
                    </p>

                </div>

                <span class="status ${status.toLowerCase().replace(/\s+/g, "-")}">
                    ${status}
                </span>

                <p class="view-details">
                    Click to view full details →
                </p>

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

    // Keep the selected button visible
    button.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
    });

    if (category === "All") {
        displayProducts(allProducts);
    } else {
        displayProducts(
            allProducts.filter(p => p["Category"] === category)
        );
    }
};
        
}
function showDetails(index) {

    const product = allProducts[index];

    if (!product) {
        console.error("Product not found:", index);
        return;
    }

    const image =
        product["Image"] && product["Image"].trim() !== ""
            ? product["Image"]
            : "images/placeholder.png";

    const status = product["Status"] || "";

    document.getElementById("modalBody").innerHTML = `

        <img
            src="${image}"
            class="product-image"
            onerror="this.src='images/placeholder.png'"
        >

        <h2>${product["Product Name"] || ""}</h2>

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
            ₱${Number(product["SRP"] || 0).toLocaleString()}
        </p>

        <p>
            <strong>Dealer Price:</strong>
            ₱${Number(product["Dealer Price"] || 0).toLocaleString()}
        </p>

        <p>
            <strong>VOL Price:</strong>
            ₱${Number(product["VOL Price"] || 0).toLocaleString()}
        </p>

        <p>
            <strong>MOQ:</strong>
            ${product["MOQ"] || "-"}
        </p>

        <p>
            <strong>Status:</strong>
            <span class="status ${status.toLowerCase().replace(/\s+/g, "-")}">
                ${status}
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
