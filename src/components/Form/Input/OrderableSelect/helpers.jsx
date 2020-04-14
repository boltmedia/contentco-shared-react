import React, { useImperativeHandle, useRef } from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import PropTypes from 'prop-types';
import { set } from 'lodash';

export const orderDragged = (inputArry, dragIndex, hoverIndex) => {
  const dragedValue = inputArry[dragIndex];
  const arry = [...inputArry];
  arry.splice(dragIndex, 1);
  arry.splice(hoverIndex, 0, dragedValue);
  return arry;
};

export const orderable = (
  Component,
  dragType,
  {
    getItem = (props) => ({ id: props.id }),
    getIndex = (props) => props.index,
    getMoveFnc = (props) => props.moveValue
  }
) => {
  const Orderable = React.forwardRef(
    ({ isDragging, connectDragSource, connectDropTarget, ...props }, ref) => {
      const elementRef = useRef(null);
      connectDragSource(elementRef);
      connectDropTarget(elementRef);
      useImperativeHandle(ref, () => ({
        getNode: () => elementRef.current
      }));
      return (
        <div ref={elementRef}>
          <Component isDragging={isDragging} {...props} />
        </div>
      );
    }
  );
  Orderable.displayName = `Orderable(${Component.displayName ||
    Component.name ||
    'Component'})`;
  Orderable.propTypes = {
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  };

  return DropTarget(
    dragType,
    {
      hover(props, monitor, component) {
        if (!component) {
          return null;
        }
        // node = HTML Div element from imperative API
        const node = component.getNode();
        if (!node) {
          return null;
        }
        const dragIndex = monitor.getItem().index;
        const hoverIndex = getIndex(props);
        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
          return null;
        }
        // Determine rectangle on screen
        const hoverBoundingRect = node.getBoundingClientRect();
        // Get vertical middle
        const hoverMiddleX =
          (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
        // Determine mouse position
        const clientOffset = monitor.getClientOffset();
        // Get pixels to the top
        const hoverClientX = clientOffset.x - hoverBoundingRect.left;
        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%
        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
          return null;
        }
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
          return null;
        }
        // Time to actually perform the action
        getMoveFnc(props)(dragIndex, hoverIndex);
        // Note: we're mutating the monitor item here!
        // Generally it's better to avoid mutations,
        // but it's good here for the sake of performance
        // to avoid expensive index searches.
        monitor.getItem().index = hoverIndex;
        return null;
      }
    },
    (connect) => ({
      connectDropTarget: connect.dropTarget()
    })
  )(
    DragSource(
      dragType,
      {
        beginDrag: (props) => set(getItem(props), 'index', getIndex(props))
      },
      (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
      })
    )(Orderable)
  );
};
