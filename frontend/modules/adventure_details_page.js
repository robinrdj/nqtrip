import config from "../conf/index.js";

//Implementation to extract adventure ID from query params
function getAdventureIdFromURL(search) {
  let params = new URLSearchParams(search);
  let adventureId = params.get("adventure");
  return adventureId;
  // TODO: MODULE_ADVENTURE_DETAILS
  // 1. Get the Adventure Id from the URL


  // Place holder for functionality to work in the Stubs
  // return null;
}
//Implementation of fetch call with a paramterized input based on adventure ID
async function fetchAdventureDetails(adventureId) {
   
  try{
    let res = await fetch(`${config.backendEndpoint}/adventures/detail?adventure=${adventureId}`);
    let resJson = await res.json();
    return resJson;
  }catch(err){
    console.log(err);
    return null;
  }




  // TODO: MODULE_ADVENTURE_DETAILS
  // 1. Fetch the details of the adventure by making an API call


  // Place holder for functionality to work in the Stubs
  return null;
}

//Implementation of DOM manipulation to add adventure details to DOM
function addAdventureDetailsToDOM(adventure) {
     let adventureNameElement = document.getElementById("adventure-name");
     adventureNameElement.textContent = adventure.name;

     let adventureSubtitleElement = document.getElementById("adventure-subtitle");
     adventureSubtitleElement.textContent = adventure.subtitle;

     let adventureContentElement = document.getElementById("adventure-content");
     adventureContentElement.textContent = adventure.content;
     
     let photoGalleryElement = document.getElementById("photo-gallery");
     adventure.images.forEach(item=>{
      let galleyElement = document.createElement("img");
      galleyElement.setAttribute("src",item);
      galleyElement.setAttribute("class","activity-card-image");
      photoGalleryElement.append(galleyElement);
     })
     


  // TODO: MODULE_ADVENTURE_DETAILS
  // 1. Add the details of the adventure to the HTML DOM

}

//Implementation of bootstrap gallery component
function addBootstrapPhotoGallery(images) {
  
  let cardsElements = document.querySelectorAll(".activity-card-image");
  cardsElements.forEach(item=>{
    item.parentElement.removeChild(item);
  })
  let carouselInnerElement = document.getElementById("carousel-inner-id");
  carouselInnerElement.innerHTML="";
  images.forEach((item,index)=>{
    if(index===0){
      let divElement = document.createElement("div");
      divElement.setAttribute("class", "carousel-item active");
      divElement.innerHTML=`
      <img src=${item} class="d-block w-100 activity-card-image" alt="alt" />
      `
      carouselInnerElement.append(divElement);
    }
    if(index>0){
      let divElement = document.createElement("div");
      divElement.setAttribute("class", "carousel-item");
      divElement.innerHTML=`
      <img src=${item} class="d-block w-100 activity-card-image" alt="alt" />
      `
      carouselInnerElement.append(divElement);
    }

  })

  // let photoGalleryElement = document.getElementById("photo-gallery");
  // photoGalleryElement.innerHTML="";
  // photoGalleryElement.append(carouselInnerElement);
  // TODO: MODULE_ADVENTURE_DETAILS
  // 1. Add the bootstrap carousel to show the Adventure images




}

//Implementation of conditional rendering of DOM based on availability
function conditionalRenderingOfReservationPanel(adventure) {
  // TODO: MODULE_RESERVATIONS
  // 1. If the adventure is already reserved, display the sold-out message.

}

//Implementation of reservation cost calculation based on persons
function calculateReservationCostAndUpdateDOM(adventure, persons) {
  // TODO: MODULE_RESERVATIONS
  // 1. Calculate the cost based on number of persons and update the reservation-cost field

}

//Implementation of reservation form submission
function captureFormSubmit(adventure) {
  // TODO: MODULE_RESERVATIONS
  // 1. Capture the query details and make a POST API call using fetch() to make the reservation
  // 2. If the reservation is successful, show an alert with "Success!" and refresh the page. If the reservation fails, just show an alert with "Failed!".
}

//Implementation of success banner after reservation
function showBannerIfAlreadyReserved(adventure) {
  // TODO: MODULE_RESERVATIONS
  // 1. If user has already reserved this adventure, show the reserved-banner, else don't

}

export {
  getAdventureIdFromURL,
  fetchAdventureDetails,
  addAdventureDetailsToDOM,
  addBootstrapPhotoGallery,
  conditionalRenderingOfReservationPanel,
  captureFormSubmit,
  calculateReservationCostAndUpdateDOM,
  showBannerIfAlreadyReserved,
};
