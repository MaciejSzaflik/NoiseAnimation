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
  zoomZ : 200,
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

var clock;

// Scene objects
var flame;

var shaderUniforms = {
		noise: {type: 't', value: null},
		rainbow: {type: 't', value: null},
		grad: {type: 't', value: null},
		time : {type: 'f', value : 0.0}
	};
/********************
 * Helper Functions *
 ********************/

function flameCreate(size) {
	size = size || 5;
	var noiseImage = 'flameAssets/img/texture/noise_texture.png';
	var rainbowImage = 'flameAssets/img/texture/rainbow.png';
	var gradImage = 'flameAssets/img/texture/grad.png';
	var geom = new THREE.Geometry(); 
	var halfSize = size/2;
	var v1 = new THREE.Vector3(-halfSize,0,0);
	var v2 = new THREE.Vector3(halfSize,0,0);
	var v3 = new THREE.Vector3(-halfSize,size,0);
	var v4 = new THREE.Vector3(halfSize,size,0);
	geom.vertices.push(v1);
	geom.vertices.push(v2);
	geom.vertices.push(v3);
	geom.vertices.push(v4);

	geom.faces.push( new THREE.Face3( 0, 1, 2 ), new THREE.Face3( 2, 1, 3 ));
	
	var minX = 0.0;
	var maxY = 0.9;
	var minY = 0.01;
	 geom.faceVertexUvs[0].push([
        new THREE.Vector2(minX,minY),
        new THREE.Vector2(minX,maxY),
        new THREE.Vector2(1-minX,minY)
    ]);
	
	 geom.faceVertexUvs[0].push([
        new THREE.Vector2(1- minX,minY),
        new THREE.Vector2(minY,maxY),
        new THREE.Vector2(1-minX,maxY)
    ]);
	
	
	var noiseTexture = new THREE.ImageUtils.loadTexture( noiseImage );
	noiseTexture.wrapS = THREE.RepeatWrapping;
	noiseTexture.wrapT = THREE.RepeatWrapping;
	
	
	var rainbowTexture = new THREE.ImageUtils.loadTexture( rainbowImage );
	rainbowTexture.wrapS = THREE.RepeatWrapping;
	rainbowTexture.wrapT = THREE.RepeatWrapping;
	
	var gradTexture = new THREE.ImageUtils.loadTexture( gradImage );
	gradTexture.wrapS = THREE.RepeatWrapping;
	gradTexture.wrapT = THREE.RepeatWrapping;
	
	shaderUniforms.noise.value = noiseTexture;
	shaderUniforms.rainbow.value = rainbowTexture;
	shaderUniforms.grad.value = gradTexture;
	
	var mat = new THREE.ShaderMaterial({
		uniforms: shaderUniforms,
        vertexShader: THREE.FlameShader.vertexShader,
        fragmentShader: THREE.FlameShader.fragmentShader,
        transparent: true,
        lights: false
    });

	var flame = new THREE.Mesh( geom, mat );
	flame.rotateZ(1.57);
	return flame;
}


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
  renderScene();
  updateScene();
  
  var deltaTime = clock.getDelta();
  shaderUniforms.time.value += deltaTime;
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


/************************
 * Scene Initialization *
 ************************/
function initializeScene() {

  /*************************
   * Initialize Essentials *
   *************************/

  // Scene and window resize listener
  scene = new THREE.Scene();
  clock = new THREE.Clock(true);
  var canvasWidth  = window.innerWidth;
  var canvasHeight = window.innerHeight;
  window.addEventListener('resize', resizeWindow, false);

  // Camera and set initial view
  var aspectRatio  = canvasWidth/canvasHeight;
  camera = new THREE.OrthographicCamera( canvasWidth / - 2, canvasWidth / 2, canvasHeight / 2, canvasHeight / - 2, 1, 1000 );
  camera.position.set( CAMERA.zoomX, CAMERA.zoomY, CAMERA.zoomZ );
  camera.lookAt(scene.position);
  scene.add(camera);

  // Add WebGL renderer to DOM
  renderer = new THREE.WebGLRenderer(RENDERER);
  renderer.setSize(canvasWidth, canvasHeight);
  addToDOM(renderer.domElement);


  /**********************
   * Initialize Plugins *
   **********************/


  // Dat gui (top right controls)
  gui = new dat.GUI( {height: 5 * 32 - 1} );


  var flameSize = 600;
  flame = flameCreate(flameSize);
  flame.position.set(flameSize/2, flameSize/3, 0);
  scene.add(flame);

}


/**********************
 * Render and Animate *
 **********************/
initializeScene();
animateScene();
