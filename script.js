const products = [
    {
        sku: "CH001",
        name: "67W GaN Charger",
        price: "₱1,499"
    },
    {
        sku: "CB001",
        name: "100W USB-C Cable",
        price: "₱399"
    }
];

const container = document.getElementById("product-list");

function displayProducts(list){
    container.innerHTML = "";

    list.forEach(product=>{
        container.innerHTML += `
            <div class="product">
                <h2>${product.name}</h2>
                <p><strong>${product.sku}</strong></p>
                <p>${product.price}</p>
            </div>
        `;
    });
}

displayProducts(products);

document.getElementById("search").addEventListener("input", e=>{
    const keyword = e.target.value.toLowerCase();

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(keyword) ||
        p.sku.toLowerCase().includes(keyword)
    );

    displayProducts(filtered);
});
