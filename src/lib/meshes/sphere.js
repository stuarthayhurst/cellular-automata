import * as glMatrix from "gl-matrix";

//Mesh generation settings
const volumeDiameter = 1.0;

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

    //Generate extra points according to the scale
    width *= meshWidthScale;
    height *= meshHeightScale;

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

            skeleton.push(point);
        }
    }

    return [skeleton, []];
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

    let j = -1;
    for (let i = 0; i < skeleton.length; i++) {
        //Handle poles
        const p = i % (height + 3);
        let mapTriangles = true;
        if (p === 0) {
            //Skip internal triangles
            continue;
        } else if (p === 1 || p === height + 2) {
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

        //Save first and second triangles
        mesh.push(
            skeleton[i],
            skeleton[nextRingSamePoint],
            skeleton[nextRingPrevPoint],
            skeleton[i],
            skeleton[nextRingPrevPoint],
            skeleton[prevPoint],
        );

        if (mapTriangles) {
            //Calculate the raw grid index components
            let y = j % height;
            let x = Math.floor(j / height);

            //Account for mesh scaling / interpolation
            x = Math.floor(x / meshWidthScale);
            y = Math.floor(y / meshHeightScale);
            let gridIndex = y * Math.floor(width / meshWidthScale) + x;

            indices.push(gridIndex, gridIndex);
        } else {
            indices.push(-1, -1);
        }
    }

    //Generate local origins
    const zero = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
    for (let i = 0; i < mesh.length; i++) {
        origins.push(zero);
    }

    return [mesh, origins, indices];
}
