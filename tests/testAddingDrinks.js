const url = 'http://localhost:3000/register';
const url2 = 'http://localhost:3000/login';
const url3 = 'http://localhost:3000/deleteAccount'
const url4 = 'http://localhost:3000/'
const url5 = 'http://localhost:3000/drinks/add'


casper.start(url,function(){
  this.echo(this.getTitle());
});

casper.then(function () {
  console.log("page loaded");
  this.test.assertExists('form', "signupform is found");
  this.evaluate(function(){
    document.getElementById("firstName").value="FirstName";
    document.getElementById("lastName").value="LastName";
    document.getElementById("username").value="testuser";
    document.getElementById("password").value="password";
    document.getElementById("confirm").value="password";
    document.getElementById("submit").click();
  });

})

casper.thenOpen(url2, function() {
  console.log("page loaded");
  this.test.assertExists('form', "main form is found");
  this.evaluate(function(){
    document.getElementById("username").value="testuser";
    document.getElementById("password").value="password";
    document.getElementById("login").click();
  });
});

casper.thenOpen(url4, function () {

  console.log("page loaded");
  this.test.assertExists('form', "adding drings for is found");
  this.evaluate(function(){
      document.getElementById("nameInput").value="testjook";
      document.getElementById("volumeInput").value="500";
      document.getElementById("alcoholPercentageInput").value="10";
      document.getElementById("priceInput").value="10";
      document.getElementById("addNewDrink").click();
  });


})

casper.thenOpen(url4, function () {
  this.test.assertExists('.google-visualization-table-td', "Drink is added and appears");
})



// casper.thenOpen(url3, function () {
//
//   this.evaluate(function () {
//     document.getElementById("deleteAccount").click()
//   })
//
//   this.test.assertExists('form', "Redirected back into main page");
// })




casper.run();
