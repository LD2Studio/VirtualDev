(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("three"), require("tweakpane")) : typeof define === "function" && define.amd ? define(["exports", "three", "tweakpane"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.vdev = {}, global.THREE, global.tweakpane));
})(this, (function(exports2, THREE, tweakpane) {
  "use strict";
  function _interopNamespaceDefault(e) {
    const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
    if (e) {
      for (const k in e) {
        if (k !== "default") {
          const d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: () => e[k]
          });
        }
      }
    }
    n.default = e;
    return Object.freeze(n);
  }
  const THREE__namespace = /* @__PURE__ */ _interopNamespaceDefault(THREE);
  const _changeEvent = { type: "change" };
  const _startEvent = { type: "start" };
  const _endEvent = { type: "end" };
  const _ray = new THREE.Ray();
  const _plane = new THREE.Plane();
  const _TILT_LIMIT = Math.cos(70 * THREE.MathUtils.DEG2RAD);
  const _v = new THREE.Vector3();
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
  class OrbitControls extends THREE.Controls {
    /**
     * Constructs a new controls instance.
     *
     * @param {Object3D} object - The object that is managed by the controls.
     * @param {?HTMLElement} domElement - The HTML element used for event listeners.
     */
    constructor(object, domElement = null) {
      super(object, domElement);
      this.state = _STATE.NONE;
      this.target = new THREE.Vector3();
      this.cursor = new THREE.Vector3();
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
      this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
      this.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
      this.target0 = this.target.clone();
      this.position0 = this.object.position.clone();
      this.zoom0 = this.object.zoom;
      this._domElementKeyEvents = null;
      this._lastPosition = new THREE.Vector3();
      this._lastQuaternion = new THREE.Quaternion();
      this._lastTargetPosition = new THREE.Vector3();
      this._quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
      this._quatInverse = this._quat.clone().invert();
      this._spherical = new THREE.Spherical();
      this._sphericalDelta = new THREE.Spherical();
      this._scale = 1;
      this._panOffset = new THREE.Vector3();
      this._rotateStart = new THREE.Vector2();
      this._rotateEnd = new THREE.Vector2();
      this._rotateDelta = new THREE.Vector2();
      this._panStart = new THREE.Vector2();
      this._panEnd = new THREE.Vector2();
      this._panDelta = new THREE.Vector2();
      this._dollyStart = new THREE.Vector2();
      this._dollyEnd = new THREE.Vector2();
      this._dollyDelta = new THREE.Vector2();
      this._dollyDirection = new THREE.Vector3();
      this._mouse = new THREE.Vector2();
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
          const mouseBefore = new THREE.Vector3(this._mouse.x, this._mouse.y, 0);
          mouseBefore.unproject(this.object);
          const prevZoom = this.object.zoom;
          this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale));
          this.object.updateProjectionMatrix();
          zoomChanged = prevZoom !== this.object.zoom;
          const mouseAfter = new THREE.Vector3(this._mouse.x, this._mouse.y, 0);
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
        position = new THREE.Vector2();
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
      case THREE.MOUSE.DOLLY:
        if (this.enableZoom === false) return;
        this._handleMouseDownDolly(event);
        this.state = _STATE.DOLLY;
        break;
      case THREE.MOUSE.ROTATE:
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
      case THREE.MOUSE.PAN:
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
          case THREE.TOUCH.ROTATE:
            if (this.enableRotate === false) return;
            this._handleTouchStartRotate(event);
            this.state = _STATE.TOUCH_ROTATE;
            break;
          case THREE.TOUCH.PAN:
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
          case THREE.TOUCH.DOLLY_PAN:
            if (this.enableZoom === false && this.enablePan === false) return;
            this._handleTouchStartDollyPan(event);
            this.state = _STATE.TOUCH_DOLLY_PAN;
            break;
          case THREE.TOUCH.DOLLY_ROTATE:
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
  class Outliner extends tweakpane.Pane {
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
          title: `📈 GPU (Three.js r${THREE.REVISION})`,
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
  const version = "0.1.0-0";
  let instance = null;
  let RENDER_ENGINE = null;
  class App {
    /**
     * Construct a new application
     * 
     * @param {THREE.WebGLRenderer|THREE.WebGPURenderer} renderEngine - The rendering engine (WebGL/WebGPU)
     * @param {Object} physicsEngine - The physics engine (Rapier)
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor(renderEngine, physicsEngine = null, parameters = {}) {
      if (instance) {
        return instance;
      }
      instance = this;
      RENDER_ENGINE = renderEngine;
      const {
        name = "Untitled",
        interactive = false,
        vr = false,
        ar = false,
        monitor = false,
        renderOptions = {}
      } = parameters;
      this.name = document.title === "" ? name : document.title;
      this.name = `${this.name} ${interactive ? "(Interactive)" : ""}`;
      document.title = this.name;
      this.renderer = null;
      if (RENDER_ENGINE.WebGLRenderer !== void 0) {
        this.renderer = new RENDER_ENGINE.WebGLRenderer(renderOptions);
      } else {
        this.renderer = new RENDER_ENGINE.WebGPURenderer(renderOptions);
      }
      console.log(`VirtualDev v${version} - ${RENDER_ENGINE.WebGLRenderer !== void 0 ? "WebGL" : "WebGPU"} renderer`);
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
      this.scene = new THREE__namespace.Scene();
      this.camera = new THREE__namespace.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
      this.camera.position.z = 5;
      this.inputs = new Input();
      if (interactive) {
        this.orbitalControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitalControls.enableDamping = true;
        this.outliner = new Outliner(
          this.scene,
          this.camera,
          this.orbitalControls,
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
        Promise.resolve().then(() => main).then((Stats2) => {
          this.stats = new Stats2.default({
            trackGPU: true
          });
          document.body.appendChild(this.stats.dom);
          this.stats.init(this.renderer);
        });
      }
      EntityManager.init(this.scene);
      this.sceneTree = EntityManager.getInstance();
      this._clock = new THREE__namespace.Clock();
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
          this.orbitalControls.update();
        }
        if (this.stats) {
          this.stats.update();
          if (!this.webgl) {
            this.renderer.resolveTimestampsAsync(THREE__namespace.TimestampQuery.RENDER);
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
  }
  class StatsCore {
    constructor({
      trackGPU = false,
      trackCPT = false,
      trackHz = false,
      trackFPS = true,
      logsPerSecond = 4,
      graphsPerSecond = 30,
      samplesLog = 40,
      samplesGraph = 10,
      precision = 2
    } = {}) {
      this.gl = null;
      this.ext = null;
      this.gpuDevice = null;
      this.gpuBackend = null;
      this.renderer = null;
      this.activeQuery = null;
      this.gpuQueries = [];
      this.threeRendererPatched = false;
      this.webgpuNative = false;
      this.gpuQuerySet = null;
      this.gpuResolveBuffer = null;
      this.gpuReadBuffers = [];
      this.gpuWriteBufferIndex = 0;
      this.gpuFrameCount = 0;
      this.pendingResolve = null;
      this.frameTimes = [];
      this.renderCount = 0;
      this.totalCpuDuration = 0;
      this.totalGpuDuration = 0;
      this.totalGpuDurationCompute = 0;
      this.averageFps = { logs: [], graph: [] };
      this.averageCpu = { logs: [], graph: [] };
      this.averageGpu = { logs: [], graph: [] };
      this.averageGpuCompute = { logs: [], graph: [] };
      this.trackGPU = trackGPU;
      this.trackCPT = trackCPT;
      this.trackHz = trackHz;
      this.trackFPS = trackFPS;
      this.samplesLog = samplesLog;
      this.samplesGraph = samplesGraph;
      this.precision = precision;
      this.logsPerSecond = logsPerSecond;
      this.graphsPerSecond = graphsPerSecond;
      const now = performance.now();
      this.prevGraphTime = now;
      this.beginTime = now;
      this.prevTextTime = now;
      this.prevCpuTime = now;
    }
    async init(canvasOrGL) {
      if (!canvasOrGL) {
        console.error('Stats: The "canvas" parameter is undefined.');
        return;
      }
      if (this.handleThreeRenderer(canvasOrGL))
        return;
      if (await this.handleWebGPURenderer(canvasOrGL))
        return;
      if (this.handleNativeWebGPU(canvasOrGL))
        return;
      if (this.initializeWebGL(canvasOrGL)) {
        if (this.trackGPU) {
          this.initializeGPUTracking();
        }
        return;
      } else {
        console.error("Stats-gl: Failed to initialize WebGL context");
      }
    }
    handleNativeWebGPU(device) {
      var _a;
      if (device && typeof device.createCommandEncoder === "function" && typeof device.createQuerySet === "function" && device.queue) {
        this.gpuDevice = device;
        this.webgpuNative = true;
        if (this.trackGPU && ((_a = device.features) == null ? void 0 : _a.has("timestamp-query"))) {
          this.initializeWebGPUTiming();
          this.onWebGPUTimestampSupported();
        }
        return true;
      }
      return false;
    }
    initializeWebGPUTiming() {
      if (!this.gpuDevice)
        return;
      this.gpuQuerySet = this.gpuDevice.createQuerySet({
        type: "timestamp",
        count: 2
      });
      this.gpuResolveBuffer = this.gpuDevice.createBuffer({
        size: 16,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC
      });
      for (let i = 0; i < 2; i++) {
        this.gpuReadBuffers.push(this.gpuDevice.createBuffer({
          size: 16,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        }));
      }
    }
    handleThreeRenderer(renderer) {
      if (renderer.isWebGLRenderer && !this.threeRendererPatched) {
        this.patchThreeRenderer(renderer);
        this.gl = renderer.getContext();
        if (this.trackGPU) {
          this.initializeGPUTracking();
        }
        return true;
      }
      return false;
    }
    async handleWebGPURenderer(renderer) {
      var _a;
      if (renderer.isWebGPURenderer) {
        this.renderer = renderer;
        if (this.trackGPU || this.trackCPT) {
          renderer.backend.trackTimestamp = true;
          if (!renderer._initialized) {
            await renderer.init();
          }
          if (renderer.hasFeature("timestamp-query")) {
            this.onWebGPUTimestampSupported();
          }
        }
        this.info = renderer.info;
        this.gpuBackend = renderer.backend;
        this.gpuDevice = ((_a = renderer.backend) == null ? void 0 : _a.device) || null;
        this.patchThreeWebGPU(renderer);
        return true;
      }
      return false;
    }
    onWebGPUTimestampSupported() {
    }
    initializeWebGL(canvasOrGL) {
      if (canvasOrGL instanceof WebGL2RenderingContext) {
        this.gl = canvasOrGL;
      } else if (canvasOrGL instanceof HTMLCanvasElement || canvasOrGL instanceof OffscreenCanvas) {
        this.gl = canvasOrGL.getContext("webgl2");
        if (!this.gl) {
          console.error("Stats: Unable to obtain WebGL2 context.");
          return false;
        }
      } else {
        console.error(
          "Stats: Invalid input type. Expected WebGL2RenderingContext, HTMLCanvasElement, or OffscreenCanvas."
        );
        return false;
      }
      return true;
    }
    initializeGPUTracking() {
      if (this.gl) {
        this.ext = this.gl.getExtension("EXT_disjoint_timer_query_webgl2");
        if (this.ext) {
          this.onGPUTrackingInitialized();
        }
      }
    }
    onGPUTrackingInitialized() {
    }
    /**
     * Get timestampWrites configuration for WebGPU render pass.
     * Use this when creating your render pass descriptor.
     * @returns timestampWrites object or undefined if not tracking GPU
     */
    getTimestampWrites() {
      if (!this.webgpuNative || !this.gpuQuerySet)
        return void 0;
      return {
        querySet: this.gpuQuerySet,
        beginningOfPassWriteIndex: 0,
        endOfPassWriteIndex: 1
      };
    }
    begin(encoder) {
      this.beginProfiling("cpu-started");
      if (this.webgpuNative) {
        return;
      }
      if (!this.gl || !this.ext)
        return;
      if (this.activeQuery) {
        this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
      }
      this.activeQuery = this.gl.createQuery();
      if (this.activeQuery) {
        this.gl.beginQuery(this.ext.TIME_ELAPSED_EXT, this.activeQuery);
      }
    }
    end(encoder) {
      this.renderCount++;
      if (this.webgpuNative && encoder && this.gpuQuerySet && this.gpuResolveBuffer && this.gpuReadBuffers.length > 0) {
        this.gpuFrameCount++;
        const writeBuffer = this.gpuReadBuffers[this.gpuWriteBufferIndex];
        if (writeBuffer.mapState === "unmapped") {
          encoder.resolveQuerySet(this.gpuQuerySet, 0, 2, this.gpuResolveBuffer, 0);
          encoder.copyBufferToBuffer(this.gpuResolveBuffer, 0, writeBuffer, 0, 16);
        }
        this.endProfiling("cpu-started", "cpu-finished", "cpu-duration");
        return;
      }
      if (this.gl && this.ext && this.activeQuery) {
        this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
        this.gpuQueries.push({ query: this.activeQuery });
        this.activeQuery = null;
      }
      this.endProfiling("cpu-started", "cpu-finished", "cpu-duration");
    }
    /**
     * Resolve WebGPU timestamp queries. Call this after queue.submit().
     * Returns a promise that resolves to the GPU duration in milliseconds.
     */
    async resolveTimestampsAsync() {
      if (!this.webgpuNative || this.gpuReadBuffers.length === 0) {
        return this.totalGpuDuration;
      }
      if (this.pendingResolve) {
        return this.pendingResolve;
      }
      const readBufferIndex = (this.gpuWriteBufferIndex + 1) % 2;
      const readBuffer = this.gpuReadBuffers[readBufferIndex];
      this.gpuWriteBufferIndex = (this.gpuWriteBufferIndex + 1) % 2;
      if (this.gpuFrameCount < 2) {
        return this.totalGpuDuration;
      }
      if (readBuffer.mapState !== "unmapped") {
        return this.totalGpuDuration;
      }
      this.pendingResolve = this._resolveTimestamps(readBuffer);
      try {
        const result = await this.pendingResolve;
        return result;
      } finally {
        this.pendingResolve = null;
      }
    }
    async _resolveTimestamps(readBuffer) {
      try {
        await readBuffer.mapAsync(GPUMapMode.READ);
        const data = new BigInt64Array(readBuffer.getMappedRange());
        const startTime = data[0];
        const endTime = data[1];
        readBuffer.unmap();
        const durationNs = Number(endTime - startTime);
        this.totalGpuDuration = durationNs / 1e6;
        return this.totalGpuDuration;
      } catch (_) {
        return this.totalGpuDuration;
      }
    }
    processGpuQueries() {
      if (!this.gl || !this.ext)
        return;
      this.totalGpuDuration = 0;
      for (let i = this.gpuQueries.length - 1; i >= 0; i--) {
        const queryInfo = this.gpuQueries[i];
        const available = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT_AVAILABLE);
        const disjoint = this.gl.getParameter(this.ext.GPU_DISJOINT_EXT);
        if (available && !disjoint) {
          const elapsed = this.gl.getQueryParameter(queryInfo.query, this.gl.QUERY_RESULT);
          const duration = elapsed * 1e-6;
          this.totalGpuDuration += duration;
          this.gl.deleteQuery(queryInfo.query);
          this.gpuQueries.splice(i, 1);
        }
      }
    }
    processWebGPUTimestamps() {
      this.totalGpuDuration = this.info.render.timestamp;
      this.totalGpuDurationCompute = this.info.compute.timestamp;
    }
    beginProfiling(marker) {
      if (typeof performance !== "undefined") {
        try {
          performance.clearMarks(marker);
          performance.mark(marker);
        } catch (error) {
          console.debug("Stats: Performance marking failed:", error);
        }
      }
    }
    endProfiling(startMarker, endMarker, measureName) {
      if (typeof performance === "undefined" || !endMarker || !startMarker)
        return;
      try {
        const entries = performance.getEntriesByName(startMarker, "mark");
        if (entries.length === 0) {
          this.beginProfiling(startMarker);
        }
        performance.clearMarks(endMarker);
        performance.mark(endMarker);
        performance.clearMeasures(measureName);
        const cpuMeasure = performance.measure(measureName, startMarker, endMarker);
        this.totalCpuDuration += cpuMeasure.duration;
        performance.clearMarks(startMarker);
        performance.clearMarks(endMarker);
        performance.clearMeasures(measureName);
      } catch (error) {
        console.debug("Stats: Performance measurement failed:", error);
      }
    }
    calculateFps() {
      const currentTime = performance.now();
      this.frameTimes.push(currentTime);
      while (this.frameTimes.length > 0 && this.frameTimes[0] <= currentTime - 1e3) {
        this.frameTimes.shift();
      }
      return Math.round(this.frameTimes.length);
    }
    updateAverages() {
      this.addToAverage(this.totalCpuDuration, this.averageCpu);
      this.addToAverage(this.totalGpuDuration, this.averageGpu);
      if (this.info && this.totalGpuDurationCompute !== void 0) {
        this.addToAverage(this.totalGpuDurationCompute, this.averageGpuCompute);
      }
    }
    addToAverage(value, averageArray) {
      averageArray.logs.push(value);
      while (averageArray.logs.length > this.samplesLog) {
        averageArray.logs.shift();
      }
      averageArray.graph.push(value);
      while (averageArray.graph.length > this.samplesGraph) {
        averageArray.graph.shift();
      }
    }
    resetCounters() {
      this.renderCount = 0;
      this.totalCpuDuration = 0;
      this.beginTime = performance.now();
    }
    getData() {
      const fpsLogs = this.averageFps.logs;
      const cpuLogs = this.averageCpu.logs;
      const gpuLogs = this.averageGpu.logs;
      const gpuComputeLogs = this.averageGpuCompute.logs;
      return {
        fps: fpsLogs.length > 0 ? fpsLogs[fpsLogs.length - 1] : 0,
        cpu: cpuLogs.length > 0 ? cpuLogs[cpuLogs.length - 1] : 0,
        gpu: gpuLogs.length > 0 ? gpuLogs[gpuLogs.length - 1] : 0,
        gpuCompute: gpuComputeLogs.length > 0 ? gpuComputeLogs[gpuComputeLogs.length - 1] : 0
      };
    }
    patchThreeWebGPU(renderer) {
      const originalAnimationLoop = renderer.info.reset;
      const statsInstance = this;
      renderer.info.reset = function() {
        statsInstance.beginProfiling("cpu-started");
        originalAnimationLoop.call(this);
      };
    }
    patchThreeRenderer(renderer) {
      const originalRenderMethod = renderer.render;
      const statsInstance = this;
      renderer.render = function(scene, camera) {
        statsInstance.begin();
        originalRenderMethod.call(this, scene, camera);
        statsInstance.end();
      };
      this.threeRendererPatched = true;
    }
    /**
     * Dispose of all resources. Call when done using the stats instance.
     */
    dispose() {
      if (this.gl) {
        if (this.activeQuery && this.ext) {
          try {
            this.gl.endQuery(this.ext.TIME_ELAPSED_EXT);
          } catch (_) {
          }
          this.gl.deleteQuery(this.activeQuery);
          this.activeQuery = null;
        }
        for (const queryInfo of this.gpuQueries) {
          this.gl.deleteQuery(queryInfo.query);
        }
        this.gpuQueries.length = 0;
      }
      if (this.gpuQuerySet) {
        this.gpuQuerySet.destroy();
        this.gpuQuerySet = null;
      }
      if (this.gpuResolveBuffer) {
        this.gpuResolveBuffer.destroy();
        this.gpuResolveBuffer = null;
      }
      for (const buffer of this.gpuReadBuffers) {
        if (buffer.mapState === "mapped") {
          buffer.unmap();
        }
        buffer.destroy();
      }
      this.gpuReadBuffers.length = 0;
      this.gpuFrameCount = 0;
      this.pendingResolve = null;
      this.webgpuNative = false;
      this.gl = null;
      this.ext = null;
      this.info = void 0;
      this.gpuDevice = null;
      this.gpuBackend = null;
      this.renderer = null;
      this.frameTimes.length = 0;
      this.averageFps.logs.length = 0;
      this.averageFps.graph.length = 0;
      this.averageCpu.logs.length = 0;
      this.averageCpu.graph.length = 0;
      this.averageGpu.logs.length = 0;
      this.averageGpu.graph.length = 0;
      this.averageGpuCompute.logs.length = 0;
      this.averageGpuCompute.graph.length = 0;
    }
  }
  class Panel {
    constructor(name, fg, bg) {
      this.id = 0;
      this.name = name;
      this.fg = fg;
      this.bg = bg;
      this.gradient = null;
      this.PR = Math.round(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
      this.WIDTH = 90 * this.PR;
      this.HEIGHT = 48 * this.PR;
      this.TEXT_X = 3 * this.PR;
      this.TEXT_Y = 2 * this.PR;
      this.GRAPH_X = 3 * this.PR;
      this.GRAPH_Y = 15 * this.PR;
      this.GRAPH_WIDTH = 84 * this.PR;
      this.GRAPH_HEIGHT = 30 * this.PR;
      this.canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(this.WIDTH, this.HEIGHT);
      this.canvas.width = this.WIDTH;
      this.canvas.height = this.HEIGHT;
      this.canvas.style.width = "90px";
      this.canvas.style.height = "48px";
      this.canvas.style.position = "absolute";
      this.canvas.style.cssText = "width:90px;height:48px;background-color: transparent !important;";
      this.context = this.canvas.getContext("2d");
      this.initializeCanvas();
    }
    createGradient() {
      if (!this.context)
        throw new Error("No context");
      const gradient = this.context.createLinearGradient(
        0,
        this.GRAPH_Y,
        0,
        this.GRAPH_Y + this.GRAPH_HEIGHT
      );
      let startColor;
      const endColor = this.fg;
      switch (this.fg.toLowerCase()) {
        case "#0ff":
          startColor = "#006666";
          break;
        case "#0f0":
          startColor = "#006600";
          break;
        case "#ff0":
          startColor = "#666600";
          break;
        case "#e1e1e1":
          startColor = "#666666";
          break;
        default:
          startColor = this.bg;
          break;
      }
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);
      return gradient;
    }
    initializeCanvas() {
      if (!this.context)
        return;
      this.context.imageSmoothingEnabled = false;
      this.context.font = "bold " + 9 * this.PR + "px Helvetica,Arial,sans-serif";
      this.context.textBaseline = "top";
      this.gradient = this.createGradient();
      this.context.fillStyle = this.bg;
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.fillStyle = this.fg;
      this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y);
      this.context.fillStyle = this.bg;
      this.context.globalAlpha = 0.9;
      this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
    }
    // Update only text portion
    update(value, maxValue, decimals = 0, suffix = "") {
      if (!this.context || !this.gradient)
        return;
      const min = Math.min(Infinity, value);
      const max = Math.max(maxValue, value);
      this.context.globalAlpha = 1;
      this.context.fillStyle = this.bg;
      this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
      const valueAndName = `${value.toFixed(decimals)} ${this.name}`;
      this.context.fillStyle = this.fg;
      this.context.fillText(valueAndName, this.TEXT_X, this.TEXT_Y);
      let textX = this.TEXT_X + this.context.measureText(valueAndName).width;
      if (suffix) {
        this.context.fillStyle = "#f90";
        this.context.fillText(suffix, textX, this.TEXT_Y);
        textX += this.context.measureText(suffix).width;
      }
      this.context.fillStyle = this.fg;
      this.context.fillText(
        ` (${min.toFixed(decimals)}-${parseFloat(max.toFixed(decimals))})`,
        textX,
        this.TEXT_Y
      );
    }
    // Update only graph portion
    updateGraph(valueGraph, maxGraph) {
      if (!this.context || !this.gradient)
        return;
      if (valueGraph === 0 && maxGraph === 0) {
        maxGraph = 1;
      }
      maxGraph = Math.max(maxGraph, valueGraph, 0.1);
      valueGraph = Math.max(valueGraph, 0);
      const graphX = Math.round(this.GRAPH_X);
      const graphY = Math.round(this.GRAPH_Y);
      const graphWidth = Math.round(this.GRAPH_WIDTH);
      const graphHeight = Math.round(this.GRAPH_HEIGHT);
      const pr = Math.round(this.PR);
      this.context.drawImage(
        this.canvas,
        graphX + pr,
        graphY,
        graphWidth - pr,
        graphHeight,
        graphX,
        graphY,
        graphWidth - pr,
        graphHeight
      );
      this.context.fillStyle = this.bg;
      this.context.fillRect(
        graphX + graphWidth - pr,
        graphY,
        pr,
        graphHeight
      );
      const columnHeight = Math.min(
        graphHeight,
        Math.round(valueGraph / maxGraph * graphHeight)
      );
      if (columnHeight > 0) {
        this.context.globalAlpha = 0.9;
        this.context.fillStyle = this.gradient;
        this.context.fillRect(
          graphX + graphWidth - pr,
          graphY + (graphHeight - columnHeight),
          pr,
          columnHeight
        );
      }
      this.context.globalAlpha = 1;
    }
  }
  class PanelVSync extends Panel {
    constructor(name, fg, bg) {
      super(name, fg, bg);
      this.vsyncValue = 0;
      this.SMALL_HEIGHT = 9 * this.PR;
      this.HEIGHT = this.SMALL_HEIGHT;
      this.WIDTH = 35 * this.PR;
      this.TEXT_Y = 0 * this.PR;
      this.canvas.height = this.HEIGHT;
      this.canvas.width = this.WIDTH;
      this.canvas.style.height = "9px";
      this.canvas.style.width = "35px";
      this.canvas.style.cssText = `
            width: 35px;
            height: 9px;
            position: absolute;
            top: 0;
            left: 0;
            background-color: transparent !important;
            pointer-events: none;
        `;
      this.initializeCanvas();
    }
    initializeCanvas() {
      if (!this.context)
        return;
      this.context.imageSmoothingEnabled = false;
      this.context.font = "bold " + 9 * this.PR + "px Helvetica,Arial,sans-serif";
      this.context.textBaseline = "top";
      this.context.globalAlpha = 1;
    }
    // Override update for VSync-specific display
    update(value, _maxValue, _decimals = 0) {
      if (!this.context)
        return;
      this.vsyncValue = value;
      this.context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
      this.context.globalAlpha = 1;
      this.context.fillStyle = this.bg;
      this.context.fillText(
        `${value.toFixed(0)}Hz`,
        this.TEXT_X,
        this.TEXT_Y
      );
    }
    // Override updateGraph to do nothing (we don't need a graph for VSync)
    updateGraph(_valueGraph, _maxGraph) {
      return;
    }
    // Method to set the offset position relative to parent panel
    setOffset(x, y) {
      this.canvas.style.transform = `translate(${x}px, ${y}px)`;
    }
  }
  class PanelTexture extends Panel {
    // Source texture aspect ratio (width/height)
    constructor(name) {
      super(name, "#fff", "#111");
      this.currentBitmap = null;
      this.sourceAspect = 1;
      this.initializeCanvas();
    }
    initializeCanvas() {
      if (!this.context)
        return;
      this.context.imageSmoothingEnabled = true;
      this.context.font = "bold " + 9 * this.PR + "px Helvetica,Arial,sans-serif";
      this.context.textBaseline = "top";
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      this.drawLabelOverlay();
    }
    drawLabelOverlay() {
      if (!this.context)
        return;
      this.context.fillStyle = "rgba(0, 0, 0, 0.5)";
      this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
      this.context.fillStyle = this.fg;
      this.context.fillText(this.name, this.TEXT_X, this.TEXT_Y);
    }
    /**
     * Set the source texture aspect ratio for proper display
     * @param width - Source texture width
     * @param height - Source texture height
     */
    setSourceSize(width, height) {
      this.sourceAspect = width / height;
    }
    updateTexture(bitmap) {
      if (!this.context)
        return;
      if (this.currentBitmap) {
        this.currentBitmap.close();
      }
      this.currentBitmap = bitmap;
      this.context.fillStyle = "#000";
      this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);
      const panelAspect = this.WIDTH / this.HEIGHT;
      let destWidth;
      let destHeight;
      let destX;
      let destY;
      if (this.sourceAspect > panelAspect) {
        destWidth = this.WIDTH;
        destHeight = this.WIDTH / this.sourceAspect;
        destX = 0;
        destY = (this.HEIGHT - destHeight) / 2;
      } else {
        destHeight = this.HEIGHT;
        destWidth = this.HEIGHT * this.sourceAspect;
        destX = (this.WIDTH - destWidth) / 2;
        destY = 0;
      }
      this.context.drawImage(
        bitmap,
        destX,
        destY,
        destWidth,
        destHeight
      );
      this.drawLabelOverlay();
    }
    setLabel(label) {
      this.name = label;
      this.drawLabelOverlay();
    }
    // Override update - not used for texture panels
    update(_value, _maxValue, _decimals = 0, _suffix = "") {
    }
    // Override updateGraph - not used for texture panels
    updateGraph(_valueGraph, _maxGraph) {
    }
    /**
     * Dispose of resources
     */
    dispose() {
      if (this.currentBitmap) {
        this.currentBitmap.close();
        this.currentBitmap = null;
      }
    }
  }
  const DEFAULT_PREVIEW_WIDTH = 90;
  const DEFAULT_PREVIEW_HEIGHT = 48;
  class TextureCaptureWebGL {
    constructor(gl, width = DEFAULT_PREVIEW_WIDTH, height = DEFAULT_PREVIEW_HEIGHT) {
      this.previewFbo = null;
      this.previewTexture = null;
      this.gl = gl;
      this.previewWidth = width;
      this.previewHeight = height;
      this.pixels = new Uint8Array(width * height * 4);
      this.flippedPixels = new Uint8Array(width * height * 4);
      this.initResources();
    }
    /**
     * Resize preview dimensions
     */
    resize(width, height) {
      if (width === this.previewWidth && height === this.previewHeight)
        return;
      this.previewWidth = width;
      this.previewHeight = height;
      this.pixels = new Uint8Array(width * height * 4);
      this.flippedPixels = new Uint8Array(width * height * 4);
      this.dispose();
      this.initResources();
    }
    initResources() {
      const gl = this.gl;
      this.previewTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.previewTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.previewWidth, this.previewHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      this.previewFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.previewFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.previewTexture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    async capture(source, sourceWidth, sourceHeight, _sourceId = "default") {
      const gl = this.gl;
      const prevReadFbo = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING);
      const prevDrawFbo = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.previewFbo);
      gl.blitFramebuffer(
        0,
        0,
        sourceWidth,
        sourceHeight,
        0,
        0,
        this.previewWidth,
        this.previewHeight,
        gl.COLOR_BUFFER_BIT,
        gl.LINEAR
      );
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.previewFbo);
      gl.readPixels(0, 0, this.previewWidth, this.previewHeight, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, prevReadFbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, prevDrawFbo);
      const flipped = this.flipY(this.pixels, this.previewWidth, this.previewHeight);
      const imageData = new ImageData(new Uint8ClampedArray(flipped), this.previewWidth, this.previewHeight);
      return createImageBitmap(imageData);
    }
    flipY(pixels, width, height) {
      const rowSize = width * 4;
      for (let y = 0; y < height; y++) {
        const srcOffset = y * rowSize;
        const dstOffset = (height - 1 - y) * rowSize;
        this.flippedPixels.set(pixels.subarray(srcOffset, srcOffset + rowSize), dstOffset);
      }
      return this.flippedPixels;
    }
    removeSource(_sourceId) {
    }
    dispose() {
      const gl = this.gl;
      if (this.previewFbo) {
        gl.deleteFramebuffer(this.previewFbo);
        this.previewFbo = null;
      }
      if (this.previewTexture) {
        gl.deleteTexture(this.previewTexture);
        this.previewTexture = null;
      }
    }
  }
  class TextureCaptureWebGPU {
    constructor(device, width = DEFAULT_PREVIEW_WIDTH, height = DEFAULT_PREVIEW_HEIGHT) {
      this.previewTexture = null;
      this.stagingBuffer = null;
      this.blitPipeline = null;
      this.sampler = null;
      this.bindGroupLayout = null;
      this.initialized = false;
      this.device = device;
      this.previewWidth = width;
      this.previewHeight = height;
      this.pixelsBuffer = new Uint8ClampedArray(width * height * 4);
    }
    /**
     * Resize preview dimensions
     */
    resize(width, height) {
      if (width === this.previewWidth && height === this.previewHeight)
        return;
      this.previewWidth = width;
      this.previewHeight = height;
      this.pixelsBuffer = new Uint8ClampedArray(width * height * 4);
      if (this.previewTexture)
        this.previewTexture.destroy();
      if (this.stagingBuffer)
        this.stagingBuffer.destroy();
      this.previewTexture = null;
      this.stagingBuffer = null;
      if (this.initialized) {
        this.createSizeResources();
      }
    }
    createSizeResources() {
      const device = this.device;
      this.previewTexture = device.createTexture({
        size: { width: this.previewWidth, height: this.previewHeight },
        format: "rgba8unorm",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
      });
      const bytesPerRow = Math.ceil(this.previewWidth * 4 / 256) * 256;
      this.stagingBuffer = device.createBuffer({
        size: bytesPerRow * this.previewHeight,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });
    }
    async initResources() {
      if (this.initialized)
        return;
      const device = this.device;
      this.createSizeResources();
      this.sampler = device.createSampler({
        minFilter: "linear",
        magFilter: "linear"
      });
      const shaderModule = device.createShaderModule({
        code: `
        @group(0) @binding(0) var texSampler: sampler;
        @group(0) @binding(1) var texInput: texture_2d<f32>;

        struct VertexOutput {
          @builtin(position) position: vec4f,
          @location(0) uv: vec2f
        }

        @vertex
        fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
          var positions = array<vec2f, 3>(
            vec2f(-1.0, -1.0),
            vec2f(3.0, -1.0),
            vec2f(-1.0, 3.0)
          );
          var uvs = array<vec2f, 3>(
            vec2f(0.0, 1.0),
            vec2f(2.0, 1.0),
            vec2f(0.0, -1.0)
          );

          var output: VertexOutput;
          output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
          output.uv = uvs[vertexIndex];
          return output;
        }

        @fragment
        fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
          return textureSample(texInput, texSampler, uv);
        }
      `
      });
      this.bindGroupLayout = device.createBindGroupLayout({
        entries: [
          { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "filtering" } },
          { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: "float" } }
        ]
      });
      this.blitPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [this.bindGroupLayout] }),
        vertex: {
          module: shaderModule,
          entryPoint: "vertexMain"
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fragmentMain",
          targets: [{ format: "rgba8unorm" }]
        },
        primitive: { topology: "triangle-list" }
      });
      this.initialized = true;
    }
    async capture(source) {
      await this.initResources();
      if (!this.previewTexture || !this.stagingBuffer || !this.blitPipeline || !this.sampler || !this.bindGroupLayout) {
        return null;
      }
      const device = this.device;
      const bindGroup = device.createBindGroup({
        layout: this.bindGroupLayout,
        entries: [
          { binding: 0, resource: this.sampler },
          { binding: 1, resource: source.createView() }
        ]
      });
      const commandEncoder = device.createCommandEncoder();
      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [{
          view: this.previewTexture.createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }]
      });
      renderPass.setPipeline(this.blitPipeline);
      renderPass.setBindGroup(0, bindGroup);
      renderPass.draw(3);
      renderPass.end();
      const bytesPerRow = Math.ceil(this.previewWidth * 4 / 256) * 256;
      commandEncoder.copyTextureToBuffer(
        { texture: this.previewTexture },
        { buffer: this.stagingBuffer, bytesPerRow },
        { width: this.previewWidth, height: this.previewHeight }
      );
      device.queue.submit([commandEncoder.finish()]);
      await this.stagingBuffer.mapAsync(GPUMapMode.READ);
      const data = new Uint8Array(this.stagingBuffer.getMappedRange());
      for (let y = 0; y < this.previewHeight; y++) {
        const srcOffset = y * bytesPerRow;
        const dstOffset = y * this.previewWidth * 4;
        this.pixelsBuffer.set(data.subarray(srcOffset, srcOffset + this.previewWidth * 4), dstOffset);
      }
      this.stagingBuffer.unmap();
      const imageData = new ImageData(new Uint8ClampedArray(this.pixelsBuffer), this.previewWidth, this.previewHeight);
      return createImageBitmap(imageData);
    }
    dispose() {
      if (this.previewTexture)
        this.previewTexture.destroy();
      if (this.stagingBuffer)
        this.stagingBuffer.destroy();
      this.previewTexture = null;
      this.stagingBuffer = null;
      this.blitPipeline = null;
      this.sampler = null;
      this.bindGroupLayout = null;
      this.initialized = false;
    }
  }
  function extractWebGLSource(target, gl) {
    if (target.isWebGLRenderTarget && target.__webglFramebuffer) {
      return {
        framebuffer: target.__webglFramebuffer,
        width: target.width || 1,
        height: target.height || 1
      };
    }
    return null;
  }
  function extractWebGPUSource(target, backend) {
    if (target.isRenderTarget && target.texture && backend.get) {
      const textureData = backend.get(target.texture);
      return (textureData == null ? void 0 : textureData.texture) || null;
    }
    return null;
  }
  const _Stats = class _Stats2 extends StatsCore {
    constructor({
      trackGPU = false,
      trackCPT = false,
      trackHz = false,
      trackFPS = true,
      logsPerSecond = 4,
      graphsPerSecond = 30,
      samplesLog = 40,
      samplesGraph = 10,
      precision = 2,
      minimal = false,
      horizontal = true,
      mode = 0
    } = {}) {
      super({
        trackGPU,
        trackCPT,
        trackHz,
        trackFPS,
        logsPerSecond,
        graphsPerSecond,
        samplesLog,
        samplesGraph,
        precision
      });
      this.fpsPanel = null;
      this.msPanel = null;
      this.gpuPanel = null;
      this.gpuPanelCompute = null;
      this.vsyncPanel = null;
      this.workerCpuPanel = null;
      this.texturePanels = /* @__PURE__ */ new Map();
      this.texturePanelRow = null;
      this.textureCaptureWebGL = null;
      this.textureCaptureWebGPU = null;
      this.textureSourcesWebGL = /* @__PURE__ */ new Map();
      this.textureSourcesWebGPU = /* @__PURE__ */ new Map();
      this.texturePreviewWidth = DEFAULT_PREVIEW_WIDTH;
      this.texturePreviewHeight = DEFAULT_PREVIEW_HEIGHT;
      this.lastRendererWidth = 0;
      this.lastRendererHeight = 0;
      this.textureUpdatePending = false;
      this.updateCounter = 0;
      this.lastMin = {};
      this.lastMax = {};
      this.lastValue = {};
      this.VSYNC_RATES = [
        { refreshRate: 60, frameTime: 16.67 },
        { refreshRate: 75, frameTime: 13.33 },
        { refreshRate: 90, frameTime: 11.11 },
        { refreshRate: 120, frameTime: 8.33 },
        { refreshRate: 144, frameTime: 6.94 },
        { refreshRate: 165, frameTime: 6.06 },
        { refreshRate: 240, frameTime: 4.17 }
      ];
      this.detectedVSync = null;
      this.frameTimeHistory = [];
      this.HISTORY_SIZE = 120;
      this.VSYNC_THRESHOLD = 0.05;
      this.lastFrameTime = 0;
      this.externalData = null;
      this.hasNewExternalData = false;
      this.isWorker = false;
      this.averageWorkerCpu = { logs: [], graph: [] };
      this.handleClick = (event) => {
        event.preventDefault();
        this.showPanel(++this.mode % this.dom.children.length);
      };
      this.handleResize = () => {
        if (this.fpsPanel)
          this.resizePanel(this.fpsPanel);
        if (this.msPanel)
          this.resizePanel(this.msPanel);
        if (this.workerCpuPanel)
          this.resizePanel(this.workerCpuPanel);
        if (this.gpuPanel)
          this.resizePanel(this.gpuPanel);
        if (this.gpuPanelCompute)
          this.resizePanel(this.gpuPanelCompute);
      };
      this.mode = mode;
      this.horizontal = horizontal;
      this.minimal = minimal;
      this.dom = document.createElement("div");
      this.initializeDOM();
      this._panelId = 0;
      if (this.trackFPS) {
        this.fpsPanel = this.addPanel(new _Stats2.Panel("FPS", "#0ff", "#002"));
        this.msPanel = this.addPanel(new _Stats2.Panel("CPU", "#0f0", "#020"));
      }
      if (this.trackGPU) {
        this.gpuPanel = this.addPanel(new _Stats2.Panel("GPU", "#ff0", "#220"));
      }
      if (this.trackCPT) {
        this.gpuPanelCompute = this.addPanel(new _Stats2.Panel("CPT", "#e1e1e1", "#212121"));
      }
      if (this.trackHz === true) {
        this.vsyncPanel = new PanelVSync("", "#f0f", "#202");
        this.dom.appendChild(this.vsyncPanel.canvas);
        this.vsyncPanel.setOffset(56, 35);
      }
      this.setupEventListeners();
    }
    initializeDOM() {
      this.dom.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      opacity: 0.9;
      z-index: 10000;
      ${this.minimal ? "cursor: pointer;" : ""}
    `;
    }
    setupEventListeners() {
      if (this.minimal) {
        this.dom.addEventListener("click", this.handleClick);
        this.showPanel(this.mode);
      } else {
        window.addEventListener("resize", this.handleResize);
      }
    }
    /**
     * Compute and update texture preview dimensions based on renderer aspect ratio
     */
    updateTexturePreviewDimensions() {
      var _a, _b;
      if (!this.renderer)
        return;
      const rendererWidth = ((_a = this.renderer.domElement) == null ? void 0 : _a.width) || 0;
      const rendererHeight = ((_b = this.renderer.domElement) == null ? void 0 : _b.height) || 0;
      if (rendererWidth === this.lastRendererWidth && rendererHeight === this.lastRendererHeight) {
        return;
      }
      if (rendererWidth === 0 || rendererHeight === 0)
        return;
      this.lastRendererWidth = rendererWidth;
      this.lastRendererHeight = rendererHeight;
      const sourceAspect = rendererWidth / rendererHeight;
      const panelAspect = DEFAULT_PREVIEW_WIDTH / DEFAULT_PREVIEW_HEIGHT;
      let newWidth;
      let newHeight;
      if (sourceAspect > panelAspect) {
        newWidth = DEFAULT_PREVIEW_WIDTH;
        newHeight = Math.round(DEFAULT_PREVIEW_WIDTH / sourceAspect);
      } else {
        newHeight = DEFAULT_PREVIEW_HEIGHT;
        newWidth = Math.round(DEFAULT_PREVIEW_HEIGHT * sourceAspect);
      }
      newWidth = Math.max(newWidth, 16);
      newHeight = Math.max(newHeight, 16);
      if (newWidth !== this.texturePreviewWidth || newHeight !== this.texturePreviewHeight) {
        this.texturePreviewWidth = newWidth;
        this.texturePreviewHeight = newHeight;
        if (this.textureCaptureWebGL) {
          this.textureCaptureWebGL.resize(newWidth, newHeight);
        }
        if (this.textureCaptureWebGPU) {
          this.textureCaptureWebGPU.resize(newWidth, newHeight);
        }
        for (const panel of this.texturePanels.values()) {
          panel.setSourceSize(rendererWidth, rendererHeight);
        }
      }
    }
    onWebGPUTimestampSupported() {
    }
    onGPUTrackingInitialized() {
    }
    setData(data) {
      this.externalData = data;
      this.hasNewExternalData = true;
      if (!this.isWorker && this.msPanel) {
        this.isWorker = true;
        this.workerCpuPanel = new _Stats2.Panel("WRK", "#f90", "#220");
        const insertPosition = this.msPanel.id + 1;
        this.workerCpuPanel.id = insertPosition;
        if (this.gpuPanel && this.gpuPanel.id >= insertPosition) {
          this.gpuPanel.id++;
          this.resizePanel(this.gpuPanel);
        }
        if (this.gpuPanelCompute && this.gpuPanelCompute.id >= insertPosition) {
          this.gpuPanelCompute.id++;
          this.resizePanel(this.gpuPanelCompute);
        }
        const msCanvas = this.msPanel.canvas;
        if (msCanvas.nextSibling) {
          this.dom.insertBefore(this.workerCpuPanel.canvas, msCanvas.nextSibling);
        } else {
          this.dom.appendChild(this.workerCpuPanel.canvas);
        }
        this.resizePanel(this.workerCpuPanel);
        this._panelId++;
      }
    }
    update() {
      if (this.externalData) {
        this.updateFromExternalData();
      } else {
        this.updateFromInternalData();
      }
    }
    updateFromExternalData() {
      const data = this.externalData;
      this.endProfiling("cpu-started", "cpu-finished", "cpu-duration");
      this.addToAverage(this.totalCpuDuration, this.averageCpu);
      this.totalCpuDuration = 0;
      if (this.hasNewExternalData) {
        this.addToAverage(data.cpu, this.averageWorkerCpu);
        this.addToAverage(data.fps, this.averageFps);
        this.addToAverage(data.gpu, this.averageGpu);
        this.addToAverage(data.gpuCompute, this.averageGpuCompute);
        this.hasNewExternalData = false;
      }
      this.renderPanels();
    }
    updateFromInternalData() {
      this.endProfiling("cpu-started", "cpu-finished", "cpu-duration");
      if (this.webgpuNative) {
        this.resolveTimestampsAsync();
      } else if (!this.info) {
        this.processGpuQueries();
      } else {
        this.processWebGPUTimestamps();
      }
      this.updateAverages();
      this.resetCounters();
      this.renderPanels();
    }
    renderPanels() {
      var _a;
      const currentTime = performance.now();
      if (!this.isWorker) {
        this.frameTimes.push(currentTime);
        while (this.frameTimes.length > 0 && this.frameTimes[0] <= currentTime - 1e3) {
          this.frameTimes.shift();
        }
        const fps = Math.round(this.frameTimes.length);
        this.addToAverage(fps, this.averageFps);
      }
      const shouldUpdateText = currentTime >= this.prevTextTime + 1e3 / this.logsPerSecond;
      const shouldUpdateGraph = currentTime >= this.prevGraphTime + 1e3 / this.graphsPerSecond;
      const suffix = this.isWorker ? " ⛭" : "";
      this.updatePanelComponents(this.fpsPanel, this.averageFps, 0, shouldUpdateText, shouldUpdateGraph, suffix);
      this.updatePanelComponents(this.msPanel, this.averageCpu, this.precision, shouldUpdateText, shouldUpdateGraph, "");
      if (this.workerCpuPanel && this.isWorker) {
        this.updatePanelComponents(this.workerCpuPanel, this.averageWorkerCpu, this.precision, shouldUpdateText, shouldUpdateGraph, " ⛭");
      }
      if (this.gpuPanel) {
        this.updatePanelComponents(this.gpuPanel, this.averageGpu, this.precision, shouldUpdateText, shouldUpdateGraph, suffix);
      }
      if (this.trackCPT && this.gpuPanelCompute) {
        this.updatePanelComponents(this.gpuPanelCompute, this.averageGpuCompute, this.precision, shouldUpdateText, shouldUpdateGraph, suffix);
      }
      if (shouldUpdateText) {
        this.prevTextTime = currentTime;
      }
      if (shouldUpdateGraph) {
        this.prevGraphTime = currentTime;
        if (this.texturePanels.size > 0 && !this.textureUpdatePending) {
          this.textureUpdatePending = true;
          this.updateTexturePanels().finally(() => {
            this.textureUpdatePending = false;
          });
        }
        this.captureStatsGLNodes();
      }
      if (this.vsyncPanel !== null) {
        this.detectVSync(currentTime);
        const vsyncValue = ((_a = this.detectedVSync) == null ? void 0 : _a.refreshRate) || 0;
        if (shouldUpdateText && vsyncValue > 0) {
          this.vsyncPanel.update(vsyncValue, vsyncValue);
        }
      }
    }
    resetCounters() {
      this.renderCount = 0;
      this.totalCpuDuration = 0;
      this.beginTime = performance.now();
    }
    resizePanel(panel) {
      panel.canvas.style.position = "absolute";
      if (this.minimal) {
        panel.canvas.style.display = "none";
      } else {
        panel.canvas.style.display = "block";
        if (this.horizontal) {
          panel.canvas.style.top = "0px";
          panel.canvas.style.left = panel.id * panel.WIDTH / panel.PR + "px";
        } else {
          panel.canvas.style.left = "0px";
          panel.canvas.style.top = panel.id * panel.HEIGHT / panel.PR + "px";
        }
      }
    }
    addPanel(panel) {
      if (panel.canvas) {
        this.dom.appendChild(panel.canvas);
        panel.id = this._panelId;
        this.resizePanel(panel);
        this._panelId++;
      }
      return panel;
    }
    showPanel(id) {
      for (let i = 0; i < this.dom.children.length; i++) {
        const child = this.dom.children[i];
        child.style.display = i === id ? "block" : "none";
      }
      this.mode = id;
    }
    // ==========================================================================
    // Texture Panel API
    // ==========================================================================
    /**
     * Add a new texture preview panel
     * @param name - Label for the texture panel
     * @returns The created PanelTexture instance
     */
    addTexturePanel(name) {
      if (!this.texturePanelRow) {
        this.texturePanelRow = document.createElement("div");
        this.texturePanelRow.style.cssText = `
        position: absolute;
        top: 48px;
        left: 0;
        display: flex;
        flex-direction: row;
      `;
        this.dom.appendChild(this.texturePanelRow);
      }
      const panel = new PanelTexture(name);
      panel.canvas.style.position = "relative";
      panel.canvas.style.left = "";
      panel.canvas.style.top = "";
      this.texturePanelRow.appendChild(panel.canvas);
      this.texturePanels.set(name, panel);
      return panel;
    }
    /**
     * Set texture source for a panel (Three.js render target)
     * Auto-detects WebGL/WebGPU and extracts native handles
     * @param name - Panel name
     * @param source - Three.js RenderTarget or native texture
     */
    setTexture(name, source) {
      this.updateTexturePreviewDimensions();
      if (this.gl && !this.textureCaptureWebGL) {
        this.textureCaptureWebGL = new TextureCaptureWebGL(this.gl, this.texturePreviewWidth, this.texturePreviewHeight);
      }
      if (this.gpuDevice && !this.textureCaptureWebGPU) {
        this.textureCaptureWebGPU = new TextureCaptureWebGPU(this.gpuDevice, this.texturePreviewWidth, this.texturePreviewHeight);
      }
      const panel = this.texturePanels.get(name);
      if (source.isWebGLRenderTarget && this.gl) {
        const webglSource = extractWebGLSource(source, this.gl);
        if (webglSource) {
          this.textureSourcesWebGL.set(name, {
            target: source,
            ...webglSource
          });
          if (panel) {
            panel.setSourceSize(webglSource.width, webglSource.height);
          }
        }
        return;
      }
      if (source.isRenderTarget && this.gpuBackend) {
        const gpuTexture = extractWebGPUSource(source, this.gpuBackend);
        if (gpuTexture) {
          this.textureSourcesWebGPU.set(name, gpuTexture);
          if (panel && source.width && source.height) {
            panel.setSourceSize(source.width, source.height);
          }
        }
        return;
      }
      if (source && typeof source.createView === "function") {
        this.textureSourcesWebGPU.set(name, source);
        return;
      }
    }
    /**
     * Set WebGL framebuffer source with explicit dimensions
     * @param name - Panel name
     * @param framebuffer - WebGL framebuffer
     * @param width - Texture width
     * @param height - Texture height
     */
    setTextureWebGL(name, framebuffer, width, height) {
      this.updateTexturePreviewDimensions();
      if (this.gl && !this.textureCaptureWebGL) {
        this.textureCaptureWebGL = new TextureCaptureWebGL(this.gl, this.texturePreviewWidth, this.texturePreviewHeight);
      }
      this.textureSourcesWebGL.set(name, {
        target: { isWebGLRenderTarget: true },
        framebuffer,
        width,
        height
      });
      const panel = this.texturePanels.get(name);
      if (panel) {
        panel.setSourceSize(width, height);
      }
    }
    /**
     * Set texture from ImageBitmap (for worker mode)
     * @param name - Panel name
     * @param bitmap - ImageBitmap transferred from worker
     * @param sourceWidth - Optional source texture width for aspect ratio
     * @param sourceHeight - Optional source texture height for aspect ratio
     */
    setTextureBitmap(name, bitmap, sourceWidth, sourceHeight) {
      const panel = this.texturePanels.get(name);
      if (panel) {
        if (sourceWidth !== void 0 && sourceHeight !== void 0) {
          panel.setSourceSize(sourceWidth, sourceHeight);
        }
        panel.updateTexture(bitmap);
      }
    }
    /**
     * Remove a texture panel
     * @param name - Panel name to remove
     */
    removeTexturePanel(name) {
      const panel = this.texturePanels.get(name);
      if (panel) {
        panel.dispose();
        panel.canvas.remove();
        this.texturePanels.delete(name);
        this.textureSourcesWebGL.delete(name);
        this.textureSourcesWebGPU.delete(name);
      }
    }
    /**
     * Capture and update all texture panels
     * Called automatically during renderPanels at graphsPerSecond rate
     */
    async updateTexturePanels() {
      this.updateTexturePreviewDimensions();
      if (this.textureCaptureWebGL) {
        for (const [name, source] of this.textureSourcesWebGL) {
          const panel = this.texturePanels.get(name);
          if (panel) {
            let framebuffer = source.framebuffer;
            let width = source.width;
            let height = source.height;
            if (source.target.isWebGLRenderTarget && source.target.__webglFramebuffer) {
              framebuffer = source.target.__webglFramebuffer;
              width = source.target.width || width;
              height = source.target.height || height;
            }
            const bitmap = await this.textureCaptureWebGL.capture(framebuffer, width, height, name);
            if (bitmap) {
              panel.updateTexture(bitmap);
            }
          }
        }
      }
      if (this.textureCaptureWebGPU) {
        for (const [name, gpuTexture] of this.textureSourcesWebGPU) {
          const panel = this.texturePanels.get(name);
          if (panel) {
            const bitmap = await this.textureCaptureWebGPU.capture(gpuTexture);
            if (bitmap) {
              panel.updateTexture(bitmap);
            }
          }
        }
      }
    }
    /**
     * Capture StatsGL nodes registered by the addon
     */
    captureStatsGLNodes() {
      const captures = this._statsGLCaptures;
      if (!captures || captures.size === 0 || !this.renderer)
        return;
      for (const captureData of captures.values()) {
        if (captureData.capture) {
          captureData.capture(this.renderer);
        }
      }
    }
    detectVSync(currentTime) {
      if (this.lastFrameTime === 0) {
        this.lastFrameTime = currentTime;
        return;
      }
      const frameTime = currentTime - this.lastFrameTime;
      this.lastFrameTime = currentTime;
      this.frameTimeHistory.push(frameTime);
      if (this.frameTimeHistory.length > this.HISTORY_SIZE) {
        this.frameTimeHistory.shift();
      }
      if (this.frameTimeHistory.length < 60)
        return;
      const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b) / this.frameTimeHistory.length;
      const variance = this.frameTimeHistory.reduce((acc, time) => acc + Math.pow(time - avgFrameTime, 2), 0) / this.frameTimeHistory.length;
      const stability = Math.sqrt(variance);
      if (stability > 2) {
        this.detectedVSync = null;
        return;
      }
      let closestMatch = null;
      let smallestDiff = Infinity;
      for (const rate of this.VSYNC_RATES) {
        const diff = Math.abs(avgFrameTime - rate.frameTime);
        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestMatch = rate;
        }
      }
      if (closestMatch && smallestDiff / closestMatch.frameTime <= this.VSYNC_THRESHOLD) {
        this.detectedVSync = closestMatch;
      } else {
        this.detectedVSync = null;
      }
    }
    updatePanelComponents(panel, averageArray, precision, shouldUpdateText, shouldUpdateGraph, suffix = "") {
      if (!panel || averageArray.logs.length === 0)
        return;
      const key = String(panel.id);
      if (!(key in this.lastMin)) {
        this.lastMin[key] = Infinity;
        this.lastMax[key] = 0;
        this.lastValue[key] = 0;
      }
      const currentValue = averageArray.logs[averageArray.logs.length - 1];
      this.lastMax[key] = Math.max(...averageArray.logs);
      this.lastMin[key] = Math.min(this.lastMin[key], currentValue);
      this.lastValue[key] = this.lastValue[key] * 0.7 + currentValue * 0.3;
      const graphMax = Math.max(
        Math.max(...averageArray.logs),
        ...averageArray.graph.slice(-this.samplesGraph)
      );
      this.updateCounter++;
      if (shouldUpdateText) {
        panel.update(
          this.lastValue[key],
          this.lastMax[key],
          precision,
          suffix
        );
      }
      if (shouldUpdateGraph) {
        panel.updateGraph(
          currentValue,
          graphMax
        );
      }
    }
    updatePanel(panel, averageArray, precision = 2) {
      if (!panel || averageArray.logs.length === 0)
        return;
      const currentTime = performance.now();
      if (!(panel.name in this.lastMin)) {
        this.lastMin[panel.name] = Infinity;
        this.lastMax[panel.name] = 0;
        this.lastValue[panel.name] = 0;
      }
      const currentValue = averageArray.logs[averageArray.logs.length - 1];
      const recentMax = Math.max(...averageArray.logs.slice(-30));
      this.lastMin[panel.name] = Math.min(this.lastMin[panel.name], currentValue);
      this.lastMax[panel.name] = Math.max(this.lastMax[panel.name], currentValue);
      this.lastValue[panel.name] = this.lastValue[panel.name] * 0.7 + currentValue * 0.3;
      const graphMax = Math.max(recentMax, ...averageArray.graph.slice(-this.samplesGraph));
      this.updateCounter++;
      if (this.updateCounter % (this.logsPerSecond * 2) === 0) {
        this.lastMax[panel.name] = recentMax;
        this.lastMin[panel.name] = currentValue;
      }
      if (panel.update) {
        if (currentTime >= this.prevCpuTime + 1e3 / this.logsPerSecond) {
          panel.update(
            this.lastValue[panel.name],
            currentValue,
            this.lastMax[panel.name],
            graphMax,
            precision
          );
        }
        if (currentTime >= this.prevGraphTime + 1e3 / this.graphsPerSecond) {
          panel.updateGraph(
            currentValue,
            graphMax
          );
          this.prevGraphTime = currentTime;
        }
      }
    }
    get domElement() {
      return this.dom;
    }
    /**
     * Dispose of all resources. Call when done using Stats.
     */
    dispose() {
      if (this.minimal) {
        this.dom.removeEventListener("click", this.handleClick);
      } else {
        window.removeEventListener("resize", this.handleResize);
      }
      if (this.textureCaptureWebGL) {
        this.textureCaptureWebGL.dispose();
        this.textureCaptureWebGL = null;
      }
      if (this.textureCaptureWebGPU) {
        this.textureCaptureWebGPU.dispose();
        this.textureCaptureWebGPU = null;
      }
      for (const panel of this.texturePanels.values()) {
        panel.dispose();
      }
      this.texturePanels.clear();
      this.textureSourcesWebGL.clear();
      this.textureSourcesWebGPU.clear();
      const captures = this._statsGLCaptures;
      if (captures) {
        for (const captureData of captures.values()) {
          if (captureData.dispose) {
            captureData.dispose();
          }
        }
        captures.clear();
      }
      if (this.texturePanelRow) {
        this.texturePanelRow.remove();
        this.texturePanelRow = null;
      }
      this.dom.remove();
      this.fpsPanel = null;
      this.msPanel = null;
      this.gpuPanel = null;
      this.gpuPanelCompute = null;
      this.vsyncPanel = null;
      this.workerCpuPanel = null;
      this.frameTimeHistory.length = 0;
      this.averageWorkerCpu.logs.length = 0;
      this.averageWorkerCpu.graph.length = 0;
      super.dispose();
    }
  };
  _Stats.Panel = Panel;
  _Stats.PanelTexture = PanelTexture;
  let Stats = _Stats;
  const main = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    PanelTexture,
    TextureCaptureWebGL,
    TextureCaptureWebGPU,
    default: Stats
  }, Symbol.toStringTag, { value: "Module" }));
  exports2.App = App;
  exports2.Entity = Entity;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=virtualdev.umd.js.map
