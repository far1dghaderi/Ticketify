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
// window.addEventListener("scroll", (e) => {
//   //this will stick menu bar to the top when the user starts scrolling and will revert it to its default position when user reaches top of the webpage again
//   if (window.scrollY > 100) {
//     mainNavbar.classList.add("sticky-navbar");
//     document.body.style.marginTop = mainNavbar.clientHeight;
//     mainNavbar.style.boxShadow = "0 4px 4px 0 #00000030";
//   } else {
//     mainNavbar.classList.remove("sticky-navbar");
//     document.body.style.marginTop = "0px";
//   }
// });
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
if (navAccountBtn) {
  navAccountBtn.addEventListener("mouseleave", () => {
    rotatableAccountNavIcon.style.animation = "rotate-down-icon 0.3s forwards";
    dropDownAccountMenu.classList.add("none");
  });
  navAccountBtn.addEventListener("mouseenter", () => {
    rotatableAccountNavIcon.style.animation = "rotate-up-icon 0.3s forwards";
    dropDownAccountMenu.classList.remove("none");
  });
}

//#endregion

//#region match tickets
//tickets panel
const floorsButton = document.querySelector(".floors-ul");
const ticketsContainer = document.querySelectorAll(".tickets-container");
const flootsLI = document.querySelectorAll(".floors-ul li");
if (ticketsContainer) {
  ticketsContainer.forEach((el, index) => {
    if (index != 0) {
      el.classList.add("none");
    }
  });
}
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
const standIdContainer = document.querySelector("#standID");
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
        standIdContainer.value = e.target.textContent;
        purchasePriceContainer.textContent =
          e.target.nextElementSibling.textContent + "$";
      }
      if (e.target.classList.contains("stand-price-container")) {
        purchasePriceContainer.textContent = e.target.textContent + "$";
        purchaseidContainer.textContent =
          e.target.previousElementSibling.textContent;
        standIdContainer.value = e.target.previousElementSibling.textContent;
      }
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      purchaseBox.classList.remove("none");
    }
  });
});

//Countdown timer for matches that hasn't been started yet

//get countdown timers box
const countdown = document.querySelector(".count-down");
if (countdown) {
  //get the difference between current date and start match date
  setInterval(() => {
    let { days, hours, minutes, seconds } = dateDifference(
      countdown.dataset.date
    );
    countdown.children.days.textContent = days;
    countdown.children.hours.textContent = hours;
    countdown.children.minutes.textContent = minutes;
    countdown.children.seconds.textContent = seconds;
    //if there was no difference between current date and
    if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
      setTimeout(() => {
        location.reload();
      }, 2000);
    }
  }, 1000);
}

//#endregion

//#region  Admin panel | create stadium
//adding stands
const addStandBtn = document.querySelector("#add-stand-btn");
const stadiumForm = document.querySelector("#stadium-form");

if (addStandBtn) {
  addStandBtn.addEventListener("click", () => {
    //deifne the color of stand row
    const standsContainer = document.querySelector(".stands-container");
    const standRows = document.querySelectorAll(".stands-row-data");
    let standRowColor;
    //if it was any row in the stands container, we will choose the color of the row base of the last row
    if (standRows.length != 0) {
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
      return alert("Stand ID must have more than 1 character");
    } else if (stadiumForm.availabilty.value == "availabilty") {
      return alert("Please choose an availabilty option for the stand");
    } else if (stadiumForm.country.value == "country") {
      return alert("Please choose a country for the stand");
    } else if (stadiumForm.province.value == "province") {
      return alert("Please choose a province for the stand");
    } else if (stadiumForm.city.value == "city") {
      return alert("Please choose a city for the stand");
    } else if (stadiumForm.floor.value == "floor") {
      return alert("Please choose a floor for the stand");
    } else if (stadiumForm.price.value.length < 1) {
      return alert("Please specify a price for the stand");
    } else if (stadiumForm.capacity.value * 1 < 1) {
      return alert("Please specify a capacity for the stand");
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
  <input type="text" value="${stadiumForm.standId.value}" name="stand_${
        standRows.length + 1
      }_id" readonly />
</div>
<div class="column-floor column">
  <input type="text" value="${stadiumForm.floor.value}" name="stand_${
        standRows.length + 1
      }_floor" readonly />
</div>
<div class="column-stand column">
  <input
    type="text"
    value="${stadiumForm.location.value}"
    name="stand_${standRows.length + 1}_location"
    readonly
  />
</div>
<div class="column-price column flex">
  <input
    type="text"
    value="${stadiumForm.price.value}$"
    name="stand_${standRows.length + 1}_price"
    readonly
  />
</div>
<div class="column-availablity column">
  <input
    type="text"
    value="${stadiumForm.availabilty.value}"
    name="stand_${standRows.length + 1}_availablity"
    readonly
  />
</div>
<div class="column-capacity column">
  <input
    type="text"
    value="${stadiumForm.capacity.value}"
    name="stand_${standRows.length + 1}_capacity"
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
}
//removing stands
if (stadiumForm) {
  stadiumForm.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-stand-btn")) {
      e.target.parentNode.remove();
    }
  });
}
//- Fill imgs with selected image

//logos form
const logo = document.querySelector(".img-logo");
const fileInput = document.querySelector(".logo-file-input");

if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const img = e.target.files;
    logo.src = URL.createObjectURL(img[0]);
  });
}
//team bg
const bg = document.querySelector(".img-bg");
const bgFileInput = document.querySelector(".bg-file-input");

if (bgFileInput) {
  bgFileInput.addEventListener("change", (e) => {
    const img = e.target.files;
    bg.src = URL.createObjectURL(img[0]);
  });
}
//- Add btn in panel hover effects
const floatBtn = document.querySelector(".float-add-btn");
if (floatBtn) {
  floatBtn.addEventListener("mouseover", () => {
    floatBtn.classList.add("float-add-btn-hover");
    floatBtn.textContent = "Create new one";
  });
  floatBtn.addEventListener("mouseout", () => {
    floatBtn.classList.remove("float-add-btn-hover");
    floatBtn.textContent = "+";
  });
}

//-Copy id to clipboard
// teams, comps
const idContainer = document.querySelector(".teams");
if (idContainer) {
  //appending click event listener to parent
  idContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("copy-id-btn")) {
      e.preventDefault();
      //adding a temporary textarea to
      //DOM for copying the ID of container to the clipboard
      const textArea = document.createElement("textarea");
      document.body.appendChild(textArea);
      textArea.value = e.target.dataset.id;
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  });
}
//stadiums
const idContainer2 = document.querySelector(".table");
if (idContainer2) {
  //appending click event listener to parent
  idContainer2.addEventListener("click", (e) => {
    if (e.target.classList.contains("copy-id-btn")) {
      e.preventDefault();
      //adding a temporary textarea to
      //DOM for copying the ID of container to the clipboard
      const textArea = document.createElement("textarea");
      document.body.appendChild(textArea);
      textArea.value = e.target.dataset.id;
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
  });
}
//- verify email
//#region Send confirmation code
const verifyEmailContainer = document.querySelector(".verify-section");
const verifyEmailBtn = document.querySelector("#verify-email-btn");
const resendCode = document.querySelector("#resend-code");
const sendCode = () => {
  return axios({
    url: `/auth/email/sendcode`,
    method: "POST",
  });
};
//show the vertification window when the user hits the verify button
if (verifyEmailBtn) {
  verifyEmailBtn.addEventListener("click", () => {
    verifyEmailContainer.classList.remove("none");
    verifyEmailContainer.children["send-code-container"].classList.remove(
      "none"
    );
    verifyEmailContainer.children["enter-code-container"].classList.add("none");
  });
  //show enter code window when the user htis the button
  verifyEmailContainer.children["send-code-container"].addEventListener(
    "click",
    (e) => {
      //when the user hits the send code button, we will send the vertification code
      if (e.target.classList.contains("send-code-btn")) {
        sendCode()
          .then((data) => {
            console.log(data.data.message);
          })
          .catch((err) => {
            console.log(err);
          });

        verifyEmailContainer.children["send-code-container"].classList.add(
          "none"
        );
        verifyEmailContainer.children["enter-code-container"].classList.remove(
          "none"
        );
      }
    }
  );
  //when the user hits the resend button, we will send the vertification code again
  if (resendCode) {
    resendCode.addEventListener("click", () => {
      sendCode()
        .then((data) => {
          console.log(data.data.message);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }
  //#endregion

  //#region verifyEmail
  //this function will send a post request to the server for verifying the email
  const verifyEmail = (code) => {
    return axios({ url: "/auth/email/verify", method: "POST", data: { code } });
  };
  const confirmCodeInput = document.querySelector("#confirm-code-input");
  const confirmCodeBtn = document.querySelector("#confirm-code-btn");
  if (confirmCodeInput && confirmCodeBtn) {
    //when the user hits the send button, we will check it's code to the server
    confirmCodeBtn.addEventListener("click", () => {
      //for preventing extra request from the client, we won't let the user to send codes that has less or more than 6 digits
      if (confirmCodeInput.value.length != 6) {
        alert("please enter a correct code");
      } else {
        //sending request to the server
        verifyEmail(confirmCodeInput.value)
          .then((data) => {
            console.log(data.data.message);
            if (data.data.status == "success") {
              setTimeout(() => {
                location.reload();
              }, 3000);
            }
          })
          .catch((err) => console.log(err));
      }
    });
  }
  //#endregion
  //close vertification window when the user hits the close button
  verifyEmailContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("close")) {
      verifyEmailContainer.classList.add("none");
      verifyEmailContainer.children["send-code-container"].classList.add(
        "none"
      );
      verifyEmailContainer.children["enter-code-container"].classList.add(
        "none"
      );
    }
  });
}

//get all datetime-local and change theire value to a value that they can show in the output
const localDateInputes = document.querySelectorAll(
  "input[type='datetime-local']"
);
localDateInputes.forEach((el) => {
  el.value = fortmatDate(el.dataset.date);
});

//Handler for to make sure that the user wants to delete an item
const deleteItemBtn = document.querySelectorAll(".delete-item-btn");
deleteItemBtn.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let result = window.confirm(
      "This item will be remove from the database, Are you sure?"
    );
    if (!result) e.preventDefault();
  });
});

//index countdown
