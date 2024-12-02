import user = require("user.service");
import drawer = require("drawer.service");
import entity = require("entity.service");
import game = require("game.service")

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

init();
