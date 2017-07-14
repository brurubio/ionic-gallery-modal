import { ElementRef } from '@angular/core';
import { ViewController, NavParams, Slides, Content, Platform } from 'ionic-angular';
import { Photo } from '../interfaces/photo-interface';
export declare class GalleryModal {
    private viewCtrl;
    private element;
    private platform;
    slider: Slides;
    content: Content;
    photos: Photo[];
    private sliderDisabled;
    private initialSlide;
    private currentSlide;
    private sliderLoaded;
    private closeIcon;
    private parentSubject;
    constructor(viewCtrl: ViewController, params: NavParams, element: ElementRef, platform: Platform);
    /**
     * Closes the modal (when user click on CLOSE)
     */
    dismiss(): void;
    private resize(event);
    private orientationChange(event);
    /**
     * When the modal has entered into view
     */
    private ionViewDidEnter();
    /**
     * Disables the scroll through the slider
     *
     * @param  {Event} event
     */
    private disableScroll(event);
    /**
     * Enables the scroll through the slider
     *
     * @param  {Event} event
     */
    private enableScroll(event);
}
