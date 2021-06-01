//disable scroll value changing on input numbers
const inputNumbers = document.querySelectorAll("input[type='number'");
inputNumbers.forEach((input) => {
  input.addEventListener("mousewheel", (e) => {
    e.preventDefault();
  });
});

//#region Navbar
//Sticky navbar
const mainNavbar = document.querySelector(".nav");
window.addEventListener("scroll", (e) => {
  //this will stick menu bar to the top when the user starts scrolling and will revert it to its default position when user reaches top of the webpage again
  if (window.scrollY > 100) {
    mainNavbar.classList.add("sticky-navbar");
    document.body.style.marginTop = mainNavbar.clientHeight;
    mainNavbar.style.boxShadow = "0 4px 4px 0 #00000030";
  } else {
    mainNavbar.classList.remove("sticky-navbar");
    document.body.style.marginTop = "0px";
  }
});
//hover navbar
const hoverableButton = document.querySelector(".navbar-li-sports");
const rotatableSearchNavIcon = document.querySelector(
  ".navbar-li-sports a span"
);
//this two event listeners will rotate menu cheveron icon
hoverableButton.addEventListener("mouseleave", () => {
  rotatableSearchNavIcon.style.animation = "rotate-down-icon 0.3s forwards";
});
hoverableButton.addEventListener("mouseenter", () => {
  rotatableSearchNavIcon.style.animation = "rotate-up-icon 0.3s forwards";
});
//navbar search seaction
const navSearchButton = document.querySelector(".navbar-li-search");
const navSearchForm = document.querySelector("#navbar-search");
//this event listener shows the nav search box
navSearchButton.addEventListener("click", (e) => {
  navSearchForm.classList.toggle("none");
});

//navbar user action button
const navAccountBtn = document.querySelector(".acoount-btn-nav");
const rotatableAccountNavIcon = document.querySelector(".acoount-btn-nav span");
const dropDownAccountMenu = document.querySelector(".acoount-btn-nav ul");
//this part of code shows the accounts button menu
navAccountBtn.addEventListener("mouseleave", () => {
  rotatableAccountNavIcon.style.animation = "rotate-down-icon 0.3s forwards";
  dropDownAccountMenu.classList.add("none");
});
navAccountBtn.addEventListener("mouseenter", () => {
  rotatableAccountNavIcon.style.animation = "rotate-up-icon 0.3s forwards";
  dropDownAccountMenu.classList.remove("none");
});

//#endregion

//#region match tickets
//tickets panel
const floorsButton = document.querySelector(".floors-ul");
const ticketsContainer = document.querySelectorAll(".tickets-container");
const flootsLI = document.querySelectorAll(".floors-ul li");
//this part of code is for the tickets panel
if (floorsButton) {
  floorsButton.addEventListener("click", (e) => {
    //removes active class on all li element
    flootsLI.forEach((li) => {
      li.classList.remove("active");
    });
    //shows the div that is related to selected LI
    if (e.target.nodeName === "LI") {
      ticketsContainer.forEach((el) => {
        if (el.id === `tickets-container-${e.target.textContent}`) {
          el.classList.remove("none");
        } else {
          el.classList.add("none");
        }
      });
      //add active class to selected div
      e.target.classList.add("active");
    }
  });
}

const standsContainer = document.querySelectorAll(".stand-container");
const standBoxes = document.querySelectorAll(".stand-box");
const purchaseBox = document.querySelector(".purchase-box");
const purchasePriceContainer = document.querySelector(
  ".purchase-price-container"
);
const purchaseidContainer = document.querySelector(".purchase-id-container");
//add click event listener to all ticket containers
standsContainer.forEach((container) => {
  container.addEventListener("click", (e) => {
    //change ticket box style to acitve
    let target = e.target.parentNode;
    if (
      target.classList.contains("stand-box") &&
      !target.classList.contains("sold-out")
    ) {
      //reset all ticket boxs box shadow
      standBoxes.forEach((standBox) => {
        standBox.style.boxShadow = null;
      });
      //getting price and id and put them in purchase box
      if (e.target.classList.contains("stand-id-container")) {
        purchaseidContainer.textContent = e.target.textContent;
        purchasePriceContainer.textContent =
          e.target.nextElementSibling.textContent + "$";
      }
      if (e.target.classList.contains("stand-price-container")) {
        purchasePriceContainer.textContent = e.target.textContent + "$";
        purchaseidContainer.textContent =
          e.target.previousElementSibling.textContent;
      }

      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      purchaseBox.classList.remove("none");
    }
  });
});
//#endregion

//#region  Admin panel | create stadium
//adding stands
const addStandBtn = document.querySelector("#add-stand-btn");
const stadiumForm = document.querySelector("#stadium-form");

addStandBtn.addEventListener("click", () => {
  //deifne the color of stand row
  const standsContainer = document.querySelector(".stands-container");
  const standRows = document.querySelectorAll(".stands-row-data");
  let standRowColor;
  //if it was any row in the stands container, we will choose the color of the row base of the last row
  if (standRows) {
    if (standRows[standRows.length - 1].classList.contains("blue-row")) {
      standRowColor = "purple-row";
    } else {
      standRowColor = "blue-row";
    }
    //if it wasnt any row in the stands container, we will set the color to blue
  } else {
    standRowColor = "blue-row";
  }
  //get all stand inputs values
  if (stadiumForm.standId.value.length < 2) {
    // TODO show error
  } else if (stadiumForm.availabilty.value == "Availabilty") {
    // TODO show error
  } else if (stadiumForm.location.value == "Location") {
    // TODO show error
  } else if (stadiumForm.floor.value == "Error") {
    // TODO show error
  } else if (stadiumForm.price.value.length < 1) {
    // TODO show error
  } else {
    //create new row for new stand
    let standRow = document.createElement("div");
    standRow.classList.add(
      "stands-row",
      "stands-row-data",
      "flex",
      standRowColor
    );
    standRow.innerHTML = `<div class="columns flex">
<div class="column-id column">
  <input type="text" value="${stadiumForm.standId.value}" name="stand-${
      standRows.length + 1
    }-id" readonly />
</div>
<div class="column-floor column">
  <input type="text" value="${stadiumForm.floor.value}" name="stand-${
      standRows.length + 1
    }-floor" readonly />
</div>
<div class="column-stand column">
  <input
    type="text"
    value="${stadiumForm.location.value}"
    name="stand-${standRows.length + 1}-stand"
    readonly
  />
</div>
<div class="column-price column">
  <input
    type="text"
    value="${stadiumForm.price.value}$"
    name="stand-${standRows.length + 1}-price"
    readonly
  />
</div>
<div class="column-availablity column">
  <input
    type="text"
    value="${stadiumForm.availabilty.value}"
    name="stand-${standRows.length + 1}-availablity"
    readonly
  />
</div>
<div class="column-capacity column">
  <input
    type="text"
    value="${stadiumForm.capacity.value}"
    name="stand-${standRows.length + 1}-capacity"
    readonly
  />
</div>

<span
  class="stand-column-btn delete-stand-btn bi-trash-fill"
></span>
</div>`;
    //add row to stands container
    standsContainer.appendChild(standRow);
  }
});
//removing stands
stadiumForm.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-stand-btn")) {
    e.target.parentNode.remove();
  }
});
