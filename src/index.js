import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated from 'react-native-reanimated';
import Interactable from 'react-native-interactable-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

const getSnapPoints = (snapPoints) => {
  return snapPoints.map((snapItem) => {
    if (typeof snapItem === 'string') {
      const parentValue = snapItem.split('%')[0];
      snapItem = (Screen.height / 100) * parentValue;
    }
    const snapObject = { y: Screen.height - snapItem };
    return snapObject;
  });
};

const getInitialPosition = (snapPoints, snapPoint) => {
  return snapPoints[snapPoint];
};

class BottomPanel extends Component {
  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height);
    this.state = {
      showFullScreenHeader: false,
      snapToIndex: 0,
      points: 100,
      scrollValueY: new Animated.Value(0),
      isDismissWithPress: props.isBackDropDismissByPress
        ? props.isBackDropDismissByPress
        : false,
      isBottomSheetDismissed:
        props.initialPosition === 0 || props.initialPosition === '0%',
    };
  }

  onDrawerSnap = (snap) => {
    const { snapPoints, onSnap, isHeaderDockable } = this.props;
    if (
      snapPoints[snap.nativeEvent.index] === 0 ||
      snapPoints[snap.nativeEvent.index] === '0%'
    ) {
      this.setState({
        isBottomSheetDismissed: true,
        showFullScreenHeader: false,
      });
    } else if (
      snapPoints[snap.nativeEvent.index] === Screen.height ||
      snapPoints[snap.nativeEvent.index] === '100%'
    ) {
      if (isHeaderDockable) {
        this.setState({
          showFullScreenHeader: true,
        });
      }
    } else {
      this.setState({
        isBottomSheetDismissed: false,
        showFullScreenHeader: false,
      });
    }
    if (onSnap) {
      onSnap(snap.nativeEvent, true);
    }
  };

  dismissBottomSheet = () => {
    const { snapPoints } = this.props;
    let index = snapPoints.findIndex((x) => x === 0 || x === '0%');
    if (index !== -1) {
      this.refs.bottomPanel.snapTo({ index });
    }
    this.setState({
      showFullScreenHeader: false,
    });
  };

  snapTo = (index) => {
    const { snapPoints } = this.props;
    if (snapPoints.findIndex((x) => x === 0 || x === '0%') !== -1) {
      Keyboard.dismiss();
    }
    this.refs.bottomPanel.snapTo({ index });
  };

  _onPanGestureEvent = (event) => {
    const { isHeaderDockable, snapPoints } = this.props;
    const { showFullScreenHeader } = this.state;
    if (showFullScreenHeader && isHeaderDockable) {
      if (event.nativeEvent.translationY > 50) {
        let snapPoint = snapPoints.filter(
          (x) => x !== '100%' && x !== Screen.height && x !== '0%' && x !== 0
        );
        if (snapPoint.length > 0) {
          let index = snapPoints.indexOf(snapPoint[0]);
          this.snapTo(index);
        }
      }
    }
  };

  render() {
    const {
      bottomSheerColor = '#FFFFFF',
      backDropColor = '#000000',
      isRoundBorderWithTipHeader = false,
      header,
      body,
      isBackDrop = false,
      isModal,
      isAnimatedYFromParent,
      animatedValueY,
      containerStyle,
      tipStyle,
      headerStyle,
      bodyStyle,
      dragEnabled,
      isHeaderDockable,
    } = this.props;
    let { snapPoints, initialPosition = { y: 0 } } = this.props;
    snapPoints = getSnapPoints(snapPoints);
    initialPosition = getInitialPosition(snapPoints, initialPosition);
    const {
      isDismissWithPress,
      isBottomSheetDismissed,
      showFullScreenHeader,
    } = this.state;
    return (
      <PanGestureHandler onGestureEvent={this._onPanGestureEvent}>
        <View
          style={styles.panelContainer}
          pointerEvents={!isBottomSheetDismissed ? 'auto' : 'box-none'}
        >
          {/* Backdrop */}
          {isBackDrop && (
            <Animated.View
              pointerEvents={!isBottomSheetDismissed ? 'auto' : 'box-none'}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: backDropColor,
                opacity: isAnimatedYFromParent
                  ? animatedValueY.interpolate({
                      inputRange: [0, Screen.height - 100],
                      outputRange: [1, 0],
                      extrapolateRight: 'clamp',
                    })
                  : this._deltaY.interpolate({
                      inputRange: [0, Screen.height - 100],
                      outputRange: [1, 0],
                      extrapolateRight: 'clamp',
                    }),
              }}
            />
          )}
          {!isModal && isDismissWithPress && !isBottomSheetDismissed && (
            <Animated.View
              pointerEvents={!isBottomSheetDismissed ? 'auto' : 'box-none'}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <TouchableWithoutFeedback
                pointerEvents={!isBottomSheetDismissed ? 'auto' : 'box-none'}
                style={{
                  flex: 1,
                }}
                onPress={this.dismissBottomSheet}
              >
                <View
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                />
              </TouchableWithoutFeedback>
            </Animated.View>
          )}
          <Interactable.View
            dragEnabled={dragEnabled === true && showFullScreenHeader === false}
            verticalOnly={true}
            ref="bottomPanel"
            snapPoints={snapPoints}
            initialPosition={initialPosition}
            boundaries={{
              top: isModal ? 0 : -300,
              bounce: isModal ? 0 : 0.5,
            }}
            animatedValueY={
              isAnimatedYFromParent ? animatedValueY : this._deltaY
            }
            onSnap={this.onDrawerSnap}
          >
            <View
              style={[
                isModal ? styles.modal : styles.panel,
                { backgroundColor: bottomSheerColor },
                isRoundBorderWithTipHeader
                  ? {
                      backgroundColor: '#f7f5eee8',
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 0 },
                      shadowRadius: 5,
                      shadowOpacity: 0.4,
                    }
                  : {},
                containerStyle,
              ]}
            >
              {!isModal && !showFullScreenHeader ? (
                <>
                  {isRoundBorderWithTipHeader ? (
                    <View style={[styles.panelHandle, tipStyle]} />
                  ) : null}
                  <View style={[styles.panelHeader, headerStyle]}>
                    {header}
                  </View>
                </>
              ) : isHeaderDockable ? (
                <View>{header}</View>
              ) : null}

              <View style={bodyStyle}>{body}</View>
            </View>
          </Interactable.View>
        </View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  panelHandle: {
    position: 'absolute',
    alignSelf: 'center',
    width: 40,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginVertical: 8,
  },
  panel: {
    height: Screen.height + 300,
  },
  modal: {
    height: Screen.height + 300,
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
});

export default BottomPanel;
