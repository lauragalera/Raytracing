var Screen = {
    width 	: 0,
    height 	: 0,
    canvas 	: null,
    context : null,
    buffer 	: null,
};

var ListCameras = [
    new Camera("Start camera",[-1,1,3], [-0.2,0.5,0], 70),
    new Camera("Triangle right",[1.5,1,-0.5], [3,1,-2],70),
    new Camera("Ruby sphere",[2,0.2,-0.2],[1,1,-3],70),
    new Camera("2 spheres",[2,0.5,0],[-2,1,-1],70),
    new Camera("Jade sphere",[-0.5,0.5,-3],[0,1.5,-4.2],70),
    new Camera("Refractive sphere",[-2,1.5,2],[0,0.5,1],70),
    new Camera("Front sphere",[0,0.5,0.5],[-1,0,1],70),
    new Camera("Left side",[-3,1,2],[-1,0.5,0],70),
    new Camera("Right side",[3.5,1,-2],[2,0.5,-1.8],70),
    new Camera("Back",[2.5,2,-4.9],[1.3,1,-3],70)
]

var Scene = {
    Fons: [0, 0, 0],
    Shapes: [
        {
            id		: "pla_terra",
            tipus	: "pla",
            normal	: [0,1,0],
            point   : [0,0,0],
            // Material:
            material : Bronze
        },
        {
            id		: "pla_fons",
            tipus	: "pla",
            normal	: [0,0,1],
            point   : [0,0,-5],
            // Material:
            material : Tin
        },        {
            id		: "pla_fons_darrera",
            tipus	: "pla",
            normal	: [0,0,-1],
            point   : [0,0,10],
            // Material:
            material : Tin
        },
        {
            id		: "esfera_1",
            tipus	: "esfera",
            radi	: 0.6,
            centre	: [-1,0.6,-1.2],
            color : [0,0,1],
            // Material:
            material : Silver
        },
        {
            id		: "esfera_2",
            tipus	: "esfera",
            radi	: 0.4,
            centre	: [0,1.5,-4],
            color : [0,0,1],
            // Material:
            material : Jade
        },
        {
            id		: "esfera_3",
            tipus	: "esfera",
            radi	: 0.4,
            centre	: [0.2,0.4,0.3],
            color : [0,0,1],
            // Material:
            material : Gold
        },
        {
            id		: "esfera_4",
            tipus	: "esfera",
            radi	: 0.2,
            centre	: [2,0.2,-1],
            color : [0,0,1],
            // Material:
            material : Ruby
        },
        {
            id		: "esfera_5",
            tipus	: "esfera",
            radi	: 0.3,
            centre	: [-1.3,0.3,1],
            color : [0,0,1],
            // Material:
            material : Chrome
        },
       {
            id		: "triangle_dreta",
            tipus	: "triangle",
            v1: [3, 0, -3],
            v2: [4, 0, -1.5],
            v3: [4, 2, -1.5],
            color : [1,1,0],
            // Material:
            material : Chrome

        },
       {
            id		: "triangle_esquerra",
            tipus	: "triangle",
            v1: [-1.5, 2, 0],
            v2: [-2.5, 1, 0],
            v3: [-1.5, 1, -3],
            color : [1,1,0],
            // Material:
            material : Chrome
        }
    ],
    Pois: new Caretaker(ListCameras),
    Camera: ListCameras[0],
    Lights: [
        {
            ambient : [0.5,0.5,0.5],
            diffuse : [0.5,0.5,0.5],
            specular: [0.5,0.5,0.5],
            position : [-1, 2, 0],
            on: true
        },
        {
            ambient : [0.1,0.3,0.5],
            diffuse : [0.1,0.1,0.1],
            specular: [0.5,0.5,0.5],
            position : [5, 5, -3],
            on: true
        }
    ]
};