import * as THREE from '/node_modules/three/build/three.module.js';

export default class controlsMovementsManager {
    constructor(game) {
        this.game = game;
        this.debbug = false;
    }
    movePaddleUp(player) {
        if (this.game.controleClassic == false) {
            if (player.direction.up == true) {
                let rotationAmount = 0;
                const rotatePaddle = () => {
                    // Vérifie si la paddle touche la balle
                    let ball = this.paddleHitBall(player)
                    if (ball) {
                        this.pushHardBall(ball, 2);
                        // Si la paddle touche la balle, attendre avant de continuer la rotation
                        setTimeout(rotatePaddle, 10); // Attendre 100 millisecondes avant de retester
                        return; // Sortir de la fonction pour éviter la rotation pendant la collision
                    }
                    player.paddle.mesh.rotation.z -= THREE.MathUtils.degToRad(3);
                    player.paddle.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), player.paddle.mesh.rotation.z);
                    player.paddle.mesh.updateMatrixWorld();
        
                    // Vérifie si la rotation complète a été effectuée
                    if (++rotationAmount < 15) {
                        setTimeout(rotatePaddle, 1);
                    }
                };
                rotatePaddle(); // Commencer la rotation de la paddle
            }
            player.direction.up = false;
        }
    }
    movePaddleDown(player) {
        if (this.game.controleClassic == false) {
            if (player.direction.down == true) {
                let rotationAmount = 0;
                const rotatePaddle = () => {
                    let ball = this.paddleHitBall(player)
                    if (ball) {
                        this.pushHardBall(ball, 2);
                        setTimeout(rotatePaddle, 10); // Attendre 100 millisecondes avant de retester
                        return; // Sortir de la fonction pour éviter la rotation pendant la collision
                    }
                    player.paddle.mesh.rotation.z += THREE.MathUtils.degToRad(3);
                    player.paddle.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), player.paddle.mesh.rotation.z);
                    player.paddle.mesh.updateMatrixWorld();
                    this.game.renderer.render(this.game.scene, this.game.camera);
                    // Vérifie si la rotation complète a été effectuée
                    if (++rotationAmount < 15) {
                        // S'il reste des rotations à effectuer, planifie la prochaine itération avec un délai de 16 ms (pour viser environ 60 images par seconde)
                        setTimeout(rotatePaddle, 1);
                    }
                };
        
                rotatePaddle(); // Commencer la rotation de la paddle
            }
            player.direction.down = false;
        }
    
    }
    movePaddleLeft(player) {
        if (this.controleClassic == false) {
            if(this.paddleHitBall(player)){return}
        }
        player.paddle.mesh.position.x -= player.speed; 
        player.paddle.body.position.x -= player.speed;
        player.paddle.mesh.updateMatrixWorld();
    }
    movePaddleRight(player) {
        if (this.controleClassic == false) {
            if(this.paddleHitBall(player)){return}
        }
        player.paddle.mesh.position.x += player.speed; 
        player.paddle.body.position.x += player.speed;
        player.paddle.mesh.updateMatrixWorld();
    }
    onKeyUp(event) {
        // Gérer les événements de touche relâchée
        switch (event.keyCode) {
            case 90: //P1
                this.game.player1.direction.up = true;
                break;
            case 83: 
                this.game.player1.direction.down = true;
                break;
            case 81: 
                this.game.player1.direction.left = false;
                break;
            case 68: 
                this.game.player1.direction.right = false;
                break;
            case 37:  //P2
                this.game.player2.direction.left = false;
                break;
            case 39: 
                this.game.player2.direction.right = false;
                break;
            case 38:
                this.game.player2.direction.up = true;
                break;
            case 40:
                this.game.player2.direction.down = true;
                break;
        }
    }
    onKeyDown(event) {
        // Gérer les événements de touche enfoncée
        //console.log(event.keyCode)
        switch (event.keyCode) {
            case 81:
                this.game.player1.direction.right = false;
                this.game.player1.direction.left = true;
                break;
            case 68:
                this.game.player1.direction.left = false;
                this.game.player1.direction.right = true;
                break;
            case 37: //P2
                this.game.player2.direction.right = false;
                this.game.player2.direction.left = true;
                break;
            case 39:
                this.game.player2.direction.left = false;
                this.game.player2.direction.right = true;
                break;
            // Ajoutez d'autres cas pour d'autres actions de joueur
        }
    }
    changingDirectionOfBall(ball, paddle) {
        if (ball) {
            const angleBouce = this.determineBouceIfNeeded(ball, paddle)
            if (angleBouce) {
                const newVelocityAngle = this.calculateMovementVector(angleBouce)
                ball.body.velocity.set(newVelocityAngle.x, newVelocityAngle.y, newVelocityAngle.z);
                while (ball.body.velocity.length() < this.vitesseMaxForBall) {
                    let newVelocity = ball.body.velocity.clone().scale(1.1);
                    ball.body.velocity.copy(newVelocity);
                }
            }
        }
    };
    determineBouceIfNeeded(ball, paddle) {
        const ballPosition = ball.mesh.position.x;
        const paddlePosition = paddle.mesh.position.x ;
        const paddleOneSideWidth = (paddle.mesh.geometry.parameters.width / 2);
        const sectionWidth = paddleOneSideWidth / 100;
        let factor = null;
        if (ballPosition > paddlePosition) { // la balle est à droite du centre du paddle
            factor = (ballPosition - paddlePosition) / sectionWidth;
            if (factor > 80) {
                factor = 80;
            }
        }else{// la balle est à gauche du centre du paddle
            factor = (ballPosition - paddlePosition) / sectionWidth;
            if (factor < -80) {
                factor = -80;
            }
        }
        return factor
    };
    calculateMovementVector(angleDegrees) {
        const angleRadians = THREE.MathUtils.degToRad(angleDegrees);
        const x = Math.sin(angleRadians);
        const y = Math.cos(angleRadians);
        const z = 0;
        return new THREE.Vector3(x, y, z);
    };

    findBallByBody(ballBody) {
        for (let i = 0; i < this.game.balls.length; i++) {
            const ball = this.game.balls[i];
            if (ball.body === ballBody) {
                return ball; // Retourne la balle correspondant au corps physique donné
            }
        }
        return null; // Retourne null si aucune balle correspondante n'est trouvée
    };

    paddleHitBall(player){
        const id = player.id
        if (this.game.world.contacts.length > 0) {
            for(var i=0; i<this.game.world.contacts.length; i++){
                var c = this.game.world.contacts[i];
                if (c.bi.name === "ball" && c.bj.name.startsWith("paddle_")) {
                    const ball = c.bi;
                    console.log("hit")
                    if (c.bj.name.endsWith("_1") && id == 1) {
                        return this.findBallByBody(ball)
                    }else if (c.bj.name.endsWith("_2") && id == 2){
                        return this.findBallByBody(ball)
                    }
                }
            }
        }
        return false;
    };
    pushHardBall(ball, factor = 4){
        const { body, mesh } = ball;
        while (body.velocity.length() < (this.vitesseMaxForBall * factor)) {
            const newVelocity = body.velocity.clone().scale(1.10); 
            body.velocity.copy(newVelocity);
        }
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
        mesh.updateMatrixWorld();
    };
}
/**
            if (this.debbug == false) {
                this.debbug = true
            }
 */