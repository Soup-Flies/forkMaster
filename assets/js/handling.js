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
function formCharCheck (){
//   var city = document.getElementById("inputCity").value;
//   var state = document.getElementById("inputState").value;

  document.getElementById('#borrow').addEventListener("click", function(){
  alert("i work!");



  })

}
