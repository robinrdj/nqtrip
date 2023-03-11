import config from "../conf/index.js";

async function init() {

  //Fetches list of all cities along with their images and description
  let cities = await fetchCities();
  //Updates the DOM with the cities
  console.log(cities);
  // if (cities) {
    cities.forEach((key) => {
      addCityToDOM(key.id, key.city, key.description, key.image);
    });
  // }
}

//Implementation of fetch call
async function fetchCities() {
  // TODO: MODULE_CITIES
  // 1. Fetch cities using the Backend API and return the data

  try{
    let citiesInitital = await fetch(`${config.backendEndpoint}/cities`);
    let cities = await citiesInitital.json();
   return cities;
  }
  catch(err){
    return null;
  }


}

//Implementation of DOM manipulation to add cities
function addCityToDOM(id, city, description, image) {
  // TODO: MODULE_CITIES
  // 1. Populate the City details and insert those details into the DOM
  const containerElement = document.createElement("div");
  const aElement = document.createElement("a");
  aElement.setAttribute("href",`pages/adventures/?city=${id}`);
  aElement.setAttribute("id", id);


  const imgElement = document.createElement("img");
  imgElement.setAttribute("src",image);

  aElement.append(imgElement);

  const pElement = document.createElement("p");
  pElement.innerText=city;
  const descriptionElement = document.createElement("p");
  descriptionElement.innerText = description;
  containerElement.append(aElement);
  containerElement.append(pElement);
  containerElement.append(descriptionElement);

  const dataElement = document.getElementById("data");
  dataElement.append(containerElement);



}

export { init, fetchCities, addCityToDOM };
