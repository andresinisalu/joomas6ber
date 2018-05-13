function checkPassword () {
  if($('#confirm').val() !==$('#password').val() ){
    $('#confirm').removeClass('alert alert-success')
    $('#confirm').addClass('alert alert-danger')
    $('#submit').attr("disabled", "disabled")
  } else {
    console.log($('#confirm').val())
    console.log($('#password').val())
    $('#confirm').removeClass('alert alert-danger')
    $('#confirm').addClass('alert alert-success')
    $('#submit').removeAttr("disabled")
  }
}