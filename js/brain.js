var camera, controls, scene, renderer, drawline, d, geometry, material, mesh, colormap

var cutoff = 0.6; // decimal value for thresholding

container = document.getElementById('canvas');
document.body.appendChild(container);

renderer = new THREE.WebGLRenderer();
renderer.setSize( 800, 600 );
container.appendChild( renderer.domElement );

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
    35,             // Field of view
    800 / 600,      // Aspect ratio
    0.1,            // Near plane
    10000           // Far plane
);

camera.position.set( -250, 50, 100 );
camera.lookAt( scene.position );

controls = new THREE.OrbitControls( camera , container );
controls.damping = 0.2;
controls.addEventListener( 'change', render );

// Read in colormap
// Read in vertices of brain
 $.get( "data/colourmap.dat", function( data ) {
      parseData(data,generate_colormap);
    });

// Read in vertices of brain
 $.get( "data/brain_vert.dat", function( data ) {
      parseData(data,draw_vertices);
    });
 // Read in faces associated with brain
 $.get( "data/brain_face.dat", function( data ) {
      parseData(data,draw_faces);
    });

// Read in node locations
 $.get( "data/aal_points.dat", function( data ) {
      parseData(data,draw_points);
    });

// Read in connections
 $.get( "data/connections.dat", function( data ) {
      parseData(data,draw_connections);
    });


// init();
render();

function vertex(points) {
  geometry.vertices.push(new THREE.Vector3(points[0],points[2],points[1]));
};

function face(points){
	geometry.faces.push(new THREE.Face3(points[0],points[2],points[1]));
}

function parseData(data,varout) {
    Papa.parse(data, {
        header: false,
        delimiter: ",",
        newline: "↵",
        complete: varout,
    });
}

function animate(results) {
            requestAnimationFrame(animate);
            controls.update();
        }

function draw_vertices(results) {

        d = results.data;
        d.splice(-1);
        geometry = new THREE.Geometry();

        for (i = 0, len = d.length; i < len; i++) {
            // document.write(""+d[i]+"\n")
            vertex(d[i]);
        }

}

function draw_faces(results) {

    d = results.data;
    d.splice(-1);
	for (i = 0, len = d.length ; i < len; i++) {
            // document.write(""+d[i]+"\n")
            face(d[i]);
        }

        geometry.computeBoundingSphere();

        material = new THREE.MeshLambertMaterial({
            emissive: 0x000103,
            wireframe: false,
            transparent: true
        });

    mesh = new THREE.Mesh(geometry,material);
    material.opacity = 0.1;
    scene.add(mesh)

}

function draw_points(results) {

    d = results.data;
    d.splice(-1);
    geometry = new THREE.Geometry();

    for (i = 0, len = d.length; i < len; i++) {
      geometry.vertices.push(new THREE.Vector3(d[i][0],d[i][2],d[i][1]));      
    }

    material = new THREE.PointCloudMaterial({
        color: 0x000000,
        size: 7
    });

    scene.add(new THREE.PointCloud(geometry,material));

 
    return d 

}

function draw_connections(results) {

    conns = results.data;
    conns.splice(-1);
    
    var f = new Array();
    var mf = new Array();

    for (i=0;i<d.length;i++) {
        f[i]=new Array();
        for (j=0;j<d.length;j++) {
            f[i][j]=Math.abs(conns[i][j]);
        }
        mf[i] = Math.max.apply(Math,f[i]);
    }

    var max = Math.max.apply(Math,mf);
    var thresh = cutoff*max;

    geometry = new THREE.Geometry();

    for (i = 0; i < d.length; i++) {
        for (j = 0; j < d.length; j++) {
            if (Math.abs(conns[i][j]) > thresh) {
                    geometry = new THREE.Geometry();
                    geometry.vertices.push(new THREE.Vector3(d[i][0],d[i][2],d[i][1]));
                    geometry.vertices.push(new THREE.Vector3(d[j][0],d[j][2],d[j][1]));
                    var color = new THREE.Color();
                    var rgb = colorindex(conns[i][j],max);
                    color.setRGB(colormap[rgb][0],colormap[rgb][1],colormap[rgb][2]);
                    material = new THREE.LineBasicMaterial({
                        color: color,
                        linewidth: 10
                    });
                    scene.add(new THREE.Line(geometry,material));
            };
        };
    };

    
    renderer.setClearColor( 0xeeeeee, 1);
    renderer.render( scene, camera );

    animate();

}

function generate_colormap(results){
    colormap = results.data;
    colormap.splice(-1);
    return colormap;
};

function colorindex(value,mx){
    var hi = 2*mx;
    var v = Number(value)+mx;
    var index = Math.round(100*v/hi);
    return index

};

function render() {
    renderer.render( scene, camera );
}
