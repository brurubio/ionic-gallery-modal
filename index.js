import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { Gesture, NavParams, Platform, ViewController } from 'ionic-angular/index';
import { Subject } from 'rxjs/Subject';

var ZoomableImage = (function () {
    function ZoomableImage() {
        this.disableScroll = new EventEmitter();
        this.enableScroll = new EventEmitter();
        this.scale = 1;
        this.scaleStart = 1;
        this.maxScale = 3;
        this.minScale = 1;
        this.minScaleBounce = 0.2;
        this.maxScaleBounce = 0.35;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.position = {
            x: 0,
            y: 0,
        };
        this.scroll = {
            x: 0,
            y: 0,
        };
        this.centerRatio = {
            x: 0,
            y: 0,
        };
        this.centerStart = {
            x: 0,
            y: 0,
        };
        this.dimensions = {
            width: 0,
            height: 0,
        };
        this.panCenterStart = {
            x: 0, y: 0,
        };
    }
    /**
     * @return {?}
     */
    ZoomableImage.prototype.ngOnInit = function () {
        var _this = this;
        // Get the scrollable element
        this.scrollableElement = this.ionScrollContainer.nativeElement.querySelector('.scroll-content');
        // Attach events
        this.attachEvents();
        // Listen to parent resize
        this.parentSubject.subscribe(function (event) {
            _this.resize(event);
        });
        // Resize the zoomable image
        this.resize(false);
    };
    /**
     * @return {?}
     */
    ZoomableImage.prototype.ngOnDestroy = function () {
        this.scrollableElement.removeEventListener('scroll', this.scrollListener);
    };
    /**
     * Attach the events to the items
     * @return {?}
     */
    ZoomableImage.prototype.attachEvents = function () {
        var _this = this;
        // Gesture events
        this.gesture = new Gesture(this.container.nativeElement);
        this.gesture.listen();
        this.gesture.on('doubletap', function (e) { return _this.doubleTapEvent(e); });
        this.gesture.on('pinch', function (e) { return _this.pinchEvent(e); });
        this.gesture.on('pinchstart', function (e) { return _this.pinchStartEvent(e); });
        this.gesture.on('pinchend', function (e) { return _this.pinchEndEvent(e); });
        this.gesture.on('pan', function (e) { return _this.panEvent(e); });
        // Scroll event
        this.scrollListener = this.scrollEvent.bind(this);
        this.scrollableElement.addEventListener('scroll', this.scrollListener);
    };
    /**
     * Called every time the window gets resized
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.resize = function (event) {
        // Set the wrapper dimensions first
        this.setWrapperDimensions(event.width, event.height);
        // Get the image dimensions
        this.setImageDimensions();
    };
    /**
     * Set the wrapper dimensions
     *
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    ZoomableImage.prototype.setWrapperDimensions = function (width, height) {
        this.dimensions.width = width || window.innerWidth;
        this.dimensions.height = height || window.innerHeight;
    };
    /**
     * Get the real image dimensions and other useful stuff
     * @return {?}
     */
    ZoomableImage.prototype.setImageDimensions = function () {
        if (!this.imageElement) {
            this.imageElement = new Image();
            this.imageElement.src = this.src;
            this.imageElement.onload = this.saveImageDimensions.bind(this);
            return;
        }
        this.saveImageDimensions();
    };
    /**
     * Save the image dimensions (when it has the image)
     * @return {?}
     */
    ZoomableImage.prototype.saveImageDimensions = function () {
        var /** @type {?} */ width = this.imageElement['width'];
        var /** @type {?} */ height = this.imageElement['height'];
        if (width / height > this.dimensions.width / this.dimensions.height) {
            this.imageWidth = this.dimensions.width;
            this.imageHeight = height / width * this.dimensions.width;
        }
        else {
            this.imageHeight = this.dimensions.height;
            this.imageWidth = width / height * this.dimensions.height;
        }
        this.maxScale = Math.max(width / this.imageWidth - this.maxScaleBounce, 1.5);
        this.image.nativeElement.style.width = this.imageWidth + "px";
        this.image.nativeElement.style.height = this.imageHeight + "px";
        this.displayScale();
    };
    /**
     * While the user is pinching
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchEvent = function (event) {
        var /** @type {?} */ scale = this.scaleStart * event.scale;
        if (scale > this.maxScale) {
            scale = this.maxScale + (1 - this.maxScale / scale) * this.maxScaleBounce;
        }
        else if (scale < this.minScale) {
            scale = this.minScale - (1 - scale / this.minScale) * this.minScaleBounce;
        }
        this.scale = scale;
        this.displayScale();
        event.preventDefault();
    };
    /**
     * When the user starts pinching
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchStartEvent = function (event) {
        this.scaleStart = this.scale;
        this.setCenter(event);
    };
    /**
     * When the user stops pinching
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchEndEvent = function (event) {
        this.checkScroll();
        if (this.scale > this.maxScale) {
            this.animateScale(this.maxScale);
        }
        else if (this.scale < this.minScale) {
            this.animateScale(this.minScale);
        }
    };
    /**
     * When the user double taps on the photo
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.doubleTapEvent = function (event) {
        this.setCenter(event);
        var /** @type {?} */ scale = this.scale > 1 ? 1 : 2.5;
        if (scale > this.maxScale) {
            scale = this.maxScale;
        }
        this.animateScale(scale);
    };
    /**
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.panEvent = function (event) {
        // calculate center x,y since pan started
        var /** @type {?} */ x = Math.max(Math.floor(this.panCenterStart.x + event.deltaX), 0);
        var /** @type {?} */ y = Math.max(Math.floor(this.panCenterStart.y + event.deltaY), 0);
        this.centerStart.x = x;
        this.centerStart.y = y;
        if (event.isFinal) {
            this.panCenterStart.x = x;
            this.panCenterStart.y = y;
        }
        this.displayScale();
    };
    /**
     * When the user is scrolling
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.scrollEvent = function (event) {
        this.scroll.x = event.target.scrollLeft;
        this.scroll.y = event.target.scrollTop;
    };
    /**
     * Set the startup center calculated on the image (along with the ratio)
     *
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.setCenter = function (event) {
        var /** @type {?} */ realImageWidth = this.imageWidth * this.scale;
        var /** @type {?} */ realImageHeight = this.imageHeight * this.scale;
        this.centerStart.x = Math.max(event.center.x - this.position.x * this.scale, 0);
        this.centerStart.y = Math.max(event.center.y - this.position.y * this.scale, 0);
        this.panCenterStart.x = Math.max(event.center.x - this.position.x * this.scale, 0);
        this.panCenterStart.y = Math.max(event.center.y - this.position.y * this.scale, 0);
        this.centerRatio.x = Math.min((this.centerStart.x + this.scroll.x) / realImageWidth, 1);
        this.centerRatio.y = Math.min((this.centerStart.y + this.scroll.y) / realImageHeight, 1);
    };
    /**
     * Set the scroll of the ion-scroll
     * @return {?}
     */
    ZoomableImage.prototype.setScroll = function () {
        this.scrollableElement.scrollLeft = this.scroll.x;
        this.scrollableElement.scrollTop = this.scroll.y;
    };
    /**
     * Calculate the position and set the proper scale to the element and the
     * container
     * @return {?}
     */
    ZoomableImage.prototype.displayScale = function () {
        var /** @type {?} */ realImageWidth = this.imageWidth * this.scale;
        var /** @type {?} */ realImageHeight = this.imageHeight * this.scale;
        this.position.x = Math.max((this.dimensions.width - realImageWidth) / (2 * this.scale), 0);
        this.position.y = Math.max((this.dimensions.height - realImageHeight) / (2 * this.scale), 0);
        this.image.nativeElement.style.transform = "scale(" + this.scale + ") translate(" + this.position.x + "px, " + this.position.y + "px)";
        this.container.nativeElement.style.width = realImageWidth + "px";
        this.container.nativeElement.style.height = realImageHeight + "px";
        this.scroll.x = this.centerRatio.x * realImageWidth - this.centerStart.x;
        this.scroll.y = this.centerRatio.y * realImageWidth - this.centerStart.y;
        this.setScroll();
    };
    /**
     * Check wether to disable or enable scroll and then call the events
     * @return {?}
     */
    ZoomableImage.prototype.checkScroll = function () {
        if (this.scale > 1) {
            this.disableScroll.emit({});
        }
        else {
            this.enableScroll.emit({});
        }
    };
    /**
     * Animates to a certain scale (with ease)
     *
     * @param {?} scale
     * @return {?}
     */
    ZoomableImage.prototype.animateScale = function (scale) {
        this.scale += (scale - this.scale) / 5;
        if (Math.abs(this.scale - scale) <= 0.1) {
            this.scale = scale;
        }
        this.displayScale();
        if (Math.abs(this.scale - scale) > 0.1) {
            window.requestAnimationFrame(this.animateScale.bind(this, scale));
        }
        else {
            this.checkScroll();
        }
    };
    return ZoomableImage;
}());
ZoomableImage.decorators = [
    { type: Component, args: [{
                encapsulation: ViewEncapsulation.None,
                selector: 'zoomable-image',
                template: "<ion-scroll #ionScrollContainer scrollX=\"true\" scrollY=\"true\" zoom=\"false\"> <div #container class=\"image\"> <img #image src=\"{{ src }}\" alt=\"\" /> </div> </ion-scroll> ",
                styles: ["zoomable-image { width: 100%; height: 100%; } zoomable-image ion-scroll { width: 100%; height: 100%; text-align: left; white-space: nowrap; } zoomable-image ion-scroll .scroll-zoom-wrapper { width: 100%; height: 100%; } zoomable-image ion-scroll .image { display: inline-block; vertical-align: top; text-align: left; min-width: 100%; min-height: 100%; transform-origin: left top; background-repeat: no-repeat; background-position: center center; background-size: contain; } zoomable-image ion-scroll .image img { pointer-events: none; max-width: none; min-width: none; transform-origin: left top; } "],
            },] },
];
/**
 * @nocollapse
 */
ZoomableImage.ctorParameters = function () { return []; };
ZoomableImage.propDecorators = {
    'image': [{ type: ViewChild, args: ['image',] },],
    'container': [{ type: ViewChild, args: ['container',] },],
    'ionScrollContainer': [{ type: ViewChild, args: ['ionScrollContainer', { read: ElementRef },] },],
    'src': [{ type: Input },],
    'parentSubject': [{ type: Input },],
    'disableScroll': [{ type: Output },],
    'enableScroll': [{ type: Output },],
};

var GalleryModal = (function () {
    /**
     * @param {?} viewCtrl
     * @param {?} params
     * @param {?} element
     * @param {?} platform
     */
    function GalleryModal(viewCtrl, params, element, platform) {
        this.viewCtrl = viewCtrl;
        this.element = element;
        this.platform = platform;
        this.sliderDisabled = false;
        this.initialSlide = 0;
        this.currentSlide = 0;
        this.sliderLoaded = false;
        this.closeIcon = 'arrow-back';
        this.parentSubject = new Subject();
        this.photos = params.get('photos') || [];
        this.closeIcon = params.get('closeIcon') || 'arrow-back';
        this.initialSlide = params.get('initialSlide') || 0;
    }
    /**
     * Closes the modal (when user click on CLOSE)
     * @return {?}
     */
    GalleryModal.prototype.dismiss = function () {
        this.viewCtrl.dismiss();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.resize = function (event) {
        this.slider.update();
        var /** @type {?} */ width = this.element['nativeElement'].offsetWidth;
        var /** @type {?} */ height = this.element['nativeElement'].offsetHeight;
        this.parentSubject.next({
            width: width,
            height: height,
        });
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.orientationChange = function (event) {
        var _this = this;
        // TODO: See if you can remove timeout
        window.setTimeout(function () {
            _this.resize(event);
        }, 150);
    };
    /**
     * When the modal has entered into view
     * @return {?}
     */
    GalleryModal.prototype.ionViewDidEnter = function () {
        this.resize(false);
        this.sliderLoaded = true;
    };
    /**
     * Disables the scroll through the slider
     *
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.disableScroll = function (event) {
        if (!this.sliderDisabled) {
            this.currentSlide = this.slider.getActiveIndex();
            this.sliderDisabled = true;
        }
    };
    /**
     * Enables the scroll through the slider
     *
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.enableScroll = function (event) {
        if (this.sliderDisabled) {
            this.slider.slideTo(this.currentSlide, 0, false);
            this.sliderDisabled = false;
        }
    };
    return GalleryModal;
}());
GalleryModal.decorators = [
    { type: Component, args: [{
                encapsulation: ViewEncapsulation.None,
                selector: 'gallery-modal',
                template: "<ion-content #content class=\"gallery-modal\" (window:resize)=\"resize($event)\" (window:orientationchange)=\"orientationChange($event)\"> <button class=\"close-button\" ion-button icon-only (click)=\"dismiss()\"> <ion-icon name=\"{{ closeIcon }}\"></ion-icon> </button> <!-- Initial image while modal is animating --> <div class=\"image-on-top\" #image [ngStyle]=\"{ 'background-image': 'url(' + photos[initialSlide].url + ')'}\" [hidden]=\"sliderLoaded\"> &nbsp; </div> <!-- Slider with images --> <ion-slides #slider [initialSlide]=\"initialSlide\" class=\"slider\" *ngIf=\"photos.length\" [ngStyle]=\"{ 'visibility': sliderLoaded ? 'visible' : 'hidden' }\"> <ion-slide *ngFor=\"let photo of photos;\"> <zoomable-image src=\"{{ photo.url }}\" [ngClass]=\"{ 'swiper-no-swiping': sliderDisabled }\" (disableScroll)=\"disableScroll($event)\" (enableScroll)=\"enableScroll($event)\" [parentSubject]=\"parentSubject\" ></zoomable-image> <div class=\"description\" *ngIf=\"photo.description\"> {{ photo.description }} </div> </ion-slide> </ion-slides> </ion-content> ",
                styles: [".gallery-modal { position: relative; background: black; } .gallery-modal .close-button { position: absolute; left: 5px; top: 10px; z-index: 10; background: none; } .gallery-modal .close-button.button-ios { top: 20px; } .gallery-modal .slider .slide-zoom { height: 100%; } .gallery-modal .image-on-top { position: absolute; left: 0; top: 0; width: 100%; height: 100%; z-index: 10; display: block; background-repeat: no-repeat; background-position: center center; background-size: contain; } .gallery-modal .description { position: absolute; bottom: 0; right: 0; left: 0; padding: 15px 0; color: #fff; background-color: rgba(0, 0, 0, 0.6); z-index: 10; } "],
            },] },
];
/**
 * @nocollapse
 */
GalleryModal.ctorParameters = function () { return [
    { type: ViewController, },
    { type: NavParams, },
    { type: ElementRef, },
    { type: Platform, },
]; };
GalleryModal.propDecorators = {
    'slider': [{ type: ViewChild, args: ['slider',] },],
    'content': [{ type: ViewChild, args: ['content',] },],
};

export { ZoomableImage, GalleryModal };
