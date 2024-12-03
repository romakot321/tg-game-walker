import user = require("user.service");
import drawer = require("drawer.service");
import entity = require("entity.service");
import game = require("game.service")

declare global {
  interface Window {
    Telegram: any;
  }
}

var dataElement = document.getElementById("data");

var userService: user.UserService;
var drawerService: drawer.DrawerService;
var entityService: entity.EntityService;
var gameService: game.GameService;

function init() {
  userService = new user.UserService();
  drawerService = new drawer.DrawerService();
  entityService = new entity.EntityService();
  gameService = new game.GameService(userService, entityService, drawerService);

  gameService.start();
}

const app = window.Telegram.WebApp;
app.expand();
app.ready();
app.disableVerticalSwipes();
document.body.style.overflowY = 'hidden'
document.body.style.marginTop = `1px`
document.body.style.height = window.innerHeight + 1 + "px"
document.body.style.paddingBottom = `1px`
window.scrollTo(0, 1);

init();
