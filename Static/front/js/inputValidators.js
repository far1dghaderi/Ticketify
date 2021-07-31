const checkInputValue = (input, isValid) => {
  if (isValid) {
    input.style.borderColor = "";
  } else {
    input.style.borderColor = "red";
  }
};

//- signup form validator
const signUpForm = document.querySelector("#signup-form");

if (signUpForm) {
  //validating fields
  signUpForm.addEventListener("submit", (e) => {
    //reseting errors beofre revalidating them
    checkInputValue(signUpForm.firstname, true);
    checkInputValue(signUpForm.lastname, true);
    checkInputValue(signUpForm.email, true);
    checkInputValue(signUpForm.password, true);
    checkInputValue(signUpForm.confirmPassword, true);
    if (signUpForm.firstname.value.length < 2) {
      checkInputValue(signUpForm.firstname, false);
      alert("firstname must have at least 2 characters");
      e.preventDefault();
    } else if (signUpForm.firstname.value.length > 40) {
      checkInputValue(signUpForm.firstname, false);
      alert("firstname must have  less than 41 characters");
      e.preventDefault();
    } else if (signUpForm.lastname.value.length < 2) {
      checkInputValue(signUpForm.lastname, false);
      alert("lastname must have at least 2 characters");
      e.preventDefault();
    } else if (signUpForm.lastname.value.length > 40) {
      checkInputValue(signUpForm.lastname, false);
      alert("lastname must have  less than 41 characters");
      e.preventDefault();
    } else if (signUpForm.email.value.length < 7) {
      checkInputValue(signUpForm.email, false);
      alert("email must have at least 2 characters");
      e.preventDefault();
    } else if (signUpForm.email.value.length > 330) {
      checkInputValue(signUpForm.email, false);
      alert("email must have  less than 331 characters");
      e.preventDefault();
    } else if (signUpForm.password.value.length < 8) {
      checkInputValue(signUpForm.password, false);
      alert("password must have at least 8 characters");
      e.preventDefault();
    } else if (signUpForm.password.value.length > 40) {
      checkInputValue(signUpForm.password, false);
      alert("password must have  less than 129 characters");
      e.preventDefault();
    } else if (signUpForm.password.value != signUpForm.confirmPassword.value) {
      checkInputValue(signUpForm.confirmPassword, false);
      alert("passwords are not the same");
      e.preventDefault();
    }
  });
}

//- signin form validator
const signInForm = document.querySelector("#signin-form");

if (signInForm) {
  signInForm.addEventListener("submit", (e) => {
    //reseting errors for re-validation them
    checkInputValue(signInForm.email, true);
    checkInputValue(signInForm.password, true);

    if (signInForm.email.value.length < 7) {
      checkInputValue(signInForm.email, false);
      e.preventDefault();
      alert("please enter a valid email");
    } else if (signInForm.email.value.length > 330) {
      checkInputValue(signInForm.email, false);
      alert("email must have  less than 331 characters");
      e.preventDefault();
    } else if (signInForm.password.value.length < 8) {
      checkInputValue(signInForm.password, false);
      alert("password must have at least 8 characters");
      e.preventDefault();
    } else if (signInForm.password.value.length > 40) {
      checkInputValue(signInForm.password, false);
      alert("password must have  less than 129 characters");
      e.preventDefault();
    }
  });
}

//- Reset password validator
const resetPasswordForm = document.querySelector("#reset-password-form");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", (e) => {
    //reseting errors for re-validation them
    if (resetPasswordForm.email.value.length < 7) {
      checkInputValue(resetPasswordForm.email, false);
      e.preventDefault();
      alert("please enter a valid email");
    } else if (resetPasswordForm.email.value.length > 330) {
      checkInputValue(resetPasswordForm.email, false);
      alert("email must have  less than 331 characters");
      e.preventDefault();
    }
  });
}

//- change password validators
const changePasswordForm = document.querySelector("#change-password-form");
if (changePasswordForm) {
  changePasswordForm.addEventListener("submit", (e) => {
    //reseting errors for re-validation them

    checkInputValue(changePasswordForm.password, false);
    checkInputValue(changePasswordForm.confirmPassword, false);
    if (changePasswordForm.password.value.length < 8) {
      checkInputValue(changePasswordForm.password, false);
      alert("password must have at least 8 characters");
      e.preventDefault();
    } else if (changePasswordForm.password.value.length > 40) {
      checkInputValue(changePasswordForm.password, false);
      alert("password must have  less than 129 characters");
      e.preventDefault();
    } else if (
      changePasswordForm.password.value !=
      changePasswordForm.confirmPassword.value
    ) {
      checkInputValue(changePasswordForm.confirmPassword, false);
      alert("passwords are not the same");
      e.preventDefault();
    }
  });
}
