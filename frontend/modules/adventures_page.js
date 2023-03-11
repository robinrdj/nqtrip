
import config from "../conf/index.js";

//Implementation to extract city from query params
function getCityFromURL(search) {
  let params = new URLSearchParams(search);
  return params.get("city");
  // TODO: MODULE_ADVENTURES
  // 1. Extract the city id from the URL's Query Param and return it

}

//Implementation of fetch call with a paramterized input based on city
async function fetchAdventures(city) {
  
  try{
    // let cityGot = getCityFromURL(window.location.search);
    // console.log(cityGot)
    let res = await fetch(`${config.backendEndpoint}/adventures?city=${city}`);
    let resJson = await res.json();
    return resJson;
  }catch(err){
    return null;
  }


  // TODO: MODULE_ADVENTURES
  // 1. Fetch adventures using the Backend API and return the data

}

//Implementation of DOM manipulation to add adventures for the given city from list of adventures
function addAdventureToDOM(adventures) {
  

  adventures.forEach(item=>{
     
  let cardElement = document.createElement("div");
  cardElement.setAttribute("class","activity-card");


  let aElement = document.createElement("a");
  aElement.setAttribute("href",`detail/?adventure=${item.id}`);
  aElement.setAttribute("id",item.id);

  let imgElement = document.createElement("img");
  imgElement.setAttribute("src",item.image);
  imgElement.setAttribute("class","img-custom activity-card img ");

  aElement.append(imgElement);

  let nameElement = document.createElement("p");
  nameElement.innerText=item.name;
  nameElement.setAttribute("class","content-item-left");

  let costPerHeadElement = document.createElement("p");
  costPerHeadElement.innerText=`₹ ${item.costPerHead}`;
  costPerHeadElement.setAttribute("class","content-item-right");


  let durationElement = document.createElement("p");
  durationElement.innerText = "duration";
  durationElement.setAttribute("class","content-item-left");

  let durationValueElement = document.createElement("p");
  durationValueElement.innerText = `${item.duration} hours`;
  durationValueElement.setAttribute("class","content-item-right");


  const row1Element = document.createElement("div");
  row1Element.append(nameElement, costPerHeadElement);
  row1Element.setAttribute("class","display-flex");

  const row2Element = document.createElement("div");
  row2Element.append(durationElement, durationValueElement);
  row2Element.setAttribute("class","display-flex");


  cardElement.append(aElement, row1Element, row2Element);
  cardElement.setAttribute("class", "col-lg-3 col-md-3 col-sm-6 col-xs-6 card-custom");
  

  let dataElement = document.getElementById("data");
  
  dataElement.append(cardElement);
  

  })
  


  // TODO: MODULE_ADVENTURES
  // 1. Populate the Adventure Cards and insert those details into the DOM

}

//Implementation of filtering by duration which takes in a list of adventures, the lower bound and upper bound of duration and returns a filtered list of adventures.
function filterByDuration(list, low, high) {
  // TODO: MODULE_FILTERS
  // 1. Filter adventures based on Duration and return filtered list

}

//Implementation of filtering by category which takes in a list of adventures, list of categories to be filtered upon and returns a filtered list of adventures.
function filterByCategory(list, categoryList) {
  // TODO: MODULE_FILTERS
  // 1. Filter adventures based on their Category and return filtered list

}

// filters object looks like this filters = { duration: "", category: [] };

//Implementation of combined filter function that covers the following cases :
// 1. Filter by duration only
// 2. Filter by category only
// 3. Filter by duration and category together

function filterFunction(list, filters) {
  // TODO: MODULE_FILTERS
  // 1. Handle the 3 cases detailed in the comments above and return the filtered list of adventures
  // 2. Depending on which filters are needed, invoke the filterByDuration() and/or filterByCategory() methods


  // Place holder for functionality to work in the Stubs
  return list;
}

//Implementation of localStorage API to save filters to local storage. This should get called everytime an onChange() happens in either of filter dropdowns
function saveFiltersToLocalStorage(filters) {
  // TODO: MODULE_FILTERS
  // 1. Store the filters as a String to localStorage

  return true;
}

//Implementation of localStorage API to get filters from local storage. This should get called whenever the DOM is loaded.
function getFiltersFromLocalStorage() {
  // TODO: MODULE_FILTERS
  // 1. Get the filters from localStorage and return String read as an object


  // Place holder for functionality to work in the Stubs
  return null;
}

//Implementation of DOM manipulation to add the following filters to DOM :
// 1. Update duration filter with correct value
// 2. Update the category pills on the DOM

function generateFilterPillsAndUpdateDOM(filters) {
  // TODO: MODULE_FILTERS
  // 1. Use the filters given as input, update the Duration Filter value and Generate Category Pills

}
export {
  getCityFromURL,
  fetchAdventures,
  addAdventureToDOM,
  filterByDuration,
  filterByCategory,
  filterFunction,
  saveFiltersToLocalStorage,
  getFiltersFromLocalStorage,
  generateFilterPillsAndUpdateDOM,
};
