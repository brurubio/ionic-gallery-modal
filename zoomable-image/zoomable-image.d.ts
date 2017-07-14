import { OnInit, OnDestroy, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
export declare class ZoomableImage implements OnInit, OnDestroy {
    image: any;
    container: any;
    ionScrollContainer: ElementRef;
    src: string;
    parentSubject: Subject<any>;
    disableScroll: EventEmitter<{}>;
    enableScroll: EventEmitter<{}>;
    private scrollableElement;
    private scrollListener;
    private gesture;
    private scale;
    private scaleStart;
    private maxScale;
    private minScale;
    private minScaleBounce;
    private maxScaleBounce;
    private imageWidth;
    private imageHeight;
    private position;
    private scroll;
    private centerRatio;
    private centerStart;
    private dimensions;
    private panCenterStart;
    private imageElement;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Attach the events to the items
     */
    private attachEvents();
    /**
     * Called every time the window gets resized
     */
    resize(event: any): void;
    /**
     * Set the wrapper dimensions
     *
     * @param  {number} width
     * @param  {number} height
     */
    private setWrapperDimensions(width, height);
    /**
     * Get the real image dimensions and other useful stuff
     */
    private setImageDimensions();
    /**
     * Save the image dimensions (when it has the image)
     */
    private saveImageDimensions();
    /**
     * While the user is pinching
     *
     * @param  {Event} event
     */
    private pinchEvent(event);
    /**
     * When the user starts pinching
     *
     * @param  {Event} event
     */
    private pinchStartEvent(event);
    /**
     * When the user stops pinching
     *
     * @param  {Event} event
     */
    private pinchEndEvent(event);
    /**
     * When the user double taps on the photo
     *
     * @param  {Event} event
     */
    private doubleTapEvent(event);
    private panEvent(event);
    /**
     * When the user is scrolling
     *
     * @param  {Event} event
     */
    private scrollEvent(event);
    /**
     * Set the startup center calculated on the image (along with the ratio)
     *
     * @param  {Event} event
     */
    private setCenter(event);
    /**
     * Set the scroll of the ion-scroll
     */
    private setScroll();
    /**
     * Calculate the position and set the proper scale to the element and the
     * container
     */
    private displayScale();
    /**
     * Check wether to disable or enable scroll and then call the events
     */
    private checkScroll();
    /**
     * Animates to a certain scale (with ease)
     *
     * @param  {number} scale
     */
    private animateScale(scale);
}
