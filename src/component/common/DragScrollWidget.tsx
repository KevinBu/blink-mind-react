import * as React from "react";
import { BaseWidget } from "./BaseWidget";
import ResizeObserver from "resize-observer-polyfill";
import styled from "styled-components";

const DragScrollView = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: scroll;
`;

const DragScrollContent = styled.div`
  position: relative;
  width: max-content;
`;

interface DragScrollWidgetProps {
  mouseKey?: "left" | "right";
  needKeyPressed?: boolean;
  canDragFunc?: () => Boolean;
  children: (
    setViewBoxScroll: (left: number, top: number) => void,
    setViewBoxScrollDelta: (left: number, top: number) => void
  ) => React.ReactNode;
}

export class DragScrollWidget extends BaseWidget<DragScrollWidgetProps> {
  constructor(props: DragScrollWidgetProps) {
    super(props);
    this.state = {
      widgetStyle: {
        width: "10000px",
        height: "10000px"
      }
    };
  }

  static defaultProps = {
    mouseKey: "left",
    needKeyPressed: false
  };

  contentResizeCallback = (
    entries: ResizeObserverEntry[],
    observer: ResizeObserver
  ) => {
    if (this.oldContentRect) {
      let widgetStyle = {
        width: this.content.clientWidth + this.viewBox.clientWidth * 2,
        height: this.content.clientHeight + this.viewBox.clientHeight * 2
      };
      this.bigView.style.width = widgetStyle.width + "px";
      this.bigView.style.height = widgetStyle.height + "px";
    }
    this.oldContentRect = entries[0].contentRect;
  };

  contentResizeObserver = new ResizeObserver(this.contentResizeCallback);
  // oldScroll: { left: number; top: number };
  oldContentRect: DOMRectReadOnly;
  content: HTMLElement;
  contentRef = ref => {
    if (ref) {
      this.content = ref;
      this.contentResizeObserver.observe(this.content);
    }
  };

  viewBox: HTMLElement;
  viewBoxRef = ref => {
    if (ref) {
      this.viewBox = ref;
      this.setViewBoxScroll(
        this.viewBox.clientWidth,
        this.viewBox.clientHeight
      );
    }
  };

  bigView: HTMLElement;
  bigViewRef = ref => {
    if (ref) {
      this.bigView = ref;
    }
  };

  setWidgetStyle = () => {
    if (this.content && this.viewBox && this.bigView) {
      this.bigView.style.width =
        (this.content.clientWidth + this.viewBox.clientWidth) * 2 + "px";
      this.bigView.style.height =
        (this.content.clientHeight + this.viewBox.clientHeight) * 2 + "px";

      this.content.style.left = this.viewBox.clientWidth + "px";
      this.content.style.top = this.viewBox.clientHeight + "px";
    }
  };

  setViewBoxScroll = (left: number, top: number) => {
    // console.error(`setViewBoxScroll`);
    if (this.viewBox) {
      this.viewBox.scrollLeft = left;
      this.viewBox.scrollTop = top;
    }
  };

  setViewBoxScrollDelta = (deltaLeft: number, deltaTop: number) => {
    // log(`setViewBoxScrollDelta ${deltaLeft} ${deltaTop}`);
    if (this.viewBox) {
      this.viewBox.scrollLeft += deltaLeft;
      this.viewBox.scrollTop += deltaTop;
    }
  };

  onMouseDown = e => {
    // log('Drag Scroll onMouseDown');
    // log(e.nativeEvent.target);

    // mouseKey 表示鼠标按下那个键才可以进行拖动，左键或者右键
    // needKeyPressed 为了支持是否需要按下ctrl键，才可以进行拖动
    // canDragFunc是一个函数，它是为了支持使用者以传入函数的方式，这个函数的返回值表示当前的内容是否可以被拖拽而移动
    let { mouseKey, needKeyPressed, canDragFunc } = this.props;
    if (canDragFunc && !canDragFunc()) return;
    if (
      (e.button === 0 && mouseKey === "left") ||
      (e.button === 2 && mouseKey === "right")
    ) {
      if (needKeyPressed) {
        if (!e.ctrlKey) return;
      }
      this._lastCoordX = this.viewBox.scrollLeft + e.nativeEvent.clientX;
      this._lastCoordY = this.viewBox.scrollTop + e.nativeEvent.clientY;
      // console.log('add listener');
      window.addEventListener("mousemove", this.onMouseMove);
      window.addEventListener("mouseup", this.onMouseUp);
    }
  };

  onMouseUp = e => {
    // log('Drag Scroll onMouseUp');
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
  };

  // onDragEnter = e=> {
  //   log('Drag Scroll onDragEnter');
  //   window.removeEventListener("mousemove", this.onMouseMove);
  //   window.removeEventListener("mouseup", this.onMouseUp);
  // };

  // _lastCoordX和_lastCorrdY 是为了在拖动过程中 计算 viewBox的scrollLeft和scrollTop值用到
  // _lastCoordX和_lastCorrdY 记录下拖动开始时刻viewBox的scroll值和鼠标位置值
  _lastCoordX: number;
  _lastCoordY: number;

  onMouseMove = (e: MouseEvent) => {
    // console.log('onMouseMove');

    this.viewBox.scrollLeft = this._lastCoordX - e.clientX;
    this.viewBox.scrollTop = this._lastCoordY - e.clientY;
  };

  handleContextMenu = e => {
    e.preventDefault();
  };

  componentDidMount(): void {
    this.setWidgetStyle();
    document.addEventListener("contextmenu", this.handleContextMenu);
  }

  componentWillUnmount(): void {
    document.removeEventListener("contextmenu", this.handleContextMenu);
  }

  render() {
    return (
      <DragScrollView
        ref={this.viewBoxRef}
        onMouseDown={this.onMouseDown}
        // onDragEnter={this.onDragEnter}
      >
        <div style={this.state.widgetStyle} ref={this.bigViewRef}>
          <DragScrollContent
            ref={this.contentRef}
            style={this.state.contentStyle}
          >
            {this.props.children(
              this.setViewBoxScroll,
              this.setViewBoxScrollDelta
            )}
          </DragScrollContent>
        </div>
      </DragScrollView>
    );
  }
}
