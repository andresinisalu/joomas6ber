

// print out all the messages in the headless browser context
casper.on('remote.message', function(msg) {
  this.echo('remote message caught: ' + msg);
});

// print out all the messages in the headless browser context
casper.on("page.error", function(msg, trace) {
  this.echo("Page Error: " + msg, "ERROR");
});

const url = 'http://localhost:3000/register';
const url2 = 'http://localhost:3000/login';
const url3 = 'http://localhost:3000/deleteAccount'
const url4 = 'http://localhost:3000/'

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

  this.test.assertEqual(this.getTitle(),'Joogisõber | Siin saad lisada enda jooke', 'Can log in with the user')
})

casper.thenOpen(url3, function () {

  this.evaluate(function () {
    document.getElementById("deleteAccount").click()
  })

  this.test.assertExists('form', "Redirected back into main page");
})




casper.run();
