import * as THREE from "three";
import * as FRAGS from "bim-fragment";
import { FragmentsGroup } from "bim-fragment";
import { Component, Event } from "../../base-types";
import { Components, Simple2DScene } from "../../core";
import { CurveHighlighter } from "./src/curve-highlighter";
import { AnchorPosition } from "../AnchorPosition";
import { RoadElevationNavigator } from "../RoadElevationNavigator";

export abstract class RoadNavigator extends Component<any> {
  enabled = true;

  caster = new THREE.Raycaster();

  scene: Simple2DScene;

  anchor: AnchorPosition;

  model: any;

  abstract view: "horizontal" | "vertical";

  protected _curves = new Set<FRAGS.CivilCurve>();
  private curveMeshes: THREE.Object3D[] = [];

  private _navigatorVertical!: RoadElevationNavigator;

  readonly onHighlight = new Event();
  highlighter: CurveHighlighter;

  protected constructor(components: Components) {
    super(components);
    this.caster.params.Line = { threshold: 5 };
    this.scene = new Simple2DScene(this.components, false);
    this.highlighter = new CurveHighlighter(this.scene.get());
    this.model = null;

    const { domElement } = components.renderer.get();
    this.anchor = new AnchorPosition(components, domElement, this, this.model);

    this.setupEvents();
  }

  get getAnchor() {
    return this.anchor;
  }

  get() {
    return null as any;
  }

  get navigatorVertical(): RoadElevationNavigator {
    return this._navigatorVertical;
  }

  set navigatorVertical(navigatorVertical: RoadElevationNavigator) {
    this._navigatorVertical = navigatorVertical;
  }

  async draw(model: FragmentsGroup, ids?: Iterable<number>) {
    if (!model.civilData) {
      throw new Error("The provided model doesn't have civil data!");
    }

    this.model = model;
    const { alignments } = model.civilData;
    const allIDs = ids || alignments.keys();

    const scene = this.scene.get();

    const totalBBox: THREE.Box3 = new THREE.Box3();
    totalBBox.makeEmpty();
    totalBBox.min.set(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
    totalBBox.max.set(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

    for (const id of allIDs) {
      const alignment = alignments.get(id);
      if (!alignment) {
        throw new Error("Alignment not found!");
      }

      for (const curve of alignment[this.view]) {
        this._curves.add(curve);
        scene.add(curve.mesh);
        this.curveMeshes.push(curve.mesh);

        if (!totalBBox.isEmpty()) {
          totalBBox.expandByObject(curve.mesh);
        } else {
          curve.mesh.geometry.computeBoundingBox();
          const cbox = curve.mesh.geometry.boundingBox;

          if (cbox instanceof THREE.Box3) {
            totalBBox.copy(cbox).applyMatrix4(curve.mesh.matrixWorld);
          }
        }
      }
    }

    await this.scene.controls.fitToBox(totalBBox, false);
  }

  setupEvents() {
    const mousePositionSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );

    this.scene.get().add(mousePositionSphere);

    this.scene.uiElement
      .get("container")
      .domElement.addEventListener("mousemove", (event) => {
        const dom = this.scene.uiElement.get("container").domElement;
        const mouse = new THREE.Vector2();
        const rect = dom.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.scene.camera);
        const intersects = raycaster.intersectObjects(this.curveMeshes);
        if (intersects.length > 0) {
          const intersect = intersects[0];
          const { point } = intersect;

          const alignment2DPosition = this.anchor.alignment2D;

          if (!alignment2DPosition) {
            mousePositionSphere.position.copy(point);
          }
        }
      });

    this.scene.uiElement
      .get("container")
      .domElement.addEventListener("click", async (event) => {
        const dom = this.scene.uiElement.get("container").domElement;
        const mouse = new THREE.Vector2();
        const rect = dom.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.scene.camera);

        const intersects = raycaster.intersectObjects(this.curveMeshes);

        if (intersects.length > 0) {
          const curve = intersects[0].object as THREE.LineSegments;
          await this.onHighlight.trigger(curve);

          // Anchor set & load alignment vertical

          const intersect = intersects[0];
          const { point, object } = intersect;

          this.anchor.model2DPosition = point;
          this.anchor.alignment2D = object;

          // @ts-ignore
          const index = object.curve.index;

          const verticalAlignment =
            // @ts-ignore
            object.curve.alignment.vertical[index].mesh;

          this.navigatorVertical.scene.get().add(verticalAlignment);

          const controlsElevation = this.navigatorVertical.scene.controls;

          await controlsElevation.fitToBox(verticalAlignment, true);
        }
      });
  }

  dispose() {
    this.highlighter.dispose();
    this.clear();
    this.onHighlight.reset();
    this.caster = null as any;
    this.scene.dispose();
    this._curves = null as any;
  }

  clear() {
    for (const curve of this._curves) {
      curve.mesh.removeFromParent();
    }
    this._curves.clear();
  }
}
