/*-------JSHint Directives-------*/
/* global THREE, dat             */
/*-------------------------------*/
'use strict';


/*******************
 * Manage Settings *
 *******************/
var CAMERA = {
  fov : 45,
  near : 1,
  far : 1000,
  zoomX : 0,
  zoomY : 20,
  zoomZ : 50,
};

var CONTROLS = {
  enabled : true,
  userPan : true,
  userPanSpeed : 1,
  minDistance : 10.0,
  maxDistance : 200.0,
  maxPolarAngle : (Math.PI/180) * 80,
};

var RENDERER = {
  antialias : false,
};


/********************
 * Global Variables *
 ********************/
// Built-in
var scene, camera, renderer;

// Plugins
var controls, gui;

// Scene objects
var crate;

var clock;

var animationHash = {};
var agentSpeed = {};
var white = new THREE.Color(1,1,1);
var black = new THREE.Color(0,0,0);
var constanMoveX = 0;
var constanMoveY = 0;

var animValues;
var animationValues = function() {
	this.particleSystem;
	this.lifeTime = 3;
	this.size = 1000;
	this.simplexSampling = 0.01;
	this.speedMulti = 1;
	this.speedXSimplex = 1;
	this.speedYSimplex = 1;
	this.particleCount = 20000;
	this.startSpeed = 30;
	this.startOffset = 15;
	this.createParticleSystem = function(){
		
		if(this.particleSystem!=null)
		{
			var selectedObject = scene.getObjectByName(this.particleSystem.name);
			scene.remove( this.particleSystem );
		}
		
		animationHash = {};
		agentSpeed = {};
		var particles = new THREE.Geometry();
		for(var p = 0; p < this.particleCount; p++){
			animationHash[p] = 0;
			agentSpeed[p] = Math.random()*animValues.startSpeed - animValues.startOffset;
			var x = Math.random()*this.size - this.size/2;
			var y = Math.random()*this.size - this.size/2;
			particles.vertices.push(new THREE.Vector3(x,y,0));
		}
		
		var particleMaterial = new THREE.PointsMaterial(
		{
			color:0xFFFFFF,
			size: 1,
			blending: THREE.AdditiveBlending,
			transparent: true,
			vertexColors: THREE.VertexColors,
			alphaTest: 0.5,
			transparent: true 
		});
		
		this.particleSystem = new THREE.Points(particles,particleMaterial);
		scene.add(this.particleSystem);
	};
};

/***********************
 * Rendering Functions *
 ***********************/
function renderScene() {
  renderer.render( scene, camera );
}

function updateScene() {

}

function animateScene() {
  window.requestAnimationFrame( animateScene );
  var deltaTime = clock.getDelta();
  animateParticles(deltaTime);
  renderScene();
  updateScene();
}

function resizeWindow() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addToDOM(object) {
  var container = document.getElementById('canvas-body');
  container.appendChild(object);
}


function animateParticles(deltaTime) {
    var verts = animValues.particleSystem.geometry.vertices;
	var simplexSampling = animValues.simplexSampling;
    for(var i = 0; i < verts.length; i++) {
        var vert = verts[i];
		animationHash[i]+= deltaTime/animValues.lifeTime;
       
		var value = noise.simplex2((vert.x + constanMoveX)*simplexSampling,(vert.y  + constanMoveY)*simplexSampling);
		var speed = value * agentSpeed[i] * animValues.speedMulti;
		var angle = value * 360 * Math.PI / 180;
	   
        vert.x += Math.cos( angle ) * speed;
		vert.y += Math.sin( angle ) * speed;

		var lerpValue = Math.sin(animationHash[i]);
		if(animationHash[i] < 0.5*Math.PI)
			animValues.particleSystem.geometry.colors[i] = (new THREE.Color(0,0,0)).lerp(white,lerpValue); 
		else
			animValues.particleSystem.geometry.colors[i] = (new THREE.Color(1,1,1)).lerp(black,1 - lerpValue);
		
		if (animationHash[i] > Math.PI) {
			vert.x = Math.random()*animValues.size - animValues.size/2;
            vert.y = Math.random()*animValues.size - animValues.size/2;
			animationHash[i] = 0;
        }
		
    }
	constanMoveX+=animValues.speedXSimplex;
	constanMoveY+=animValues.speedYSimplex;
	animValues.particleSystem.geometry.colorsNeedUpdate = true;
    animValues.particleSystem.geometry.verticesNeedUpdate = true;
     
}


/************************
 * Scene Initialization *
 ************************/
function initializeScene() {

  /*************************
   * Initialize Essentials *
   *************************/
  noise.seed(Math.random());
  clock = new THREE.Clock(true);
  scene = new THREE.Scene();
  var canvasWidth  = window.innerWidth;
  var canvasHeight = window.innerHeight;
  window.addEventListener('resize', resizeWindow, false);

  var aspectRatio  = canvasWidth/canvasHeight;
  camera = new THREE.OrthographicCamera( canvasWidth / - 2, canvasWidth / 2, canvasHeight / 2, canvasHeight / - 2, 1, 1000 );
  camera.position.set( 0, 0, -900 );
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene.add(camera);

  renderer = new THREE.WebGLRenderer(RENDERER);
  renderer.setSize(canvasWidth, canvasHeight);
  addToDOM(renderer.domElement);
	
  animValues = new animationValues();

  gui = new dat.GUI( {height: 5 * 32 - 1} );
  gui.add(animValues, 'size', 0.01, 2000);
  gui.add(animValues, 'lifeTime', 0.01, 100);
  gui.add(animValues, 'simplexSampling', 0, 0.1);
  gui.add(animValues, 'speedMulti', -5, 5);
  gui.add(animValues, 'speedXSimplex', -5, 5);
  gui.add(animValues, 'speedXSimplex', -5, 5);
  gui.add(animValues, 'particleCount', 1, 100000);
  gui.add(animValues, 'startSpeed', -100, 100);
  gui.add(animValues, 'startOffset', -100, 100);
  gui.add(animValues, 'createParticleSystem');

  animValues.createParticleSystem(animValues.particleCount,animValues.size);
}


/**********************
 * Render and Animate *
 **********************/
initializeScene();
animateScene();
