import * as THREE from "three";
import { Controls, Vector3, MOUSE, TOUCH, Quaternion, Spherical, Vector2, Ray, Plane, MathUtils, REVISION } from "three";
import { Pane } from "tweakpane";
const _changeEvent = { type: "change" };
const _startEvent = { type: "start" };
const _endEvent = { type: "end" };
const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos(70 * MathUtils.DEG2RAD);
const _v = new Vector3();
const _twoPI = 2 * Math.PI;
const _STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
};
const _EPS = 1e-6;
class OrbitControls extends Controls {
  /**
   * Constructs a new controls instance.
   *
   * @param {Object3D} object - The object that is managed by the controls.
   * @param {?HTMLElement} domElement - The HTML element used for event listeners.
   */
  constructor(object, domElement = null) {
    super(object, domElement);
    this.state = _STATE.NONE;
    this.target = new Vector3();
    this.cursor = new Vector3();
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.minZoom = 0;
    this.maxZoom = Infinity;
    this.minTargetRadius = 0;
    this.maxTargetRadius = Infinity;
    this.minPolarAngle = 0;
    this.maxPolarAngle = Math.PI;
    this.minAzimuthAngle = -Infinity;
    this.maxAzimuthAngle = Infinity;
    this.enableDamping = false;
    this.dampingFactor = 0.05;
    this.enableZoom = true;
    this.zoomSpeed = 1;
    this.enableRotate = true;
    this.rotateSpeed = 1;
    this.keyRotateSpeed = 1;
    this.enablePan = true;
    this.panSpeed = 1;
    this.screenSpacePanning = true;
    this.keyPanSpeed = 7;
    this.zoomToCursor = false;
    this.autoRotate = false;
    this.autoRotateSpeed = 2;
    this.keys = { LEFT: "ArrowLeft", UP: "ArrowUp", RIGHT: "ArrowRight", BOTTOM: "ArrowDown" };
    this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
    this.touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 = this.object.zoom;
    this._domElementKeyEvents = null;
    this._lastPosition = new Vector3();
    this._lastQuaternion = new Quaternion();
    this._lastTargetPosition = new Vector3();
    this._quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
    this._quatInverse = this._quat.clone().invert();
    this._spherical = new Spherical();
    this._sphericalDelta = new Spherical();
    this._scale = 1;
    this._panOffset = new Vector3();
    this._rotateStart = new Vector2();
    this._rotateEnd = new Vector2();
    this._rotateDelta = new Vector2();
    this._panStart = new Vector2();
    this._panEnd = new Vector2();
    this._panDelta = new Vector2();
    this._dollyStart = new Vector2();
    this._dollyEnd = new Vector2();
    this._dollyDelta = new Vector2();
    this._dollyDirection = new Vector3();
    this._mouse = new Vector2();
    this._performCursorZoom = false;
    this._pointers = [];
    this._pointerPositions = {};
    this._controlActive = false;
    this._onPointerMove = onPointerMove.bind(this);
    this._onPointerDown = onPointerDown.bind(this);
    this._onPointerUp = onPointerUp.bind(this);
    this._onContextMenu = onContextMenu.bind(this);
    this._onMouseWheel = onMouseWheel.bind(this);
    this._onKeyDown = onKeyDown.bind(this);
    this._onTouchStart = onTouchStart.bind(this);
    this._onTouchMove = onTouchMove.bind(this);
    this._onMouseDown = onMouseDown.bind(this);
    this._onMouseMove = onMouseMove.bind(this);
    this._interceptControlDown = interceptControlDown.bind(this);
    this._interceptControlUp = interceptControlUp.bind(this);
    if (this.domElement !== null) {
      this.connect(this.domElement);
    }
    this.update();
  }
  connect(element) {
    super.connect(element);
    this.domElement.addEventListener("pointerdown", this._onPointerDown);
    this.domElement.addEventListener("pointercancel", this._onPointerUp);
    this.domElement.addEventListener("contextmenu", this._onContextMenu);
    this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: false });
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keydown", this._interceptControlDown, { passive: true, capture: true });
    this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown);
    this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove);
    this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp);
    this.domElement.removeEventListener("pointercancel", this._onPointerUp);
    this.domElement.removeEventListener("wheel", this._onMouseWheel);
    this.domElement.removeEventListener("contextmenu", this._onContextMenu);
    this.stopListenToKeyEvents();
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keydown", this._interceptControlDown, { capture: true });
    this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  /**
   * Get the current vertical rotation, in radians.
   *
   * @return {number} The current vertical rotation, in radians.
   */
  getPolarAngle() {
    return this._spherical.phi;
  }
  /**
   * Get the current horizontal rotation, in radians.
   *
   * @return {number} The current horizontal rotation, in radians.
   */
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  /**
   * Returns the distance from the camera to the target.
   *
   * @return {number} The distance from the camera to the target.
   */
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  /**
   * Adds key event listeners to the given DOM element.
   * `window` is a recommended argument for using this method.
   *
   * @param {HTMLElement} domElement - The DOM element
   */
  listenToKeyEvents(domElement) {
    domElement.addEventListener("keydown", this._onKeyDown);
    this._domElementKeyEvents = domElement;
  }
  /**
   * Removes the key event listener previously defined with `listenToKeyEvents()`.
   */
  stopListenToKeyEvents() {
    if (this._domElementKeyEvents !== null) {
      this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown);
      this._domElementKeyEvents = null;
    }
  }
  /**
   * Save the current state of the controls. This can later be recovered with `reset()`.
   */
  saveState() {
    this.target0.copy(this.target);
    this.position0.copy(this.object.position);
    this.zoom0 = this.object.zoom;
  }
  /**
   * Reset the controls to their state from either the last time the `saveState()`
   * was called, or the initial state.
   */
  reset() {
    this.target.copy(this.target0);
    this.object.position.copy(this.position0);
    this.object.zoom = this.zoom0;
    this.object.updateProjectionMatrix();
    this.dispatchEvent(_changeEvent);
    this.update();
    this.state = _STATE.NONE;
  }
  update(deltaTime = null) {
    const position = this.object.position;
    _v.copy(position).sub(this.target);
    _v.applyQuaternion(this._quat);
    this._spherical.setFromVector3(_v);
    if (this.autoRotate && this.state === _STATE.NONE) {
      this._rotateLeft(this._getAutoRotationAngle(deltaTime));
    }
    if (this.enableDamping) {
      this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor;
      this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor;
    } else {
      this._spherical.theta += this._sphericalDelta.theta;
      this._spherical.phi += this._sphericalDelta.phi;
    }
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;
    if (isFinite(min) && isFinite(max)) {
      if (min < -Math.PI) min += _twoPI;
      else if (min > Math.PI) min -= _twoPI;
      if (max < -Math.PI) max += _twoPI;
      else if (max > Math.PI) max -= _twoPI;
      if (min <= max) {
        this._spherical.theta = Math.max(min, Math.min(max, this._spherical.theta));
      } else {
        this._spherical.theta = this._spherical.theta > (min + max) / 2 ? Math.max(min, this._spherical.theta) : Math.min(max, this._spherical.theta);
      }
    }
    this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi));
    this._spherical.makeSafe();
    if (this.enableDamping === true) {
      this.target.addScaledVector(this._panOffset, this.dampingFactor);
    } else {
      this.target.add(this._panOffset);
    }
    this.target.sub(this.cursor);
    this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
    this.target.add(this.cursor);
    let zoomChanged = false;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) {
      this._spherical.radius = this._clampDistance(this._spherical.radius);
    } else {
      const prevRadius = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale);
      zoomChanged = prevRadius != this._spherical.radius;
    }
    _v.setFromSpherical(this._spherical);
    _v.applyQuaternion(this._quatInverse);
    position.copy(this.target).add(_v);
    this.object.lookAt(this.target);
    if (this.enableDamping === true) {
      this._sphericalDelta.theta *= 1 - this.dampingFactor;
      this._sphericalDelta.phi *= 1 - this.dampingFactor;
      this._panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this._sphericalDelta.set(0, 0, 0);
      this._panOffset.set(0, 0, 0);
    }
    if (this.zoomToCursor && this._performCursorZoom) {
      let newRadius = null;
      if (this.object.isPerspectiveCamera) {
        const prevRadius = _v.length();
        newRadius = this._clampDistance(prevRadius * this._scale);
        const radiusDelta = prevRadius - newRadius;
        this.object.position.addScaledVector(this._dollyDirection, radiusDelta);
        this.object.updateMatrixWorld();
        zoomChanged = !!radiusDelta;
      } else if (this.object.isOrthographicCamera) {
        const mouseBefore = new Vector3(this._mouse.x, this._mouse.y, 0);
        mouseBefore.unproject(this.object);
        const prevZoom = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
        this.object.updateProjectionMatrix();
        zoomChanged = prevZoom !== this.object.zoom;
        const mouseAfter = new Vector3(this._mouse.x, this._mouse.y, 0);
        mouseAfter.unproject(this.object);
        this.object.position.sub(mouseAfter).add(mouseBefore);
        this.object.updateMatrixWorld();
        newRadius = _v.length();
      } else {
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled.");
        this.zoomToCursor = false;
      }
      if (newRadius !== null) {
        if (this.screenSpacePanning) {
          this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(newRadius).add(this.object.position);
        } else {
          _ray.origin.copy(this.object.position);
          _ray.direction.set(0, 0, -1).transformDirection(this.object.matrix);
          if (Math.abs(this.object.up.dot(_ray.direction)) < _TILT_LIMIT) {
            this.object.lookAt(this.target);
          } else {
            _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
            _ray.intersectPlane(_plane, this.target);
          }
        }
      }
    } else if (this.object.isOrthographicCamera) {
      const prevZoom = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
      if (prevZoom !== this.object.zoom) {
        this.object.updateProjectionMatrix();
        zoomChanged = true;
      }
    }
    this._scale = 1;
    this._performCursorZoom = false;
    if (zoomChanged || this._lastPosition.distanceToSquared(this.object.position) > _EPS || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > _EPS || this._lastTargetPosition.distanceToSquared(this.target) > _EPS) {
      this.dispatchEvent(_changeEvent);
      this._lastPosition.copy(this.object.position);
      this._lastQuaternion.copy(this.object.quaternion);
      this._lastTargetPosition.copy(this.target);
      return true;
    }
    return false;
  }
  _getAutoRotationAngle(deltaTime) {
    if (deltaTime !== null) {
      return _twoPI / 60 * this.autoRotateSpeed * deltaTime;
    } else {
      return _twoPI / 60 / 60 * this.autoRotateSpeed;
    }
  }
  _getZoomScale(delta) {
    const normalizedDelta = Math.abs(delta * 0.01);
    return Math.pow(0.95, this.zoomSpeed * normalizedDelta);
  }
  _rotateLeft(angle) {
    this._sphericalDelta.theta -= angle;
  }
  _rotateUp(angle) {
    this._sphericalDelta.phi -= angle;
  }
  _panLeft(distance, objectMatrix) {
    _v.setFromMatrixColumn(objectMatrix, 0);
    _v.multiplyScalar(-distance);
    this._panOffset.add(_v);
  }
  _panUp(distance, objectMatrix) {
    if (this.screenSpacePanning === true) {
      _v.setFromMatrixColumn(objectMatrix, 1);
    } else {
      _v.setFromMatrixColumn(objectMatrix, 0);
      _v.crossVectors(this.object.up, _v);
    }
    _v.multiplyScalar(distance);
    this._panOffset.add(_v);
  }
  // deltaX and deltaY are in pixels; right and down are positive
  _pan(deltaX, deltaY) {
    const element = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const position = this.object.position;
      _v.copy(position).sub(this.target);
      let targetDistance = _v.length();
      targetDistance *= Math.tan(this.object.fov / 2 * Math.PI / 180);
      this._panLeft(2 * deltaX * targetDistance / element.clientHeight, this.object.matrix);
      this._panUp(2 * deltaY * targetDistance / element.clientHeight, this.object.matrix);
    } else if (this.object.isOrthographicCamera) {
      this._panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / element.clientWidth, this.object.matrix);
      this._panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / element.clientHeight, this.object.matrix);
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.");
      this.enablePan = false;
    }
  }
  _dollyOut(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale /= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _dollyIn(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this._scale *= dollyScale;
    } else {
      console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.");
      this.enableZoom = false;
    }
  }
  _updateZoomParameters(x, y) {
    if (!this.zoomToCursor) {
      return;
    }
    this._performCursorZoom = true;
    const rect = this.domElement.getBoundingClientRect();
    const dx = x - rect.left;
    const dy = y - rect.top;
    const w = rect.width;
    const h = rect.height;
    this._mouse.x = dx / w * 2 - 1;
    this._mouse.y = -(dy / h) * 2 + 1;
    this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(dist) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, dist));
  }
  //
  // event callbacks - update the object state
  //
  _handleMouseDownRotate(event) {
    this._rotateStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownDolly(event) {
    this._updateZoomParameters(event.clientX, event.clientX);
    this._dollyStart.set(event.clientX, event.clientY);
  }
  _handleMouseDownPan(event) {
    this._panStart.set(event.clientX, event.clientY);
  }
  _handleMouseMoveRotate(event) {
    this._rotateEnd.set(event.clientX, event.clientY);
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
    this.update();
  }
  _handleMouseMoveDolly(event) {
    this._dollyEnd.set(event.clientX, event.clientY);
    this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);
    if (this._dollyDelta.y > 0) {
      this._dollyOut(this._getZoomScale(this._dollyDelta.y));
    } else if (this._dollyDelta.y < 0) {
      this._dollyIn(this._getZoomScale(this._dollyDelta.y));
    }
    this._dollyStart.copy(this._dollyEnd);
    this.update();
  }
  _handleMouseMovePan(event) {
    this._panEnd.set(event.clientX, event.clientY);
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
    this.update();
  }
  _handleMouseWheel(event) {
    this._updateZoomParameters(event.clientX, event.clientY);
    if (event.deltaY < 0) {
      this._dollyIn(this._getZoomScale(event.deltaY));
    } else if (event.deltaY > 0) {
      this._dollyOut(this._getZoomScale(event.deltaY));
    }
    this.update();
  }
  _handleKeyDown(event) {
    let needsUpdate = false;
    switch (event.code) {
      case this.keys.UP:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateUp(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(0, this.keyPanSpeed);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.BOTTOM:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateUp(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(0, -this.keyPanSpeed);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateLeft(_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(this.keyPanSpeed, 0);
          }
        }
        needsUpdate = true;
        break;
      case this.keys.RIGHT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this._rotateLeft(-_twoPI * this.keyRotateSpeed / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this._pan(-this.keyPanSpeed, 0);
          }
        }
        needsUpdate = true;
        break;
    }
    if (needsUpdate) {
      event.preventDefault();
      this.update();
    }
  }
  _handleTouchStartRotate(event) {
    if (this._pointers.length === 1) {
      this._rotateStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateStart.set(x, y);
    }
  }
  _handleTouchStartPan(event) {
    if (this._pointers.length === 1) {
      this._panStart.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panStart.set(x, y);
    }
  }
  _handleTouchStartDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyStart.set(0, distance);
  }
  _handleTouchStartDollyPan(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enablePan) this._handleTouchStartPan(event);
  }
  _handleTouchStartDollyRotate(event) {
    if (this.enableZoom) this._handleTouchStartDolly(event);
    if (this.enableRotate) this._handleTouchStartRotate(event);
  }
  _handleTouchMoveRotate(event) {
    if (this._pointers.length == 1) {
      this._rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._rotateEnd.set(x, y);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const element = this.domElement;
    this._rotateLeft(_twoPI * this._rotateDelta.x / element.clientHeight);
    this._rotateUp(_twoPI * this._rotateDelta.y / element.clientHeight);
    this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(event) {
    if (this._pointers.length === 1) {
      this._panEnd.set(event.pageX, event.pageY);
    } else {
      const position = this._getSecondPointerPosition(event);
      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);
      this._panEnd.set(x, y);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed);
    this._pan(this._panDelta.x, this._panDelta.y);
    this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(event) {
    const position = this._getSecondPointerPosition(event);
    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    this._dollyEnd.set(0, distance);
    this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed));
    this._dollyOut(this._dollyDelta.y);
    this._dollyStart.copy(this._dollyEnd);
    const centerX = (event.pageX + position.x) * 0.5;
    const centerY = (event.pageY + position.y) * 0.5;
    this._updateZoomParameters(centerX, centerY);
  }
  _handleTouchMoveDollyPan(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enablePan) this._handleTouchMovePan(event);
  }
  _handleTouchMoveDollyRotate(event) {
    if (this.enableZoom) this._handleTouchMoveDolly(event);
    if (this.enableRotate) this._handleTouchMoveRotate(event);
  }
  // pointers
  _addPointer(event) {
    this._pointers.push(event.pointerId);
  }
  _removePointer(event) {
    delete this._pointerPositions[event.pointerId];
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) {
        this._pointers.splice(i, 1);
        return;
      }
    }
  }
  _isTrackingPointer(event) {
    for (let i = 0; i < this._pointers.length; i++) {
      if (this._pointers[i] == event.pointerId) return true;
    }
    return false;
  }
  _trackPointer(event) {
    let position = this._pointerPositions[event.pointerId];
    if (position === void 0) {
      position = new Vector2();
      this._pointerPositions[event.pointerId] = position;
    }
    position.set(event.pageX, event.pageY);
  }
  _getSecondPointerPosition(event) {
    const pointerId = event.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[pointerId];
  }
  //
  _customWheelEvent(event) {
    const mode = event.deltaMode;
    const newEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY
    };
    switch (mode) {
      case 1:
        newEvent.deltaY *= 16;
        break;
      case 2:
        newEvent.deltaY *= 100;
        break;
    }
    if (event.ctrlKey && !this._controlActive) {
      newEvent.deltaY *= 10;
    }
    return newEvent;
  }
}
function onPointerDown(event) {
  if (this.enabled === false) return;
  if (this._pointers.length === 0) {
    this.domElement.setPointerCapture(event.pointerId);
    this.domElement.ownerDocument.addEventListener("pointermove", this._onPointerMove);
    this.domElement.ownerDocument.addEventListener("pointerup", this._onPointerUp);
  }
  if (this._isTrackingPointer(event)) return;
  this._addPointer(event);
  if (event.pointerType === "touch") {
    this._onTouchStart(event);
  } else {
    this._onMouseDown(event);
  }
}
function onPointerMove(event) {
  if (this.enabled === false) return;
  if (event.pointerType === "touch") {
    this._onTouchMove(event);
  } else {
    this._onMouseMove(event);
  }
}
function onPointerUp(event) {
  this._removePointer(event);
  switch (this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(event.pointerId);
      this.domElement.ownerDocument.removeEventListener("pointermove", this._onPointerMove);
      this.domElement.ownerDocument.removeEventListener("pointerup", this._onPointerUp);
      this.dispatchEvent(_endEvent);
      this.state = _STATE.NONE;
      break;
    case 1:
      const pointerId = this._pointers[0];
      const position = this._pointerPositions[pointerId];
      this._onTouchStart({ pointerId, pageX: position.x, pageY: position.y });
      break;
  }
}
function onMouseDown(event) {
  let mouseAction;
  switch (event.button) {
    case 0:
      mouseAction = this.mouseButtons.LEFT;
      break;
    case 1:
      mouseAction = this.mouseButtons.MIDDLE;
      break;
    case 2:
      mouseAction = this.mouseButtons.RIGHT;
      break;
    default:
      mouseAction = -1;
  }
  switch (mouseAction) {
    case MOUSE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseDownDolly(event);
      this.state = _STATE.DOLLY;
      break;
    case MOUSE.ROTATE:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      } else {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      }
      break;
    case MOUSE.PAN:
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        if (this.enableRotate === false) return;
        this._handleMouseDownRotate(event);
        this.state = _STATE.ROTATE;
      } else {
        if (this.enablePan === false) return;
        this._handleMouseDownPan(event);
        this.state = _STATE.PAN;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onMouseMove(event) {
  switch (this.state) {
    case _STATE.ROTATE:
      if (this.enableRotate === false) return;
      this._handleMouseMoveRotate(event);
      break;
    case _STATE.DOLLY:
      if (this.enableZoom === false) return;
      this._handleMouseMoveDolly(event);
      break;
    case _STATE.PAN:
      if (this.enablePan === false) return;
      this._handleMouseMovePan(event);
      break;
  }
}
function onMouseWheel(event) {
  if (this.enabled === false || this.enableZoom === false || this.state !== _STATE.NONE) return;
  event.preventDefault();
  this.dispatchEvent(_startEvent);
  this._handleMouseWheel(this._customWheelEvent(event));
  this.dispatchEvent(_endEvent);
}
function onKeyDown(event) {
  if (this.enabled === false) return;
  this._handleKeyDown(event);
}
function onTouchStart(event) {
  this._trackPointer(event);
  switch (this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case TOUCH.ROTATE:
          if (this.enableRotate === false) return;
          this._handleTouchStartRotate(event);
          this.state = _STATE.TOUCH_ROTATE;
          break;
        case TOUCH.PAN:
          if (this.enablePan === false) return;
          this._handleTouchStartPan(event);
          this.state = _STATE.TOUCH_PAN;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case TOUCH.DOLLY_PAN:
          if (this.enableZoom === false && this.enablePan === false) return;
          this._handleTouchStartDollyPan(event);
          this.state = _STATE.TOUCH_DOLLY_PAN;
          break;
        case TOUCH.DOLLY_ROTATE:
          if (this.enableZoom === false && this.enableRotate === false) return;
          this._handleTouchStartDollyRotate(event);
          this.state = _STATE.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = _STATE.NONE;
      }
      break;
    default:
      this.state = _STATE.NONE;
  }
  if (this.state !== _STATE.NONE) {
    this.dispatchEvent(_startEvent);
  }
}
function onTouchMove(event) {
  this._trackPointer(event);
  switch (this.state) {
    case _STATE.TOUCH_ROTATE:
      if (this.enableRotate === false) return;
      this._handleTouchMoveRotate(event);
      this.update();
      break;
    case _STATE.TOUCH_PAN:
      if (this.enablePan === false) return;
      this._handleTouchMovePan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_PAN:
      if (this.enableZoom === false && this.enablePan === false) return;
      this._handleTouchMoveDollyPan(event);
      this.update();
      break;
    case _STATE.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === false && this.enableRotate === false) return;
      this._handleTouchMoveDollyRotate(event);
      this.update();
      break;
    default:
      this.state = _STATE.NONE;
  }
}
function onContextMenu(event) {
  if (this.enabled === false) return;
  event.preventDefault();
}
function interceptControlDown(event) {
  if (event.key === "Control") {
    this._controlActive = true;
    const document2 = this.domElement.getRootNode();
    document2.addEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}
function interceptControlUp(event) {
  if (event.key === "Control") {
    this._controlActive = false;
    const document2 = this.domElement.getRootNode();
    document2.removeEventListener("keyup", this._interceptControlUp, { passive: true, capture: true });
  }
}
class VRButton {
  /**
   * Constructs a new VR button.
   *
   * @param {WebGLRenderer|WebGPURenderer} renderer - The renderer.
   * @param {XRSessionInit} [sessionInit] - The a configuration object for the AR session.
   * @return {HTMLElement} The button or an error message if `immersive-ar` isn't supported.
   */
  static createButton(renderer, sessionInit = {}) {
    const button = document.createElement("button");
    function showEnterVR() {
      let currentSession = null;
      async function onSessionStarted(session) {
        session.addEventListener("end", onSessionEnded);
        await renderer.xr.setSession(session);
        button.textContent = "EXIT VR";
        currentSession = session;
      }
      function onSessionEnded() {
        currentSession.removeEventListener("end", onSessionEnded);
        button.textContent = "ENTER VR";
        currentSession = null;
      }
      button.style.display = "";
      button.style.cursor = "pointer";
      button.style.left = "calc(50% - 50px)";
      button.style.width = "100px";
      button.textContent = "ENTER VR";
      const sessionOptions = {
        ...sessionInit,
        optionalFeatures: [
          "local-floor",
          "bounded-floor",
          "layers",
          ...sessionInit.optionalFeatures || []
        ]
      };
      button.onmouseenter = function() {
        button.style.opacity = "1.0";
      };
      button.onmouseleave = function() {
        button.style.opacity = "0.5";
      };
      button.onclick = function() {
        if (currentSession === null) {
          navigator.xr.requestSession("immersive-vr", sessionOptions).then(onSessionStarted);
        } else {
          currentSession.end();
          if (navigator.xr.offerSession !== void 0) {
            navigator.xr.offerSession("immersive-vr", sessionOptions).then(onSessionStarted).catch((err) => {
              console.warn(err);
            });
          }
        }
      };
      if (navigator.xr.offerSession !== void 0) {
        navigator.xr.offerSession("immersive-vr", sessionOptions).then(onSessionStarted).catch((err) => {
          console.warn(err);
        });
      }
    }
    function disableButton() {
      button.style.display = "";
      button.style.cursor = "auto";
      button.style.left = "calc(50% - 75px)";
      button.style.width = "150px";
      button.onmouseenter = null;
      button.onmouseleave = null;
      button.onclick = null;
    }
    function showWebXRNotFound() {
      disableButton();
      button.textContent = "VR NOT SUPPORTED";
    }
    function showVRNotAllowed(exception) {
      disableButton();
      console.warn("Exception when trying to call xr.isSessionSupported", exception);
      button.textContent = "VR NOT ALLOWED";
    }
    function stylizeElement(element) {
      element.style.position = "absolute";
      element.style.bottom = "20px";
      element.style.padding = "12px 6px";
      element.style.border = "1px solid #fff";
      element.style.borderRadius = "4px";
      element.style.background = "rgba(0,0,0,0.1)";
      element.style.color = "#fff";
      element.style.font = "normal 13px sans-serif";
      element.style.textAlign = "center";
      element.style.opacity = "0.5";
      element.style.outline = "none";
      element.style.zIndex = "999";
    }
    if ("xr" in navigator) {
      button.id = "VRButton";
      button.style.display = "none";
      stylizeElement(button);
      navigator.xr.isSessionSupported("immersive-vr").then(function(supported) {
        supported ? showEnterVR() : showWebXRNotFound();
        if (supported && VRButton.xrSessionIsGranted) {
          button.click();
        }
      }).catch(showVRNotAllowed);
      return button;
    } else {
      const message = document.createElement("a");
      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, "https:");
        message.innerHTML = "WEBXR NEEDS HTTPS";
      } else {
        message.href = "https://immersiveweb.dev/";
        message.innerHTML = "WEBXR NOT AVAILABLE";
      }
      message.style.left = "calc(50% - 90px)";
      message.style.width = "180px";
      message.style.textDecoration = "none";
      stylizeElement(message);
      return message;
    }
  }
  /**
   * Registers a `sessiongranted` event listener. When a session is granted, the {@link VRButton#xrSessionIsGranted}
   * flag will evaluate to `true`. This method is automatically called by the module itself so there
   * should be no need to use it on app level.
   */
  static registerSessionGrantedListener() {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      if (/WebXRViewer\//i.test(navigator.userAgent)) return;
      navigator.xr.addEventListener("sessiongranted", () => {
        VRButton.xrSessionIsGranted = true;
      });
    }
  }
}
VRButton.xrSessionIsGranted = false;
VRButton.registerSessionGrantedListener();
class XRButton {
  /**
   * Constructs a new XR button.
   *
   * @param {WebGLRenderer|WebGPURenderer} renderer - The renderer.
   * @param {XRSessionInit} [sessionInit] - The a configuration object for the AR session.
   * @return {HTMLElement} The button or an error message if WebXR isn't supported.
   */
  static createButton(renderer, sessionInit = {}) {
    const button = document.createElement("button");
    function showStartXR(mode) {
      let currentSession = null;
      async function onSessionStarted(session) {
        session.addEventListener("end", onSessionEnded);
        await renderer.xr.setSession(session);
        button.textContent = "STOP XR";
        currentSession = session;
      }
      function onSessionEnded() {
        currentSession.removeEventListener("end", onSessionEnded);
        button.textContent = "START XR";
        currentSession = null;
      }
      button.style.display = "";
      button.style.cursor = "pointer";
      button.style.left = "calc(50% - 50px)";
      button.style.width = "100px";
      button.textContent = "START XR";
      const sessionOptions = {
        ...sessionInit,
        optionalFeatures: [
          "local-floor",
          "bounded-floor",
          "layers",
          ...sessionInit.optionalFeatures || []
        ]
      };
      button.onmouseenter = function() {
        button.style.opacity = "1.0";
      };
      button.onmouseleave = function() {
        button.style.opacity = "0.5";
      };
      button.onclick = function() {
        if (currentSession === null) {
          navigator.xr.requestSession(mode, sessionOptions).then(onSessionStarted);
        } else {
          currentSession.end();
          if (navigator.xr.offerSession !== void 0) {
            navigator.xr.offerSession(mode, sessionOptions).then(onSessionStarted).catch((err) => {
              console.warn(err);
            });
          }
        }
      };
      if (navigator.xr.offerSession !== void 0) {
        navigator.xr.offerSession(mode, sessionOptions).then(onSessionStarted).catch((err) => {
          console.warn(err);
        });
      }
    }
    function disableButton() {
      button.style.display = "";
      button.style.cursor = "auto";
      button.style.left = "calc(50% - 75px)";
      button.style.width = "150px";
      button.onmouseenter = null;
      button.onmouseleave = null;
      button.onclick = null;
    }
    function showXRNotSupported() {
      disableButton();
      button.textContent = "XR NOT SUPPORTED";
    }
    function showXRNotAllowed(exception) {
      disableButton();
      console.warn("Exception when trying to call xr.isSessionSupported", exception);
      button.textContent = "XR NOT ALLOWED";
    }
    function stylizeElement(element) {
      element.style.position = "absolute";
      element.style.bottom = "20px";
      element.style.padding = "12px 6px";
      element.style.border = "1px solid #fff";
      element.style.borderRadius = "4px";
      element.style.background = "rgba(0,0,0,0.1)";
      element.style.color = "#fff";
      element.style.font = "normal 13px sans-serif";
      element.style.textAlign = "center";
      element.style.opacity = "0.5";
      element.style.outline = "none";
      element.style.zIndex = "999";
    }
    if ("xr" in navigator) {
      button.id = "XRButton";
      button.style.display = "none";
      stylizeElement(button);
      navigator.xr.isSessionSupported("immersive-ar").then(function(supported) {
        if (supported) {
          showStartXR("immersive-ar");
        } else {
          navigator.xr.isSessionSupported("immersive-vr").then(function(supported2) {
            if (supported2) {
              showStartXR("immersive-vr");
            } else {
              showXRNotSupported();
            }
          }).catch(showXRNotAllowed);
        }
      }).catch(showXRNotAllowed);
      return button;
    } else {
      const message = document.createElement("a");
      if (window.isSecureContext === false) {
        message.href = document.location.href.replace(/^http:/, "https:");
        message.innerHTML = "WEBXR NEEDS HTTPS";
      } else {
        message.href = "https://immersiveweb.dev/";
        message.innerHTML = "WEBXR NOT AVAILABLE";
      }
      message.style.left = "calc(50% - 90px)";
      message.style.width = "180px";
      message.style.textDecoration = "none";
      stylizeElement(message);
      return message;
    }
  }
}
class Input {
  /**
   * Constructor
   * 
   * Initialize the input manager
   * 
   * Listens to keydown, keyup and pointermove events
   * 
   * @private
   * @example
   * const input = new Input();
   * input.actions = [
   *     { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
   *     { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
   *     { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
   *     { name: 'right', keys: ['ArrowRight', 'KeyD'] },
   *     { name: 'run', keys: ['ShiftLeft', 'ShiftRight']}
   * ]
   */
  constructor() {
    this._actions = [];
    this.actionState = {};
    this.pointer = {
      x: 0,
      y: 0
    };
    window.addEventListener("keydown", (event) => {
      this._down(event.code);
    });
    window.addEventListener("keyup", (event) => {
      this._up(event.code);
    });
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = event.clientX / window.innerWidth * 2 - 1;
      this.pointer.y = -event.clientY / window.innerHeight * 2 + 1;
    });
  }
  /**
   * Sets the actions for this input manager
   * 
   * @param {Object[]} newActions - The new actions to set
   * 
   * Each action is an object with the following properties:
   * - name: The name of the action
   * - keys: An array of keys that will trigger the action
   */
  set actions(newActions) {
    this._actions = newActions;
    this._actions.forEach((action) => {
      this.actionState[action.name] = {
        pressed: false,
        justPressed: false,
        _lastPressed: false
      };
    });
  }
  isPressed(actionName) {
    return this.actionState[actionName].pressed;
  }
  isJustPressed(actionName) {
    if (this.actionState[actionName].justPressed) {
      this.actionState[actionName].justPressed = false;
      return true;
    }
    return false;
  }
  _down(key) {
    const action = this._actions.find((action2) => action2.keys.includes(key));
    if (action !== void 0) {
      this.actionState[action.name].pressed = true;
      if (!this.actionState[action.name]._lastPressed) {
        this.actionState[action.name].justPressed = true;
        this.actionState[action.name]._lastPressed = true;
      }
    }
  }
  _up(key) {
    const action = this._actions.find((action2) => action2.keys.includes(key));
    if (action !== void 0) {
      this.actionState[action.name].pressed = false;
      this.actionState[action.name].justPressed = false;
      this.actionState[action.name]._lastPressed = false;
    }
  }
}
class Outliner extends Pane {
  constructor(scene, camera, camControl, renderer) {
    super({
      title: "Outliner",
      expanded: false
    });
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this._cameraProps = this.addFolder({
      title: "📸 Camera",
      expanded: false
    });
    {
      const positionFolder = this._cameraProps.addFolder({
        title: "Position"
      });
      positionFolder.addBinding(this.camera.position, "x", {
        readonly: true,
        label: "X"
      });
      positionFolder.addBinding(this.camera.position, "y", {
        readonly: true,
        label: "Y"
      });
      positionFolder.addBinding(this.camera.position, "z", {
        readonly: true,
        label: "Z"
      });
    }
    {
      const targetFolder = this._cameraProps.addFolder({
        title: "Target"
      });
      targetFolder.addBinding(camControl.target, "x", {
        readonly: true,
        label: "X"
      });
      targetFolder.addBinding(camControl.target, "y", {
        readonly: true,
        label: "Y"
      });
      targetFolder.addBinding(camControl.target, "z", {
        readonly: true,
        label: "Z"
      });
    }
    {
      this._gpuFolder = this.addFolder({
        title: `📈 GPU (Three.js r${REVISION})`,
        expanded: false
      });
    }
  }
  addGPUBinding() {
    const backend = this.renderer.isWebGLRenderer ? "WebGL" : this.renderer.isWebGPURenderer ? this.renderer.backend.isWebGPUBackend ? "WebGPU" : "WebGL2" : "Unknown";
    this._gpuFolder.addBlade({
      view: "text",
      label: "Backend",
      parse: (value) => value,
      value: backend,
      disabled: true
    });
    if (this.renderer.isWebGLRenderer) {
      const renderFolder = this._gpuFolder.addFolder({ title: "🖼️ Render" });
      renderFolder.addBinding(this.renderer.info.render, "frame", { label: "Frame ID", readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "calls", { label: "DrawCalls", readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "triangles", { readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "points", { readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "lines", { readonly: true });
      const memoryFolder = this._gpuFolder.addFolder({ title: "🖥️ Memory" });
      memoryFolder.addBinding(this.renderer.info.memory, "geometries", { readonly: true });
      memoryFolder.addBinding(this.renderer.info.memory, "textures", { readonly: true });
      const programsFolder = this._gpuFolder.addFolder({ title: "⚡ Shaders" });
      programsFolder.addBinding(this.renderer.info.programs, "length", { readonly: true, label: "Count" });
    } else if (this.renderer.isWebGPURenderer) {
      const renderFolder = this._gpuFolder.addFolder({ title: "🖼️ Render" });
      renderFolder.addBinding(this.renderer.info, "frame", { label: "Frame ID", readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "drawCalls", { label: "DrawCalls", readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "frameCalls", { label: "FrameCalls", readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "triangles", { readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "points", { readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "lines", { readonly: true });
      renderFolder.addBinding(this.renderer.info.render, "timestamp", { readonly: true });
      const memoryFolder = this._gpuFolder.addFolder({ title: "🖥️ Memory" });
      memoryFolder.addBinding(this.renderer.info.memory, "geometries", { label: "Geometries", readonly: true });
      memoryFolder.addBinding(this.renderer.info.memory, "textures", { label: "Textures", readonly: true });
    }
  }
}
class EntityManager {
  constructor(scene, physics) {
    this.scene = scene;
    this._phyObjects = [];
  }
  static #instance = null;
  static init(scene, physics) {
    if (this.#instance === null) {
      this.#instance = new EntityManager(scene, physics);
    }
  }
  static getInstance() {
    if (this.#instance === null) {
      return null;
    }
    return this.#instance;
  }
  add(entity) {
    entity.children.forEach((c) => {
      if (c.isObject3D) {
        this.scene.add(c);
      } else if (c.rigidBody !== void 0) {
        this._phyObjects.push(c);
      }
    });
  }
  remove(entity) {
  }
  update() {
    this._phyObjects.forEach((obj) => {
      if (obj.rigidBody !== void 0) {
        if (obj.rigidBody.isDynamic()) {
          obj.mesh.position.copy(obj.rigidBody.translation());
          obj.mesh.quaternion.copy(obj.rigidBody.rotation());
        }
      }
    });
  }
}
class Entity {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  init() {
  }
  add(child) {
    this.children.push(child);
  }
  remove(child) {
    this.children = this.children.filter((c) => c !== child);
  }
}
const version = "0.0.4";
class App {
  /**
   * Construct a new application
   * 
   * @param {AppOptions} [parameters] - The configuration parameter
   */
  constructor(renderEngine, parameters = {}) {
    this.MODULE = renderEngine;
    this.webgl = this.MODULE.WebGLRenderer !== void 0;
    const {
      name = "Untitled",
      interactive = false,
      vr = false,
      ar = false,
      monitor = false,
      antialias = false,
      renderOptions = {}
    } = parameters;
    this.name = document.title === "" ? name : document.title;
    this.name = `${this.name} ${interactive ? "(Interactive)" : ""}`;
    document.title = this.name;
    this.renderer = null;
    if (this.webgl) {
      this.renderer = new this.MODULE.WebGLRenderer(renderOptions);
    } else {
      this.renderer = new this.MODULE.WebGPURenderer(renderOptions);
    }
    console.log(`VirtualDev v${version} - ${this.webgl ? "WebGL" : "WebGPU"} renderer`);
    if (this.renderer) {
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.domElement.style.width = "100%";
      this.renderer.domElement.style.height = "100%";
      document.body.appendChild(this.renderer.domElement);
      const canvas = this.renderer.domElement;
      if (canvas.parentNode.localName === "body") {
        canvas.parentNode.style.margin = 0;
        canvas.parentNode.style.height = "100vh";
      }
    }
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
    this.camera.position.z = 5;
    this.inputs = new Input();
    this.interactive = interactive;
    this.interactiveProps = {};
    if (this.interactive) {
      this.interactiveProps.orbitalControls = new OrbitControls(this.camera, this.renderer.domElement);
      this.interactiveProps.orbitalControls.enableDamping = true;
      this.outliner = new Outliner(
        this.scene,
        this.camera,
        this.interactiveProps.orbitalControls,
        this.renderer
      );
    }
    if (vr) {
      document.body.appendChild(VRButton.createButton(this.renderer));
      this.renderer.xr.enabled = true;
    }
    if (ar) {
      document.body.appendChild(XRButton.createButton(this.renderer));
      this.renderer.xr.enabled = true;
    }
    this.stats = null;
    if (monitor) {
      import("./main-DrV-jhtb.mjs").then((Stats) => {
        this.stats = new Stats.default({
          trackGPU: true
        });
        document.body.appendChild(this.stats.dom);
        this.stats.init(this.renderer);
      });
    }
    EntityManager.init(this.scene);
    this.sceneTree = EntityManager.getInstance();
    this._clock = new THREE.Clock();
    this._lastTime = this._clock.getElapsedTime();
    this._firstRender = true;
    const renderLoop = () => {
      const time = this._clock.getElapsedTime();
      const deltaTime = time - this._lastTime;
      this._lastTime = time;
      if (this._firstRender) {
        if (this.outliner) this.outliner.addGPUBinding();
        this._firstRender = false;
      }
      this.onRender(time, deltaTime);
      if (interactive) {
        this.interactiveProps.orbitalControls.update();
      }
      if (this.stats) {
        this.stats.update();
        if (!this.webgl) {
          this.renderer.resolveTimestampsAsync(THREE.TimestampQuery.RENDER);
        }
      }
      this.onBeforeRender(time, deltaTime);
      this.renderer.render(this.scene, this.camera);
      this.onAfterRender(time, deltaTime);
    };
    this.renderer.setAnimationLoop(renderLoop);
    this.onRender = (time, deltaTime) => {
    };
    this.onBeforeRender = (time, deltaTime) => {
    };
    this.onAfterRender = (time, deltaTime) => {
    };
    window.addEventListener("resize", () => {
      this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
    });
  }
  static #instance = null;
  /**
   * Initialize the application
   * 
   * @param {THREE} renderEngine - The rendering engine (WebGL/WebGPU)
   * @param {AppOptions} [parameters] - The configuration parameter
   */
  static init(renderEngine, parameters) {
    if (this.#instance === null) {
      this.#instance = new App(renderEngine, parameters);
    }
    return this.#instance;
  }
  static getInstance() {
    if (this.#instance === null) {
      return null;
    }
    return this.#instance;
  }
}
export {
  App,
  Entity
};
//# sourceMappingURL=virtualdev.es.js.map
