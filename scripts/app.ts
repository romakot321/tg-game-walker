import user = require("user.service");
import drawer = require("drawer.service");
import entityRepository = require("entity.repository");
import animationRepository = require("animation.repository");
import entityService = require("entity.service");
import game = require("game.service")
import server = require("server.service");

var dataElement = document.getElementById("data");

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

  var entityRep = new entityRepository.EntityRepository();
  var animationRep = new animationRepository.AnimationRepository();
  var entityServ = new entityService.EntityService(entityRep, animationRep);
  var userService = new user.UserService(username);
  var drawerService = new drawer.DrawerService(entityRep);
  var serverService = new server.ServerService("", userService);
  var gameService = new game.GameService(username, userService, entityServ, animationRep, drawerService, serverService);

  gameService.start();
}

init();
