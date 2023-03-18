import config from "../conf/index.js";

//Implementation of fetch call to fetch all reservations
 async function fetchReservations() {
  // TODO: MODULE_RESERVATIONS
  // 1. Fetch Reservations by invoking the REST API and return them
  try{
    return await fetch(`${config.backendEndpoint}/reservations/`).then(res=>{return res.json()}).then(response=>{return response});
  }catch(err){
    console.log(err);
    return null;
  }

}

//Function to add reservations to the table. Also; in case of no reservations, display the no-reservation-banner, else hide it.
function addReservationToTable(reservations) {
  // if(reservations.length===0){
  //   document.getElementById("no-reservation-banner").style.display = "block";
  //   document.getElementById("reservation-table-parent").style.display = "none";
  // }else{
  //   document.getElementById("no-reservation-banner").style.display = "none";
  //   document.getElementById("reservation-table-parent").style.display = "block";
  //   let reservationTableElement = document.getElementById("reservation-table");
  //   reservations.forEach(reservation=>{
  //     let trElement = document.createElement("tr");
  //     let reservationDate = new Date(reservation.date);
  //     let options = {year:"numeric",month:"numeric",day:"numeric"};

  //     let reservationTime = new Date(reservation.time);

  //     trElement.innerHTML = `
  //     <td scope="col">${reservation.id}</td>
  //     <td scope="col">${reservation.name}</td>
  //     <td scope="col">${reservation.adventureName}</td>
  //     <td scope="col">${reservation.person}</td>
  //     <td scope="col">${reservationDate.toLocaleDateString("en-IN",options)}</td>
  //     <td scope="col">${reservation.price}</td>
  //     <td scope="col">${reservationTime.toLocaleDateString("en-IN",{year:"numeric", month:"long",day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}</td>
  //     `
  //     let tdElement = document.createElement("td");
  //     tdElement.setAttribute("scope","col");

  //     let buttonElement = document.createElement("button");
  //     buttonElement.setAttribute("class","reservation-visit-button");

  //     let aElement = document.createElement("a");
  //     aElement.setAttribute("href",`../detail/?adventure=${reservation.adventure}`);
  //     aElement.innerText="Visit Adventure";

  //     buttonElement.append(aElement);
  //     tdElement.append(buttonElement);

  //     trElement.append(tdElement);
  //     reservationTableElement.append(trElement);
  //   })
  if (reservations && reservations.length > 0) {
    document.getElementById('no-reservation-banner').style.display = "none";
    document.getElementById('reservation-table-parent').style.display = "block";
    
    let tbodyEle = document.getElementById('reservation-table');
    reservations.forEach((ele) => {
      let resDate = new Date(ele.date);
      let resDateStr = resDate.toLocaleDateString('en-IN');
      let bookingDate = new Date(ele.time);
      // let bookingDateStr = bookingDate.toLocaleString('en-IN');
      let dateDay = bookingDate.getDate();
      let monthIdx = bookingDate.getMonth();
      const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      let month = monthNames[monthIdx];
      let year = bookingDate.getFullYear();
      let hours = bookingDate.getHours();
      let minutes = bookingDate.getMinutes();
      let seconds = bookingDate.getSeconds();
      let ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      let strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

      let tRow = document.createElement('tr');

      tRow.innerHTML = `
        <td>${ele.id}</td>
        <td>${ele.name}</td>
        <td>${ele.adventureName}</td>
        <td>${ele.person}</td>
        <td>${resDateStr}</td>
        <td>${ele.price}</td>
        <td>${dateDay} ${month} ${year}, ${strTime}</td>
        <td>
            <button type="button" id="${ele.id}" class="reservation-visit-button"><a href="../detail/?adventure=${ele.adventure}">Visit Adventure</a></button>
        </td>
      `;

      tbodyEle.append(tRow);
    });
  } 
  else {
    document.getElementById('no-reservation-banner').style.display = "block";
    document.getElementById('reservation-table-parent').style.display = "none";
  }
  }


  // TODO: MODULE_RESERVATIONS
  // 1. Add the Reservations to the HTML DOM so that they show up in the table

  //Conditionally render the no-reservation-banner and reservation-table-parent

  /*
    Iterating over reservations, adding it to table (into div with class "reservation-table") and link it correctly to respective adventure
    The last column of the table should have a "Visit Adventure" button with id=<reservation-id>, class=reservation-visit-button and should link to respective adventure page

    Note:
    1. The date of adventure booking should appear in the format D/MM/YYYY (en-IN format) Example:  4/11/2020 denotes 4th November, 2020
    2. The booking time should appear in a format like 4 November 2020, 9:32:31 pm
  */


export { fetchReservations, addReservationToTable };
