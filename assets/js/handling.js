function formVal (){
  var city = document.getElementById("inputCity").value;
  var state = document.getElementById("inputState").value;

  if (city === "" || state === ""){
    $("#modal").modal("show")
    // alert("please input correct info")
    return false;
    console.log();
  }
  else{
      updateCurrentSearch(this);
      return true;


  }

}

window.onkeydown = function (e) {
var code = e.keyCode //this returns the number to test against
console.log(code);
  if (code >= 65 || code <= 90 || code == 32) {
    //do good stuff with the pressed key

  } else {
    //input different keypress
    //wouldn't suggest a popup on this though just do nothing or something like that
    })
  }

}
