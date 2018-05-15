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

const url = 'http://localhost:3000/login';

casper.start(url,function(){
  this.echo(this.getTitle());
});

casper.waitForResource(url, function() {
  console.log("page loaded");
  this.test.assertExists('form', "main form is found");
  this.evaluate(function(){
    document.getElementById("username").value="admin";
    document.getElementById("password").value="admin";
    document.getElementById("login").click();
  });
});

casper.then(function () {

  this.test.assertEqual(this.getTitle(),'Joogisõber | Siin saad lisada enda jooke', 'Can log into admin user')
})


casper.run();
