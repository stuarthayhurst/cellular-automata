import * as glMatrix from "gl-matrix";

//Mesh generation settings
const volumeDiameter = 0.55;
const ringRadius = 1 - volumeDiameter / 2;

/**
 * Return a list of points of the volume rings and a list of their origins.
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @returns {[glMatrix.vec3[], glMatrix.vec3[]]}
 */
export function generateSkeleton(
    width,
    height,
    meshWidthScale,
    meshHeightScale,
) {
    /** @type {glMatrix.vec3[]} */
    let skeleton = [];
    /** @type {glMatrix.vec3[]} */
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
 * @param {glMatrix.vec3[]} skeleton
 * @param {glMatrix.vec3[]} skeletonOrigins
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @returns {[glMatrix.vec3[], glMatrix.vec3[], Number[]]}
 */
export function calculateMesh(
    skeleton,
    skeletonOrigins,
    width,
    height,
    meshWidthScale,
    meshHeightScale,
) {
    /** @type {glMatrix.vec3[]} */
    let mesh = [];
    /** @type {glMatrix.vec3[]} */
    let origins = [];
    /** @type {Number[]} */
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

        //Save first and second triangles
        mesh.push(
            skeleton[i],
            skeleton[nextRingSamePoint],
            skeleton[nextRingPrevPoint],
            skeleton[i],
            skeleton[nextRingPrevPoint],
            skeleton[prevPoint],
        );

        //Save corresponding origins
        origins.push(
            currentOrigin,
            nextOrigin,
            nextOrigin,
            currentOrigin,
            nextOrigin,
            currentOrigin,
        );

        //Calculate the raw grid index components
        let y = i % height;
        let x = Math.floor(i / height);

        //Account for mesh scaling / interpolation
        x = Math.floor(x / meshWidthScale);
        y = Math.floor(y / meshHeightScale);
        let gridIndex = y * Math.floor(width / meshWidthScale) + x;

        indices.push(gridIndex, gridIndex);
    }

    return [mesh, origins, indices];
}
