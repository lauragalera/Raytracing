
// RAY TRACING
// Autora: Laura Galera Alfaro

/* Globals */
var maxDepth = 2; //Màxim profunditat calculada en les reflexions/refraccions
var velocitat = 0.1;
var tetha = 20;


// Inicialitzem el RayTracing
function inicialitzar(Scene) {

	// Calculem els increments i P0 (GLOBALS)
	incX = calcularIncrementX(Scene.Camera,Screen);
	incY = calcularIncrementY(Scene.Camera,Screen);
	P0 = calcularP0(incX,incY,Scene.Camera,Screen);

	// Executem RayTracing
	rayTracing(Scene, Screen);
	Screen.context.putImageData(Screen.buffer, 0, 0);
}

// Calcular increment de X
function calcularIncrementX(Cam,Scr) {
	var rati = (Scr.height/Scr.width);

	var theta = (Cam.fov * Math.PI / 180);
	var w = 2*Math.tan(theta/2); // Calculem w' = 2*tg(theta/2)
	var h = w*rati; // Calculem h' = w'*rati

	var aux = w/Scr.width; // w'/W
	var incX = vec3.scale(Cam.right,aux); // Calculem increment de X (X * 2*tg(theta/2)/W)

	return incX;
}


// Calcular increment de Y
function calcularIncrementY(Cam,Scr) {
	var rati = (Scr.height/Scr.width);

	var theta = (Cam.fov * Math.PI / 180);
	var w = 2*Math.tan(theta/2); // Calculem w' = 2*tg(theta/2)
	var h = w*rati; // Calculem h' = w'*rati

	var aux = rati*w/Scr.height; // rati*w'/H
	var incY = vec3.scale(Cam.up,aux); // Calculem increment de Y (Y * 2*tg(theta/2)/W)

	return incY;
}


// Calcular P0
function calcularP0(incX,incY,Cam,Scr) {

	var P = vec3.subtract(Cam.eye,vec3.negate(Cam.front)); // Calculem P (O - Z)
	var aux = vec3.scale(incX,((Scr.width-1)/2)); // Increment de X * (W-1)/2
	var aux2 = vec3.scale(incY,((Scr.height-1)/2)); // Increment de Y * (H-1)/2
	var aux3 = vec3.subtract(P,aux); // P - Increment de X * (W-1)/2
	var P0 = vec3.add(aux3,aux2); // Calculem P0 (P - Increment de X * (W-1)/2 + Increment de Y * (H-1)/2)

	return P0;
}


function plot(x,y,color){
	var index = (x+y*Screen.buffer.width)*4;
	Screen.buffer.data[index+0] = color[0] * 255;
	Screen.buffer.data[index+1] = color[1] * 255;
	Screen.buffer.data[index+2] = color[2] * 255;
	Screen.buffer.data[index+3] = 255;
	return index;
}


// Pintar cada pixel
function rayTracing(Scene, Screen) {
	console.log(incX);
	var ray = {
		o: Scene.Camera.eye
	};
	for(var x = 0; x < Screen.width; x++){
		for (y = 0; y < Screen.height; y++){
			ray.dir = computeRay(incX,incY,P0,Scene.Camera,x,y);
			var color = intersectScene(Scene, ray, 0, maxDepth);
			plot(x,y,color);
		}
	}
}

/**
 * @pre depth <= maxDepth
 * @post dona el color del pixel segons l'intersecció del raig amb els
 * objeces de l'escena.
 */
function intersectScene(Scene, ray, depth, maxDepth){
	var color = vec3.create();
	var hit = computeHit(Scene, ray);
	if(!hit.isHit) 	//el raig va a l'infinit
		color = Scene.Fons;
	else{ //el raig ha xocat amb un objecte
		//Computa ambient, diffuse i specular
		for(var i = 0; i < Scene.Lights.length; i++){
			var light = Scene.Lights[i]
			if(light.on) {
				var p = phong(hit.obj.material, light, hit.interPoint, hit.normal, Scene)
				color = vec3.add(color, p);
			}
		}
		if(depth < maxDepth) { //toca rebotar
			if(!cannot_refract(ray,hit)) {
				//refraccio
				var d2 = computeRefractionDirection(ray, hit);
				var colorRefraccio = intersectScene(Scene, {o: hit.interPoint, dir: d2}, depth + 1, maxDepth);
				color = vec3.add(color, vec3.scale(colorRefraccio, hit.obj.material.kr));
			}else{
				//reflexio
				var d1 = computeReflectionDirection(ray, hit);
				var colorReflexion = intersectScene(Scene, {o:hit.interPoint, dir: d1}, depth+1, maxDepth);
				color = vec3.add(color, vec3.scale(colorReflexion, hit.obj.material.km));
			}
		}
	}
	return color;
}

/**
 * @pre --
 * @post donat el material, la llum, el punt d'intersecció, la normal i l'escena,
 * 		retorna el color del pixel després d'aplicar la tècnica de phong
 */
function phong(material, light, P, N, Scene){
	var color = vec3.create();
	var ambient = vec3.multiply(material.mat_ambient,light.ambient);
	color = vec3.add(color,ambient);
	if(!inShadow(P, light.position, Scene)){
		var diffuse = vec3.create();
		var specular = vec3.create();
		var L = vec3.normalize(vec3.subtract(light.position,P))
		var lambertian = Math.max(vec3.dot(N,L),0.0)
		if(lambertian > 0.0){
			var V = vec3.normalize(vec3.negate(P))
			var Lneg = vec3.negate(L)
			var R = vec3.subtract(Lneg,vec3.scale(N,vec3.dot(N,Lneg)*2));
			var specAngle = Math.max(0.0, vec3.dot(R,V))
			var spe = Math.pow(specAngle,material.alpha)

			diffuse = vec3.scale(vec3.multiply(light.diffuse,material.mat_diffuse),lambertian)
			specular = vec3.scale(vec3.multiply(light.specular,material.mat_specular),spe)
			color = vec3.add(color,specular);
			color = vec3.add(color,diffuse);
		}
	}
	return color;
}

/**
 * @pre --
 * @post donat el punt d'interseccio, l'origen de la llum i l'escena,
 * 		retorna cert si el punt d'intersecció està en ombre,
 * 		 fals altrament
 */
function inShadow(interPoint, lightPoint, Scene){
	var direccio = vec3.normalize(vec3.subtract(lightPoint,interPoint))
	var hit = computeHit(Scene,{o: interPoint, dir: direccio})
	//Com pot donar-se el cas que hi hagui intersecció amb el mateix objecte
	//cal donar un marge, en aquest cas, he triat -0.003 empiricament
	var distllum = vec3.distance(interPoint,lightPoint)
	return (hit.isHit && hit.dist > -0.003 && hit.dist < distllum);
}

/**
 * @pre --
 * @post donat el raig i les dades de la intersecció, retorna la direcció
 * 		 del raig reflexat
 */
function computeReflectionDirection(ray, hit){
	var r = vec3.scale(hit.normal, vec3.dot(ray.dir, hit.normal)*2);
	return vec3.normalize(vec3.subtract(ray.dir,r))
}

/**
 * @pre --
 * @post retorna cert si el raig no pot ser refractit sobre el material de l'objecte,
 * 		fals altrament.
 */
function cannot_refract(ray, hit){
	var etai_over_etat = (1.0/hit.obj.material.kr)
	var cos_theta = Math.min(vec3.dot(vec3.negate(ray.dir),hit.normal), 1.0)
	var sin_theta = Math.sqrt(1.0 - cos_theta*cos_theta)

	return etai_over_etat * sin_theta > 1.0;
}

/**
 * @pre --
 * @post donat el raig i les dades de la intersecció, retorna la direcció
 * 		 del raig refractat
 */
function computeRefractionDirection(ray, hit){
	var etai_over_etat = (1.0/hit.obj.material.kr)
	var cos_theta = Math.min(vec3.dot(vec3.negate(ray.dir),hit.normal), 1.0)
	var r_out_perp = vec3.scale((vec3.add(ray.dir,vec3.scale(hit.normal,cos_theta))), etai_over_etat)
	var r_out_parallel = vec3.scale(hit.normal,-1*Math.sqrt(Math.abs(1.0 - vec3.dot(r_out_perp, r_out_perp))))
	return vec3.add(r_out_perp, r_out_parallel);
}
/**
 * @pre --
 * @post retorna el vector normal de l'esfera sobre el punt position
 */
function normalEsfera(object, position) {
	return vec3.normalize(vec3.subtract(position,object.centre));
}

/**
 * @pre --
 * @post retorna la normal del triangle
 */
function normalTriangle(object){
	var ab = vec3.subtract(object.v1, object.v2);
	var ac = vec3.subtract(object.v1, object.v3);
	return vec3.normalize(vec3.cross(ab, ac));
}

/**
 * @pre position es el punt d'intersecció, només s'utilitza per l'esfera
 * @post retorna la normal de l'objecte
 */
function normal(object, position){
	if(object.tipus === 'esfera'){
		return normalEsfera(object, position);
	}else if(object.tipus === 'pla'){
		return object.normal;
	}else{
		return normalTriangle(object);
	}
}

/**
 * @pre ray te o d'origen i dir de direccio
 * @post retorna la var hit, on hit.isHit es fals si no intersecciona amb cap
 * 		objecte o cert si ho fa. Quan intersecciona tambe retorna la distancia,
 * 		l'objecte, el punt d'interseccio i la normal.
 */
function computeHit(Scene, ray){
	var hit = {
		isHit : false
	};
	var distMin = -1;
	for (var i = 0; i < Scene.Shapes.length; i++){
		var obj = Scene.Shapes[i];
		if(obj.tipus === 'esfera'){
			dist = intersectSphere(obj, ray);
		}else if(obj.tipus === 'pla'){
			dist = intersectPlane(obj, ray);
		}else{ //es un triangle
			dist = intersectTriangle(obj, ray);
		}
		if(dist !== undefined && (distMin === -1 || dist < distMin)){ //Aquest objecte està més aprop
			distMin = dist;
			hit.isHit = true;
			hit.obj = obj;
			hit.dist = distMin;
			hit.interPoint = vec3.add(ray.o,vec3.scale(ray.dir,dist)); //punt interseccio
			hit.normal = normal(obj, hit.interPoint);
		}
	}
	return hit;
}

/**
 * @pre --
 * @post retorna la distancia del raig al pla.
 */
function intersectPlane(plane, ray){
	var denom = vec3.dot(plane.normal, ray.dir);
	if (Math.abs(denom) > 0){
		var c = vec3.subtract(plane.point,ray.o);
		var t = vec3.dot(c,plane.normal)/denom;
		if(t >= 0.003) return t;
	}
	return;
}

/**
 * @pre --
 * @post retorna la distancia del raig a l'esfera.
 */
function intersectSphere(sphere, ray){
	var oc = vec3.subtract(ray.o,sphere.centre);
	var a = vec3.dot(ray.dir, ray.dir);
	var b = 2.0 * vec3.dot(oc, ray.dir);
	var c = vec3.dot(oc,oc) - sphere.radi*sphere.radi;
	var disc = b*b - 4*a*c;
	if (disc < 0) {
		return;
	} else {
		var root = (-1 * b - Math.sqrt(disc)) / (2.0 * a)
		if(root < 0.001 || Number.POSITIVE_INFINITY < root){
			return;
		}
		return root
	}
}

/**
 * @pre --
 * @post retorna la distancia del raig al triangle.
 */
function intersectTriangle(triangle, ray) {
	var u = vec3.subtract(triangle.v2, triangle.v1);
	var v = vec3.subtract(triangle.v3, triangle.v1);
	var n = vec3.cross(u, v);
	var pla = {
		normal: n,
		point: triangle.v1,
	}
	var t = intersectPlane(pla, ray);
	var P = vec3.add(ray.o,vec3.scale(ray.dir,t)); //punt interseccio
	if (t !== undefined && PointInTriangle(P, triangle) && t >= 0.003) {
		return t;
	}
	return;
}

/**
 * @pre --
 * @post retorna cert si el punt p està dins del triangle tri, fals altrament.
 */
function PointInTriangle(p, tri) {
	return SameSide(p, tri.v1, tri.v2, tri.v3) && SameSide(p, tri.v2, tri.v1, tri.v3) && SameSide(p, tri.v3, tri.v1, tri.v2);
}

/**
 * @pre --
 * @post retorna cert si els punts cauen sobre la mateixa cara del triangle,
 * 		fals altrament.
 */
function  SameSide(p1,p2, a,b){
	var cp1 = vec3.cross(vec3.subtract(b,a), vec3.subtract(p1,a));
	var cp2 = vec3.cross(vec3.subtract(b,a), vec3.subtract(p2,a));
	return vec3.dot(cp1, cp2) >= 0;
}

// Computar el raig
function computeRay(incX,incY,P0,Cam,x,y){

	// Calculem la direccio per a cada pixel
	var aux = vec3.scale(incX,x); // Increment de X * x
	var aux2 = vec3.scale(incY,y); // Increment de Y * y
	var aux3 = vec3.add(P0,aux); // P0 + Increment de X * x
	var aux4 = vec3.subtract(aux3,aux2); // P0 + Increment de X * x - Increment de Y * y
	var ray = vec3.subtract(aux4,Cam.eye); // Obtenim raig (P0 + Increment de X * x - Increment de Y * y - O)
	 // Normalitzem el raig
	return vec3.normalize(ray);
}

/*
  Gestiona la pressió de tecles
 */
function handleKeyDown(event) {
	console.log(event.keyCode);
	switch (event.key) {
		case 'a': //mou a l'esq
			Scene.Camera.moveX(-velocitat);
			break;
		case 'd': //mou a la dreta
			Scene.Camera.moveX(velocitat);
			break;
		case 'w': //mou endavant
			Scene.Camera.moveZ(velocitat);
			break;
		case 's': //mou endarrere
			Scene.Camera.moveZ(-velocitat);
			break;
		case 'q': //mou amunt
			Scene.Camera.moveY(velocitat);
			break;
		case 'e': //mou avall
			Scene.Camera.moveY(-1*velocitat);
			break;
		case 'g': //rota a la dreta
			Scene.Camera.rotateH(-tetha);
			break;
		case 'f': //rota a l'esq
			Scene.Camera.rotateH(tetha);
			break;
		case 'v': //rota avall
			Scene.Camera.rotateV(-tetha);
			break;
		case 't': //rota amunt
			Scene.Camera.rotateV(tetha);
			break;
	}
}

/**
 * @pre light < Scene.Lights.length i 0 <= index <= 2
 * @post actualitza el color de la llum segons el color llegit al HTML
 */
function setColor (light, index, value, Scene) {

	var myColor = value.substr(1); // para eliminar el # del #FCA34D
	var r = myColor.charAt(0) + '' + myColor.charAt(1);
	var g = myColor.charAt(2) + '' + myColor.charAt(3);
	var b = myColor.charAt(4) + '' + myColor.charAt(5);

	r = parseInt(r, 16) / 255.0;
	g = parseInt(g, 16) / 255.0;
	b = parseInt(b, 16) / 255.0;

	switch (index) {
		case 0:
			Scene.Lights[light].ambient = [r, g, b];
			break;
		case 1:
			Scene.Lights[light].diffuse = [r, g, b];
			break;
		case 2:
			Scene.Lights[light].specular = [r, g, b];
			break;
	}
}

/*
  Gestiona els event handlers del HTML
 */
function initHandlers(Scene){

	const inputs = document.getElementsByTagName("input");
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener("change",
			function(){
				switch (this.getAttribute("name")) {
					case "depth":
						maxDepth = inputs[0].value;
						break;
					case "La1":
						setColor(0, 0, inputs[1].value, Scene);
						break;
					case "Ld1":
						setColor(0, 1, inputs[2].value, Scene);
						break;
					case "Ls1":
						setColor(0, 2, inputs[3].value, Scene);
						break;
					case "La2":
						setColor(1, 0, inputs[8].value, Scene);
						break;
					case "Ld2":
						setColor(1,1, inputs[9].value, Scene);
						break;
					case "Ls2":
						setColor(1,2, inputs[10].value, Scene);
						break;
					case "La1X":
						Scene.Lights[0].position[0] = inputs[4].value
						break;
					case "La1Y":
						Scene.Lights[0].position[1] = inputs[5].value;
						break;
					case "La1Z":
						Scene.Lights[0].position[2] = inputs[6].value;
						break;
					case "La2X":
						Scene.Lights[1].position[0] = inputs[11].value;
						break;
					case "La2Y":
						Scene.Lights[1].position[1] = inputs[12].value;
						break;
					case "La2Z":
						Scene.Lights[1].position[2] = inputs[13].value;
						break;
					case "OnL1":
						if(inputs[7].checked){
							Scene.Lights[0].on = true;
						}else{
							Scene.Lights[0].on = false;
						}
						break;
					case "OnL2":
						if(inputs[14].checked){
							Scene.Lights[1].on = true;
						}else{
							Scene.Lights[1].on = false;
						}
						break;
				}
			},
			false);
	}

	const selectcameras = document.getElementById("selectCameras");
	//event per quan es vol canviar de camera
	selectcameras.addEventListener("click", function () {
		cIndex = selectcameras.selectedIndex;
		Scene.Camera = Scene.Pois.getMemento(cIndex);
	});
}

//només es fa quan es carrega la pàgina
window.onload = function main() {

	initHandlers(Scene); //parametres de la llum, de la càmera i els rebots
	document.onkeydown = handleKeyDown;
	//document.onkeydown = handleKeyDown;
	Screen.canvas = document.getElementById("glcanvas");
	if (Screen.canvas == null) {
		alert("Invalid element: " + id);
		return;
	}
	Screen.context = Screen.canvas.getContext("2d");
	if (Screen.context == null) {
		alert("Could not get context");
		return;
	}
	Screen.width = Screen.canvas.width;
	Screen.height = Screen.canvas.height;
	Screen.buffer = Screen.context.createImageData(Screen.width, Screen.height);

	inicialitzar(Scene);
}


