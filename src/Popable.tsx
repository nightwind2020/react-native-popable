/* eslint-disable react-native/no-inline-styles */
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  // @ts-ignore
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewProps,
} from 'react-native';
import Backdrop from './Backdrop';
import Popover, { PopoverProps } from './Popover';
import type { PopableManager } from './use-popable/types';

export type PopableProps = {
  action?: 'press' | 'longpress' | 'hover';
  animated?: PopoverProps['animated'];
  animationType?: PopoverProps['animationType'];
  backgroundColor?: PopoverProps['backgroundColor'];
  caret?: PopoverProps['caret'];
  caretPosition?: PopoverProps['caretPosition'];
  children: any;
  content: PopoverProps['children'];
  numberOfLines?: PopoverProps['numberOfLines'];
  onAction?: (visible: boolean) => void;
  position?: PopoverProps['position'];
  style?: PopoverProps['style'];
  visible?: boolean;
  wrapperStyle?: ViewProps['style'];
};

const DEFAULT_LAYOUT = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

const Popable = forwardRef<PopableManager, PopableProps>(function Popable(
  {
    action = 'press',
    animated,
    animationType,
    backgroundColor,
    children,
    caret,
    caretPosition,
    content,
    numberOfLines,
    onAction,
    position = 'auto',
    style,
    visible,
    wrapperStyle,
  },
  ref
) {
  const dimensions = useWindowDimensions();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverOffset, setPopoverOffset] = useState({ left: 0, top: 0 });
  const [popoverLayout, setPopoverLayout] = useState(DEFAULT_LAYOUT);
  const [popoverPagePosition, setPopoverPagePosition] = useState({
    left: 0,
    top: 0,
  });
  const [childrenLayout, setChildrenLayout] = useState(DEFAULT_LAYOUT);
  const computedPosition = useRef<PopoverProps['position']>(position);
  const isInteractive = typeof visible === 'undefined';
  const isPopoverVisible = isInteractive ? popoverVisible : visible;
  const childrenRef = useRef<View>(null);
  const popoverRef = useRef<View>(null);

  useImperativeHandle(ref, () => ({
    show: () => setPopoverVisible(true),
    hide: () => setPopoverVisible(false),
  }));

  const handlers: { [prop: string]: () => void } = {};

  if (isInteractive) {
    if (action === 'hover' && Platform.OS === 'web') {
      handlers.onHoverIn = () => {
        setPopoverVisible(true);
        onAction?.(true);
      };

      handlers.onHoverOut = () => {
        setPopoverVisible(false);
        onAction?.(false);
      };
    } else if (
      action === 'press' ||
      (action === 'hover' && Platform.OS !== 'web')
    ) {
      handlers.onPress = () => {
        if (!visible) {
          popoverRef.current?.measure(
            (_x, _y, _width, _height, pageX, pageY) => {
              setPopoverPagePosition({ left: pageX, top: pageY });
            }
          );
        }

        onAction?.(!visible);
        setPopoverVisible(!visible);
      };
    } else {
      handlers.onLongPress = () => {
        onAction?.(!visible);
        setPopoverVisible(!visible);
      };
    }
  }

  const handleHidePopover = useCallback(() => {
    setPopoverVisible(false);
  }, []);

  const handlePopoverLayout = useCallback(() => {
    popoverRef.current?.measureInWindow((x, y, width, height) => {
      setPopoverLayout({ x, y, width, height });
    });
  }, [popoverRef]);

  const handleChildrenLayout = useCallback(() => {
    childrenRef.current?.measureInWindow((x, y, width, height) => {
      setChildrenLayout({ x, y, width, height });
    });
  }, [childrenRef]);

  useEffect(() => {
    if (popoverLayout.width !== 0 && childrenLayout.width !== 0) {
      if (position === 'auto') {
        computedPosition.current = 'top';

        if (popoverLayout.y < 0) {
          computedPosition.current = 'bottom';
        }

        if (popoverLayout.x + popoverLayout.width > dimensions.width) {
          computedPosition.current = 'left';
        }

        const w = (popoverLayout.width - childrenLayout.width) / 2;
        if (popoverLayout.x - w < 0) {
          computedPosition.current = 'right';
        }
      }
    }
  }, [position, popoverLayout, childrenLayout, dimensions]);

  useEffect(() => {
    if (computedPosition.current !== 'auto') {
      let left = 0;
      let top = 0;

      switch (computedPosition.current) {
        case 'right':
        case 'left':
          const h = (popoverLayout.height - childrenLayout.height) / 2;
          top = h;
          if (popoverLayout.y < 0) {
            top = 0;
          } else if (
            popoverLayout.y + popoverLayout.height >
            dimensions.height
          ) {
            top = popoverLayout.y + popoverLayout.height - dimensions.height;
          }
          break;

        case 'top':
        case 'bottom':
          const w = (popoverLayout.width - childrenLayout.width) / 2;
          left = w;
          if (popoverLayout.x - w < 0) {
            left = 0;
          } else if (popoverLayout.x + popoverLayout.width > dimensions.width) {
            left = popoverLayout.x + popoverLayout.width - dimensions.width;
          }

          if (popoverLayout.y < 0) {
            top = popoverLayout.y;
          }
          break;
      }

      setPopoverOffset({ left, top });
    }
  }, [computedPosition, popoverLayout, childrenLayout, dimensions]);

  const sharedPopoverProps = {
    animated,
    animationType,
    backgroundColor,
    caret,
    caretPosition,
    children: content,
    numberOfLines,
    position: computedPosition.current,
  };

  console.log({
    computedPosition,
    dimensions,
    popoverLayout,
    childrenLayout,
    popoverOffset,
  });

  return (
    <View style={[styles.container, wrapperStyle]}>
      <Backdrop
        visible={isInteractive && popoverVisible}
        onPress={handleHidePopover}
        popoverRef={popoverRef}
        childrenRef={childrenRef}
      >
        {
          // Backdrop renders the same popover because:
          // since the backdrop adds a layer on top of the screen to
          // detect any "outside popover press", the inner popover becomes
          // unreachable: the upper layer would keep all the touch events.
          // Because the backdrop uses a modal as a layer, we render that
          // same popover inside the modal, and hide the initial one
          // underneath (which explains why the popover below this one has
          // `visible` set to `false`)
          Platform.OS !== 'web' && (
            <Popover
              {...sharedPopoverProps}
              forceInitialAnimation
              visible={isPopoverVisible}
              style={[
                {
                  position: 'absolute',
                  transform: [
                    { translateX: popoverPagePosition.left },
                    { translateY: popoverPagePosition.top },
                  ],
                },
                style,
              ]}
            />
          )
        }
      </Backdrop>

      <Popover
        ref={popoverRef}
        {...sharedPopoverProps}
        onLayout={handlePopoverLayout}
        visible={Platform.OS === 'web' ? isPopoverVisible : false}
        style={[
          computedPosition.current === 'top' && styles.popoverTop,
          computedPosition.current === 'bottom' && styles.popoverBottom,
          computedPosition.current === 'left' && {
            alignItems: 'flex-end',
            right: childrenLayout.width,
          },
          computedPosition.current === 'right' && {
            left: childrenLayout.width,
          },
          {
            position: 'absolute',
            transform: [
              { translateX: popoverOffset.left * -1 },
              { translateY: popoverOffset.top * -1 },
            ],
          },
          style,
        ]}
      />

      <Pressable
        ref={childrenRef}
        onLayout={handleChildrenLayout}
        {...handlers}
      >
        {children}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  popoverTop: {
    bottom: '100%',
  },
  popoverBottom: {
    top: '100%',
  },
});

export default Popable;
