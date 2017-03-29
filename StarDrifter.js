// WebGL Demo
// Copyright 2017 Vincent Prime <myself@vincentprime.com>
// Distributed under the MIT Licence 
// https://github.com/vprime/Photosphere-Viewer

var StarDrifter = {
// Generates a slowly spinning skysphere
//

    // URLS
    rootURI: "",

    // Scene
    container:{},
    camera:{},
    controls:{},
    scene:{},
    renderer:{},
    animation:{},

    // Lighting
    ambient:{},

    // Useful Info
    windowHalfX: (window.innerWidth / 2),
    windowHalfY: (window.innerHeight / 2),

    // Materials
    materials:{},
    models:{},
    modelLoader:{},

    // Skybox Mesh
    skyBox:{},
    skyBoxMaterials:[],

    rocketLoader:{},
    rocketCollada:{},

    toLoad:0,

    loaded:0,
    loading:{},

    assets:[],

    run: function(rootURI){
        this.rootURI = rootURI;
        var self = this;

        this.container = document.createElement('div');
        this.container.setAttribute("id", "canvas-background");
        document.body.appendChild(this.container);

        this.createCamera();

        this.scene = new THREE.Scene();

        // Load the lighting and elemnts
        this.loadLighting();

        // Load skybox then render it
        this.skyboxAssets();
        this.createSkyBox();

        this.loadRocket();

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(new THREE.Color("hsl(0, 0%, 10%)"));

        // Ensures everything is loaded before starting animations
        this.loading = setInterval( function(){ self.loadAndLaunch() },100);

    },

    loadAndLaunch:function(){
        if ( this.toLoad <= this.loaded) {
            console.log("loaded!");
            clearInterval(this.loading);
            this.container.appendChild(this.renderer.domElement);
            window.addEventListener( 'resize', this.onWindoResize.bind(this), false);
            this.animate();
        }
    },

    skyboxAssets:function(){
        var imagePrefix = this.rootURI + "/skybox/starry-night-2048_";
        var directions = [ "right","left",  "up", "down", "front", "back"];
        var imageSuffix = ".jpg";
        var skyboxImages  = [];
        directions.forEach(function(direction){
          skyboxImages.push(
            imagePrefix + direction + imageSuffix
          );
        });

        this.materials['skybox'] = Array(directions.length);
        this.loadSkyMaterials(skyboxImages, 'skybox');

    },

    loadLighting:function(){

        //ambient = new THREE.AmbientLight(0xffffff, 0.0);
        //scene.add(ambient);

        keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 0.75);
        keyLight.position.set(-100, 0, 100);

        fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
        fillLight.position.set(100, 0, 100);

        backLight = new THREE.DirectionalLight(0xffffff, 0.70);
        backLight.position.set(100, 0, -100).normalize();

        this.scene.add(keyLight);
        this.scene.add(fillLight);
        this.scene.add(backLight);

    },

    asteroidSpawner:function(){

    },

    loadRocks:function(){
    	var rockPrefix = this.rootURI + "/models/Asteroid-";
    	var rocks = ['2', '3', '4', '5'];
    	var rockSuffix = 'dae';
    	var rockURIList = this.listLoader(rockPrefix, rocks, rockSuffix);
    	this.loadColladaList(rockURIList, 'rock');
    },

    listLoader:function(prefix, list, suffix){
    	var listURIs = [];
    	list.forEach(function(item){
    		listURIs.push(
    			prefix + item + suffix
    		);
    	});
    	return listURIs;
    },

    loadColladaList:function(modelURIs, name){
    	for (var i = 0; i < modelURIs.length; i++){
    		this.loadCollada(modelURIs[i], name+i);
    	}
    },

    loadCollada:function(modelURI, name){
    	this.toLoad++;

    	this.modelLoader[name] = THREE.ColladaLoader();
    	var self = this;
    	this.modelLoader[name].load(modelURI,function(collada){
    		self.model[name] = collada;
    		self.loaded++;
    	});
    },

    onWindoResize:function(){
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( window.innerWidth, window.innerHeight);
    },

    createCamera:function(){
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.z = 20;
    },

    createSkyBox:function(){
        var skyGeometry = new THREE.BoxGeometry( 900, 900, 900 );   
        
        var skyMaterial = new THREE.MultiMaterial( this.materials['skybox'] );
        this.skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        this.scene.add( this.skyBox );
        
    },

    loadRocket:function(){
        var model = this.rootURI + "/models/rocket.dae";
        this.toLoad++;
        
        this.rocketLoader = new THREE.ColladaLoader();
        var self = this;
        this.rocketLoader.load(model,
                function( collada ){
                    self.rocketCollada = collada.scene;
                    
                    self.rocketCollada.rotation.x = -90;
                    //self.rocketCollada.children[ 0 ].material = new THREE.MeshPhongMaterial({map: self.rocketCollada.children[0].material.map});
                    self.scene.add( self.rocketCollada );
                    self.loaded++;
                },
                function( xhr ){
                    //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
                }
            );
    },

    loadSkyMaterials:function(textures, container){
        for (var i = 0; i < textures.length; i++) {
            this.loadSkyMaterial(textures[i], container, i);
        }
    },

    loadSkyMaterial:function(textureURI, container, direction){
        this.toLoad++;
        var self = this;
        var texLoader = new THREE.TextureLoader().load(textureURI,
                function( texture ){
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.repeat.x = -1;
                    console.log(textureURI);
                    self.materials[container][direction] = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.DoubleSide,
                        overdraw: 0.0,
                    });
                    self.loaded++;
                }
            );
    },

    animateSky:function(){
        //this.skyBox.rotation.y += 0.001;
        this.rocketCollada.rotation.z += 0.0002;
        this.skyBox.rotation.x -= 0.0001;
    },

    animate: function(){
        this.animation = requestAnimationFrame(this.animate.bind(this));

        this.animateSky();

        this.render();
    },
    render: function(){
        this.renderer.render(this.scene, this.camera);
    },
};