// casper.option = ({
//   verbose: true,
//   logLevel: 'debug',
//   pageSettings: {
//   loadImages:  false,         // The WebPage instance used by Casper will
//     loadPlugins: false,         // use these settings
//     userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
// }
// });

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

casper.thenOpen(url3, function () {

  this.evaluate(function () {
    document.getElementById("deleteAccount").click()
  })

  this.test.assertExists('form', "Redirected back into main page");
})




casper.run();
