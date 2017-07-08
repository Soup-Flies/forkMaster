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

  if (city =< "65" || state =< "65") {
    alert("please input a new char");
  }







}
