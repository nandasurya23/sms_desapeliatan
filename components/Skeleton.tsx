import React, { useEffect, useState } from 'react';
import { Animated, ViewStyle, DimensionValue } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 8, style, className }) => {
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      className={className}
      style={[
        {
          width: width as DimensionValue,
          height: height as DimensionValue,
          borderRadius,
          backgroundColor: '#E5E7EB', // gray-200
          opacity,
        },
        style,
      ]}
    />
  );
};

export default Skeleton;
