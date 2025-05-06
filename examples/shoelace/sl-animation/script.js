export const load = () => Promise.all(['sl-animation', 'sl-button', 'sl-input', 'sl-select', 'sl-switch'].map(tagName => customElements.whenDefined(tagName))).then(() => ({
  animations: ['backInDown', 'backInLeft', 'backInRight', 'backInUp', 'backOutDown', 'backOutLeft', 'backOutRight', 'backOutUp', 'bounce', 'bounceIn', 'bounceInDown', 'bounceInLeft', 'bounceInRight', 'bounceInUp', 'bounceOut', 'bounceOutDown', 'bounceOutLeft', 'bounceOutRight', 'bounceOutUp', 'fadeIn', 'fadeInBottomLeft', 'fadeInBottomRight', 'fadeInDown', 'fadeInDownBig', 'fadeInLeft', 'fadeInLeftBig', 'fadeInRight', 'fadeInRightBig', 'fadeInTopLeft', 'fadeInTopRight', 'fadeInUp', 'fadeInUpBig', 'fadeOut', 'fadeOutBottomLeft', 'fadeOutBottomRight', 'fadeOutDown', 'fadeOutDownBig', 'fadeOutLeft', 'fadeOutLeftBig', 'fadeOutRight', 'fadeOutRightBig', 'fadeOutTopLeft', 'fadeOutTopRight', 'fadeOutUp', 'fadeOutUpBig', 'flash', 'flip', 'flipInX', 'flipInY', 'flipOutX', 'flipOutY', 'headShake', 'heartBeat', 'hinge', 'jackInTheBox', 'jello', 'lightSpeedInLeft', 'lightSpeedInRight', 'lightSpeedOutLeft', 'lightSpeedOutRight', 'pulse', 'rollIn', 'rollOut', 'rotateIn', 'rotateInDownLeft', 'rotateInDownRight', 'rotateInUpLeft', 'rotateInUpRight', 'rotateOut', 'rotateOutDownLeft', 'rotateOutDownRight', 'rotateOutUpLeft', 'rotateOutUpRight', 'rubberBand', 'shake', 'shakeX', 'shakeY', 'slideInDown', 'slideInLeft', 'slideInRight', 'slideInUp', 'slideOutDown', 'slideOutLeft', 'slideOutRight', 'slideOutUp', 'swing', 'tada', 'wobble', 'zoomIn', 'zoomInDown', 'zoomInLeft', 'zoomInRight', 'zoomInUp', 'zoomOut', 'zoomOutDown', 'zoomOutLeft', 'zoomOutRight', 'zoomOutUp'],
  easings: ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut', 'easeInSine', 'easeOutSine', 'easeInOutSine', 'easeInQuad', 'easeOutQuad', 'easeInOutQuad', 'easeInCubic', 'easeOutCubic', 'easeInOutCubic', 'easeInQuart', 'easeOutQuart', 'easeInOutQuart', 'easeInQuint', 'easeOutQuint', 'easeInOutQuint', 'easeInExpo', 'easeOutExpo', 'easeInOutExpo', 'easeInCirc', 'easeOutCirc', 'easeInOutCirc', 'easeInBack', 'easeOutBack', 'easeInOutBack'],
  animation: 'bounce',
  easing: 'ease',
  direction: 'normal',
  duration: 2000,
  delay: 100,
  endDelay: 100,
  rate: 1,
  iterationStart: 0,
  play: false,
  fill: 'none',
  iterations: '3',
  eventType: "N/A"
}));
export const observer = $entries => {
  // console.error($entry.isIntersecting);
  const entry = $entries[0];
  if (entry.isIntersecting) {
    // Start the animation when the box enters the viewport
    animationElement.play = true;
  } else {
    animationElement.play = false;
    animationElement.currentTime = 0;
  }
};