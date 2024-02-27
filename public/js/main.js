// Import Three.js library
import * as THREE from '/node_modules/three/build/three.module.js';
import '/node_modules/cannon/build/cannon.min.js';
import { OrbitControls } from '/vendor_mods/OrbitControls.js';

//import { createBrick } from '/methodes/brick.js';
import LevelManagerInstance from '/methodes/LevelManager.js';
import controlsMovementsManager from '/methodes/Movement.js';

window.addEventListener("load", (event) => {
    class BBGame {
        constructor() {
            this.debug = true;
            //level methodes
            this.level = null;
            this.levelManager = null;
            this.controlsMovementsManager = null;
            // brick objects
            //this.createBrick = createBrick;

            this.controleClassic = false;
            this.gameLauched = false;
            this.mass = 1;
            this.ballSpeed = 1;
            this.screenHeight = window.innerHeight;
            this.screenWidth = window.innerWidth;
            this.controls = null;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.params = {
                rotationSpeed: 0.2,
            };
            this.gui = null;
            this.bloomPass = null;
            this.composer = null;
            this.renderScene = null;
            this.balls = [];
            this.walls = [];
            this.world = new CANNON.World();
            this.colors = {
                green: 0x00ff00,
                red: 0xff0000,
                blue: 0x0000ff,
                yellow: 0xffff00,
                orange: 0xffa500,
                purple: 0x800080,
                cyan: 0x00ffff,
                magenta: 0xff00ff,
                darkBlue: 0x00008b
            };
            this.rotation = {
                "vertical" :  (Math.PI / 2),
                "travers_1" : (Math.PI / 4),
                "horizontal" : 0,
                "travers_2" : (-Math.PI / 4),
            }
            this.vitesseMaxForBall = false;
            this.spedNormal = 75;
            this.player1 = {
                id : 1,
                paddle : null,
                baseRotation : this.rotation.horizontal,
                direction : {
                    up : false,
                    down : false,
                    left : false,
                    right : false,
                },
                speed : 0.75,
            };
            this.player2 = {
                id : 2,
                paddle : null,
                baseRotation : this.rotation.horizontal,
                direction : {
                    up : false,
                    down : false,
                    left : false,
                    right : false,
                },
                speed : 1,
            };
            /*
            this.keys = {
                moveUpP1 : 90,
                moveDownP1 : 83,
                moveLeftP1 : 81,
                moveRighttP1 : 68,
                powerP1 : 65,
                laucheBallP1 : 69,
                moveUpP2 : 37,
                moveDownP2 : 39,
                moveLeftP2 : 38,
                moveRighttP2 : 40,
                powerP2 : 161,
                laucheBallP2 : 16,
            }
            */
        }


        creatLevel(level){
            const configLevelLoaded = this.levelManager.creatLevel(level);
            this.game = configLevelLoaded;
            this.controlsMovementsManager = new controlsMovementsManager(this.game);
        }
        init() {
            console.log('init started');
            this.initBasic();
            this.levelManager = new LevelManagerInstance(this);
            console.log('init basic COMPLETED');
            this.gameLauched = true;
            this.initEventListeners() 
        }
        
        initBasic() {
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, this.screenWidth / this.screenHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setSize(this.screenWidth, this.screenHeight);
            document.body.appendChild(this.renderer.domElement);

            this.controls = new OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableKeys = false
            const spotLight = new THREE.SpotLight(0xffffff);
            spotLight.position.set(-200, 100, 100);
            this.scene.add(spotLight);

            const axesHelper = new THREE.AxesHelper(20);
            //"(x,y,z)"
            axesHelper.setColors ( this.colors.blue, this.colors.red, this.colors.green ) 
            this.scene.add(axesHelper);
            this.camera.position.z = 110 ;
            this.world.gravity.set(0, 0, 0);
        }

        initEventListeners() {
            // Ajoutez les écouteurs d'événements au canevas Three.js
            window.addEventListener('keydown', (event) => {
                this.controlsMovementsManager.onKeyDown(event)
            });
            window.addEventListener('keyup', (event) => {
                this.controlsMovementsManager.onKeyUp(event)
            });
        }
        
        initGui() {
            this.gui = new dat.GUI();
        }
        
        startAnimation() {
            console.log("animation loop begin")
            this.animate();
        }

        animate() {
            if (this.player1.direction.left) {
                this.controlsMovementsManager.movePaddleLeft(this.player1);
            }else if(this.player1.direction.right){
                this.controlsMovementsManager.movePaddleRight(this.player1);
            }
            if (this.player2.direction.left) {
                this.controlsMovementsManager.movePaddleLeft(this.player2);
            }else if(this.player2.direction.right){
                this.controlsMovementsManager.movePaddleRight(this.player2);
            }
            if (this.player1.direction.up) {
                this.controlsMovementsManager.movePaddleUp(this.player1)
            }else if(this.player1.direction.down){
                this.controlsMovementsManager.movePaddleDown(this.player1)
            }
            if (this.player2.direction.up) {
                this.controlsMovementsManager.movePaddleUp(this.player2)
            }else if(this.player2.direction.down){
                this.controlsMovementsManager.movePaddleDown(this.player2)
            }
            this.world.step(1 / 120);
            this.updateBallPosition();
            if (this.controleClassic == true) {
                if (this.world.contacts.length > 0) {
                    for(var i=0; i<this.world.contacts.length; i++){
                        var c = this.world.contacts[i];
                        if (c.bi.name === "ball" && c.bj.name.startsWith("paddle_")) {
                            const ball = this.findBallByBody(c.bi);
                            if (c.bj.name.endsWith("_1")) {
                                this.changingDirectionOfBall((ball), this.player1.paddle)
                            }else{
                                this.changingDirectionOfBall((ball), this.player2.paddle)
                            }
                        }
                    }
                }
            }
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(() => this.animate());
       }
       updateBallPosition() {
            this.game.balls.forEach((ball) => {
                const { body, mesh } = ball;
                if (this.debug) {
                    this.debug = false;
                    console.log(body.velocity.length());
                    console.log(body.speed);
                } 
                if (body.velocity.length() <= 0) {
                    body.velocity.copy(new CANNON.Vec3(0, -10, 0));
                }else if (body.velocity.length() < body.speed) {
                    let newVelocity = body.velocity.clone().scale(1.01);
                    body.velocity.copy(newVelocity);
                } else if (body.velocity.length() > body.speed) {
                    let newVelocity = body.velocity.clone().scale(0.99);
                    body.velocity.copy(newVelocity);
                }
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
                mesh.updateMatrixWorld();
            });
        };

    }

    const level_1 = {
        params: { id: 1, name: "Testing Level", modClassic: true, lifes: 3, spawnPoints: { x: 50, y: 25, z: 0 } },
        decorations: {},
        enemies: {},
        walls: [
            { size: { width: 5, height: 100, thickness: 5 }, position: { x: 50, y: 25, z: 0 }, rotation: 0, color: 0x0000ff, id:1 },
            { size: { width: 5, height: 100, thickness: 5 }, position: { x: -50, y: 25, z: 0 }, rotation: 0, color: 0x00ff00 , id:2 },
            { size: { width: 5, height: 100, thickness: 5 }, position: { x: -25, y: 80, z: 0 }, rotation: (-Math.PI / 4), color: 0xffff00 , id:3 },
            { size: { width: 5, height: 100, thickness: 5 }, position: { x: 25, y: 80, z: 0 }, rotation: (Math.PI / 4), color: 0xffff00, id:4 },
            { size: { width: 5, height: 100, thickness: 5 }, position: { x: 0, y: -25, z: 0 }, rotation: Math.PI / 2, color: 0xffff00, id:5},
        ],
        paddles: [
            { playerId: 1 /* Instance de l'objet player 1 */, size: { width: 150, height: 1, thickness: 1 }, position: { x: 0, y: -5, z: 0 },baseRotation:(0), color: 0xffa500 },
            { playerId: 2 /* Instance de l'objet player 2 */, size: { width: 10, height: 2, thickness: 2 }, position: { x: 50, y: -50, z: 0 },baseRotation:(0), color: 0xff00ff },
        ],
        bricks: [
            { type: 1, width: 5, height: 10, thickness: 5, x: 75, y: 75, z: 0, rotation: undefined, color: 0x00008b },
        ],
        balls: [
            { type: 1, width: 32, height: 32, mass: 0.1, color: 0x00008b, speed: 40,  initialPosition:new CANNON.Vec3(0, 0, 0), initialVelocity:new CANNON.Vec3(-20, -20, 0) },
        ],
    };

    const game = new BBGame();
    game.init();
    game.creatLevel(level_1)
    game.startAnimation();
    console.log("gameCreated")

    /*
    document.onkeydown = function(e) {
        if (game.gameLauched == true) {
            game.onKeyDown(e)
        }
    }*/
});
