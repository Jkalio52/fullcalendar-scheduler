import { Hit, View, ViewProps, ComponentContext, ViewSpec, DateProfileGenerator, OffsetTracker, DateProfile } from '@fullcalendar/core'
import TimeAxis from './TimeAxis'
import TimelineLane from './TimelineLane'

export default class TimelineView extends View {

  // child components
  timeAxis: TimeAxis
  lane: TimelineLane

  offsetTracker: OffsetTracker

  constructor(context: ComponentContext, viewSpec: ViewSpec, dateProfileGenerator: DateProfileGenerator, parentEl: HTMLElement) {
    super(context, viewSpec, dateProfileGenerator, parentEl)

    this.el.classList.add('fc-timeline')

    if (this.opt('eventOverlap') === false) {
      this.el.classList.add('fc-no-overlap')
    }

    this.el.innerHTML = this.renderSkeletonHtml()

    this.timeAxis = new TimeAxis(
      this.context,
      this.el.querySelector('thead .fc-time-area'),
      this.el.querySelector('tbody .fc-time-area')
    )

    this.lane = new TimelineLane(
      this.context,
      this.timeAxis.layout.bodyScroller.enhancedScroll.canvas.contentEl,
      this.timeAxis.layout.bodyScroller.enhancedScroll.canvas.bgEl,
      this.timeAxis
    )
  }

  destroy() {
    this.timeAxis.destroy()
    this.lane.destroy()

    super.destroy()
  }

  renderSkeletonHtml() {
    let { theme } = this

    return `<table class="` + theme.getClass('tableGrid') + `"> \
<thead class="fc-head"> \
<tr> \
<td class="fc-time-area ` + theme.getClass('widgetHeader') + `"></td> \
</tr> \
</thead> \
<tbody class="fc-body"> \
<tr> \
<td class="fc-time-area ` + theme.getClass('widgetContent') + `"></td> \
</tr> \
</tbody> \
</table>`
  }

  render(props: ViewProps) {
    super.render(props) // flags for updateSize, addScroll

    this.timeAxis.receiveProps({
      dateProfile: props.dateProfile
    })

    this.lane.receiveProps({
      ...props,
      nextDayThreshold: this.nextDayThreshold
    })
  }

  updateSize(isResize, totalHeight, isAuto) {
    this.timeAxis.updateSize(isResize, totalHeight, isAuto)
    this.lane.updateSize(isResize)
  }


  // Now Indicator
  // ------------------------------------------------------------------------------------------

  getNowIndicatorUnit(dateProfile: DateProfile) {
    return this.timeAxis.getNowIndicatorUnit(dateProfile)
  }

  renderNowIndicator(date) {
    this.timeAxis.renderNowIndicator(date)
  }

  unrenderNowIndicator() {
    this.timeAxis.unrenderNowIndicator()
  }


  // Scroll System
  // ------------------------------------------------------------------------------------------

  computeInitialDateScroll() {
    return this.timeAxis.computeInitialDateScroll()
  }

  applyDateScroll(scroll) {
    this.timeAxis.applyDateScroll(scroll)
  }

  queryScroll() {
    let { enhancedScroll } = this.timeAxis.layout.bodyScroller

    return {
      top: enhancedScroll.getScrollTop(),
      left: enhancedScroll.getScrollLeft()
    }
  }


  // Hit System
  // ------------------------------------------------------------------------------------------

  prepareHits() {
    this.offsetTracker = new OffsetTracker(this.timeAxis.slats.el)
  }

  releaseHits() {
    this.offsetTracker.destroy()
  }

  queryHit(leftOffset, topOffset): Hit {
    let { offsetTracker } = this
    let slats = this.timeAxis.slats

    if (offsetTracker.isWithinClipping(leftOffset, topOffset)) {
      let slatHit = slats.positionToHit(leftOffset - offsetTracker.computeLeft())

      if (slatHit) {
        return {
          component: this,
          dateSpan: slatHit.dateSpan,
          rect: {
            left: slatHit.left,
            right: slatHit.right,
            top: offsetTracker.origTop,
            bottom: offsetTracker.origBottom
          },
          dayEl: slatHit.dayEl,
          layer: 0
        }
      }
    }
  }

}

TimelineView.prototype.isInteractable = true
