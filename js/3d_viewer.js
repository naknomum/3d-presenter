			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controlsChanged = false;

			//init('OMSI_003');
			//animate();


function init3d() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.z = 100;

				controls = new THREE.TrackballControls( camera );
			controls.rotateSpeed = 5.0;
			controls.zoomSpeed = 5;
			controls.panSpeed = 2;
			controls.noZoom = false;
			controls.noPan = false;
			controls.staticMoving = true;
			controls.dynamicDampingFactor = 0.3;

			jQuery(controls).bind('change', function() {
				controlsChanged = true;
			});

				scene = new THREE.Scene();


/*
				var ambient = new THREE.AmbientLight( 0xaaaaaa );
				//var ambient = new THREE.AmbientLight( 0xffffff );
				scene.add( ambient );
*/


				var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0.2, 0.2, 1 ).normalize();
				scene.add( directionalLight );



				if (Detector.webgl) {
					renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
				} else {
					renderer = new THREE.CanvasRenderer();
					addMessage('warning', ':( no webgl');
				}


				//renderer = new THREE.WebGLRenderer( {preserveDrawingBuffer: true} );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				animate();
console.log('---- done init() ----');

			}


			function addOBJbyData(objText, textureDataUrl) {
				var texture = false;
				var material = false;

				if (textureDataUrl) {
					var texture = new THREE.Texture();
					var img = document.createElement( 'img' );
					img.addEventListener( 'load', function() {
    				texture.image = img;
    				texture.needsUpdate = true;
					});
					img.src = textureDataUrl;

				} else {
					//material = new THREE.MeshBasicMaterial( { color: 0x888888 } );
					material = new THREE.MeshLambertMaterial( { color: 0x888888 } );
				}

				var objLoader = new THREE.OBJLoader();
				var obj = objLoader.parse(objText);
				addToScene(obj, texture, material);
			}


			function addOBJbyUrl(objUrl, textureUrl) {
				var texture = false;
				var material = false;

				if (textureUrl) {
					texture = new THREE.Texture();
					var imageLoader = new THREE.ImageLoader();
					imageLoader.load( textureUrl,
						function ( img ) {
    					texture.image = img;
    					texture.needsUpdate = true;
						}
					);

				} else {
					//material = new THREE.MeshBasicMaterial( { color: 0x888888 } );
					material = new THREE.MeshLambertMaterial( { color: 0x888888 } );
				}

				var objLoader = new THREE.OBJLoader();
				objLoader.load( objUrl, function(o) { addToScene(o, texture, material); } );
			}


			function addToScene(obj, texture, material) {
window.theObj = obj;
				obj.traverse( function ( child ) {
					if ( child instanceof THREE.Mesh ) {
						if (texture) {
							child.material.map = texture;
						} else {
							child.material = material;
						}
					}
				});

				obj.scale = new THREE.Vector3( 25, 25, 25 );
				scene.add( obj );
				objAdded(obj);
			}




/*
				objLoader.load( objUrl,
					function(obj) {
						obj.traverse( function ( child ) {
							if ( child instanceof THREE.Mesh ) {
								if (texture) {
									child.material.map = texture;
								} else {
									child.material = material;
								}
							}
						});

						obj.scale = new THREE.Vector3( 25, 25, 25 );
						scene.add( obj );
console.log('obj added to scene');
					}
				);
*/

			

			function onWindowResize() {
console.log('3d resize');

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				mouseX = ( event.clientX - windowHalfX ) / 2;
				mouseY = ( event.clientY - windowHalfY ) / 2;

			}

			//

			function animate() {

				requestAnimationFrame( animate );
				render();

			}

			function render() {

				controls.update();

				camera.lookAt( scene.position );

				renderer.render( scene, camera );

			}


