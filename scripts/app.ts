import user = require("user.service");
import drawer = require("drawer.service");
import entity = require("entity.service");
import game = require("game.service")
import server = require("server.service");

var dataElement = document.getElementById("data");

var userService: user.UserService;
var drawerService: drawer.DrawerService;
var entityService: entity.EntityService;
var gameService: game.GameService;
var serverService: server.ServerService;

declare global {
  interface Window {
    Telegram: any;
  }
}

function disableScrolling() {
  const app = window.Telegram.WebApp;
  app.expand();
  app.ready();
  app.disableVerticalSwipes();
  document.body.style.overflowY = 'hidden'
  document.body.style.marginTop = `5px`
  document.body.style.height = window.innerHeight + 5 + "px"
  document.body.style.paddingBottom = `5px`
  window.scrollTo(5, 5);
}

function init() {
  disableScrolling();
  let username = Math.random().toString();

  userService = new user.UserService(username);
  drawerService = new drawer.DrawerService();
  entityService = new entity.EntityService();
  serverService = new server.ServerService("eramir.ru:9999", userService);
  gameService = new game.GameService(username, userService, entityService, drawerService, serverService);

  gameService.start();
}

init();
