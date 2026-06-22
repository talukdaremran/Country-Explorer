console.log("Test test con");

const input = document.getElementById("search-field");
const countryContainer = document.getElementById("country-container");
const select = document.querySelector('select[name="region"]');

window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const regionFromURL = urlParams.get('region');
  if (regionFromURL) select.value = regionFromURL;
});

async function liveSearch() {
  const region = select.value; // <-- get current selection
  const query = input.value.trim();

  console.log("region:", region);
  console.log("query:", query);

  const res = await fetch(`/search?name=${query}&region=${region}`);
  const countries = await res.json();

  console.log(countries);

  if (!countries.length) {
    countryContainer.classList.add("remove-grid");
    countryContainer.innerHTML = `
    <p class="no-match">No countries found. Check your spelling or try another region.</p>
    `;
  } else {
    countryContainer.classList.remove("remove-grid");
    countryContainer.innerHTML = countries.map(country => `
      <a class="country-card-small" href="/country?name=${country.names.common}">
        <img 
          src="${country.flag.url_svg}" 
          alt="${country.flag.description}"
        />
        <h3>${country.names.common}</h3>
        <p><strong>Capital:</strong> ${country.capitals?.[0]?.name || "N/A"}</p>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
      </a>
    `).join("");
  };
};

let timeout;

input.addEventListener("input", () => {
  clearTimeout(timeout);
  // debounce (wait until user stops typing)
  timeout = setTimeout(liveSearch, 0); // 0ms delay
});

select.addEventListener("change", liveSearch);