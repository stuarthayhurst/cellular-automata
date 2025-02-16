import * as glMatrix from "gl-matrix";

//Mesh generation settings
const volumeDiameter = 1.0;
const ringRadius = 1.0;

/**
 * Return a list of points of the volume rings and a list of their origins.
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @returns {[Array<glMatrix.vec3>, Array<glMatrix.vec3>]}
 */
export function generateSkeleton(
    width,
    height,
    meshWidthScale,
    meshHeightScale,
) {
    /** @type {Array<glMatrix.vec3>} */
    let skeleton = [];
    /** @type {Array<glMatrix.vec3>} */
    let skeletonOrigins = [];

    //Generate extra points according to the scale
    width *= meshWidthScale;
    height *= meshHeightScale;

    //Generate local origins
    for (let i = 0; i < width; i++) {
        skeletonOrigins.push(glMatrix.vec3.fromValues(0.0, 0.0, 0.0));
    }

    //Generate a vertical half-ring around each point on the origins
    for (let i = 0; i < width; i++) {
        let ringRadians = (i / width) * 2 * Math.PI;
        for (let j = 0; j < height + 3; j++) {
            let volumeRadians = (j / ((height + 2) * 2)) * 2 * Math.PI;

            //Generate a point for the vertical ring
            let localRadius = Math.sin(volumeRadians) * volumeDiameter;
            let point = glMatrix.vec3.fromValues(
                Math.sin(ringRadians - 2 * Math.PI) * localRadius,
                Math.cos(volumeRadians),
                Math.cos(ringRadians - 2 * Math.PI) * localRadius,
            );
            glMatrix.vec3.scale(point, point, volumeDiameter);
            glMatrix.vec3.add(point, point, skeletonOrigins[i]);

            skeleton.push(point);
        }
    }

    return [skeleton, skeletonOrigins];
}

/**
 * Return the index of the previous point, within the same ring.
 * @param {Number} index
 * @param {Number} height
 * @returns {Number}
 */
function previousPointWrapped(index, height) {
    return index - (index % height) + ((index - 1 + height) % height);
}

/**
 * Return a list of vertices in the mesh, and per-triangle lists of origins and indices.
 * @param {Array<glMatrix.vec3>} skeleton
 * @param {Array<glMatrix.vec3>} skeletonOrigins
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @returns {[Array<glMatrix.vec3>, Array<glMatrix.vec3>, Array<Number>]}
 */
export function calculateMesh(
    skeleton,
    skeletonOrigins,
    width,
    height,
    meshWidthScale,
    meshHeightScale,
) {
    /** @type {Array<glMatrix.vec3>} */
    let mesh = [];
    /** @type {Array<glMatrix.vec3>} */
    let origins = [];
    /** @type {Array<Number>} */
    let indices = [];

    //Handle scaled skeletons
    width *= meshWidthScale;
    height *= meshHeightScale;

    let j = -1;
    for (let i = 0; i < skeleton.length; i++) {
        //Handle poles
        const p = i % (height + 3);
        let mapTriangles = true;
        if (p == 0) {
            //Skip internal triangles
            continue;
        } else if (p == 1 || p == height + 2) {
            //Don't map poles
            mapTriangles = false;
        } else {
            //Only increment j when we generate a mapped triangle
            j++;
        }

        //Calculate the indices of the surrounding points for the triangle pair
        let nextRingSamePoint = (i + (height + 3)) % (width * (height + 3));
        let prevPoint = previousPointWrapped(i, height + 3);
        let nextRingPrevPoint = previousPointWrapped(
            nextRingSamePoint,
            height + 3,
        );

        //Fetch the origins for the ring pair
        let ringIndex = Math.floor(i / (height + 3));
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

        if (mapTriangles) {
            //Calculate the raw grid index components
            let y = j % height;
            let x = Math.floor(j / height);

            //Account for mesh scaling / interpolation
            x = Math.floor(x / meshWidthScale);
            y = Math.floor(y / meshHeightScale);
            let gridIndex = y * Math.floor(width / meshWidthScale) + x;

            indices.push(gridIndex);
            indices.push(gridIndex);
        } else {
            indices.push(-1);
            indices.push(-1);
        }
    }

    return [mesh, origins, indices];
}
