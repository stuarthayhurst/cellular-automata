//Return a list of points of the volume rings and a list of their origins
export function generateSkeleton(
    width,
    height,
    ringRadius,
    volumeDiameter,
    meshWidthScale,
    meshHeightScale,
) {
    let skeleton = [];
    let skeletonOrigins = [];

    //Generate extra points according to the scale
    width *= meshWidthScale;
    height *= meshHeightScale;

    //Generate a flat ring for outer ring origins
    for (let i = 0; i < width; i++) {
        let ringRadians = (i / width) * 2 * Math.PI;
        let origin = glMatrix.vec3.fromValues(
            Math.sin(ringRadians),
            0.0,
            Math.cos(ringRadians),
        );
        glMatrix.vec3.scale(origin, origin, ringRadius);
        skeletonOrigins.push(origin);
    }

    //Generate a vertical ring around each point on the outer ring
    for (let i = 0; i < width; i++) {
        let ringRadians = (i / width) * 2 * Math.PI;
        for (let j = 0; j < height; j++) {
            let volumeRadians = (j / height) * 2 * Math.PI;

            //Generate a point for the vertical ring
            let localRadius = Math.sin(volumeRadians) * volumeDiameter;
            let point = glMatrix.vec3.fromValues(
                Math.sin(ringRadians - 2 * Math.PI) * localRadius,
                Math.cos(volumeRadians) / 2,
                Math.cos(ringRadians - 2 * Math.PI) * localRadius,
            );
            glMatrix.vec3.scale(point, point, volumeDiameter);
            glMatrix.vec3.add(point, point, skeletonOrigins[i]);

            skeleton.push(point);
        }
    }

    return [skeleton, skeletonOrigins];
}

//Return the index of the previous point, within the same ring
function previousPointWrapped(index, height) {
    return index - (index % height) + ((index - 1 + height) % height);
}

//Return a list of vertices in the mesh, and per-triangle lists of origins and indices
export function calculateMesh(
    skeleton,
    skeletonOrigins,
    width,
    height,
    meshWidthScale,
    meshHeightScale,
) {
    let mesh = [];
    let origins = [];
    let indices = [];

    //Handle scaled skeletons
    width *= meshWidthScale;
    height *= meshHeightScale;

    for (let i = 0; i < skeleton.length; i++) {
        //Calculate the indices of the surrounding points for the triangle pair
        let nextRingSamePoint = (i + height) % (width * height);
        let prevPoint = previousPointWrapped(i, height);
        let nextRingPrevPoint = previousPointWrapped(nextRingSamePoint, height);

        //Fetch the origins for the ring pair
        let ringIndex = Math.floor(i / height);
        let currentOrigin = skeletonOrigins[ringIndex];
        let nextOrigin = skeletonOrigins[(ringIndex + 1) % width];

        //Save the first triangle and corresponding origins
        mesh.push(skeleton[i]);
        origins.push(currentOrigin);
        mesh.push(skeleton[nextRingSamePoint]);
        origins.push(nextOrigin);
        mesh.push(skeleton[nextRingPrevPoint]);
        origins.push(nextOrigin);

        //Save the second triangle and corresponding origins
        mesh.push(skeleton[i]);
        origins.push(currentOrigin);
        mesh.push(skeleton[nextRingPrevPoint]);
        origins.push(nextOrigin);
        mesh.push(skeleton[prevPoint]);
        origins.push(currentOrigin);

        //Calculate the grid index, account for scale
        let widthIndex = Math.floor(Math.floor(i / height) / meshWidthScale);
        let heightIndex = Math.floor(((i % height) * width) / meshHeightScale);
        let gridIndex = widthIndex + heightIndex;
        indices.push(gridIndex);
        indices.push(gridIndex);
    }

    return [mesh, origins, indices];
}

//Return per-vertex, smoothed normals
export function calculateNormals(mesh, origins) {
    let normals = [];
    for (let i = 0; i < origins.length; i++) {
        let normal = glMatrix.vec3.create();
        glMatrix.vec3.sub(normal, mesh[i], origins[i]);
        glMatrix.vec3.normalize(normal, normal);
        normals.push(normal);
    }

    return normals;
}
