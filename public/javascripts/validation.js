function printError(elemId, hintMsg) {
    document.getElementById(elemId).innerHTML = hintMsg;
  }


  //signup 

  function signupValidate() {
    
    const name = document.getElementById("name").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;
    const mobile = document.getElementById("mobile").value;
  
    if (name == "") {
      printError("nameErr", "Please enter your name");
    } else {
      const regex = /^[a-zA-Z\s]+$/;
      if (regex.test(name) === false) {
        printError("nameErr", "Please enter a valid name");
      } else {
        printError("nameErr", "");
      }
    }
  
    if (password == "") {
      printError("passErr", "please enter your password");
    } else {
      printError("passErr", "");
    }
  
    if (email == "") {
      printError("emailErr", "Please enter your email address");
    } else {
      // Regular expression for basic email validation
      const regex = /^\S+@\S+\.\S+$/;
      if (regex.test(email) === false) {
        printError("emailErr", "Please enter a valid email address");
      } else {
        printError("emailErr", "");
      }
    }
    if (mobile == "") {
      printError("mobileErr", "Please enter your mobile number");
    } else {
      const regex = /^[1-9]\d{9}$/;
      if (regex.test(mobile) === false) {
        printError("mobileErr", "Please enter a valid 10 digit mobile number");
      } else {
        printError("mobileErr", "");
      }
    }
  }



//login

  function loginValidate() {
    
    let email = document.getElementById("lEmail").value;
    let password = document.getElementById("lPassword").value;
  
    if (email == "") {
      printError("lEmailErr", "Please enter your email address");
    } else {
      // Regular expression for basic email validation
      const regex = /^\S+@\S+\.\S+$/;
      if (regex.test(email) === false) {
        printError("lEmailErr", "Please enter a valid email address");
      } else {
        printError("lEmailErr", "");
      }
    }

    if (password == "") {
      printError("lPassErr", "please enter your password");
    } else {
      printError("lPassErr", "");
    }
  }
  