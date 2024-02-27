import * as THREE from '/node_modules/three/build/three.module.js';

export default class LevelManager {
    constructor(game) {
        this.game = game;
        //configs
        this.id = null;
        this.name = null;
        this.modClassic = null;
        this.life = null;
        this.spawnPoints = null;
        //objects
        this.walls = null;
        this.bricks = null;
        this.paddles = null;
        this.enemies = null;
        this.decorations = null;
    }

    initLevelConfigs(level){
        //configs
        this.id = level.params.id;
        this.name = level.params.name;
        this.modClassic = level.params.modClassic;
        this.life = level.params.lifes;
        this.spawnPoints = level.params.spawnPoints;
        //objects
        this.walls = level.walls;
        this.balls = level.balls;
        this.bricks = level.bricks;
        this.paddles = level.paddles;
        this.enemies = level.enemies;
        this.decorations =level.decorations;
    }
    
    createPaddle({playerId, size, position, baseRotation, color = 0x00ff00}) {
        const paddleGeometry = new THREE.BoxGeometry(size.width, size.height, size.thickness);
        const paddleMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        const paddleMesh = new THREE.Mesh(paddleGeometry, paddleMaterial);
        
        paddleMesh.position.set(position.x, position.y, position.z);
        paddleMesh.rotation.z = baseRotation;
    
        const paddleShape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.thickness / 2));
        const paddleBody = new CANNON.Body({ mass: 0});
        paddleBody.name = "paddle_" + playerId;
        paddleBody.addShape(paddleShape);
    
        paddleBody.material = new CANNON.Material();
        paddleBody.position.set(position.x, position.y, position.z);
        paddleBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), (paddleMesh.rotation.z));
    
        this.game.scene.add(paddleMesh);
        this.game.world.addBody(paddleBody);
        const newpaddle = { body: paddleBody, mesh: paddleMesh, type:"paddle" };
        if (playerId == 1) {
            this.game.player1.baseRotation = baseRotation;
            this.game.player1.paddle = (newpaddle);
        }else{
            this.game.player2.baseRotation = baseRotation;
            this.game.player2.paddle = (newpaddle);
        }
    }
    createWall({size ={ width: 5, height: 100, thickness: 5 }, position={ x: 50, y: 25, z: 0 }, rotation = -Math.PI / 2, color = 0x00ff00}) {
        const wallGeometry = new THREE.BoxGeometry(size.width, size.height, size.thickness);
        const wallMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: true });
        const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);

        wallMesh.position.set(position.x, position.y, position.z);
        wallMesh.rotation.z = rotation;
    
        const wallShape = new CANNON.Box(new CANNON.Vec3(size.width / 2, size.height / 2, size.thickness / 2));
        const wallBody = new CANNON.Body({ mass: 0 });
        wallBody.name ="wall";
        wallBody.addShape(wallShape);

        wallBody.material = new CANNON.Material();
        wallBody.position.set(position.x, position.y, position.z);
        wallBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), (wallMesh.rotation.z));

        this.game.scene.add(wallMesh);
        this.game.world.addBody(wallBody);
        const newWall = { body: wallBody, mesh: wallMesh,  type:"wall"};
        this.game.walls.push(newWall);
    }



    createBall({ type = 1, width = 32, height = 32, mass = 0.1, color = 0x0000ff, speed = 5, initialPosition = new CANNON.Vec3(0, 0, 0), initialVelocity =new CANNON.Vec3(0, -15, 0)}) {
        const ballMaterial = new CANNON.Material();
        const ballBody = new CANNON.Body({ mass: mass, material: ballMaterial});
        const ballShape = new CANNON.Sphere(1);
        ballBody.addShape(ballShape);
        ballBody.name = "ball";
        ballBody.speed = speed;

        this.game.world.addBody(ballBody);
        const ballGeometry = new THREE.SphereGeometry(1, width, height);
        const ballMesh = new THREE.Mesh(ballGeometry, new THREE.MeshBasicMaterial({ color: color }));
        this.game.scene.add(ballMesh);

        ballBody.position.copy(initialPosition);
        ballMesh.position.copy(initialPosition);
        ballBody.velocity.copy(initialVelocity);

        const newBall = { body: ballBody, mesh: ballMesh, type:"ball" }
        this.game.balls.push(newBall);
        this.creatConctactBall(newBall);
    };

    creatConctactBall(ball) {
        for (let index = 0; index < this.game.walls.length; index++) {
            console.log(ball.body.material)
            const newContactMaterial = new CANNON.ContactMaterial(ball.body.material, this.game.walls[index].body.material, {
                friction: 0.0,
                restitution: 1.0
            });
            this.game.world.addContactMaterial(newContactMaterial);
        }
        const newContactMaterialPlayer1 = new CANNON.ContactMaterial(ball.body.material, this.game.player1.paddle.body.material, {
            friction: 0.0,
            restitution: 1.0
        });
        this.game.world.addContactMaterial(newContactMaterialPlayer1);
        const newContactMaterialPlayer2 = new CANNON.ContactMaterial(ball.body.material, this.game.player2.paddle.body.material, {
            friction: 0.0,
            restitution: 1.0
        });
        this.game.world.addContactMaterial(newContactMaterialPlayer2);
    }

    creatLevel(level){
        this.initLevelConfigs(level)
        this.walls.forEach(element => { 
            this.createWall(element);
        });
        this.paddles.forEach(element => { 
            this.createPaddle(element);
        });
        this.balls.forEach(element => { 
            this.createBall(element);
        });
        /*

        this.bricks.forEach(element => { 
            this.createBrick(position, type)
        });

        this.game.balls.forEach(element => { 
        console.log(element,"-------------------------------------")
        this.creatConctactBall(element);
        });
        */
        console.log("---------------lauchLevel----------------------")
        console.log("-------------------------------------")
        console.log("-------------------------------------")
        return this.game;

        console.log("-------------------------------------")
    }

}

/*

        // Ajout du mesh à la scène Three.js
        ballBody.addEventListener('collide', function(event) {
            // Gérer la collision ici
            console.log("Collision détectée !");
            console.log(event);
        });

        */


