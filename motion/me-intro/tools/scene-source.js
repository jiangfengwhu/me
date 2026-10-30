import * as THREE from 'three';
import { NightStreetScene } from '../../../src/webgl/NightStreetScene.js';
import { PROFILE, BOOKS, SOCIAL_LINKS } from '../../../src/data/portfolioConfig.js';

// Reuse the actual website geometry, typography, book materials and textures.
// Only the input loop is replaced: the composition's time is the sole clock.
class FilmScene extends NightStreetScene {
  bindEvents() {}
  requestRenderFor() {}
  syncBulletinMotion() {}
}

window.createOriginalScene = async (container) => {
  await document.fonts.ready;
  await Promise.all([document.fonts.load('800 32px Inter'), document.fonts.load('700 24px "JetBrains Mono"')]);
  const scene = new FilmScene({ container, profile: PROFILE, books: BOOKS, socialLinks: SOCIAL_LINKS, sound: {} });
  scene.renderer.setPixelRatio(1);
  scene.renderer.setSize(1920, 1080);
  await scene.warmup();
  scene.contributionSnake?.setActive(false);
  const shelfPoses = scene.books.map(book => ({ p: book.outerGroup.position.clone(), r: book.outerGroup.rotation.clone() }));
  const shot = { cx: 76, cy: 1, cz: 62, tx: 76, ty: 1, tz: -6, board: 0, detail: 0, extract: 1, index: 0, spin: -1.05, mascot: 1 };

  function draw(time) {
    const detail = shot.detail > .5;
    const index = Math.max(0, Math.min(6, Math.round(shot.index)));
    scene.act1Group.visible = shot.board > .01;
    scene.act2Group.visible = shot.board < .99;
    scene.scene.background = detail ? new THREE.Color(BOOKS[index].palette.detailBg) : scene.galleryBackground;
    scene.scene.fog = detail ? null : scene.galleryFog;
    scene.backdropMesh.visible = !detail;
    scene.shelfFrameGroup.visible = !detail;
    scene.topLinearLightGroup.visible = !detail;
    scene.books.forEach((book, i) => {
      const pose = shelfPoses[i];
      book.outerGroup.visible = !detail || i === index;
      book.outerGroup.position.copy(pose.p);
      book.outerGroup.rotation.copy(pose.r);
      book.outerGroup.scale.setScalar(1);
      book.coverGroup.rotation.set(0, -Math.PI / 2, 0, 'ZYX');
      if (i === index && shot.extract > 0) {
        const e = shot.extract;
        book.outerGroup.position.lerp(new THREE.Vector3(-13, .8, 7), e);
        book.outerGroup.rotation.set(-Math.PI / 2 * (1-e), 0, Math.PI / 2 * (1-e));
        book.outerGroup.scale.setScalar(1 - (detail ? .4 : .25) * e);
        book.coverGroup.rotation.set(-.07 * e, THREE.MathUtils.lerp(-Math.PI/2, shot.spin, e), 0, 'ZYX');
      } else if (!detail && time >= 10 && time < 14) {
        book.outerGroup.position.z += Math.max(0, 1 - Math.abs((time-10)*1.7-i)) * 2.7;
      }
    });
    scene.mascotGroup.visible = shot.mascot > .5;
    if (shot.board > .5) {
      scene.mascotGroup.position.set(-4.4, 1.4, -6.5);
    } else {
      scene.mascotGroup.position.set(detail ? 70 : 94, detail ? -8.7 : -11.5, detail ? 9 : -5);
    }
    scene.mascotGroup.rotation.y = -.25;
    scene.mascotBodyPivot.position.y = Math.sin(time*3.5)*.12;
    scene.rightArmPivot.rotation.x = -.6 + Math.sin(time*4)*.27;
    scene.mascotAhoge.rotation.z = Math.sin(time*5.8)*.24;
    scene.camera.aspect = 1920/1080;
    scene.camera.position.set(shot.cx, shot.cy, shot.cz);
    scene.camera.lookAt(shot.tx, shot.ty, shot.tz);
    scene.camera.updateProjectionMatrix();
    scene.renderer.shadowMap.needsUpdate = true;
    scene.renderer.render(scene.scene, scene.camera);
  }
  return { shot, draw, books: BOOKS };
};
