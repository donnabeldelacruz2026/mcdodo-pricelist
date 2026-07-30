const sheetURL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhIMvR1ZIpgtxhcUnkDOcUy296YoM0ZtnvtWnE72QWjAYQxIc23NItsrPbWclTc7ScJ9AjZx65_52k/pub?output=csv";

const container = document.getElementById("product-list");

Papa.parse(sheetURL, {
    download: true,
    header: true,
    complete: function(results) {

        displayProducts(results.data);

        document
            .getElementById("search")
            .addEventListener("input", function(){

                const keyword = this.value.toLowerCase();

                const filtered = results.data.filter(product =>

                    Object.values(product)
                        .join(" ")
                        .toLowerCase()
                        .includes(keyword)

                );

                displayProducts(filtered);

            });

    }
});

function displayProducts(products){

    container.innerHTML = "";

    products.forEach(product=>{

        container.innerHTML += `
        <div class="product">

            <h3>${product["Product Name"]}</h3>

            <p>${product["Specs"]}</p>

            <p><strong>SRP:</strong> ₱${product["SRP"]}</p>
            

            <p><strong>Dealer:</strong> ₱${product["Dealer Price"]}</p>

            <p>${product["Status"]}</p>

        </div>
        `;

    });
    let allProducts = [];

function createCategoryButtons(products){

    const container = document.getElementById("categories");

    container.innerHTML = "";

    const categories = [
        "All",
        ...new Set(products.map(p => p["Category"]).filter(Boolean))
    ];

    categories.forEach(category => {

        const button = document.createElement("button");

        button.textContent = category;

        button.className = "category-btn";

        if(category === "All"){
            button.classList.add("active");
        }

        button.onclick = () => {

            document
                .querySelectorAll(".category-btn")
                .forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            if(category === "All"){
                displayProducts(allProducts);
            }else{
                displayProducts(
                    allProducts.filter(
                        p => p["Category"] === category
                    )
                );
            }

        };

        container.appendChild(button);

    });

}

}
