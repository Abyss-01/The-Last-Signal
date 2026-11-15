import * as THREE from 'three';

export const APOLLO_SUN_DIRECTION = new THREE.Vector3(0.48, 0.72, 0.5).normalize();

function makeCloudTexture() {
  const width = 512;
  const height = 256;
  const pixels = new Uint8Array(width * height * 4);
  const hash = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (x, y, periodX, periodY) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const wrap = (value, period) => ((value % period) + period) % period;
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = THREE.MathUtils.lerp(hash(wrap(ix, periodX), iy), hash(wrap(ix + 1, periodX), iy), sx);
    const b = THREE.MathUtils.lerp(hash(wrap(ix, periodX), iy + 1), hash(wrap(ix + 1, periodX), iy + 1), sx);
    return THREE.MathUtils.lerp(a, b, sy);
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = (x / width) * 8;
      const v = (y / height) * 5;
      const cloud = noise(u, v, 8, 5) * 0.58
        + noise(u * 2, v * 2, 16, 10) * 0.28
        + noise(u * 4, v * 4, 32, 20) * 0.14;
      const offset = (y * width + x) * 4;
      const value = Math.round(cloud * 255);
      pixels[offset] = value;
      pixels[offset + 1] = value;
      pixels[offset + 2] = value;
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, width, height, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function makeGroundTexture() {
  const size = 256;
  const pixels = new Uint8Array(size * size * 4);
  const hash = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), sx);
    const b = THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx);
    return THREE.MathUtils.lerp(a, b, sy);
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size, v = y / size;
      const broad = noise(u * 7, v * 7) * 0.55 + noise(u * 17, v * 17) * 0.3 + noise(u * 39, v * 39) * 0.15;
      const scrub = THREE.MathUtils.smoothstep(broad, 0.34, 0.72);
      const grain = (hash(x, y) - 0.5) * 7;
      const offset = (y * size + x) * 4;
      pixels[offset] = Math.round(38 + scrub * 20 + grain);
      pixels[offset + 1] = Math.round(47 + scrub * 24 + grain);
      pixels[offset + 2] = Math.round(39 + scrub * 12 + grain * 0.65);
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createLaunchPad39A(scene) {
  const padGroup = new THREE.Group();
  padGroup.name = 'launch-complex-39a';
  scene.add(padGroup);

  // Florida Coastal Terrain & Concrete Pad Apron
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(6000, 6000),
    new THREE.MeshStandardMaterial({ map: makeGroundTexture(), roughness: 0.96 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -14.5;
  padGroup.add(terrain);

  const apron = new THREE.Mesh(
    new THREE.CircleGeometry(42, 64),
    new THREE.MeshStandardMaterial({ color: '#44494b', roughness: 0.94 })
  );
  apron.rotation.x = -Math.PI / 2;
  apron.position.y = -14.2;
  padGroup.add(apron);

  // Sparse coastal pine silhouettes give the flat Florida horizon a real scale cue.
  // Instancing keeps the distant tree line inexpensive and avoids a repeated card look.
  const treeCount = 240;
  const treeGeometry = new THREE.IcosahedronGeometry(1, 1);
  const treeMaterial = new THREE.MeshStandardMaterial({ color: '#303d36', roughness: 1 });
  const treeLine = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
  const treeDummy = new THREE.Object3D();
  let treeSeed = 9137;
  const random = () => {
    treeSeed = (treeSeed * 1664525 + 1013904223) >>> 0;
    return treeSeed / 4294967296;
  };
  for (let i = 0; i < treeCount; i++) {
    const angle = random() * Math.PI * 2;
    const radius = 620 + Math.sqrt(random()) * 720;
    const height = 1.2 + random() * 2.5;
    treeDummy.position.set(Math.cos(angle) * radius, -14.5 + height * 0.52, Math.sin(angle) * radius);
    treeDummy.rotation.y = random() * Math.PI * 2;
    treeDummy.scale.set(2 + random() * 4, height, 2 + random() * 4);
    treeDummy.updateMatrix();
    treeLine.setMatrixAt(i, treeDummy.matrix);
  }
  treeLine.instanceMatrix.needsUpdate = true;
  treeLine.frustumCulled = false;
  padGroup.add(treeLine);

  // Open steel MLP frame: the central exhaust path must remain unobstructed.
  const mlpMat = new THREE.MeshStandardMaterial({ color: '#494d51', roughness: 0.68, metalness: 0.34 });
  const mlpRails = [
    [new THREE.BoxGeometry(30, 1.2, 2), 0, -1.2, -14],
    [new THREE.BoxGeometry(6, 1.2, 2), -12, -1.2, 20],
    [new THREE.BoxGeometry(6, 1.2, 2), 12, -1.2, 20],
    [new THREE.BoxGeometry(2, 1.2, 34), -14, -1.2, 3],
    [new THREE.BoxGeometry(2, 1.2, 34), 14, -1.2, 3],
  ];
  mlpRails.forEach(([geometry, x, y, z]) => {
    const rail = new THREE.Mesh(geometry, mlpMat);
    rail.position.set(x, y, z);
    padGroup.add(rail);
  });
  [-12.5, 12.5].forEach((x) => [-12.5, 18.5].forEach((z) => {
    const support = new THREE.Mesh(new THREE.BoxGeometry(1.8, 9, 1.8), mlpMat);
    support.position.set(x, -6.2, z);
    padGroup.add(support);
  }));

  // Flame Trench Deflector
  const trench = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1.5, 14),
    new THREE.MeshStandardMaterial({ color: '#2b2d30', roughness: 0.9 })
  );
  trench.position.set(0, -11.2, -34);
  trench.rotation.z = -Math.PI / 9;
  padGroup.add(trench);

  // 4 Hold-Down Arms
  const holdMat = new THREE.MeshStandardMaterial({ color: '#22252a', metalness: 0.6, roughness: 0.4 });
  [
    [5.4, 5.4],
    [-5.4, 5.4],
    [5.4, -5.4],
    [-5.4, -5.4],
  ].forEach(([x, z]) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 1.6), holdMat);
    arm.position.set(x, 0.5, z);
    padGroup.add(arm);
  });

  // Red-Orange Launch Umbilical Tower (LUT)
  const lutGroup = new THREE.Group();
  // Keep the tower beside the vehicle in the opening three-quarter camera view.
  // The camera approaches from +X/+Z, so this offset avoids hiding the rocket.
  lutGroup.position.set(-20, -0.2, 20);
  padGroup.add(lutGroup);

  const towerMat = new THREE.MeshStandardMaterial({ color: '#873c2d', roughness: 0.72, metalness: 0.2 });
  const unitBeam = new THREE.BoxGeometry(1, 1, 1);
  const beamDummy = new THREE.Object3D();
  const beamStart = new THREE.Vector3();
  const beamEnd = new THREE.Vector3();
  const beamDirection = new THREE.Vector3();
  const beamUp = new THREE.Vector3(0, 1, 0);
  const placeBeam = (mesh, index, start, end, thickness) => {
    beamStart.set(...start);
    beamEnd.set(...end);
    beamDirection.subVectors(beamEnd, beamStart);
    beamDummy.position.copy(beamStart).add(beamEnd).multiplyScalar(0.5);
    beamDummy.quaternion.setFromUnitVectors(beamUp, beamDirection.clone().normalize());
    beamDummy.scale.set(thickness, beamDirection.length(), thickness);
    beamDummy.updateMatrix();
    mesh.setMatrixAt(index, beamDummy.matrix);
  };

  const towerColumns = new THREE.InstancedMesh(unitBeam, towerMat, 4);
  [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]].forEach(([x, z], i) => {
    beamDummy.position.set(x, 58, z);
    beamDummy.scale.set(0.8, 116, 0.8);
    beamDummy.updateMatrix();
    towerColumns.setMatrixAt(i, beamDummy.matrix);
  });
  towerColumns.castShadow = true;
  lutGroup.add(towerColumns);

  const braceLevels = 14;
  const horizontalRails = new THREE.InstancedMesh(unitBeam, towerMat, (braceLevels + 1) * 4 + 12);
  const diagonalBraces = new THREE.InstancedMesh(unitBeam, towerMat, braceLevels * 8);
  let railIndex = 0;
  let braceIndex = 0;
  for (let tier = 0; tier <= braceLevels; tier++) {
    const y = 1 + tier * (114 / braceLevels);
    const corners = [
      [[-5.5, y, -5.5], [5.5, y, -5.5]],
      [[-5.5, y, 5.5], [5.5, y, 5.5]],
      [[-5.5, y, -5.5], [-5.5, y, 5.5]],
      [[5.5, y, -5.5], [5.5, y, 5.5]],
    ];
    corners.forEach(([start, end]) => placeBeam(horizontalRails, railIndex++, start, end, 0.36));
    if (tier === braceLevels) continue;
    const nextY = 1 + (tier + 1) * (114 / braceLevels);
    [
      [[-5.5, y, -5.5], [5.5, nextY, -5.5]], [[5.5, y, -5.5], [-5.5, nextY, -5.5]],
      [[-5.5, y, 5.5], [5.5, nextY, 5.5]], [[5.5, y, 5.5], [-5.5, nextY, 5.5]],
      [[-5.5, y, -5.5], [-5.5, nextY, 5.5]], [[-5.5, y, 5.5], [-5.5, nextY, -5.5]],
      [[5.5, y, -5.5], [5.5, nextY, 5.5]], [[5.5, y, 5.5], [5.5, nextY, -5.5]],
    ].forEach(([start, end]) => placeBeam(diagonalBraces, braceIndex++, start, end, 0.24));
  }
  [18, 54, 90].forEach((y) => {
    [
      [[-5.5, y, -5.5], [5.5, y, -5.5]], [[-5.5, y, 5.5], [5.5, y, 5.5]],
      [[-5.5, y, -5.5], [-5.5, y, 5.5]], [[5.5, y, -5.5], [5.5, y, 5.5]],
    ].forEach(([start, end]) => placeBeam(horizontalRails, railIndex++, start, end, 0.56));
  });
  horizontalRails.castShadow = true;
  diagonalBraces.castShadow = true;
  lutGroup.add(horizontalRails, diagonalBraces);

  const crane = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 3.2, 22),
    new THREE.MeshStandardMaterial({ color: '#d4b13b', roughness: 0.5 })
  );
  crane.position.set(0, 118, -2);
  lutGroup.add(crane);

  // Retractable Swing Arms
  const swingArmsGroup = new THREE.Group();
  swingArmsGroup.position.set(0, 0, -5.5);
  lutGroup.add(swingArmsGroup);

  const swingMat = new THREE.MeshStandardMaterial({ color: '#8f969e', metalness: 0.5, roughness: 0.45 });
  [28, 44, 62, 78, 94].forEach((armY) => {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 13), swingMat);
    arm.position.set(0, armY, -6.5);
    swingArmsGroup.add(arm);
  });

  padGroup.traverse((object) => {
    if (!object.isMesh && !object.isInstancedMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
  });

  return {
    update(state) {
      padGroup.visible = state.progress < 0.58;
      const retract = THREE.MathUtils.clamp((state.progress - 0.05) / 0.14, 0, 1);
      swingArmsGroup.rotation.y = -retract * 1.15;
    },
  };
}

export function createExhaustSmoke(scene, camera) {
  const SMOKE_COUNT = 160;
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  const hash = (x, y) => {
    const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const noise = (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = THREE.MathUtils.lerp(hash(ix, iy), hash(ix + 1, iy), sx);
    const b = THREE.MathUtils.lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), sx);
    return THREE.MathUtils.lerp(a, b, sy);
  };

  // A repeatable, soft billow mask breaks the puffs' spherical silhouette.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / (size - 1);
      const v = y / (size - 1);
      const radius = Math.hypot((u - 0.5) * 2, (v - 0.5) * 2);
      const turbulence = noise(u * 9, v * 9) * 0.58 + noise(u * 18, v * 18) * 0.28 + noise(u * 36, v * 36) * 0.14;
      const billow = 1 - radius + (turbulence - 0.5) * 0.34;
      const alpha = Math.round(THREE.MathUtils.smoothstep(billow, 0.02, 0.68) * 255);
      const offset = (y * size + x) * 4;
      data[offset] = 255;
      data[offset + 1] = alpha;
      data[offset + 2] = 255;
      data[offset + 3] = 255;
    }
  }
  const billowMap = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  billowMap.wrapS = THREE.RepeatWrapping;
  billowMap.wrapT = THREE.RepeatWrapping;
  billowMap.colorSpace = THREE.NoColorSpace;
  billowMap.generateMipmaps = true;
  billowMap.minFilter = THREE.LinearMipmapLinearFilter;
  billowMap.magFilter = THREE.LinearFilter;
  billowMap.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(1, 1);
  const mat = new THREE.MeshBasicMaterial({
    color: '#d7d3cb',
    alphaMap: billowMap,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const instancedMesh = new THREE.InstancedMesh(geo, mat, SMOKE_COUNT);
  instancedMesh.frustumCulled = false;
  scene.add(instancedMesh);

  const dummy = new THREE.Object3D();
  const seeds = Array.from({ length: SMOKE_COUNT }, (_, i) => ({
    angle: (i * 2.39996) % (Math.PI * 2),
    radialSpeed: 12 + ((i * 37) % 48),
    lift: ((i * 19) % 14) - 4,
    phaseOffset: i / SMOKE_COUNT,
    baseScale: 0.9 + ((i * 13) % 6) * 0.5,
    shade: 0.78 + ((i * 17) % 12) / 100,
  }));

  const smokeColor = new THREE.Color();
  seeds.forEach((seed, i) => {
    smokeColor.setRGB(seed.shade, seed.shade * 0.99, seed.shade * 0.97);
    instancedMesh.setColorAt(i, smokeColor);
  });
  instancedMesh.instanceColor.needsUpdate = true;

  return {
    update(state) {
      billowMap.offset.set(state.progress * 0.11, state.progress * 0.07);
      if (state.smokeDensity <= 0.01 || state.spaceTransition > 0.65) {
        instancedMesh.visible = false;
        return;
      }
      instancedMesh.visible = true;

      // Particle positions are a pure function of scroll progress so reverse scrubbing is repeatable.
      const drive = state.progress * 8;
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const p = seeds[i];
        const life = (drive + p.phaseOffset) % 1;
        const dist = life * p.radialSpeed * (0.4 + state.smokeDensity * 0.9);
        const x = Math.cos(p.angle) * dist;
        const z = Math.sin(p.angle) * dist;
        const y = -12 + life * p.lift + Math.min(state.rocketY * 0.25, 18) * (1 - life);

        const scale = p.baseScale * (0.35 + life * 2.4) * state.smokeDensity;
        dummy.position.set(x, y, z);
        dummy.scale.set(Math.max(0.001, scale * 1.8), Math.max(0.001, scale * 0.88), 1);
        dummy.quaternion.copy(camera.quaternion);
        dummy.rotateZ(life * 2 + p.angle * 0.35);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
      }
      instancedMesh.instanceMatrix.needsUpdate = true;
    },
  };
}

export function createAtmosphereAndSpace(scene, camera) {
  const skyUniforms = {
    uSunDirection: { value: APOLLO_SUN_DIRECTION.clone() },
    uSpaceTransition: { value: 0 },
    uCloudDrift: { value: 0 },
    uCloudMap: { value: makeCloudTexture() },
  };
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vDirection = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDirection;
      uniform float uSpaceTransition;
      uniform float uCloudDrift;
      uniform sampler2D uCloudMap;
      varying vec3 vDirection;
      void main() {
        vec3 dir = normalize(vDirection);
        float elevation = clamp(dir.y, -0.08, 1.0);
        vec3 horizon = vec3(0.34, 0.19, 0.13);
        vec3 middle = vec3(0.17, 0.29, 0.36);
        vec3 zenith = vec3(0.045, 0.105, 0.17);
        float lift = smoothstep(-0.08, 0.24, elevation);
        vec3 sky = mix(horizon, middle, lift);
        sky = mix(sky, zenith, smoothstep(0.18, 0.88, elevation));

        vec2 cloudUv = vec2(atan(dir.z, dir.x) * 0.159155 + 0.5 + uCloudDrift * 0.012,
          asin(clamp(dir.y, -1.0, 1.0)) * 0.31831 + 0.5);
        float cloudNoise = texture2D(uCloudMap, cloudUv).r - 0.5;
        float cloudWarp = sin(cloudUv.x * 18.0 + sin(cloudUv.y * 19.0 + cloudUv.x * 5.0) * 1.8) * 0.28
          + sin(cloudUv.x * 35.0 - cloudUv.y * 22.0) * 0.12;
        float cloudBand = smoothstep(0.51, 0.7, 0.5 + cloudNoise * 0.6 + cloudWarp)
          * (1.0 - smoothstep(0.16, 0.52, elevation));
        vec3 cloudColor = mix(vec3(0.44,0.45,0.45), vec3(0.76,0.66,0.54), max(dot(dir, uSunDirection), 0.0));
        sky = mix(sky, cloudColor, cloudBand * 0.52);

        float sunDot = max(dot(dir, normalize(uSunDirection)), 0.0);
        float sunHalo = pow(sunDot, 18.0) * 0.12 + pow(sunDot, 90.0) * 0.32;
        float sunDisk = smoothstep(0.99982, 0.99997, sunDot);
        sky += vec3(1.0, 0.55, 0.29) * sunHalo;
        sky = mix(sky, vec3(1.0,0.84,0.64), sunDisk);

        vec3 space = vec3(0.0015, 0.003, 0.009) + vec3(0.008,0.015,0.028) * max(elevation, 0.0);
        float transition = smoothstep(0.04, 0.96, uSpaceTransition);
        vec3 color = mix(sky, space, transition);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(4200, 48, 28), skyMaterial);
  skyDome.name = 'procedural-cinematic-sky';
  skyDome.frustumCulled = false;
  skyDome.renderOrder = -1000;
  scene.add(skyDome);

  // Deterministic Starfield
  const starCount = 1800;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / starCount);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = 1600;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 2.2,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Earth Curvature & Atmospheric Limb
  const earthGroup = new THREE.Group();
  earthGroup.visible = false;
  scene.add(earthGroup);

  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: { uSunDirection: { value: APOLLO_SUN_DIRECTION.clone() } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uSunDirection;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise2(vec2 p) {
        vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
      }
      float fbm2(vec2 p) {
        float v=0.0, a=0.5;
        for(int i=0;i<5;i++){v+=noise2(p)*a;p*=2.0;a*=0.5;}
        return v;
      }
      void main() {
        vec2 p = vec2(vUv.x * 10.0, vUv.y * 5.0);
        float landField = fbm2(p) * 0.72 + fbm2(p * 0.43 + 7.2) * 0.28;
        float land = smoothstep(0.47, 0.57, landField);
        float ice = smoothstep(0.76, 0.96, abs(vUv.y - 0.5) * 2.0);
        float cloudField = fbm2(vUv * vec2(38.0, 20.0) + 4.3);
        float cloud = smoothstep(0.63, 0.76, cloudField) * (1.0 - ice * 0.75);
        vec3 ocean = vec3(0.018,0.095,0.24);
        vec3 continent = mix(vec3(0.12,0.22,0.12), vec3(0.34,0.29,0.18), smoothstep(0.52,0.72,landField));
        vec3 surface = mix(ocean, continent, land);
        surface = mix(surface, vec3(0.74,0.78,0.78), ice * 0.82);
        surface = mix(surface, vec3(0.72,0.78,0.82), cloud * 0.52);
        float daylight = 0.08 + 1.1 * max(dot(normalize(vWorldNormal), normalize(uSunDirection)), 0.0);
        float limb = pow(1.0 - max(dot(normalize(vWorldNormal), normalize(uSunDirection)), 0.0), 2.0);
        vec3 color = surface * daylight + vec3(0.06,0.15,0.28) * limb * 0.65;
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const earthSphere = new THREE.Mesh(new THREE.SphereGeometry(620, 96, 64), earthMaterial);
  const earthHalo = new THREE.Mesh(
    new THREE.SphereGeometry(620, 48, 48),
    new THREE.MeshBasicMaterial({
      color: '#6cb6ff',
      transparent: true,
      opacity: 0.22,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  earthHalo.scale.setScalar(1.018);
  earthGroup.add(earthSphere, earthHalo);

  // Distant Moon for TLI Transition
  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(42, 48, 48),
    new THREE.MeshStandardMaterial({ color: '#b8b5ad', roughness: 0.95 })
  );
  moonMesh.visible = false;
  scene.add(moonMesh);

  const skyColor = new THREE.Color();
  const dayColor = new THREE.Color('#77776e');
  const upperAtmoColor = new THREE.Color('#193449');
  const spaceColor = new THREE.Color('#020308');

  return {
    update(state) {
      if (state.spaceTransition < 0.5) {
        skyColor.lerpColors(dayColor, upperAtmoColor, state.spaceTransition * 2);
      } else {
        skyColor.lerpColors(upperAtmoColor, spaceColor, (state.spaceTransition - 0.5) * 2);
      }
      skyUniforms.uSpaceTransition.value = state.spaceTransition;
      skyUniforms.uCloudDrift.value = state.progress * 0.55;
      skyDome.position.copy(camera.position);
      earthMaterial.uniforms.uSunDirection.value.copy(APOLLO_SUN_DIRECTION);
      scene.background = spaceColor;
      if (scene.fog) {
        scene.fog.color.copy(skyColor);
        scene.fog.density = THREE.MathUtils.lerp(0.00055, 0.00001, state.spaceTransition);
      }

      starMat.opacity = THREE.MathUtils.clamp((state.spaceTransition - 0.4) * 1.8, 0, 0.95);

      earthGroup.visible = state.earthCurveProgress > 0.02;
      const pullBack = Math.max(0, state.progress - 0.88) / 0.12;
      earthGroup.position.set(
        -120 - pullBack * 260,
        state.rocketY - 640 - pullBack * 280,
        -260 - pullBack * 420
      );
      earthGroup.rotation.y = state.progress * 0.35;

      moonMesh.visible = state.moonVisibility > 0.01;
      moonMesh.position.set(180, state.rocketY + 110, -520 + state.moonVisibility * 80);
      moonMesh.scale.setScalar(0.4 + state.moonVisibility * 0.85);
    },
  };
}
